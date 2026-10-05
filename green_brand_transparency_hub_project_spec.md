# Green Brand Transparency Hub
## Product & Technical Specification for Marketing Portfolio Project

**Project type:** Marketing Technology / Sustainability / Consumer Behavior / Brand Transparency  
**Primary purpose:** Build a portfolio-grade digital product for university/master's applications in Marketing, Marketing Analytics, Consumer Behavior, Sustainability Marketing, or Marketing Technology.  
**Working title:** **Green Brand Transparency Hub — Web Tra Cứu & Đánh Giá Mức Độ “Xanh” Của Thương Hiệu**  
**Core positioning:** Do **not** claim to scientifically determine whether a brand is “green.” Instead, evaluate the **transparency, evidence quality, accessibility, and verifiability of sustainability-related brand communication**.

---

# 1. Executive Summary

Green Brand Transparency Hub is a web platform that helps consumers and marketing professionals:

1. Search for brands.
2. View sustainability-related claims made by those brands.
3. Inspect the evidence supporting each claim.
4. Review a structured **Green Transparency Score**.
5. Assess **Green Claim Transparency Risk** instead of making direct accusations of greenwashing.
6. Compare brands within the same industry.
7. Understand how transparent communication may influence **brand trust** and **purchase intention**.
8. Provide marketing managers with recommendations for improving sustainability communication.

The project is intentionally positioned at the intersection of:

- Marketing
- Consumer Behavior
- Sustainability Communication
- Brand Trust
- Marketing Analytics
- UX/UI
- Data Transparency
- MarTech
- Ethical Communication

The strongest academic angle is not “Which brand is greener?” but:

> **How can a digital transparency tool reduce information asymmetry in sustainability communication and influence consumer trust and purchase intention?**

---

# 2. Strategic Positioning

## 2.1 What the project IS

The project evaluates:

- How specific a sustainability claim is.
- Whether evidence exists.
- Whether evidence is quantitative.
- Whether the methodology is disclosed.
- Whether there is independent verification.
- Whether targets have baselines and timelines.
- Whether progress is reported.
- Whether consumers can easily access the information.
- Whether environmental communication is clear and understandable.

## 2.2 What the project IS NOT

The system should NOT claim:

- “Brand X is truly sustainable.”
- “Brand X is green.”
- “Brand X is destroying the environment.”
- “Brand X is greenwashing.”

Instead use careful language such as:

- “Transparency score”
- “Evidence strength”
- “Green claim transparency risk”
- “Limited supporting evidence”
- “Partially verifiable claim”
- “High transparency risk”
- “Publicly available evidence not found”

This distinction protects the project academically, ethically, and legally.

---

# 3. Core Research Problem

Consumers increasingly encounter claims such as:

- Eco-friendly
- Sustainable
- Carbon neutral
- Net zero
- Recyclable
- Organic
- Responsible sourcing
- Green packaging
- Climate positive
- Ethical production

However, most consumers do not have the time, expertise, or tools to verify whether these claims are supported by credible evidence.

This creates:

- Information asymmetry
- Consumer confusion
- Trust problems
- Potential greenwashing risk
- Difficulty comparing brands fairly

## Core research question

> **How can digital transparency tools help consumers evaluate sustainability claims and build trust in brands?**

## Supporting research questions

1. Does greater transparency increase brand trust?
2. Does evidence-backed communication increase purchase intention?
3. Does third-party verification strengthen consumer trust?
4. Does easier access to sustainability evidence improve perceived credibility?
5. Do vague green claims create higher perceived greenwashing risk?
6. Does using the Hub change consumer perceptions compared with seeing brand advertising alone?

---

# 4. Marketing Theoretical Framework

The product should explicitly connect to marketing theory.

## 4.1 Information Asymmetry

Brands often have substantially more information than consumers about:

- Supply chain
- Material sourcing
- Carbon emissions
- Manufacturing
- Certifications
- Sustainability targets

The Hub attempts to reduce this asymmetry by consolidating evidence in one place.

Conceptual flow:

```text
Brand possesses information
        ↓
Consumer receives simplified marketing claim
        ↓
Information asymmetry
        ↓
Difficulty evaluating credibility
        ↓
Transparency Hub
        ↓
Evidence becomes easier to access
        ↓
Better-informed consumer judgement
```

---

## 4.2 Signaling Theory

Brands send “green signals” through:

- Sustainability claims
- Certifications
- ESG reports
- Advertising
- Packaging
- Corporate sustainability pages

Strong signals are costly and verifiable.

Weak signals may be:

- Vague
- Unquantified
- Unsupported
- Difficult to verify

The platform evaluates the **quality of the signal**, not only its existence.

Example:

Weak signal:

> “Designed with the planet in mind.”

Stronger signal:

> “This product contains 75% post-consumer recycled polyester, verified by [third party], compared with a 2024 baseline.”

---

## 4.3 Trust Transfer Theory

Consumers may transfer trust from a credible third party to a brand.

Example:

```text
Trusted Certification
        ↓
Perceived Credibility
        ↓
Trust Transfer
        ↓
Brand Trust
```

Possible third-party signals:

- FSC
- GOTS
- Fairtrade
- ISO standards
- B Corp
- Science-based targets
- Independent assurance

Important:

Certification must not automatically mean the entire company is sustainable.

The platform should state exactly what the certification applies to.

---

## 4.4 Brand Trust

Potential variables:

- Reliability
- Honesty
- Credibility
- Transparency
- Integrity

Suggested survey items:

> I believe this brand communicates honestly about sustainability.

> I trust the environmental information provided by this brand.

> I believe this brand provides sufficient evidence for its environmental claims.

Use 5-point or 7-point Likert scales.

---

## 4.5 Purchase Intention

Possible items:

> I would consider purchasing from this brand.

> I am more likely to choose this brand over a similar alternative.

> Sustainability information would influence my purchase decision.

---

# 5. Target Users

## Persona A — Consumer

Needs:

- Search brand quickly.
- Understand claims.
- See evidence.
- Compare competitors.
- Avoid reading 100-page ESG reports.

Main value:

> “Help me understand how transparent the brand is before I trust its green marketing.”

---

## Persona B — Marketing Manager

Needs:

- Benchmark communication against competitors.
- Find weak claims.
- Identify missing evidence.
- Improve communication quality.
- Reduce reputational risk.

Main value:

> “Show me where our sustainability communication lacks clarity, evidence, or accessibility.”

---

## Persona C — Researcher / Student

Needs:

- Structured sustainability communication data.
- Brand comparison.
- Claim evidence dataset.
- Consumer behavior research.

---

# 6. MVP Scope

The MVP should focus on four core features:

1. **Brand Search**
2. **Green Transparency Score**
3. **Claim Evidence / Claim Checker**
4. **Brand Comparison**

Optional after MVP:

5. Brand dashboard
6. Automated scraping
7. AI claim extraction
8. Consumer experiment module
9. Personalized recommendations

---

# 7. Recommended MVP User Journey

```text
Homepage
   ↓
Search a brand
   ↓
Brand Profile
   ↓
View Green Transparency Score
   ↓
Inspect sustainability claims
   ↓
View evidence
   ↓
View transparency risk
   ↓
Compare with competitors
```

Alternative journey:

```text
Paste green claim
   ↓
Claim Checker
   ↓
Detect vague wording
   ↓
Check evidence criteria
   ↓
Transparency Risk
   ↓
Recommendations
```

---

# 8. Information Architecture

Recommended pages:

```text
/
├── Home
├── Brands
│   ├── Brand Directory
│   └── Brand Profile
├── Compare
├── Claim Checker
├── Methodology
├── Research
├── About
└── Admin
```

Future:

```text
/dashboard
/research-experiment
/data-explorer
```

---

# 9. Homepage Design

## Hero

Suggested copy:

> **How transparent is the sustainability story behind the brands you buy?**

Supporting text:

> Search brands, examine environmental claims, inspect supporting evidence, and compare transparency.

CTA:

- Search a brand
- Explore brands
- Check a claim

## Homepage sections

1. Search bar
2. Featured brands
3. How scoring works
4. Claim risk examples
5. Industry comparison
6. Why transparency matters
7. Research methodology
8. Disclaimer

---

# 10. Brand Profile Page

Example structure:

```text
Patagonia
Industry: Apparel
Country: United States
Last reviewed: 2026-09-20

Green Transparency Score
82 / 100

Subscores:
Disclosure        88
Evidence          84
Verification      90
Targets           76
Accessibility     72
```

Sections:

## Overview

- Overall score
- Risk level
- Number of analyzed claims
- Number of sources
- Last update

## Score breakdown

Radar chart or horizontal bars.

## Sustainability claims

Example:

| Claim | Evidence | Verification | Risk |
|---|---|---|---|
| Recycled material use | Strong | Partial | Low |
| Carbon neutral | Moderate | Yes | Moderate |
| Sustainable supply chain | Limited | No | High |

## Evidence sources

Each source should show:

- Source title
- Source type
- URL
- Publication year
- Relevant excerpt
- Date accessed
- Verification status

## Transparency gaps

Example:

- No clear baseline disclosed.
- Target timeline is stated but yearly progress is missing.
- Certification scope is unclear.
- Evidence requires more than three navigation steps.

---

# 11. Green Transparency Score

## 11.1 Principle

Do not score environmental performance.

Score transparency of environmental communication.

Recommended total:

```text
Green Transparency Score = 100 points
```

Suggested dimensions:

| Dimension | Weight |
|---|---:|
| Sustainability Disclosure | 25 |
| Evidence Quality | 25 |
| Third-Party Verification | 20 |
| Targets & Progress | 15 |
| Information Accessibility | 15 |
| Total | 100 |

---

# 12. Scoring Dimension 1 — Sustainability Disclosure

Weight: **25**

Assess whether the brand publicly reports relevant information.

Subcriteria:

| Item | Points |
|---|---:|
| Sustainability / ESG report available | 4 |
| Carbon emissions disclosed | 4 |
| Material sourcing disclosed | 4 |
| Supply chain disclosure | 4 |
| Waste / recycling disclosure | 3 |
| Water / resource use disclosure | 3 |
| Methodology / measurement approach | 3 |

Possible scoring logic:

```text
0 = absent
0.5 = partial
1 = clearly disclosed
```

Multiply normalized result by 25.

---

# 13. Scoring Dimension 2 — Evidence Quality

Weight: **25**

For each green claim:

### Level 0

No evidence.

Example:

> “Better for the planet.”

### Level 1

Descriptive evidence only.

Example:

> “We use more recycled materials.”

### Level 2

Quantitative evidence.

Example:

> “60% recycled polyester.”

### Level 3

Quantitative evidence + source.

### Level 4

Quantitative evidence + source + disclosed methodology.

### Level 5

Quantitative evidence + methodology + independent verification.

Suggested formula:

```text
EvidenceScore = average(claim_evidence_level / 5) × 25
```

---

# 14. Scoring Dimension 3 — Third-Party Verification

Weight: **20**

Potential evidence:

- Independent certification
- Audit
- External assurance
- Standard compliance
- Verified emissions target

Suggested scoring:

```text
0 = none
1 = brand self-declaration
2 = limited external reference
3 = recognized certification
4 = independent assurance / verification
5 = multiple relevant independent verification mechanisms
```

Important database fields:

```text
certification_name
certification_body
scope
validity_period
source_url
verification_status
```

Never imply that certification applies to the whole company unless it does.

---

# 15. Scoring Dimension 4 — Targets & Progress

Weight: **15**

For every environmental target, evaluate:

1. Is the target specific?
2. Is there a baseline?
3. Is the target measurable?
4. Is there a deadline?
5. Is progress reported?
6. Is historical progress available?

Strong target:

```text
Reduce Scope 1 and 2 emissions by 50%
from a 2020 baseline
by 2030
with annual progress reporting.
```

Weak target:

```text
We aim to become greener.
```

Possible scoring:

```text
Specific target       2
Quantitative metric   3
Baseline              2
Deadline              2
Progress updates      3
Historical comparison 3
------------------------
Total                 15
```

---

# 16. Scoring Dimension 5 — Information Accessibility

Weight: **15**

This dimension connects strongly to UX and Marketing Communication.

## 16.1 Three-Click Rule

Measure whether key sustainability evidence can be reached within:

```text
Homepage → Sustainability Page → Evidence
```

Scoring suggestion:

| Clicks | Score |
|---|---:|
| 1 | 5 |
| 2 | 5 |
| 3 | 4 |
| 4 | 2 |
| 5+ | 0 |

Do not treat “3 clicks” as a universal scientific law. Use it as an operational project metric.

## 16.2 Other accessibility metrics

### Searchability — 3 points

- Easy to find
- Search works
- Clear labels

### Readability — 3 points

Possible measures:

- Short summaries
- Clear headings
- Minimal jargon
- Definitions provided

### Evidence linkage — 4 points

Can users directly connect a claim to:

- Dataset
- Report
- Certification
- Methodology

---

# 17. Green Claim Transparency Risk

Instead of calling a claim “greenwashing,” calculate:

```text
Green Claim Transparency Risk
```

Levels:

```text
Low
Moderate
High
```

Potential dimensions:

| Variable | Weight |
|---|---:|
| Specificity | 25% |
| Evidence availability | 30% |
| Measurability | 20% |
| External verification | 15% |
| Context completeness | 10% |

Pseudo-formula:

```text
TransparencyStrength =
  specificity * 0.25 +
  evidence * 0.30 +
  measurability * 0.20 +
  verification * 0.15 +
  context * 0.10

Risk = 100 - TransparencyStrength
```

Suggested thresholds:

```text
0–30     Low Risk
31–60    Moderate Risk
61–100   High Risk
```

These thresholds are project-defined and must be documented as methodological choices.

---

# 18. Green Claim Checker

## Input

User enters:

```text
Our packaging is 100% eco-friendly.
```

## Output

```text
Transparency Risk: HIGH

Potential issue:
“Eco-friendly” is a broad environmental statement.

Evidence detected:
None.

Missing information:
- Material composition
- Recycled content
- Recyclability
- Lifecycle impact
- Certification
- Methodology

Recommended improvement:
Replace broad language with measurable,
verifiable and product-specific information.
```

---

# 19. Claim Analysis Rules

Initial MVP can be rule-based.

Flag vague phrases such as:

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

These terms are not automatically bad.

Flag them when they are not accompanied by:

- Quantification
- Definition
- Evidence
- Scope
- Baseline
- Certification
- Methodology

---

# 20. Future AI Claim Analysis

After MVP:

```text
Input Claim
    ↓
Claim Classification
    ↓
Environmental topic extraction
    ↓
Quantitative evidence detection
    ↓
Source matching
    ↓
Risk explanation
```

Possible AI output schema:

```json
{
  "claim": "Our packaging is eco-friendly",
  "claim_type": "packaging",
  "specificity_score": 20,
  "evidence_detected": false,
  "measurable_metric": false,
  "third_party_verification": false,
  "risk_level": "high",
  "missing_information": [
    "material composition",
    "recycled content",
    "certification"
  ]
}
```

Human review should remain available.

---

# 21. Brand Comparison

Recommended comparison view:

```text
Compare: Brand A vs Brand B vs Brand C
```

Metrics:

- Overall transparency score
- Disclosure
- Evidence
- Verification
- Targets
- Accessibility
- Average claim risk
- Number of analyzed claims
- Number of third-party sources

Avoid presenting one brand as objectively “greener.”

Use:

> “Brand A currently provides more publicly accessible supporting evidence.”

---

# 22. Brand Dashboard

Phase 2 feature.

Target user:

Marketing / Sustainability Manager.

Possible outputs:

```text
Your Transparency Score: 64 / 100

Key gaps:

HIGH PRIORITY
- 42% of analyzed claims lack quantitative evidence.

MEDIUM PRIORITY
- Target progress has not been updated in 18 months.

LOW PRIORITY
- Sustainability report requires four navigation steps.
```

Recommendations:

```text
1. Replace broad claims with measurable language.
2. Link every major claim to supporting evidence.
3. State certification scope explicitly.
4. Publish baseline and annual progress.
5. Improve access to evidence.
```

---

# 23. Initial Brand Dataset

Do not start with hundreds of brands.

Recommended MVP:

```text
10–20 brands
```

Choose 2–3 industries.

Suggested example:

## Fashion

- H&M
- Zara
- Uniqlo
- Patagonia

## Technology

- Apple
- Samsung
- Dell
- HP

## Beauty / Consumer Goods

- L'Oréal
- The Body Shop
- Unilever brand
- P&G brand

Important:

Final brands should be chosen based on availability of public evidence.

---

# 24. Data Sources

Preferred sources:

## Tier 1 — Primary sources

- Sustainability reports
- ESG reports
- Annual reports
- Official sustainability webpages
- Official product pages
- Regulatory filings
- Corporate climate reports

## Tier 2 — Certification sources

- Certification databases
- Standard organizations
- Third-party verification bodies

## Tier 3 — Supporting sources

- Academic publications
- NGO reports
- Government publications
- Reputable news organizations

Do not assign strong scores based solely on marketing copy.

---

# 25. Data Source Record

Every evidence item should include:

```json
{
  "id": "source_001",
  "brand_id": "brand_patagonia",
  "title": "Environmental & Social Initiatives Report",
  "source_type": "sustainability_report",
  "publisher": "Brand Name",
  "publication_year": 2025,
  "url": "...",
  "accessed_at": "2026-10-05",
  "verification_level": "primary_source",
  "notes": "Contains emissions and materials data"
}
```

---

# 26. Claim Record

Recommended schema:

```json
{
  "id": "claim_001",
  "brand_id": "brand_001",
  "claim_text": "60% of polyester comes from recycled sources",
  "claim_category": "materials",
  "source_id": "source_001",
  "specificity_score": 5,
  "evidence_score": 4,
  "measurability_score": 5,
  "verification_score": 3,
  "context_score": 4,
  "risk_score": 18,
  "risk_level": "low",
  "review_status": "verified",
  "reviewed_by": "admin",
  "reviewed_at": "2026-10-05"
}
```

---

# 27. Recommended Database Model

Core tables:

```text
brands
industries
claims
sources
claim_sources
certifications
targets
scores
score_breakdowns
brand_snapshots
users
research_responses
```

---

# 28. Brand Table

```sql
brands
------
id
slug
name
industry_id
country
website
logo_url
description
created_at
updated_at
last_reviewed_at
```

---

# 29. Claim Table

```sql
claims
------
id
brand_id
claim_text
claim_category
claim_date
specificity_score
evidence_score
measurability_score
verification_score
context_score
risk_score
risk_level
status
created_at
updated_at
```

---

# 30. Sources Table

```sql
sources
-------
id
brand_id
title
source_type
publisher
url
publication_date
accessed_at
verification_level
archived_url
notes
created_at
```

---

# 31. Claim Sources Join Table

```sql
claim_sources
-------------
id
claim_id
source_id
evidence_excerpt
page_number
evidence_strength
```

---

# 32. Targets Table

```sql
targets
-------
id
brand_id
title
metric
baseline_value
baseline_year
target_value
target_year
latest_progress
progress_year
verification_status
source_id
```

---

# 33. Scores Table

Store versions, not only current score.

```sql
scores
------
id
brand_id
overall_score
disclosure_score
evidence_score
verification_score
targets_score
accessibility_score
methodology_version
calculated_at
```

This allows historical analysis.

---

# 34. Tech Stack Recommendation

Recommended for a portfolio-grade application:

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
```

## Backend

Option A:

```text
Next.js API Routes / Server Actions
```

Option B:

```text
FastAPI
```

For simplicity, use Option A initially.

## Database

```text
PostgreSQL
```

Easy hosted option:

```text
Supabase
```

## Charts

```text
Recharts
```

## Forms

```text
React Hook Form
Zod
```

## Authentication

Optional MVP:

```text
Supabase Auth
```

Admin only initially.

---

# 35. Recommended Architecture

```text
Browser
   ↓
Next.js Frontend
   ↓
Server Actions / API
   ↓
Scoring Service
   ↓
PostgreSQL / Supabase
   ↓
Evidence Database
```

Future:

```text
Scraping Pipeline
       ↓
Raw Documents
       ↓
Claim Extraction
       ↓
Human Review
       ↓
Approved Claims
       ↓
Scoring Engine
```

---

# 36. Suggested Repository Structure

```text
green-brand-transparency-hub/
│
├── app/
│   ├── page.tsx
│   ├── brands/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── compare/
│   │   └── page.tsx
│   ├── claim-checker/
│   │   └── page.tsx
│   ├── methodology/
│   │   └── page.tsx
│   ├── research/
│   │   └── page.tsx
│   └── admin/
│
├── components/
│   ├── brand/
│   ├── claims/
│   ├── charts/
│   ├── scoring/
│   └── ui/
│
├── lib/
│   ├── db/
│   ├── scoring/
│   ├── claims/
│   ├── validation/
│   └── utils/
│
├── data/
│   ├── seed/
│   └── methodology/
│
├── scripts/
│   ├── scrape/
│   ├── import/
│   └── calculate-scores/
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── tests/
│   ├── scoring/
│   ├── claims/
│   └── api/
│
├── docs/
│   ├── methodology.md
│   ├── data-dictionary.md
│   └── research-design.md
│
├── README.md
└── package.json
```

---

# 37. Recommended API Endpoints

## Brands

```http
GET /api/brands
GET /api/brands/:slug
POST /api/brands
PATCH /api/brands/:id
```

## Claims

```http
GET /api/brands/:id/claims
GET /api/claims/:id
POST /api/claims
PATCH /api/claims/:id
```

## Scores

```http
GET /api/brands/:id/score
POST /api/brands/:id/recalculate
```

## Compare

```http
GET /api/compare?brands=brand-a,brand-b
```

## Claim checker

```http
POST /api/claim-checker
```

Input:

```json
{
  "claim": "Our products are eco-friendly."
}
```

Output:

```json
{
  "riskLevel": "high",
  "riskScore": 78,
  "issues": [
    "Broad environmental wording",
    "No measurable metric",
    "No supporting evidence"
  ]
}
```

---

# 38. Scoring Service

Do not place scoring logic directly inside React components.

Recommended:

```text
lib/scoring/
├── disclosure.ts
├── evidence.ts
├── verification.ts
├── targets.ts
├── accessibility.ts
├── transparency-score.ts
└── claim-risk.ts
```

Example:

```ts
type BrandScoreInput = {
  disclosure: number
  evidence: number
  verification: number
  targets: number
  accessibility: number
}

export function calculateTransparencyScore(
  input: BrandScoreInput
) {
  return (
    input.disclosure * 0.25 +
    input.evidence * 0.25 +
    input.verification * 0.20 +
    input.targets * 0.15 +
    input.accessibility * 0.15
  )
}
```

All formulas should have unit tests.

---

# 39. Automated Data Collection

Automation is useful for demonstrating MarTech capability.

However:

**Do not scrape aggressively.**

Respect:

- robots.txt
- terms of service
- request rate
- copyright
- access restrictions

Recommended workflow:

```text
Brand URL List
      ↓
Crawler
      ↓
Find Sustainability Pages
      ↓
Store Metadata
      ↓
Download / Parse Public Reports
      ↓
Candidate Claim Extraction
      ↓
Human Verification
      ↓
Database
```

---

# 40. Python Scraping Pipeline

Recommended tools:

```text
requests
BeautifulSoup
pandas
PyMuPDF
```

Optional:

```text
Playwright
```

Use Playwright only for JavaScript-rendered content.

Suggested folders:

```text
scripts/scrape/
├── crawler.py
├── extract_html.py
├── extract_pdf.py
├── normalize.py
├── detect_claims.py
└── export_json.py
```

---

# 41. Data Collection Strategy

Phase 1:

Manual collection.

Reason:

- Faster methodology validation
- Easier error checking
- Better understanding of source structure

Phase 2:

Semi-automated extraction.

Phase 3:

Automated candidate extraction + human review.

Do not automate before the methodology is stable.

---

# 42. Claim Extraction Pipeline

```text
Source Document
      ↓
Text Extraction
      ↓
Paragraph Segmentation
      ↓
Keyword Filtering
      ↓
Candidate Claim Detection
      ↓
Metric Detection
      ↓
Certification Detection
      ↓
Human Review
      ↓
Approved Claim
```

Keywords:

```text
sustainable
carbon
emission
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

---

# 43. Evidence Quality Pipeline

For each claim:

```text
Claim
 ↓
Does evidence exist?
 ↓
Is evidence quantitative?
 ↓
Is source linked?
 ↓
Is methodology provided?
 ↓
Is evidence independently verified?
 ↓
Evidence Level 0–5
```

---

# 44. Admin Workflow

Admin interface should support:

1. Add brand.
2. Add source.
3. Add claim.
4. Link source to claim.
5. Enter evidence strength.
6. Review scoring.
7. Recalculate score.
8. Publish brand profile.

Statuses:

```text
draft
review
verified
published
archived
```

---

# 45. Data Quality Rules

Every published claim must have:

```text
claim_text
brand_id
source
source_url
date_accessed
claim_category
review_status
```

Every score should store:

```text
methodology_version
calculated_at
```

Never silently overwrite past scoring methods.

---

# 46. Methodology Versioning

Example:

```text
Methodology v1.0
2026-10-05
```

Later:

```text
v1.1
- Adjusted accessibility weighting
- Added certification scope field
```

Public methodology page should expose changes.

This strengthens credibility.

---

# 47. Consumer Research Design

A major portfolio differentiator is combining the product with consumer research.

Recommended study:

```text
Control Group
vs
Experimental Group
```

---

# 48. Experiment Design

## Control Group

Participants see:

- Brand
- Green advertisement
- Product description

## Experimental Group

Participants see:

- Same brand
- Same advertisement
- Green Transparency Hub results

Then both groups answer identical questions.

---

# 49. Dependent Variables

Measure:

## Brand Trust

Example:

```text
I trust this brand.
This brand appears honest.
This brand provides credible sustainability information.
```

## Purchase Intention

```text
I would consider purchasing from this brand.
I would choose this brand over a similar competitor.
```

## Perceived Transparency

```text
This brand clearly explains its environmental claims.
```

## Perceived Greenwashing

```text
This brand appears to exaggerate its environmental performance.
```

Use Likert:

```text
1 = Strongly disagree
5 = Strongly agree
```

or 7-point scale.

Keep one scale consistently.

---

# 50. Hypotheses

Possible hypotheses:

### H1

Higher perceived sustainability transparency is positively associated with brand trust.

### H2

Brand trust is positively associated with purchase intention.

### H3

Access to evidence-based transparency information increases perceived credibility relative to advertising alone.

### H4

Vague environmental claims are associated with higher perceived greenwashing risk.

### H5

Third-party verification strengthens the relationship between transparency and brand trust.

---

# 51. Conceptual Model

```text
Green Claim Transparency
          ↓
   Perceived Credibility
          ↓
      Brand Trust
          ↓
   Purchase Intention
```

Possible moderator:

```text
Third-Party Verification
```

Possible mediator:

```text
Brand Trust
```

---

# 52. Survey Sample

Portfolio-level target:

```text
100–200 respondents
```

Do not claim statistical representativeness unless sampling design supports it.

Describe as:

```text
exploratory consumer study
```

if convenience sampling is used.

---

# 53. Statistical Analysis

Minimum:

- Descriptive statistics
- Mean
- Standard deviation
- Group comparison

Better:

- Cronbach's alpha
- Independent samples t-test
- Correlation
- Linear regression

Optional:

- Mediation analysis

Avoid unnecessarily complicated models merely for presentation.

---

# 54. Product Analytics

If feasible, capture:

```text
brand_search
brand_view
claim_expand
evidence_click
compare_brand
claim_checker_submit
methodology_view
```

Questions:

- Which evidence do users inspect?
- Which industries are searched most?
- Do users compare brands?
- Does evidence click-through correlate with trust?

---

# 55. Recommended Dashboard Metrics

Consumer-facing:

- Overall score
- Evidence strength
- Number of claims
- Number of sources
- Verification coverage
- Accessibility score

Research-facing:

- Brand views
- Claim views
- Evidence clicks
- Comparison usage

Marketing manager:

- Unsupported claim rate
- Verification coverage
- Transparency benchmark percentile
- Information accessibility gaps

---

# 56. UX Principles

The interface should feel:

```text
neutral
analytical
credible
clear
evidence-first
non-activist
```

Avoid aggressive wording such as:

```text
LIAR
FAKE GREEN
EXPOSED
GREENWASHER
```

Use:

```text
Limited evidence
Supporting evidence not found
Partially verified
High transparency risk
```

---

# 57. Visual Design

Recommended visual direction:

- Clean
- Editorial
- Data-driven
- White / neutral background
- Muted green accents
- Strong typography
- Generous spacing

The website should look closer to:

```text
research dashboard
+
consumer comparison tool
```

than an environmental campaign site.

---

# 58. Accessibility

Implement:

- WCAG-conscious contrast
- Keyboard navigation
- Semantic HTML
- ARIA labels where necessary
- Chart text equivalents
- Responsive mobile design

---

# 59. Transparency of the Transparency Tool

A strong project must expose its own limitations.

Methodology page should explain:

1. Score methodology.
2. Weights.
3. Sources.
4. Review process.
5. Update frequency.
6. Limitations.
7. Conflict correction process.

This prevents the product from becoming another opaque rating platform.

---

# 60. Disclaimer

Suggested concept:

> Green Brand Transparency Hub evaluates the transparency and verifiability of publicly available sustainability communications. Scores do not represent a comprehensive assessment of environmental performance and should not be interpreted as a certification or definitive judgement of a brand's sustainability.

---

# 61. Correction Mechanism

Future feature:

```text
Report an issue
```

Brands or users can submit:

- Missing source
- Incorrect source
- Updated data
- Clarification

Admin reviews before publishing changes.

---

# 62. Phase 1 — Research

### Week 1

Tasks:

- Research sustainability marketing.
- Research greenwashing literature.
- Study signaling theory.
- Study information asymmetry.
- Study brand trust.
- Identify possible datasets.

Deliverable:

```text
docs/research-foundation.md
```

---

# 63. Week 2 — Product Definition

Tasks:

- Define user personas.
- Define problem statement.
- Define research question.
- Define scope.
- Define non-goals.
- Select 10 initial brands.

Deliverables:

```text
docs/product-requirements.md
docs/user-personas.md
```

---

# 64. Week 3 — Scoring Methodology

Tasks:

- Finalize 5 scoring categories.
- Define scoring rubrics.
- Define risk model.
- Create data dictionary.
- Manually score 2 sample brands.
- Identify scoring ambiguity.

Deliverables:

```text
docs/methodology.md
docs/data-dictionary.md
```

---

# 65. Week 4 — Data Collection

Tasks:

- Collect primary sources.
- Analyze sustainability reports.
- Record claims.
- Link claims to evidence.
- Count evidence navigation clicks.
- Add certification information.

Target:

```text
10 brands
30–100 claims
```

---

# 66. Week 5 — UX/UI

Design:

- Homepage
- Brand directory
- Brand profile
- Claim detail
- Claim checker
- Compare page
- Methodology page

Use Figma before implementation.

---

# 67. Week 6 — Base Application

Build:

- Next.js app
- Database
- Seed data
- Brand pages
- Navigation
- Search

Definition of done:

```text
User can search a brand and open a working profile.
```

---

# 68. Week 7 — Scoring System

Build:

- Score engine
- Score breakdown
- Risk engine
- Unit tests
- Radar / bar charts

Definition of done:

```text
Database data → scoring engine → UI score
```

---

# 69. Week 8 — Claim Checker & Comparison

Build:

- Claim checker
- Vague phrase detection
- Missing evidence detection
- Brand comparison
- Evidence drawer/modal

---

# 70. Week 9 — Data Automation

Build initial scripts:

- Brand page crawler
- ESG report extractor
- PDF parser
- Candidate claim extractor

Keep human review.

---

# 71. Week 10 — Consumer Study

Prepare:

- Survey
- Experiment condition
- Consent wording
- Randomized groups
- Brand trust scale
- Purchase intention scale

Run pilot first.

---

# 72. Week 11 — Analysis

Analyze:

- Descriptive statistics
- Group differences
- Correlation
- Regression if appropriate

Create:

- Charts
- Findings summary
- Limitations

---

# 73. Week 12 — Portfolio Packaging

Final assets:

1. Live website
2. GitHub repository
3. Product demo video
4. Figma prototype
5. Case study
6. Research summary
7. Methodology document
8. Data sample
9. SOP-ready project story

---

# 74. Portfolio Case Study Structure

Recommended case study:

## 1. Problem

Consumers face vague sustainability claims.

## 2. Research

Explain greenwashing and information asymmetry.

## 3. Insight

Consumers lack accessible evidence.

## 4. Opportunity

Create transparency infrastructure.

## 5. Product

Green Brand Transparency Hub.

## 6. Methodology

Explain score.

## 7. UX

Show product journey.

## 8. Technology

Explain data and architecture.

## 9. Consumer Experiment

Explain research design.

## 10. Results

Show impact.

## 11. Marketing Implications

Explain what brands can learn.

## 12. Reflection

What you learned and what remains unresolved.

---

# 75. SOP Storyline

Recommended narrative:

```text
Observed growth of sustainability marketing
        ↓
Noticed difficulty verifying claims
        ↓
Recognized information asymmetry
        ↓
Applied structured data thinking
        ↓
Built Green Brand Transparency Hub
        ↓
Tested consumer response
        ↓
Observed effect on trust / purchase intention
        ↓
Developed interest in marketing research and MarTech
        ↓
Want advanced study in Marketing
```

---

# 76. Strong SOP Positioning

Avoid:

> “I created a website about green brands.”

Use:

> “I designed a transparency framework that converts fragmented sustainability communication into structured, comparable evidence and used the product to study how information transparency shapes consumer trust.”

This communicates:

- Research capability
- Marketing thinking
- Product strategy
- Data thinking
- Technical implementation

---

# 77. Coding Strategy with Claude Code

Treat this file as the master specification.

Recommended prompting approach:

```text
Read PROJECT_SPEC.md.

Do not implement everything at once.

First:
1. summarize the architecture,
2. identify ambiguities,
3. generate the repository skeleton,
4. create database schema,
5. create seed data for two brands,
6. implement brand directory and brand profile.

Do not implement scraping or AI yet.
```

---

# 78. Claude Code Implementation Stages

## Stage 1

Ask Claude Code:

```text
Set up a Next.js TypeScript project with Tailwind,
PostgreSQL/Supabase-compatible database design,
and the folder structure defined in PROJECT_SPEC.md.
```

## Stage 2

```text
Implement Prisma schema for:
brands
claims
sources
claim_sources
targets
scores
certifications.
```

## Stage 3

```text
Create seed data for two fictional/sample brands.
```

Use sample data first to avoid blocking development.

## Stage 4

```text
Implement Brand Directory and Brand Profile.
```

## Stage 5

```text
Implement scoring engine with unit tests.
```

## Stage 6

```text
Implement claim detail and evidence view.
```

## Stage 7

```text
Implement Compare page.
```

## Stage 8

```text
Implement Claim Checker v1 using rules only.
```

## Stage 9

```text
Build admin data-entry workflow.
```

## Stage 10

```text
Integrate real brand data.
```

Only after methodology and UI are stable.

---

# 79. Development Rule

Claude Code should never:

- Invent source URLs.
- Invent certifications.
- Invent brand sustainability data.
- Generate a score from missing evidence.
- Mark a brand as a greenwasher.
- Treat AI extraction as verified truth.

Any automatically extracted data should be:

```text
status = candidate
```

until human approval.

---

# 80. Testing Requirements

## Unit tests

Test:

- Score calculations
- Risk calculations
- Threshold mapping
- Missing data
- Edge cases

## Integration tests

Test:

```text
brand → claims → evidence → score
```

## UI tests

Test:

- Search
- Brand page
- Compare
- Claim checker

---

# 81. Missing Data Handling

Never convert missing information to zero automatically unless methodology explicitly defines it.

Possible states:

```text
available
not_available
not_found
not_applicable
pending_review
```

Difference matters.

Example:

```text
not_found
```

means:

> We did not find public evidence.

It does NOT mean:

> The brand definitely has no evidence.

---

# 82. Confidence Level

Optional but valuable.

For each score:

```text
High confidence
Medium confidence
Low confidence
```

Based on:

- Number of sources
- Recency
- Source quality
- Verification
- Missing data

Example:

```text
Transparency Score: 74
Confidence: Medium
```

This makes the platform more intellectually honest.

---

# 83. Score Freshness

Display:

```text
Last reviewed:
Sources reviewed:
Latest source year:
```

Example:

```text
Last reviewed: 2026-10-05
Sources reviewed: 18
Latest source: 2026
```

---

# 84. Brand History

Future feature:

```text
2025 Score: 62
2026 Score: 74
```

This makes transparency improvements measurable over time.

---

# 85. Potential Advanced Research

Later versions could study:

### A. Transparency vs Brand Reputation

### B. Certification vs Trust

### C. Vague vs Specific Claims

### D. Transparency vs Purchase Intention

### E. Difference across Gen Z / Millennials

### F. Industry differences

Fashion may show different trust dynamics from technology.

---

# 86. Ethical Considerations

Research:

- Obtain informed consent.
- Avoid collecting unnecessary personal data.
- Anonymize participant responses.
- Do not misrepresent study findings.

Product:

- Use public evidence.
- State methodology.
- Avoid defamatory language.
- Allow corrections.
- Clearly explain uncertainty.

---

# 87. Suggested Success Criteria

## Product

MVP is successful if:

- 10+ brand profiles exist.
- 50+ sustainability claims are analyzed.
- Every published claim links to evidence.
- Scores are reproducible.
- Methodology is public.
- Users can compare brands.

## Research

Successful if:

- Survey instrument works.
- Experimental groups are implemented.
- Brand trust can be measured.
- Purchase intention can be measured.
- Results are interpreted cautiously.

## Portfolio

Successful if an admissions reviewer can understand in <5 minutes:

1. The problem.
2. Why it matters to marketing.
3. What you built.
4. How you measured it.
5. What you learned.

---

# 88. Main Competitive Advantage of This Project

The strongest differentiator is the combination:

```text
Marketing Theory
       +
Consumer Research
       +
Data Transparency
       +
Software Product
       +
MarTech
```

Most portfolio projects show:

```text
campaign → design → social media
```

This project can show:

```text
problem → theory → data → product → experiment → insight
```

That is a stronger research-oriented narrative.

---

# 89. Priority Matrix

## Must Have

- Brand directory
- Brand profile
- Evidence-linked claims
- Transparency score
- Methodology page
- Comparison
- Claim risk

## Should Have

- Claim checker
- Admin panel
- Consumer experiment
- Research dashboard

## Could Have

- Automated scraping
- AI claim extraction
- Historical score
- Brand manager dashboard

## Do Not Build First

- Mobile app
- Complex machine learning
- Browser extension
- Massive brand database
- Recommendation engine
- Blockchain
- Real-time crawling

---

# 90. Final MVP Definition

The MVP is complete when a user can:

```text
Search a brand
     ↓
Understand its transparency score
     ↓
Inspect individual green claims
     ↓
See supporting evidence
     ↓
Understand claim transparency risk
     ↓
Compare the brand with competitors
```

And the project owner can:

```text
Add sources
     ↓
Add claims
     ↓
Review evidence
     ↓
Calculate scores
     ↓
Publish profiles
```

---

# 91. Suggested Final Research Title

Product title:

> **Green Brand Transparency Hub**

Academic subtitle:

> **A Digital Platform for Evaluating Evidence Transparency in Sustainability Marketing Communication**

Possible research paper title:

> **From Green Claims to Consumer Trust: Exploring the Role of Digital Transparency in Sustainability Marketing**

---

# 92. One-Sentence Elevator Pitch

> Green Brand Transparency Hub transforms fragmented sustainability claims into structured, evidence-linked transparency indicators that help consumers evaluate brand communication and enable researchers to study how transparency affects trust and purchase intention.

---

# 93. Final Strategic Principle

The project should never try to answer:

> “Which brand is truly green?”

It should answer:

> **“How transparent, specific, accessible, and verifiable is the evidence behind what this brand tells consumers about sustainability?”**

That question is defensible, measurable, relevant to Marketing, and strong enough to anchor both the product and the admissions portfolio.
