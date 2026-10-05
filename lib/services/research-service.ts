import { randomInt, randomUUID } from "node:crypto";
import type { StudyStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  CONSTRUCT_KEYS,
  SURVEY_ITEMS,
  constructScores,
  type ConstructKey,
  type ItemResponses,
} from "@/lib/research/instrument";
import { cronbachAlpha, mean, standardDeviation, welchTTest } from "@/lib/research/statistics";

export class StudyError extends Error {}

/** Responses completed faster than this are flagged for data-quality review (not auto-excluded). */
export const SPEEDER_THRESHOLD_SECONDS = 30;
export const CONTROL_KEY = "control";
export const TREATMENT_KEY = "transparency_hub";

export function listStudies() {
  return prisma.researchStudy.findMany({
    include: { conditions: true, _count: { select: { responses: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getStudyBySlug(slug: string) {
  return prisma.researchStudy.findUnique({
    where: { slug },
    include: { conditions: { include: { brand: { select: { slug: true, name: true } } } } },
  });
}

export function setStudyStatus(id: string, status: StudyStatus) {
  return prisma.researchStudy.update({ where: { id }, data: { status } });
}

/**
 * Consent + random assignment. Balanced randomisation: the condition with the
 * fewest started responses is chosen; ties are broken uniformly at random.
 * The assignment is stored server-side so participants cannot pick a condition.
 */
export async function startParticipation(slug: string) {
  const study = await prisma.researchStudy.findUnique({
    where: { slug },
    include: { conditions: { include: { _count: { select: { responses: true } } } } },
  });
  if (!study || study.status !== "ACTIVE")
    throw new StudyError("This study is not currently open.");
  if (study.conditions.length === 0) throw new StudyError("This study has no conditions.");

  const min = Math.min(...study.conditions.map((c) => c._count.responses));
  const candidates = study.conditions.filter((c) => c._count.responses === min);
  const condition = candidates[randomInt(candidates.length)];
  const participantCode = randomUUID();

  await prisma.researchResponse.create({
    data: { studyId: study.id, conditionId: condition.id, participantCode, consentGiven: true },
  });
  return { participantCode, conditionKey: condition.key };
}

export async function completeParticipation(
  slug: string,
  participantCode: string,
  items: ItemResponses,
) {
  const response = await prisma.researchResponse.findFirst({
    where: { participantCode, study: { slug, status: "ACTIVE" } },
  });
  if (!response) throw new StudyError("Participation not found or the study is closed.");
  if (response.completedAt) throw new StudyError("This response has already been submitted.");

  const answers = Object.fromEntries(SURVEY_ITEMS.map((i) => [i.id, items[i.id]]));
  let scores: Record<ConstructKey, number>;
  try {
    scores = constructScores(answers);
  } catch (e) {
    throw new StudyError(e instanceof Error ? e.message : "Please answer every statement.");
  }
  const now = new Date();
  await prisma.researchResponse.update({
    where: { id: response.id },
    data: {
      ...scores,
      itemResponsesJson: answers,
      durationSeconds: Math.round((now.getTime() - response.startedAt.getTime()) / 1000),
      completedAt: now,
    },
  });
}

export interface ConstructSummary {
  construct: ConstructKey;
  byCondition: { key: string; n: number; mean: number | null; sd: number | null }[];
  alpha: number | null;
  itemCount: number;
  welch: ReturnType<typeof welchTTest>;
}

/** Descriptive results per condition, internal consistency and Welch comparison (treatment − control). */
export async function getStudyResults(studyId: string) {
  const study = await prisma.researchStudy.findUniqueOrThrow({
    where: { id: studyId },
    include: { conditions: true, responses: true },
  });
  const completed = study.responses.filter((r) => r.completedAt);
  const keyOf = new Map(study.conditions.map((c) => [c.id, c.key]));

  const constructs: ConstructSummary[] = CONSTRUCT_KEYS.map((construct) => {
    const valuesFor = (key: string) =>
      completed
        .filter((r) => keyOf.get(r.conditionId) === key)
        .map((r) => r[construct]!)
        .filter((v) => v !== null);
    const itemIds = SURVEY_ITEMS.filter((i) => i.construct === construct).map((i) => i.id);
    const rows = completed.map((r) => {
      const items = (r.itemResponsesJson ?? {}) as Record<string, number>;
      return itemIds.map((id) => items[id]);
    });
    return {
      construct,
      itemCount: itemIds.length,
      alpha: itemIds.length > 1 ? cronbachAlpha(rows) : null,
      byCondition: study.conditions.map((c) => {
        const v = valuesFor(c.key);
        return { key: c.key, n: v.length, mean: mean(v), sd: standardDeviation(v) };
      }),
      welch: welchTTest(valuesFor(TREATMENT_KEY), valuesFor(CONTROL_KEY)),
    };
  });

  return {
    study,
    started: study.responses.length,
    completed: completed.length,
    speeders: completed.filter((r) => (r.durationSeconds ?? 0) < SPEEDER_THRESHOLD_SECONDS).length,
    constructs,
  };
}

/** Anonymous CSV export of completed responses (no personal data is collected). */
export async function exportStudyCsv(studyId: string): Promise<string> {
  const study = await prisma.researchStudy.findUniqueOrThrow({
    where: { id: studyId },
    include: {
      conditions: true,
      responses: { where: { completedAt: { not: null } }, orderBy: { completedAt: "asc" } },
    },
  });
  const keyOf = new Map(study.conditions.map((c) => [c.id, c.key]));
  const header = [
    "participant_code",
    "condition",
    "duration_seconds",
    ...SURVEY_ITEMS.map((i) => i.id),
    ...CONSTRUCT_KEYS,
  ];
  const lines = study.responses.map((r) => {
    const items = (r.itemResponsesJson ?? {}) as Record<string, number>;
    return [
      r.participantCode,
      keyOf.get(r.conditionId) ?? "",
      r.durationSeconds ?? "",
      ...SURVEY_ITEMS.map((i) => items[i.id] ?? ""),
      ...CONSTRUCT_KEYS.map((k) => r[k] ?? ""),
    ].join(",");
  });
  return [header.join(","), ...lines].join("\n");
}
