import { ACCESSIBILITY_POINTS, CLICK_COUNT_BANDS } from "./config";
import type { AccessibilityAuditInput, DimensionResult } from "./types";

const TOTAL_ACCESSIBILITY_POINTS =
  ACCESSIBILITY_POINTS.clickCountMax +
  ACCESSIBILITY_POINTS.searchabilityMax +
  ACCESSIBILITY_POINTS.readabilityMax +
  ACCESSIBILITY_POINTS.evidenceLinkageMax;

export interface AccessibilityDetails {
  clickPoints: number | null;
  clickBand: string | null;
  searchability: number | null;
  readability: number | null;
  evidenceLinkage: number | null;
  totalPoints: number | null;
}

/** Operational click-count rule: 1–2 excellent (5), 3 good (4), 4 weak (2), 5+ poor (0). */
export function clickCountPoints(clicks: number): { points: number; label: string } {
  const band = CLICK_COUNT_BANDS.find((b) => clicks <= b.maxClicks)!;
  return { points: band.points, label: band.label };
}

/**
 * Information Accessibility (0–100), from the latest accessibility audit:
 *
 *   clickPoints (0–5) + searchability (0–3) + readability (0–3)
 *   + evidenceLinkage (0–4) = points out of 15
 *   accessibility = points / 15 × 100
 *
 * Click count = navigation steps from the brand homepage to the key
 * sustainability evidence. This is a project-defined operational metric,
 * not a universal usability law. All four criteria must be assessed;
 * otherwise the dimension is not calculated.
 */
export function calculateAccessibilityScore(
  audit: AccessibilityAuditInput | null,
): DimensionResult<AccessibilityDetails> {
  const empty: AccessibilityDetails = {
    clickPoints: null,
    clickBand: null,
    searchability: null,
    readability: null,
    evidenceLinkage: null,
    totalPoints: null,
  };
  if (!audit) {
    return {
      score: null,
      unavailableReason: "No accessibility audit has been completed yet.",
      explanation: [],
      details: empty,
    };
  }

  const { clickCount, searchabilityScore, readabilityScore, evidenceLinkageScore } = audit;
  if (
    clickCount === null ||
    searchabilityScore === null ||
    readabilityScore === null ||
    evidenceLinkageScore === null
  ) {
    return {
      score: null,
      unavailableReason: "The accessibility audit is incomplete.",
      explanation: [],
      details: {
        ...empty,
        searchability: searchabilityScore,
        readability: readabilityScore,
        evidenceLinkage: evidenceLinkageScore,
      },
    };
  }

  const click = clickCountPoints(clickCount);
  const searchability = clamp(searchabilityScore, ACCESSIBILITY_POINTS.searchabilityMax);
  const readability = clamp(readabilityScore, ACCESSIBILITY_POINTS.readabilityMax);
  const evidenceLinkage = clamp(evidenceLinkageScore, ACCESSIBILITY_POINTS.evidenceLinkageMax);
  const totalPoints = click.points + searchability + readability + evidenceLinkage;

  return {
    score: (totalPoints / TOTAL_ACCESSIBILITY_POINTS) * 100,
    explanation: [
      `Evidence reached in ${clickCount} click${clickCount === 1 ? "" : "s"} (${click.label.toLowerCase()}): ${click.points}/${ACCESSIBILITY_POINTS.clickCountMax} pts`,
      `Searchability: ${searchability}/${ACCESSIBILITY_POINTS.searchabilityMax} pts`,
      `Readability: ${readability}/${ACCESSIBILITY_POINTS.readabilityMax} pts`,
      `Evidence linkage: ${evidenceLinkage}/${ACCESSIBILITY_POINTS.evidenceLinkageMax} pts`,
    ],
    details: {
      clickPoints: click.points,
      clickBand: click.label,
      searchability,
      readability,
      evidenceLinkage,
      totalPoints,
    },
  };
}

function clamp(value: number, max: number) {
  return Math.min(Math.max(value, 0), max);
}
