/**
 * Survey instrument for the planned transparency experiment.
 * 5-point Likert scale: 1 = strongly disagree … 5 = strongly agree.
 * Items are adapted from the project specification; no item is reverse-coded.
 */
export const LIKERT_POINTS = 5;

export const LIKERT_LABELS = [
  "Strongly disagree",
  "Disagree",
  "Neither agree nor disagree",
  "Agree",
  "Strongly agree",
] as const;

export type ConstructKey =
  "brandTrust" | "purchaseIntention" | "perceivedTransparency" | "perceivedGreenwashing";

export interface SurveyItem {
  id: string;
  construct: ConstructKey;
  text: string;
}

export const CONSTRUCT_LABELS: Record<ConstructKey, string> = {
  brandTrust: "Brand Trust",
  purchaseIntention: "Purchase Intention",
  perceivedTransparency: "Perceived Transparency",
  perceivedGreenwashing: "Perceived Greenwashing",
};

export const CONSTRUCT_KEYS = Object.keys(CONSTRUCT_LABELS) as ConstructKey[];

export const SURVEY_ITEMS: SurveyItem[] = [
  { id: "BT1", construct: "brandTrust", text: "I trust this brand." },
  { id: "BT2", construct: "brandTrust", text: "This brand appears honest." },
  {
    id: "BT3",
    construct: "brandTrust",
    text: "This brand provides credible sustainability information.",
  },
  {
    id: "PI1",
    construct: "purchaseIntention",
    text: "I would consider purchasing from this brand.",
  },
  {
    id: "PI2",
    construct: "purchaseIntention",
    text: "I would choose this brand over a similar competitor.",
  },
  {
    id: "PT1",
    construct: "perceivedTransparency",
    text: "This brand clearly explains its environmental claims.",
  },
  {
    id: "PG1",
    construct: "perceivedGreenwashing",
    text: "This brand appears to exaggerate its environmental performance.",
  },
];

export type ItemResponses = Record<string, number>;

/** Construct score = mean of its items (all items required). */
export function constructScores(items: ItemResponses): Record<ConstructKey, number> {
  const out = {} as Record<ConstructKey, number>;
  for (const key of CONSTRUCT_KEYS) {
    const values = SURVEY_ITEMS.filter((i) => i.construct === key).map((i) => items[i.id]);
    if (values.some((v) => !Number.isInteger(v) || v < 1 || v > LIKERT_POINTS)) {
      throw new RangeError(`Missing or invalid answer for ${CONSTRUCT_LABELS[key]}`);
    }
    out[key] = values.reduce((a, b) => a + b, 0) / values.length;
  }
  return out;
}

export interface StudyStimulus {
  brandName: string;
  headline: string;
  body: string;
  productDescription: string;
}

export function parseStimulus(json: unknown): StudyStimulus | null {
  if (!json || typeof json !== "object") return null;
  const s = json as Record<string, unknown>;
  const ok = ["brandName", "headline", "body", "productDescription"].every(
    (k) => typeof s[k] === "string",
  );
  return ok ? (s as unknown as StudyStimulus) : null;
}
