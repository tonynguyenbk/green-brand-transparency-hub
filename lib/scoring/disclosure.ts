import {
  DISCLOSURE_LEVEL_VALUES,
  DISCLOSURE_MIN_COVERAGE,
  DISCLOSURE_TOPIC_LABELS,
  DISCLOSURE_TOPIC_POINTS,
  type DisclosureTopicKey,
} from "./config";
import type { DimensionResult, DisclosureItemInput } from "./types";

export interface DisclosureTopicResult {
  topic: DisclosureTopicKey;
  label: string;
  points: number;
  /** 0, 0.5 or 1 — null when excluded (pending review / not applicable). */
  value: number | null;
  state: DisclosureItemInput["state"];
  level: DisclosureItemInput["level"];
}

export interface DisclosureDetails {
  topics: DisclosureTopicResult[];
  assessedPoints: number;
  earnedPoints: number;
  pendingTopics: number;
}

/**
 * Sustainability Disclosure (0–100).
 *
 * For each of the seven topics t with point weight p_t:
 *   value_t = 1    if state = AVAILABLE and level = CLEAR
 *   value_t = 0.5  if state = AVAILABLE and level = PARTIAL
 *   value_t = 0    if state = NOT_FOUND or NOT_AVAILABLE (or level = ABSENT)
 *   excluded       if state = NOT_APPLICABLE or PENDING_REVIEW (or no row)
 *
 *   disclosure = Σ(p_t × value_t) / Σ(p_t over included topics) × 100
 *
 * NOT_FOUND counts as 0 because this dimension measures *public* disclosure:
 * "not found during the review" is exactly what is being assessed. It is
 * still labelled "Supporting evidence not found", never "does not exist".
 * PENDING_REVIEW is never converted to zero. If fewer than
 * DISCLOSURE_MIN_COVERAGE of the applicable topics have been assessed,
 * the dimension is not calculated.
 */
export function calculateDisclosureScore(
  items: DisclosureItemInput[],
): DimensionResult<DisclosureDetails> {
  const byTopic = new Map(items.map((i) => [i.topic, i]));
  const topics: DisclosureTopicResult[] = (
    Object.keys(DISCLOSURE_TOPIC_POINTS) as DisclosureTopicKey[]
  ).map((topic) => {
    const item = byTopic.get(topic);
    const state = item?.state ?? "PENDING_REVIEW";
    const level = item?.level ?? null;
    return {
      topic,
      label: DISCLOSURE_TOPIC_LABELS[topic],
      points: DISCLOSURE_TOPIC_POINTS[topic],
      value: disclosureValue(state, level),
      state,
      level,
    };
  });

  const applicable = topics.filter((t) => t.state !== "NOT_APPLICABLE");
  const assessed = applicable.filter((t) => t.value !== null);
  const pendingTopics = applicable.length - assessed.length;
  const assessedPoints = assessed.reduce((s, t) => s + t.points, 0);
  const earnedPoints = assessed.reduce((s, t) => s + t.points * (t.value ?? 0), 0);
  const details = { topics, assessedPoints, earnedPoints, pendingTopics };

  if (applicable.length === 0 || assessed.length / applicable.length < DISCLOSURE_MIN_COVERAGE) {
    return {
      score: null,
      unavailableReason: `Disclosure review is incomplete (${assessed.length} of ${applicable.length} applicable topics assessed).`,
      explanation: [],
      details,
    };
  }

  const explanation = topics.map((t) => {
    if (t.value === null) {
      return `${t.label}: ${t.state === "NOT_APPLICABLE" ? "not applicable (excluded)" : "pending review (excluded)"}`;
    }
    const verdict =
      t.value === 1
        ? "clearly disclosed"
        : t.value === 0.5
          ? "partially disclosed"
          : "public disclosure not found";
    return `${t.label}: ${verdict} (${t.points * t.value}/${t.points} pts)`;
  });

  return {
    score: (earnedPoints / assessedPoints) * 100,
    explanation,
    details,
  };
}

function disclosureValue(
  state: DisclosureItemInput["state"],
  level: DisclosureItemInput["level"],
): number | null {
  switch (state) {
    case "AVAILABLE":
      // AVAILABLE without a level is treated as not yet assessed.
      return level === null ? null : DISCLOSURE_LEVEL_VALUES[level];
    case "NOT_FOUND":
    case "NOT_AVAILABLE":
      return DISCLOSURE_LEVEL_VALUES.ABSENT;
    case "NOT_APPLICABLE":
    case "PENDING_REVIEW":
      return null;
  }
}
