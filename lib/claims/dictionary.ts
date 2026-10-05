/**
 * Rule dictionaries for the Claim Checker. Broad terms are NOT treated as
 * deceptive — they are flagged only so the checker can look for the
 * measurable context that would make them verifiable.
 */

export interface BroadTerm {
  term: string;
  pattern: RegExp;
  /** Context that would typically make this wording verifiable. */
  suggestedContext: string[];
}

const GENERIC_CONTEXT = [
  "Defined scope (which product, line or operation)",
  "Quantified metric",
  "Measurement methodology",
  "Independent certification or verification",
];

export const BROAD_TERMS: BroadTerm[] = [
  {
    term: "eco-friendly",
    pattern: /\beco[\s-]?friendly\b/i,
    suggestedContext: [
      "Material composition",
      "Recycled percentage",
      "Certification",
      "Lifecycle scope",
      "Measurement methodology",
    ],
  },
  {
    term: "green",
    pattern: /\bgreen(er|est)?\b(?![\s-]?house)/i,
    suggestedContext: GENERIC_CONTEXT,
  },
  {
    term: "planet-friendly",
    pattern: /\bplanet[\s-]?friendly\b/i,
    suggestedContext: [
      "Specific environmental attribute",
      "Lifecycle scope",
      "Measurement methodology",
    ],
  },
  {
    term: "good for the environment",
    pattern: /\b(good|better|kind(er)?)\s+(for|to)\s+(the\s+)?(environment|planet|earth)\b/i,
    suggestedContext: [
      "Comparison baseline",
      "Specific environmental attribute",
      "Lifecycle assessment",
    ],
  },
  {
    term: "sustainable",
    pattern: /\bsustainabl[ey]\b/i,
    suggestedContext: [
      "Definition of 'sustainable' used",
      "Quantified metric",
      "Certification or standard",
      "Scope",
    ],
  },
  {
    term: "clean",
    pattern: /\bclean(er|est)?\b/i,
    suggestedContext: [
      "Ingredient or energy definition",
      "Excluded substances list",
      "Standard applied",
    ],
  },
  {
    term: "responsible",
    pattern: /\bresponsibl[ey]\b/i,
    suggestedContext: ["Sourcing standard", "Share of supply covered", "Audit or certification"],
  },
  {
    term: "natural",
    pattern: /\bnatural\b/i,
    suggestedContext: ["Percentage of natural-origin content", "Standard used to define 'natural'"],
  },
  {
    term: "climate-friendly",
    pattern: /\bclimate[\s-]?(friendly|positive|neutral|smart)\b/i,
    suggestedContext: [
      "Emissions scope (1, 2, 3)",
      "Baseline year",
      "Offsetting vs reduction split",
      "Verification body",
    ],
  },
  {
    term: "conscious",
    pattern: /\bconscious(ly)?\b/i,
    suggestedContext: [
      "Specific attribute behind 'conscious'",
      "Share of range covered",
      "Criteria used",
    ],
  },
  {
    term: "ethical",
    pattern: /\bethical(ly)?\b/i,
    suggestedContext: ["Standard or code of conduct", "Audit coverage", "Supplier transparency"],
  },
];

/** Signals of measurable or verifiable information. */
export const MEASURABLE_SIGNALS = {
  percentage: /\b\d{1,3}(?:[.,]\d+)?\s?(?:%|percent\b|per\s?cent\b)/i,
  measurement:
    /\b\d+(?:[.,]\d+)?\s?(?:k?g|kilograms?|tonnes?|tons?|t\s?co2e?|tco2e?|co2e?|kwh|mwh|gwh|litres?|liters?|m3|m³|km|miles?|units?)\b/i,
  year: /\b(?:19|20)\d{2}\b/,
  baseline:
    /\b(?:baseline|compared\s+(?:with|to)|relative\s+to|versus|vs\.?|from\s+(?:a\s+)?(?:19|20)\d{2}\s+(?:level|baseline)|since\s+(?:19|20)\d{2})\b/i,
  certification:
    /\b(?:certified|certification|certificate|verified\s+by|audited|assured\s+by|independent(?:ly)?\s+(?:verified|assured|audited)|third[\s-]party|ISO\s?\d{4,5}|FSC|GOTS|Fairtrade|B\s?Corp|Cradle\s+to\s+Cradle|EU\s+Ecolabel|SBTi|science[\s-]based\s+targets?)\b/i,
  source:
    /\b(?:according\s+to|source:|see\s+(?:our|the)|report(?:ed)?\s+in|published\s+in|data\s+from|(?:sustainability|impact|esg|annual)\s+report|https?:\/\/\S+|www\.\S+)/i,
  scope:
    /\b(?:scope\s+[123]|packaging|bottles?|garments?|t-?shirts?|products?|product\s+line|collection|range|operations?|facilit(?:y|ies)|stores?|offices?|factor(?:y|ies)|supply\s+chain|suppliers?|lifecycle|life\s+cycle|cradle[\s-]to[\s-](?:gate|grave)|materials?|polyester|cotton|ingredients?|devices?|batteries?|shipping|logistics)\b/i,
  methodology:
    /\b(?:methodology|measured\s+(?:using|by|with|according)|calculated\s+(?:using|with|according)|life\s?cycle\s+assessment|LCA|GHG\s+Protocol|ISO\s?14064|ISO\s?14067)\b/i,
} as const;

export type MeasurableSignal = keyof typeof MEASURABLE_SIGNALS;

export const SIGNAL_LABELS: Record<MeasurableSignal, string> = {
  percentage: "Percentage",
  measurement: "Measurement with unit",
  year: "Year or timeframe",
  baseline: "Baseline or comparison",
  certification: "Certification / third-party verification",
  source: "Referenced source",
  scope: "Defined scope",
  methodology: "Measurement methodology",
};

/** Missing-evidence categories reported when a signal is absent. */
export const MISSING_CATEGORY_LABELS: Record<MeasurableSignal, string> = {
  percentage: "Quantified share (e.g. % recycled content)",
  measurement: "Quantifiable metric with unit (e.g. tCO2e, kWh, litres)",
  year: "Timeframe or reporting year",
  baseline: "Baseline year or comparison point",
  certification: "Certification or independent verification",
  source: "Link to a supporting source or report",
  scope: "Scope (which product, material or operation)",
  methodology: "Measurement methodology",
};

/**
 * A percentage that directly modifies a broad term ("100% eco-friendly")
 * does not describe a measurable attribute.
 */
export const PERCENT_MODIFYING_BROAD_TERM =
  /\b\d{1,3}\s?%\s+(?:eco[\s-]?friendly|green|sustainabl[ey]|natural|clean|planet[\s-]?friendly|climate[\s-]?friendly|ethical|responsible|conscious)\b/i;
