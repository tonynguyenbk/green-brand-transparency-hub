/**
 * Small, dependency-free descriptive and inferential statistics for the
 * exploratory study. Results must be reported cautiously (small, convenience
 * samples); nothing here implies representativeness or causality beyond the
 * randomised comparison.
 */

export function mean(xs: number[]): number | null {
  return xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample variance (n − 1). */
export function variance(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = mean(xs)!;
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
}

export function standardDeviation(xs: number[]): number | null {
  const v = variance(xs);
  return v === null ? null : Math.sqrt(v);
}

/**
 * Cronbach's alpha for k items. `rows` = one array of k item scores per
 * respondent. Returns null with fewer than 2 items, 2 respondents or zero
 * total-score variance.
 */
export function cronbachAlpha(rows: number[][]): number | null {
  if (rows.length < 2) return null;
  const k = rows[0].length;
  if (k < 2 || rows.some((r) => r.length !== k)) return null;
  const itemVars = Array.from({ length: k }, (_, j) => variance(rows.map((r) => r[j]))!);
  const totalVar = variance(rows.map((r) => r.reduce((a, b) => a + b, 0)))!;
  if (totalVar === 0) return null;
  return (k / (k - 1)) * (1 - itemVars.reduce((a, b) => a + b, 0) / totalVar);
}

export interface WelchResult {
  t: number;
  df: number;
  p: number;
  meanDifference: number;
  /** Cohen's d using the pooled SD (descriptive effect size). */
  cohensD: number | null;
}

/** Welch's unequal-variances t-test (two-tailed). Requires n ≥ 2 per group. */
export function welchTTest(a: number[], b: number[]): WelchResult | null {
  if (a.length < 2 || b.length < 2) return null;
  const ma = mean(a)!;
  const mb = mean(b)!;
  const va = variance(a)!;
  const vb = variance(b)!;
  const sa = va / a.length;
  const sb = vb / b.length;
  const se = Math.sqrt(sa + sb);
  if (se === 0) return null;
  const t = (ma - mb) / se;
  const df = (sa + sb) ** 2 / (sa ** 2 / (a.length - 1) + sb ** 2 / (b.length - 1));
  const pooled = Math.sqrt(((a.length - 1) * va + (b.length - 1) * vb) / (a.length + b.length - 2));
  return {
    t,
    df,
    p: studentTTwoTailedP(t, df),
    meanDifference: ma - mb,
    cohensD: pooled === 0 ? null : (ma - mb) / pooled,
  };
}

/** Two-tailed p-value of Student's t: P(|T| ≥ |t|) = I_{df/(df+t²)}(df/2, 1/2). */
export function studentTTwoTailedP(t: number, df: number): number {
  const x = df / (df + t * t);
  return Math.min(1, Math.max(0, regularizedIncompleteBeta(x, df / 2, 0.5)));
}

/** Regularized incomplete beta I_x(a, b) via Lentz's continued fraction. */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lnBeta = logGamma(a + b) - logGamma(a) - logGamma(b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b + lnBeta);
  if (x < (a + 1) / (a + b + 2)) return (front * betaContinuedFraction(x, a, b)) / a;
  return 1 - (front * betaContinuedFraction(1 - x, b, a)) / b;
}

function betaContinuedFraction(x: number, a: number, b: number): number {
  const EPS = 1e-14;
  const TINY = 1e-300;
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPS) break;
  }
  return h;
}

/** Lanczos approximation of ln Γ(z). */
export function logGamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
