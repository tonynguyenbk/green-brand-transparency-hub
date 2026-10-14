/**
 * Greenlens ESG scoring (methodology esg-1.0).
 *
 *   ESG = 0.40 × E + 0.35 × S + 0.25 × G      (each pillar scored 1–10)
 *
 * Display uses one decimal, rounded half-up (7.25 → 7.3). Ranking and band
 * classification use the unrounded value so ties are broken consistently.
 */
export const ESG_METHODOLOGY_VERSION = "esg-1.0";

export const ESG_WEIGHTS = { e: 0.4, s: 0.35, g: 0.25 } as const;

export type BandKey = "very-weak" | "weak" | "moderate" | "good" | "strong";

export interface Band {
  key: BandKey;
  min: number;
  /** Upper bound shown to readers (inclusive, one decimal). */
  max: number;
  vi: string;
  en: string;
  meaningVi: string;
  meaningEn: string;
}

/** Interpretation table from the project methodology (rating.md). */
export const BANDS: Band[] = [
  {
    key: "very-weak",
    min: 1.0,
    max: 3.4,
    vi: "Rất yếu",
    en: "Very weak",
    meaningVi: "Hiệu quả rất yếu hoặc có mối lo nghiêm trọng",
    meaningEn: "Very weak performance or serious concerns",
  },
  {
    key: "weak",
    min: 3.5,
    max: 4.9,
    vi: "Yếu",
    en: "Weak",
    meaningVi: "Hiệu quả yếu hoặc còn vấn đề lớn chưa giải quyết",
    meaningEn: "Weak performance or significant unresolved issues",
  },
  {
    key: "moderate",
    min: 5.0,
    max: 6.4,
    vi: "Trung bình",
    en: "Moderate",
    meaningVi: "Hiệu quả trung bình, có những mối lo đáng kể",
    meaningEn: "Moderate performance; notable concerns",
  },
  {
    key: "good",
    min: 6.5,
    max: 7.9,
    vi: "Tốt",
    en: "Good",
    meaningVi: "Hiệu quả tốt, còn một số khoảng trống",
    meaningEn: "Good performance, with some gaps",
  },
  {
    key: "strong",
    min: 8.0,
    max: 10,
    vi: "Mạnh",
    en: "Strong",
    meaningVi: "Hiệu quả ESG mạnh",
    meaningEn: "Strong ESG performance",
  },
];

export function assertPillar(value: number, name: string) {
  if (!Number.isFinite(value) || value < 1 || value > 10) {
    throw new RangeError(`${name} must be between 1 and 10 (received ${value})`);
  }
}

/** Weighted ESG score with full precision. */
export function computeEsg(e: number, s: number, g: number): number {
  assertPillar(e, "E");
  assertPillar(s, "S");
  assertPillar(g, "G");
  return ESG_WEIGHTS.e * e + ESG_WEIGHTS.s * s + ESG_WEIGHTS.g * g;
}

/** Round half-up to one decimal, robust to binary floating point (6.35 → 6.4). */
export function roundEsg(value: number): number {
  return Math.round(value * 10 + 1e-9) / 10;
}

export function formatEsg(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value)
    ? "—"
    : roundEsg(value).toFixed(1);
}

/** Band for a score, classified on the displayed (rounded) value so label and number agree. */
export function bandFor(value: number): Band {
  const shown = roundEsg(value);
  return BANDS.find((b) => shown >= b.min && shown <= b.max) ?? (shown > 10 ? BANDS[4] : BANDS[0]);
}

/** Position on a 1–10 ruler as a percentage (0–100). */
export function rulerPercent(value: number): number {
  return Math.min(100, Math.max(0, ((value - 1) / 9) * 100));
}
