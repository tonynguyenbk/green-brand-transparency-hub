# Methodology v1.0

Source of truth: `lib/scoring/config.ts`. Every number below is a project-defined methodological choice.
The public `/methodology` page renders the same values directly from the code.

**Measured:** transparency of sustainability communication — specificity, evidence availability and quality,
measurability, third-party verification, target and progress disclosure, accessibility.
**Not measured:** environmental performance, legal compliance, or the truth of claims.

## Green Transparency Score

```text
overall = disclosure × 0.25 + evidence × 0.25 + verification × 0.20
        + targets × 0.15 + accessibility × 0.15
```

All dimensions are 0–100; full precision is stored, display rounds with `Math.round`. The overall score is
**only** calculated when all five dimensions are available — otherwise no snapshot is written and the UI
says "Score cannot yet be calculated because required review data is incomplete."

### 1. Sustainability Disclosure (`lib/scoring/disclosure.ts`)

| Topic | Points |
|---|---:|
| Sustainability / ESG report | 4 |
| Carbon emissions | 4 |
| Material sourcing | 4 |
| Supply chain | 4 |
| Waste / recycling | 3 |
| Water / resource use | 3 |
| Methodology / measurement approach | 3 |

Values: `AVAILABLE`+`CLEAR` = 1, `AVAILABLE`+`PARTIAL` = 0.5, `NOT_FOUND` / `NOT_AVAILABLE` = 0
(the dimension measures *public* disclosure, so "not found during review" is the assessed fact).
`NOT_APPLICABLE` and `PENDING_REVIEW` are **excluded** from the denominator.

```text
disclosure = Σ(points_t × value_t) / Σ(points_t over included topics) × 100
```

Not calculated if fewer than 50% of applicable topics are assessed.

### 2. Evidence Quality (`evidence.ts`)

Evidence level per claim (stored in `Claim.evidenceScore`): 0 none · 1 descriptive · 2 quantitative ·
3 quantitative + source · 4 + methodology · 5 + independent verification.

```text
evidence = average(level / 5) × 100     over VERIFIED/PUBLISHED claims with an assessed level
```

### 3. Third-Party Verification (`verification.ts`)

Ladder (highest rung reached, verified data only):

| Level | Condition |
|---:|---|
| 5 | ≥1 independent-assurance source **and** ≥2 distinct independent mechanisms (distinct bodies of valid verified certifications, recognised-certification sources, assurance providers) |
| 4 | ≥1 `INDEPENDENT_ASSURANCE` source |
| 3 | a valid `VERIFIED` certification or a `RECOGNIZED_CERTIFICATION` source |
| 2 | an `EXTERNAL_REFERENCE` source or a `PARTIALLY_VERIFIED` certification |
| 1 | self-declared material only |
| 0 | none |

`verification = level / 5 × 100`. Certifications with `validTo < asOf` or status `EXPIRED` are not counted.

### 4. Targets & Progress (`targets.ts`)

| Criterion | Points | Rule |
|---|---:|---|
| Specific target | 2 | reviewer flag `isSpecific` |
| Quantitative metric | 3 | `metric` and `targetValue` present |
| Baseline | 2 | `baselineValue` and `baselineYear` |
| Deadline | 2 | `targetYear` |
| Progress update | 3 | `latestProgress` and `progressYear` |
| Historical comparison | 3 | reviewer flag `hasHistoricalData` |

```text
targetScore = points / 15 × 100;   targets = mean(targetScore)   (PENDING_REVIEW targets excluded)
```

No assessed targets: brand `targetsDataState` `NOT_FOUND`/`NOT_AVAILABLE` → 0; otherwise not calculated.

### 5. Information Accessibility (`accessibility.ts`)

Click count (homepage → key evidence; an operational rule, not a scientific law):
1–2 clicks = 5, 3 = 4, 4 = 2, 5+ = 0.

```text
accessibility = (clickPoints + searchability[0–3] + readability[0–3] + evidenceLinkage[0–4]) / 15 × 100
```

Uses the latest audit; all four criteria must be filled in.

## Green Claim Transparency Risk (`claim-risk.ts`)

Reviewer rubric 0–5 per component, normalised ×20.

```text
strength = specificity × 0.25 + evidence × 0.30 + measurability × 0.20
         + verification × 0.15 + context × 0.10
risk     = 100 − strength
0–30 LOW · 31–60 MODERATE · 61–100 HIGH   (classified on the rounded score)
```

If any component is unassessed, risk is `null` ("Risk pending review") and the claim cannot be verified.
`averageClaimRisk` in a snapshot is the mean over scorable claims with a calculated risk.

### Claim Checker (`lib/claims/checker.ts`)

Rules derive the five components from wording, then call the same formula:

```text
specificity   = (broad term ? 20 : 60) + (scope ? 25 : 0) + (quantified ? 15 : 0)
evidence      = (source referenced ? 50 : 0) + (certification ? 50 : 0)
measurability = (quantified ? 60 : 0) + (year ? 20 : 0) + (baseline ? 20 : 0)
verification  = certification / third party ? 100 : 0
context       = (scope ? 40 : 0) + (baseline ? 30 : 0) + (year or methodology ? 30 : 0)
```

`quantified` = percentage or measurement with unit, ignoring a percentage that only modifies a broad term
("100% eco-friendly"). Broad terms are never labelled deceptive.

## Confidence (`confidence.ts`)

Confidence in the **assessment**, not in environmental performance. Points (max 8):

| Factor | Points |
|---|---|
| Verified sources | ≥8 → 2, ≥4 → 1 |
| Source quality (share not marketing/other) | ≥60% → 1 |
| Recency (newest source) | ≤24 months → 1 |
| Missing data (pending disclosure topics + unassessed verified claims + pending targets + missing dimensions) | 0 → 2, ≤2 → 1 |
| Externally verified claims (verification rubric ≥3) | ≥50% → 2, ≥25% → 1 |

≥6 HIGH, ≥3 MEDIUM, else LOW. Fewer than 3 sources is always LOW.

## Transparency gaps (`gaps.ts`)

Derived only from stored data: claims lacking quantitative evidence (level < 2), verified claims with no
linked source, claims without independent verification (rubric ≤ 1), targets without baseline / progress,
no targets found, missing or > 24-month-old sustainability report, disclosure topics not found, expired
certifications, evidence ≥ 4 clicks away.

## Versioning

Each `BrandScore` stores `methodologyVersion`, `calculatedAt`, `sourceCount`, `confidenceLevel` and
`detailsJson` (weights used, explanations). Admins can create a new `MethodologyVersion` with different
overall weights and activate it; existing snapshots are never recalculated in place.

## Limitations

Reviewer judgement in rubric ratings; weights and thresholds not empirically calibrated; only public
information; the Claim Checker analyses wording only; demo data is fictional.
