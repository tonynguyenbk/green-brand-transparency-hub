You are the lead full-stack engineer, product engineer, data engineer, QA engineer, and technical architect responsible for building the complete application described in `PROJECT_SPEC.md`.

Your task is to build a complete, production-quality MVP called:

# Green Brand Transparency Hub

Before coding, read `PROJECT_SPEC.md` completely and treat it as the primary source of truth.

Do not ignore requirements from that file unless they directly conflict with this prompt.

The purpose of this project is NOT to scientifically determine whether a brand is environmentally sustainable.

The platform evaluates:

- transparency of sustainability communication;
- specificity of environmental claims;
- availability and quality of supporting evidence;
- measurability;
- third-party verification;
- target disclosure;
- progress disclosure;
- accessibility of sustainability information.

Never describe a company as a "greenwasher".

Use terminology such as:

- Green Transparency Score
- Green Claim Transparency Risk
- Evidence Strength
- Limited Evidence
- Supporting Evidence Not Found
- Partially Verified
- High Transparency Risk

---

# 1. PROJECT GOAL

Build a complete full-stack web application that allows users to:

1. Search brands.
2. Browse a brand directory.
3. Open a brand profile.
4. View an overall Green Transparency Score.
5. View scoring dimensions.
6. Inspect sustainability claims.
7. Inspect evidence supporting each claim.
8. View Green Claim Transparency Risk.
9. Compare multiple brands.
10. Paste a sustainability claim into a Claim Checker.
11. Understand why a claim may have transparency issues.
12. Read the scoring methodology.
13. View the academic/research framework behind the platform.
14. Allow an admin to enter and manage brands, sources, claims, certifications, targets, and scores.
15. Store methodology versions and historical score snapshots.
16. Provide a foundation for later consumer-behavior experiments.

The final application should be suitable for:

- a Marketing Master's application portfolio;
- a MarTech portfolio;
- a sustainability-marketing case study;
- a consumer-behavior research demonstration.

---

# 2. REQUIRED TECHNOLOGY STACK

Use:

## Frontend

- Next.js latest stable version
- App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Recharts

## Forms and validation

- React Hook Form
- Zod

## Database

Use PostgreSQL.

Prefer:

- Supabase PostgreSQL

Use Prisma ORM unless there is a strong technical reason not to.

## Authentication

Use Supabase Auth for admin authentication.

Public visitors must not require login.

Only administrators require authentication.

## Testing

Use:

- Vitest for unit tests
- React Testing Library where appropriate
- Playwright for important end-to-end flows

## Code quality

Use:

- ESLint
- Prettier
- strict TypeScript

---

# 3. DEVELOPMENT PRINCIPLES

Follow these principles throughout development.

## 3.1 No invented factual brand data

Do NOT fabricate:

- real sustainability reports;
- real certification status;
- sustainability claims;
- ESG statistics;
- carbon emissions;
- source URLs;
- environmental scores.

For development and seed data, use clearly fictional brands.

Examples:

- Verdant Wear
- NovaTech Labs
- PureForm Beauty

Mark all sample data as fictional.

Create a visible development notice when fictional data is being displayed.

---

## 3.2 Missing data must remain missing

Never automatically convert missing information into zero.

Use explicit states:

```text
available
not_available
not_found
not_applicable
pending_review
```

`not_found` means:

> Public supporting evidence was not found during the review.

It does NOT mean:

> Evidence definitely does not exist.

---

## 3.3 Human verification

Any automatically imported or extracted claim must have:

```text
status = candidate
```

It must not affect public scores until marked:

```text
verified
```

---

## 3.4 Methodology transparency

Every calculated score must include:

- methodology version;
- calculation timestamp;
- source count;
- confidence level.

---

# 4. HIGH-LEVEL SYSTEM ARCHITECTURE

Build approximately this architecture:

```text
Browser
   ↓
Next.js Application
   ↓
Server Components / Server Actions / API Routes
   ↓
Domain Services
   ├── Brand Service
   ├── Claim Service
   ├── Evidence Service
   ├── Scoring Engine
   ├── Claim Risk Engine
   └── Comparison Service
   ↓
Prisma ORM
   ↓
PostgreSQL / Supabase
```

Keep domain logic outside UI components.

Do not calculate important scores directly inside React components.

---

# 5. CREATE THIS REPOSITORY STRUCTURE

Create a clean scalable structure similar to:

```text
green-brand-transparency-hub/
│
├── app/
│   ├── page.tsx
│   ├── brands/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── compare/
│   │   └── page.tsx
│   │
│   ├── claim-checker/
│   │   └── page.tsx
│   │
│   ├── methodology/
│   │   └── page.tsx
│   │
│   ├── research/
│   │   └── page.tsx
│   │
│   ├── about/
│   │   └── page.tsx
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── brands/
│   │   ├── claims/
│   │   ├── sources/
│   │   ├── certifications/
│   │   └── targets/
│   │
│   └── api/
│
├── components/
│   ├── layout/
│   ├── brand/
│   ├── claim/
│   ├── evidence/
│   ├── scoring/
│   ├── compare/
│   ├── charts/
│   ├── admin/
│   └── ui/
│
├── lib/
│   ├── db/
│   ├── services/
│   ├── scoring/
│   ├── claims/
│   ├── validation/
│   ├── auth/
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── scripts/
│   ├── import/
│   ├── scrape/
│   └── scoring/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── architecture.md
│   ├── methodology.md
│   ├── data-model.md
│   ├── api.md
│   └── development.md
│
├── PROJECT_SPEC.md
├── README.md
├── .env.example
└── package.json
```

Modify structure if needed, but keep separation of concerns.

---

# 6. DATABASE DESIGN

Create a robust Prisma schema.

At minimum include these models:

## Industry

Fields:

```text
id
name
slug
createdAt
updatedAt
```

---

## Brand

Fields:

```text
id
slug
name
industryId
country
website
logoUrl
description
isFictional
status
createdAt
updatedAt
lastReviewedAt
```

---

## Source

Fields:

```text
id
brandId
title
sourceType
publisher
url
publicationDate
accessedAt
verificationLevel
archivedUrl
notes
status
createdAt
updatedAt
```

---

## Claim

Fields:

```text
id
brandId
claimText
claimCategory
claimDate
specificityScore
evidenceScore
measurabilityScore
verificationScore
contextScore
riskScore
riskLevel
status
createdAt
updatedAt
reviewedAt
```

---

## ClaimSource

Fields:

```text
id
claimId
sourceId
evidenceExcerpt
pageNumber
evidenceStrength
createdAt
```

---

## Certification

Fields:

```text
id
brandId
name
certificationBody
scope
validFrom
validTo
sourceId
verificationStatus
createdAt
updatedAt
```

---

## SustainabilityTarget

Fields:

```text
id
brandId
title
category
metric
baselineValue
baselineYear
targetValue
targetYear
latestProgress
progressYear
verificationStatus
sourceId
createdAt
updatedAt
```

---

## BrandScore

Fields:

```text
id
brandId
overallScore
disclosureScore
evidenceScore
verificationScore
targetsScore
accessibilityScore
confidenceLevel
sourceCount
methodologyVersion
calculatedAt
createdAt
```

Do NOT overwrite old score rows.

Each recalculation creates a new snapshot.

---

## MethodologyVersion

Fields:

```text
id
version
title
description
weightsJson
publishedAt
active
createdAt
```

---

## AccessibilityAudit

Fields:

```text
id
brandId
clickCount
searchabilityScore
readabilityScore
evidenceLinkageScore
notes
reviewedAt
```

---

## AdminUser

If needed in addition to Supabase Auth, store only application-specific profile information.

Do not store passwords yourself.

---

# 7. ENUMS

Create appropriate enums for:

```text
BrandStatus
ClaimStatus
RiskLevel
VerificationStatus
SourceType
VerificationLevel
EvidenceStrength
ConfidenceLevel
MissingDataState
```

Examples:

```text
ClaimStatus:
CANDIDATE
IN_REVIEW
VERIFIED
PUBLISHED
ARCHIVED
```

Risk:

```text
LOW
MODERATE
HIGH
```

---

# 8. SEED DATA

Create realistic but fictional seed data.

Create at least:

- 3 fictional brands
- 3 industries
- 5–8 claims per brand
- 5+ sources per brand
- certifications
- sustainability targets
- accessibility audits
- calculated scores

Suggested fictional brands:

```text
Verdant Wear
NovaTech Labs
PureForm Beauty
```

Make all URLs either:

- `example.com` URLs;
- local placeholders.

Never invent real company URLs.

---

# 9. GREEN TRANSPARENCY SCORE

Implement the scoring engine.

Overall weights:

```text
Sustainability Disclosure    25%
Evidence Quality             25%
Third-Party Verification     20%
Targets & Progress           15%
Information Accessibility    15%
```

Formula:

```text
overall =
  disclosure * 0.25 +
  evidence * 0.25 +
  verification * 0.20 +
  targets * 0.15 +
  accessibility * 0.15
```

Input dimension scores should be normalized to:

```text
0–100
```

Round displayed scores sensibly.

Keep internal calculation precision.

---

# 10. DISCLOSURE SCORE

Base disclosure score on whether information exists for:

```text
Sustainability/ESG report
Carbon emissions
Material sourcing
Supply chain
Waste/recycling
Water/resource use
Methodology
```

Allow:

```text
absent
partial
clear
```

Map them consistently to numeric values.

Document the exact formula in code comments and `docs/methodology.md`.

---

# 11. EVIDENCE QUALITY SCORE

Each claim should have evidence level:

```text
0 = No evidence
1 = Descriptive evidence
2 = Quantitative evidence
3 = Quantitative evidence + source
4 = Quantitative evidence + source + methodology
5 = Quantitative evidence + methodology + independent verification
```

Formula:

```text
EvidenceScore =
average(claimEvidenceLevel / 5) * 100
```

Only VERIFIED or PUBLISHED claims may affect the public score.

---

# 12. VERIFICATION SCORE

Suggested scale:

```text
0 = None
1 = Self-declaration
2 = External reference
3 = Recognized certification
4 = Independent assurance
5 = Multiple relevant independent verification mechanisms
```

Normalize to 0–100.

---

# 13. TARGETS & PROGRESS SCORE

Evaluate each target for:

```text
Specific target
Quantitative metric
Baseline
Deadline
Progress update
Historical comparison
```

Suggested weighted scoring:

```text
Specific target        2
Quantitative metric    3
Baseline               2
Deadline               2
Progress update        3
Historical comparison  3

Total = 15
```

Normalize to 100 for the scoring engine.

---

# 14. ACCESSIBILITY SCORE

Evaluate:

## Click count

Use operational rule:

```text
1 click   excellent
2 clicks  excellent
3 clicks  good
4 clicks  weak
5+ clicks poor
```

Do not describe this as a universal scientific law.

Other criteria:

```text
Searchability
Readability
Evidence linkage
```

Create a deterministic formula.

Expose the scoring explanation in the UI.

---

# 15. GREEN CLAIM TRANSPARENCY RISK

Implement a separate claim risk engine.

Dimensions:

```text
Specificity             25%
Evidence availability   30%
Measurability           20%
External verification   15%
Context completeness    10%
```

All components should be normalized to 0–100.

Formula:

```text
transparencyStrength =
  specificity * 0.25 +
  evidence * 0.30 +
  measurability * 0.20 +
  verification * 0.15 +
  context * 0.10

riskScore = 100 - transparencyStrength
```

Risk classification:

```text
0–30     LOW
31–60    MODERATE
61–100   HIGH
```

Keep thresholds in a config file rather than scattering magic numbers.

---

# 16. CONFIDENCE LEVEL

Implement a confidence indicator.

Possible result:

```text
HIGH
MEDIUM
LOW
```

Derive from:

- number of sources;
- source quality;
- source recency;
- missing data;
- proportion externally verified.

Do not create false precision.

Document that confidence refers to confidence in the transparency assessment, not environmental performance.

---

# 17. PUBLIC PAGES

Build all these pages.

---

# 18. HOMEPAGE

Route:

```text
/
```

Sections:

## Hero

Headline:

```text
How transparent is the sustainability story behind the brands you buy?
```

Supporting text:

```text
Explore sustainability claims, inspect supporting evidence, and compare how transparently brands communicate environmental commitments.
```

Primary CTA:

```text
Search a brand
```

Secondary CTA:

```text
Check a claim
```

---

Homepage content:

1. Search.
2. Featured fictional brands.
3. How the scoring system works.
4. Green Claim Transparency Risk explanation.
5. Comparison preview.
6. Marketing research angle.
7. Methodology CTA.
8. Disclaimer.

---

# 19. BRAND DIRECTORY

Route:

```text
/brands
```

Features:

- search;
- industry filter;
- score range filter;
- risk filter;
- sorting.

Sort options:

```text
Highest transparency score
Lowest transparency score
Newest review
Alphabetical
```

Each card:

- brand name;
- industry;
- score;
- confidence;
- number of analyzed claims;
- last reviewed.

---

# 20. BRAND PROFILE

Route:

```text
/brands/[slug]
```

Display:

## Header

- Brand name
- Industry
- Country
- Website
- Last reviewed
- Fictional-data badge where relevant

## Overall score

Large:

```text
82 / 100
```

Also:

```text
Confidence: Medium
```

## Score breakdown

Use chart or progress bars for:

- Disclosure
- Evidence
- Verification
- Targets
- Accessibility

## Claims

Create a table or cards with:

- claim;
- category;
- evidence strength;
- risk;
- status.

Allow filtering by category/risk.

## Evidence

Clicking a claim should reveal:

- exact claim;
- source;
- source type;
- publication date;
- evidence excerpt;
- methodology;
- verification;
- missing information;
- transparency-risk explanation.

## Certifications

Show:

- certification;
- certification body;
- scope;
- validity period;
- verification status.

Clearly show certification scope.

## Targets

Show:

- target;
- baseline;
- target year;
- progress;
- status.

## Transparency gaps

Generate from actual stored data.

Examples:

```text
No baseline disclosed for 2 targets.
3 claims lack quantitative evidence.
Latest sustainability report is older than 24 months.
```

Do not fabricate.

---

# 21. COMPARE PAGE

Route:

```text
/compare
```

Allow 2–4 brands.

Show comparison table for:

```text
Overall score
Disclosure
Evidence
Verification
Targets
Accessibility
Average claim risk
Number of analyzed claims
Source count
Confidence
```

Include comparison charts.

Avoid language like:

```text
Brand A is greener.
```

Use:

```text
Brand A currently provides more publicly accessible supporting evidence according to this methodology.
```

---

# 22. CLAIM CHECKER

Route:

```text
/claim-checker
```

MVP must work without AI.

Create a rule-based analyzer.

Input:

```text
Our packaging is 100% eco-friendly.
```

Detect potentially vague environmental phrases.

Initial phrase dictionary:

```text
eco-friendly
green
planet-friendly
good for the environment
sustainable
clean
responsible
natural
climate-friendly
conscious
ethical
```

Do NOT automatically label these phrases deceptive.

Instead check whether the claim also contains:

- percentage;
- measurement;
- year;
- baseline;
- certification;
- source;
- quantifiable metric;
- scope.

Return:

```text
Risk score
Risk level
Detected broad terms
Detected measurable information
Missing evidence categories
Explanation
Suggested stronger wording pattern
```

Example:

```text
Transparency Risk: HIGH

Potential issue:
"Eco-friendly" is a broad environmental statement.

Detected measurable information:
None

Possible missing context:
- Material composition
- Recycled percentage
- Certification
- Lifecycle scope
- Measurement methodology
```

Do not assert legal greenwashing.

---

# 23. METHODOLOGY PAGE

Route:

```text
/methodology
```

Explain:

- What is measured.
- What is not measured.
- Score dimensions.
- Weights.
- Claim-risk model.
- Evidence levels.
- Confidence levels.
- Missing-data handling.
- Update process.
- Methodology versioning.
- Limitations.

Display active methodology version.

Include disclaimer.

---

# 24. RESEARCH PAGE

Route:

```text
/research
```

Explain theoretical foundation.

Include:

## Information Asymmetry

Explain that brands possess more sustainability information than consumers.

## Signaling Theory

Explain that environmental communication acts as a signal.

## Trust Transfer Theory

Explain how third-party verification may influence brand trust.

## Proposed consumer model

Display:

```text
Green Claim Transparency
        ↓
Perceived Credibility
        ↓
Brand Trust
        ↓
Purchase Intention
```

Optional moderator:

```text
Third-Party Verification
```

Also explain planned A/B experiment.

Do NOT claim the experiment has already demonstrated effects unless data exists.

---

# 25. ABOUT PAGE

Route:

```text
/about
```

Explain:

- project purpose;
- academic motivation;
- transparency principles;
- project limitations.

---

# 26. ADMIN

Create protected routes.

Route:

```text
/admin
```

Admin dashboard should show:

- brands;
- claims pending review;
- source counts;
- last scoring runs;
- data-quality warnings.

CRUD modules:

```text
Brands
Claims
Sources
Certifications
Targets
Accessibility Audits
Methodology
```

---

# 27. ADMIN BRAND WORKFLOW

Admin should be able to:

1. Create brand.
2. Edit brand.
3. Add sources.
4. Add claims.
5. Connect claims to sources.
6. Add certifications.
7. Add sustainability targets.
8. Complete accessibility audit.
9. Verify claims.
10. Calculate score.
11. Publish profile.

---

# 28. CLAIM REVIEW WORKFLOW

Statuses:

```text
CANDIDATE
IN_REVIEW
VERIFIED
PUBLISHED
ARCHIVED
```

Candidate claims must never affect public score.

Admin interface should prominently display this.

---

# 29. SCORE RECALCULATION

Implement:

```text
Recalculate Score
```

Flow:

```text
Load verified data
     ↓
Calculate all dimensions
     ↓
Calculate overall score
     ↓
Calculate confidence
     ↓
Create new BrandScore snapshot
```

Never update old snapshots.

---

# 30. API

Create clean APIs or server actions for:

## Brands

```text
GET /api/brands
GET /api/brands/:slug
POST /api/brands
PATCH /api/brands/:id
DELETE /api/brands/:id
```

Admin writes must require auth.

---

## Claims

```text
GET /api/brands/:id/claims
GET /api/claims/:id
POST /api/claims
PATCH /api/claims/:id
```

---

## Sources

```text
GET /api/brands/:id/sources
POST /api/sources
PATCH /api/sources/:id
```

---

## Scoring

```text
GET /api/brands/:id/score
POST /api/brands/:id/recalculate
```

---

## Compare

```text
GET /api/compare?brands=brand-a,brand-b
```

---

## Claim Checker

```text
POST /api/claim-checker
```

Input:

```json
{
  "claim": "Our products are eco-friendly."
}
```

Return structured JSON.

---

# 31. VALIDATION

Use Zod for all user-controlled inputs.

Validate:

- URLs;
- numbers;
- dates;
- score ranges;
- enums;
- IDs;
- text length.

Never trust client-side validation alone.

---

# 32. SECURITY

Implement reasonable web security.

Requirements:

- protect admin routes;
- validate server inputs;
- avoid raw SQL unless necessary;
- do not expose secrets;
- use `.env`;
- create `.env.example`;
- prevent unauthorized write APIs;
- sanitize user-provided content displayed as rich text;
- use server-side authorization checks.

---

# 33. UI STYLE

Design should feel:

```text
neutral
analytical
credible
editorial
data-driven
modern
academic
```

Avoid an activist or accusatory visual tone.

Recommended appearance:

- white or neutral background;
- dark readable typography;
- restrained green accents;
- subtle borders;
- generous whitespace;
- dashboard-quality charts.

Do not overuse gradients.

Do not use excessive animations.

---

# 34. RESPONSIVE DESIGN

Support:

- desktop;
- tablet;
- mobile.

The core flows must remain usable on mobile.

---

# 35. ACCESSIBILITY

Implement:

- semantic HTML;
- keyboard navigation;
- focus states;
- accessible forms;
- labels;
- ARIA only where needed;
- chart text alternatives;
- sufficient contrast.

---

# 36. LOADING AND ERROR STATES

Every important page must have:

- loading state;
- empty state;
- error state.

Examples:

```text
No claims have been reviewed yet.
No supporting sources are currently available.
Score cannot yet be calculated because required review data is incomplete.
```

Avoid misleading zeros.

---

# 37. SCRAPING MODULE FOUNDATION

Do not make scraping a dependency for the MVP.

Create a separate Python or TypeScript script area.

Preferred Python stack:

```text
requests
BeautifulSoup
PyMuPDF
pandas
```

Optional:

```text
Playwright
```

Suggested pipeline:

```text
Brand URL
   ↓
Discover sustainability page
   ↓
Fetch permitted public page
   ↓
Extract text
   ↓
Detect candidate paragraphs
   ↓
Export candidate claims
   ↓
Human review
```

Follow:

- robots.txt;
- public access restrictions;
- respectful rate limits;
- terms of service.

Do not bypass authentication or anti-bot controls.

---

# 38. CANDIDATE CLAIM EXTRACTION

Create an optional script that detects sustainability-related paragraphs using keywords such as:

```text
sustainable
carbon
emissions
recycled
renewable
climate
water
waste
packaging
responsible
certified
net zero
```

Export candidates into JSON.

Every imported item must have:

```text
status = CANDIDATE
```

---

# 39. PRODUCT ANALYTICS FOUNDATION

Create an analytics abstraction.

Track events such as:

```text
brand_search
brand_view
claim_expand
evidence_view
evidence_click
compare_brand
claim_checker_submit
methodology_view
```

For development, log locally.

Structure code so PostHog or another analytics service could be connected later.

Do not require paid external analytics for initial operation.

---

# 40. CONSUMER EXPERIMENT FOUNDATION

Do not build a massive research platform.

Create data models and documentation supporting a later experiment.

Potential models:

```text
ResearchStudy
ResearchCondition
ResearchResponse
```

Study:

```text
Control
vs
Transparency Hub condition
```

Variables:

```text
Brand Trust
Purchase Intention
Perceived Transparency
Perceived Greenwashing
```

Use 5-point Likert scales.

Do not make the research module a blocker for MVP completion.

---

# 41. TESTING

Write real tests.

## Scoring unit tests

Test:

- overall weighted score;
- evidence calculation;
- claim risk;
- boundary thresholds;
- missing fields;
- confidence levels.

Examples:

```text
risk score 30 → LOW
risk score 31 → MODERATE
risk score 60 → MODERATE
risk score 61 → HIGH
```

---

# 42. INTEGRATION TESTS

Test:

```text
Brand
→ verified claims
→ sources
→ score calculation
→ score snapshot
```

Also test:

```text
candidate claim
→ must not affect score
```

---

# 43. E2E TESTS

Use Playwright for at least:

## Flow A

```text
Homepage
→ search brand
→ open profile
→ inspect claim
→ inspect evidence
```

## Flow B

```text
Compare
→ choose two brands
→ see comparison
```

## Flow C

```text
Claim checker
→ paste claim
→ receive analysis
```

## Flow D

Admin authenticated:

```text
create claim
→ mark verified
→ recalculate brand score
```

---

# 44. DOCUMENTATION

Generate:

## README.md

Include:

- project overview;
- screenshot placeholders;
- feature list;
- stack;
- setup;
- environment variables;
- database setup;
- migrations;
- seed;
- dev command;
- tests;
- production build.

---

## docs/architecture.md

Explain system design.

---

## docs/data-model.md

Explain every main table.

---

## docs/methodology.md

Explain scoring formulas.

---

## docs/api.md

Document routes.

---

## docs/development.md

Explain workflow.

---

# 45. ENVIRONMENT SETUP

Create `.env.example`.

Example variables:

```text
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not commit actual secrets.

---

# 46. LOCAL DEVELOPMENT

The application should be runnable with commands similar to:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

If actual commands differ, document them clearly.

---

# 47. PACKAGE SCRIPTS

Create useful scripts:

```json
{
  "dev": "...",
  "build": "...",
  "start": "...",
  "lint": "...",
  "typecheck": "...",
  "test": "...",
  "test:watch": "...",
  "test:e2e": "...",
  "seed": "..."
}
```

---

# 48. QUALITY GATES

Before considering the application complete, run:

```text
lint
typecheck
unit tests
production build
```

Fix all meaningful failures.

Do not leave known compile errors.

---

# 49. MVP ACCEPTANCE CRITERIA

The product is complete when a public visitor can:

### A

Search a fictional brand.

### B

Open a brand profile.

### C

See:

```text
Green Transparency Score
Score breakdown
Confidence
Source count
Last reviewed
```

### D

See sustainability claims.

### E

Open a claim and inspect evidence.

### F

Understand claim transparency risk.

### G

Compare at least two brands.

### H

Use Claim Checker.

### I

Understand methodology.

### J

Understand the research framework.

---

An administrator must be able to:

### K

Create and edit a brand.

### L

Add a source.

### M

Add a claim.

### N

Link evidence.

### O

Verify the claim.

### P

Add certifications and targets.

### Q

Run scoring.

### R

Generate a new score snapshot.

---

# 50. DO NOT OVERENGINEER

Do NOT add these unless needed:

- microservices;
- Kafka;
- Kubernetes;
- blockchain;
- GraphQL;
- vector databases;
- complex ML pipelines;
- browser extension;
- native mobile app.

Keep the architecture clean and understandable for a student portfolio.

---

# 51. IMPORTANT PRODUCT COPY RULES

Never write:

```text
Brand X is greenwashing.
Brand X is fake.
Brand X is environmentally harmful.
Brand X is sustainable.
```

Prefer:

```text
This claim currently has limited publicly accessible supporting evidence.

This claim has a high transparency risk according to the current methodology.

The available public information does not provide a measurable baseline.

This certification appears to apply to a limited scope rather than the entire company.
```

---

# 52. DISCLAIMER

Include a visible methodology disclaimer approximately equivalent to:

```text
Green Brand Transparency Hub evaluates the transparency and verifiability of publicly available sustainability communications.

Scores do not represent a comprehensive assessment of environmental performance and should not be interpreted as certification or a definitive judgement of a brand's sustainability.
```

---

# 53. PORTFOLIO VALUE

Keep the implementation aligned with this narrative:

```text
Marketing Theory
       +
Consumer Behavior
       +
Data Transparency
       +
Software Product
       +
Marketing Technology
```

The final application should demonstrate:

- structured thinking;
- product strategy;
- marketing understanding;
- research literacy;
- data design;
- UX;
- software engineering.

---

# 54. IMPLEMENTATION ORDER

Build in this order automatically.

Do not ask me for confirmation after every phase.

Proceed to the next phase unless blocked by missing credentials or an unavoidable external dependency.

## Phase 1

- initialize project;
- configure TypeScript;
- configure Tailwind;
- configure shadcn/ui;
- install dependencies;
- create repository structure.

## Phase 2

- Prisma schema;
- migrations;
- seed data.

## Phase 3

- scoring engine;
- claim-risk engine;
- confidence engine;
- unit tests.

## Phase 4

- layout;
- homepage;
- brand directory;
- brand profile.

## Phase 5

- claim detail;
- evidence UI;
- certification UI;
- target UI.

## Phase 6

- compare page.

## Phase 7

- claim checker.

## Phase 8

- methodology;
- research;
- about.

## Phase 9

- Supabase authentication;
- admin area;
- CRUD workflows.

## Phase 10

- scoring recalculation workflow;
- score snapshots.

## Phase 11

- scraping foundation;
- candidate import.

## Phase 12

- analytics abstraction;
- research schema foundation.

## Phase 13

- tests;
- accessibility review;
- responsive review.

## Phase 14

- README;
- docs;
- final cleanup.

---

# 55. WHILE IMPLEMENTING

After every major phase:

1. Run relevant tests.
2. Fix compilation errors.
3. Check TypeScript.
4. Update documentation where necessary.

Do not leave code knowingly broken because it will be “fixed later.”

---

# 56. WHEN SOMETHING IS AMBIGUOUS

Prefer:

- simplicity;
- maintainability;
- academic defensibility;
- transparent methodology;
- explicit assumptions.

Document assumptions in:

```text
docs/development.md
```

Do not block development over minor ambiguities.

---

# 57. WHEN EXTERNAL CREDENTIALS ARE MISSING

If Supabase credentials are unavailable:

1. Keep Supabase integration ready.
2. Make development mode work locally where possible.
3. Document exact steps needed to connect Supabase later.

Do not stop the entire project.

---

# 58. FINAL REVIEW

At the end, inspect the entire codebase.

Check:

- no broken imports;
- no unused major modules;
- no TypeScript errors;
- no fake real-brand data;
- no accidental accusations of greenwashing;
- no secrets;
- no obvious security issues;
- no scoring formula duplication;
- no score calculation inside UI components;
- methodology documentation matches actual code.

---

# 59. FINAL OUTPUT TO ME

When implementation is finished, provide a concise report containing:

## Completed

List implemented features.

## Architecture

Summarize architecture.

## Important files

Show key files.

## Database

Summarize schema.

## Scoring

Summarize implemented formulas.

## Tests

State which tests pass.

## Run locally

Give exact commands.

## Environment variables

List required variables.

## Remaining external setup

For example:

```text
Supabase project creation
Deployment credentials
Real data population
```

## Recommended next steps

Maximum 5 items.

---

# 60. START NOW

First:

1. Read `PROJECT_SPEC.md`.
2. Inspect the existing repository.
3. Preserve any correct existing work.
4. Create a brief internal implementation plan.
5. Immediately begin implementing Phase 1.
6. Continue sequentially through the full MVP.
7. Do not stop merely because one optional external integration is unavailable.

Build a coherent, working product rather than a collection of disconnected demo pages.

The final result must feel like one complete application suitable for demonstration in a university Marketing application portfolio.