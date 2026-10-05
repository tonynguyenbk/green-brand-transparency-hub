/**
 * Candidate claim detection (TypeScript mirror of scripts/scrape/detect_claims.py).
 * Flags sustainability-related paragraphs for HUMAN REVIEW. Output is never
 * treated as verified: every detected item is imported with status CANDIDATE.
 */
export const CANDIDATE_KEYWORDS = [
  "sustainable",
  "carbon",
  "emission",
  "recycled",
  "renewable",
  "climate",
  "water",
  "waste",
  "packaging",
  "responsible",
  "certified",
  "net zero",
] as const;

const KEYWORD_PATTERNS = CANDIDATE_KEYWORDS.map((k) => ({
  keyword: k,
  pattern: new RegExp(`\\b${k.replace(" ", "[\\s-]")}\\w*`, "i"),
}));

const METRIC_PATTERN =
  /\b\d+(?:[.,]\d+)?\s?(?:%|(?:percent|t(?:onnes?)?|tco2e?|kwh|mwh|litres?|kg)\b)/i;
const CERTIFICATION_PATTERN =
  /\b(?:certified|certification|verified by|assured|audited|ISO\s?\d{4,5})\b/i;

export interface CandidateParagraph {
  text: string;
  keywords: string[];
  hasMetric: boolean;
  hasCertificationReference: boolean;
}

export function detectCandidateParagraphs(
  paragraphs: string[],
  { minLength = 40, maxLength = 1000 } = {},
): CandidateParagraph[] {
  const seen = new Set<string>();
  const out: CandidateParagraph[] = [];
  for (const raw of paragraphs) {
    const text = raw.replace(/\s+/g, " ").trim();
    if (text.length < minLength || text.length > maxLength) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    const keywords = KEYWORD_PATTERNS.filter((k) => k.pattern.test(text)).map((k) => k.keyword);
    if (keywords.length === 0) continue;
    seen.add(key);
    out.push({
      text,
      keywords,
      hasMetric: METRIC_PATTERN.test(text),
      hasCertificationReference: CERTIFICATION_PATTERN.test(text),
    });
  }
  return out;
}
