/**
 * Categorical series colours for brand comparison (max 4 brands).
 * Validated with the dataviz palette validator (light surface): CVD and
 * normal-vision separation pass; slots 3–4 are below 3:1 contrast, so every
 * chart ships with a legend and a data table. Colour follows the brand's
 * position in the user's selection, never its rank.
 */
export const SERIES_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"] as const;

export const CHART_INK = {
  axis: "oklch(0.47 0.012 250)",
  grid: "oklch(0.92 0.005 95)",
  primary: "oklch(0.43 0.072 160)",
};
