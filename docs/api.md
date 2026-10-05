# API

All responses are JSON. Inputs are validated server-side with Zod (`lib/validation/schemas.ts`);
validation errors return `422 { error, fields }`. Write endpoints require an admin session (Supabase cookie
or development cookie) and return `401` otherwise. Bodies are limited to 64 KB.

Admin UI writes use Server Actions (`lib/admin/actions.ts`) that call the same services and schemas.

## Brands

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/brands?q=&industry=&minScore=&maxScore=&risk=LOW\|MODERATE\|HIGH&sort=score_desc\|score_asc\|reviewed_desc\|alpha` | public | Published brands with latest score |
| GET | `/api/brands/:slug` | public | Full public profile (verified claims, evidence, certifications, targets, sources, latest score + details) |
| POST | `/api/brands` | admin | Create brand (`brandSchema`) |
| PATCH | `/api/brands/:id` | admin | Update brand (full payload) |
| DELETE | `/api/brands/:id` | admin | Delete brand (cascade) → 204 |

## Claims

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/brands/:id/claims` | public / admin | id or slug. Public: verified/published claims of published brands. Admin: all claims |
| GET | `/api/claims/:id` | public / admin | Public only when verified/published and brand published |
| POST | `/api/claims` | admin | Create (`claimSchema`); default status `CANDIDATE` |
| PATCH | `/api/claims/:id` | admin | Full update, or `{ "status": "VERIFIED" }` for a review transition. Verifying requires all five rubric components (409 otherwise) |

## Sources

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/brands/:id/sources` | public / admin | id or slug |
| POST | `/api/sources` | admin | Create (`sourceSchema`; http(s) URLs only) |
| PATCH | `/api/sources/:id` | admin | Update |

## Scoring

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/brands/:id/score` | public (published) / admin | `{ latest, history[] }` — each with methodology version, timestamp, source count, confidence |
| POST | `/api/brands/:id/recalculate` | admin | Inserts a new snapshot → `201 { data, gaps }`, or `422 { error, missingDimensions }` when review data is incomplete |

## Compare

`GET /api/compare?brands=verdant-wear,novatech-labs` (2–4 slugs) →
`{ rows[], notFound[], statements[] }`. Statements are neutral ("currently provides more publicly
accessible supporting evidence according to this methodology").

## Claim Checker

`POST /api/claim-checker` with `{ "claim": "Our products are eco-friendly." }` (3–1000 chars) →

```json
{
  "riskScore": 84.75,
  "riskLevel": "HIGH",
  "transparencyStrength": 15.25,
  "components": { "specificity": 45, "evidence": 0, "measurability": 0, "verification": 0, "context": 40 },
  "detectedBroadTerms": ["eco-friendly"],
  "detectedMeasurableInformation": [],
  "missingEvidenceCategories": ["Quantified metric (e.g. % recycled content, tCO2e, kWh)", "..."],
  "possibleMissingContext": ["Material composition", "Recycled percentage", "Certification", "..."],
  "issues": ["\"Eco-friendly\" is a broad environmental statement.", "..."],
  "explanation": ["..."],
  "suggestedWordingPattern": "[Product / scope] contains [X% / quantity + unit] ...",
  "notes": ["This analysis looks only at the wording ..."]
}
```

Nothing is stored.

## Corrections

`POST /api/corrections` — public "Report an issue".
Body: `{ brandId, claimId?, reportType: MISSING_SOURCE|INCORRECT_SOURCE|UPDATED_DATA|CLARIFICATION|OTHER,
message (20–2000 chars), sourceUrl?, reporterRole: CONSUMER|BRAND_REPRESENTATIVE|RESEARCHER|OTHER,
reporterEmail?, website: "" }` → `201 { data: { id } }`. Only published brands and their public claims are
accepted (422 otherwise). `website` is a honeypot and must be empty. Rate limited to 5 reports per 10 minutes
per client (in-memory; use a shared store when running multiple instances) → 429. Admins review reports at
`/admin/corrections`.

## Research study

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/study/:slug/start` | public | `{ consent: true }` → `201 { data: { participantCode, conditionKey } }`. Only ACTIVE studies; balanced random assignment stored server-side; rate limited |
| POST | `/api/study/:slug/responses` | public | `{ participantCode, items: { BT1: 1–5, BT2, BT3, PI1, PI2, PT1, PG1 } }` → 204. All items required; one submission per code |
| GET | `/api/admin/research/:id/export` | admin | Anonymous CSV of completed responses |

## Analytics

`POST /api/analytics` `{ name, properties? }` — `name` ∈ `brand_search, brand_view, claim_expand,
evidence_view, evidence_click, compare_brand, claim_checker_submit, methodology_view` → 204. Logged locally.
