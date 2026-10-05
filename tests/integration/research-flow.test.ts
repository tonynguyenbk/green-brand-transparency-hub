/**
 * Integration: consent → balanced random assignment → completion → results.
 * Uses its own temporary study; deleted afterwards.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { SURVEY_ITEMS } from "@/lib/research/instrument";
import {
  StudyError,
  completeParticipation,
  getStudyResults,
  startParticipation,
} from "@/lib/services/research-service";

const slug = `itest-study-${Date.now()}`;
let studyId = "";

beforeAll(async () => {
  const study = await prisma.researchStudy.create({
    data: {
      slug,
      title: "Integration study",
      description: "Temporary",
      consentText: "Consent",
      status: "ACTIVE",
      conditions: {
        create: [
          { key: "control", name: "Control", description: "Ad only" },
          { key: "transparency_hub", name: "Hub", description: "Ad + hub" },
        ],
      },
    },
  });
  studyId = study.id;
});

afterAll(async () => {
  await prisma.researchStudy.deleteMany({ where: { slug } });
  await prisma.$disconnect();
});

const answers = (v: number) => Object.fromEntries(SURVEY_ITEMS.map((i) => [i.id, v]));

describe("research study flow", () => {
  it("assigns conditions in a balanced way", async () => {
    const assignments = [];
    for (let i = 0; i < 6; i++) assignments.push(await startParticipation(slug));
    const counts = assignments.reduce<Record<string, number>>((acc, a) => {
      acc[a.conditionKey] = (acc[a.conditionKey] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({ control: 3, transparency_hub: 3 });

    for (const a of assignments) {
      await completeParticipation(
        slug,
        a.participantCode,
        answers(a.conditionKey === "control" ? 2 : 4),
      );
    }
    await expect(
      completeParticipation(slug, assignments[0].participantCode, answers(3)),
    ).rejects.toBeInstanceOf(StudyError);
  });

  it("rejects incomplete answers and closed studies", async () => {
    const a = await startParticipation(slug);
    const partial = answers(3);
    delete partial.PG1;
    await expect(completeParticipation(slug, a.participantCode, partial)).rejects.toBeInstanceOf(
      StudyError,
    );
    await prisma.researchStudy.update({ where: { id: studyId }, data: { status: "CLOSED" } });
    await expect(startParticipation(slug)).rejects.toBeInstanceOf(StudyError);
    await prisma.researchStudy.update({ where: { id: studyId }, data: { status: "ACTIVE" } });
  });

  it("summarises completed responses only", async () => {
    const r = await getStudyResults(studyId);
    expect(r.started).toBe(7);
    expect(r.completed).toBe(6);
    const trust = r.constructs.find((c) => c.construct === "brandTrust")!;
    expect(trust.byCondition.find((g) => g.key === "control")).toMatchObject({ n: 3, mean: 2 });
    expect(trust.byCondition.find((g) => g.key === "transparency_hub")).toMatchObject({
      n: 3,
      mean: 4,
    });
    // zero variance within groups → Welch test undefined, never fabricated
    expect(trust.welch).toBeNull();
  });
});
