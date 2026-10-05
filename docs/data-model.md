# Data model

Schema: `prisma/schema.prisma`. Missing information is never stored as `0`: nullable rubric fields mean
"not yet assessed", and `MissingDataState` records why something is absent.

| Table | Purpose | Notes |
|---|---|---|
| **Industry** | Grouping for directory filters | `slug` unique |
| **Brand** | Brand profile | `status` (DRAFT/IN_REVIEW/PUBLISHED/ARCHIVED) — only PUBLISHED is public. `isFictional` drives the public notice. `targetsDataState` distinguishes "no targets found" (scores 0) from "not reviewed" (uncalculated). |
| **Source** | A document/page reviewed as evidence | `sourceType`, `verificationLevel` (SELF_DECLARED → INDEPENDENT_ASSURANCE), `status` (ReviewStatus). Only VERIFIED/PUBLISHED sources count or appear publicly. |
| **Claim** | Exact sustainability claim | Rubric fields 0–5 (`specificityScore`, `evidenceScore` = Evidence Level, `measurabilityScore`, `verificationScore`, `contextScore`). `riskScore`/`riskLevel` are written by the claim-risk engine on every save. `origin` records manual vs import. `status` workflow CANDIDATE → IN_REVIEW → VERIFIED → PUBLISHED / ARCHIVED. |
| **ClaimSource** | Links a claim to evidence | `evidenceExcerpt`, `pageNumber`, `evidenceStrength` (STRONG/MODERATE/LIMITED/NOT_FOUND). Unique per (claim, source); same-brand constraint enforced in the service. |
| **Certification** | Third-party certification | `scope` is required so the UI never implies company-wide certification. `verificationStatus`, validity dates (expired ones are not scored). |
| **SustainabilityTarget** | Stated target + progress | Baseline/target/progress values & years are nullable; `isSpecific` and `hasHistoricalData` are reviewer judgements. |
| **DisclosureItem** | One row per brand × disclosure topic | `state` (MissingDataState) + `level` (ABSENT/PARTIAL/CLEAR, required when AVAILABLE). |
| **AccessibilityAudit** | Click count + rubric (searchability 0–3, readability 0–3, evidence linkage 0–4) | Latest audit is scored. |
| **BrandScore** | Immutable score snapshot | Five dimensions, overall, `averageClaimRisk`, `claimCount`, `sourceCount`, `confidenceLevel`, `methodologyVersion`, `calculatedAt`, `detailsJson` (full trace + gaps). Never updated. |
| **MethodologyVersion** | Published methodology versions | `weightsJson` snapshot of config; exactly one `active`. |
| **AdminUser** | App-level admin profile | Allowlist for Supabase users. No passwords stored. |
| **ResearchStudy / ResearchCondition / ResearchResponse** | Foundation for the planned consumer experiment | 5-point Likert construct means (brand trust, purchase intention, perceived transparency, perceived greenwashing), anonymous `participantCode`, consent flag. Not used by MVP flows. |

## Enums

`BrandStatus`, `ClaimStatus`, `ReviewStatus`, `RiskLevel`, `VerificationStatus`, `SourceType`,
`VerificationLevel`, `EvidenceStrength`, `ConfidenceLevel`, `MissingDataState`, `DisclosureLevel`,
`DisclosureTopic`, `SustainabilityCategory`, `AdminRole`, `StudyStatus`.

## Missing-data states

| State | Meaning | Scoring |
|---|---|---|
| `AVAILABLE` | Found and assessed | scored |
| `NOT_AVAILABLE` | Brand states it does not report | 0 for disclosure |
| `NOT_FOUND` | Public evidence not found during review (may exist) | 0 for disclosure / targets |
| `NOT_APPLICABLE` | Not relevant | excluded |
| `PENDING_REVIEW` | Not assessed yet | excluded, lowers confidence |

## Deletion

Deleting a brand cascades to its sources, claims, links, certifications, targets, audits, disclosure items
and snapshots. Deleting a source cascades its claim links and nulls certification/target/disclosure references.
