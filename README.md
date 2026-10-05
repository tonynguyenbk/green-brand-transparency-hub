# Green Brand Transparency Hub

> A Digital Platform for Evaluating Evidence Transparency in Sustainability Marketing Communication

Green Brand Transparency Hub turns fragmented sustainability claims into structured, evidence-linked
transparency indicators. It does **not** decide whether a brand is "green". It evaluates how specific,
evidenced, measurable, verified, target-driven and accessible a brand's sustainability communication is.

> **Disclaimer.** Green Brand Transparency Hub evaluates the transparency and verifiability of publicly
> available sustainability communications. Scores do not represent a comprehensive assessment of
> environmental performance and should not be interpreted as certification or a definitive judgement of a
> brand's sustainability.

All brand data shipped with this repository is **fictional** (Verdant Wear, NovaTech Labs, PureForm Beauty,
Loomwell Apparel). URLs point to `example.com`; certification bodies are invented.

## Screenshots

| Home | Brand profile | Evidence panel |
|---|---|---|
| _screenshot placeholder_ | _screenshot placeholder_ | _screenshot placeholder_ |

| Compare | Claim Checker | Admin workspace |
|---|---|---|
| _screenshot placeholder_ | _screenshot placeholder_ | _screenshot placeholder_ |

## Features

**Public (no login)**
- Brand search and directory with industry, score-range and claim-risk filters, four sort orders.
- Brand profile: Green Transparency Score, five-dimension breakdown with calculation explanations,
  confidence, source count, last reviewed, score history.
- Claims explorer with category/risk filters; evidence panel per claim (sources, excerpts, methodology,
  verification, missing information, risk explanation).
- Certifications (with explicit scope), targets & progress, auto-generated transparency gaps.
- Compare 2–4 brands: table, grouped bar chart, neutral methodology-scoped statements.
- Rule-based Claim Checker (no AI) using the same claim-risk formula as reviewed claims.
- Methodology (values read from the scoring config), Research framework, About.
- "Report an issue" on every profile and claim (validated, honeypot + rate limited) feeding an admin review queue.

**Admin (authenticated)**
- Dashboard: brands, claims pending review, source counts, recent scoring runs, data-quality warnings.
- CRUD for brands, sources, claims, certifications, targets, accessibility audits, methodology versions.
- Correction-report review queue (open → in review → resolved / rejected).
- Disclosure checklist, evidence linking, claim review workflow (Candidate → In review → Verified → Published / Archived).
- Recalculate score → immutable `BrandScore` snapshot; publish/unpublish profiles.

**Foundations**
- Python scraping pipeline (robots.txt aware) + candidate importer (everything imported as `CANDIDATE`).
- Analytics abstraction (console/local by default, provider-pluggable).
- Research schema (`ResearchStudy`, `ResearchCondition`, `ResearchResponse`) for a later A/B study.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui (Radix) · Lucide ·
Recharts · React Hook Form · Zod 4 · PostgreSQL · Prisma 6 · Supabase Auth · Vitest + React Testing Library ·
Playwright · ESLint · Prettier.

## Setup

Requirements: Node.js ≥ 20.9 (tested on 24), PostgreSQL ≥ 14 (local or Supabase), optionally Python 3.10+.

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL / DIRECT_URL (see below)
npx prisma generate
npx prisma migrate dev        # creates the schema
npm run seed                  # FICTIONAL demo data + real score calculation (destructive: clears tables)
npm run dev                   # http://localhost:3000
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection (Supabase: pooled URL) |
| `DIRECT_URL` | yes | Direct connection used by migrations (local: same as `DATABASE_URL`) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for production admin | Enables Supabase Auth |
| `ADMIN_EMAILS` | with Supabase | Comma-separated admin allowlist (or add `AdminUser` rows) |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Reserved; never exposed to the browser |
| `DEV_ADMIN_PASSWORD`, `DEV_AUTH_SECRET` | local dev only | Development admin login when Supabase is not configured (secret ≥ 32 chars) |
| `ALLOW_DEV_AUTH` | no | `true` allows dev login under `NODE_ENV=production` (avoid) |
| `NEXT_PUBLIC_APP_URL` | no | Canonical URL (metadata) |
| `TEST_DATABASE_URL` | no | Separate database for integration tests |

### Database

```bash
npm run db:migrate      # prisma migrate dev
npm run db:deploy       # prisma migrate deploy (production)
npm run db:reset        # drop + re-apply migrations + seed
npm run seed
npm run score:recalculate   # new snapshot for every brand
```

### Admin login

Without Supabase credentials, `/admin/login` asks for `DEV_ADMIN_PASSWORD` (development only).
See [docs/development.md](docs/development.md#connecting-supabase) to connect Supabase Auth.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server / production build (runs `prisma generate`) / start |
| `npm run lint` · `typecheck` · `format` | ESLint · `tsc --noEmit` · Prettier |
| `npm test` · `test:watch` | Vitest unit + component tests |
| `npm run test:integration` | DB-backed scoring flow tests (needs a database) |
| `npm run test:e2e` | Playwright flows A–D (run `npm run seed` first; starts `next dev` on :3200) |
| `npm run seed` | Fictional seed data |
| `npm run import:candidates -- <file.json> [--dry-run]` | Import scraped candidate claims |

## Production build

```bash
npm run build && npm start
```

Deploying (e.g. Vercel + Supabase): set the env vars above, run `npm run db:deploy` against the production
database, configure Supabase Auth users, and add admin e-mails to `ADMIN_EMAILS`.

## Documentation

- [Architecture](docs/architecture.md)
- [Methodology & formulas](docs/methodology.md)
- [Data model](docs/data-model.md)
- [API](docs/api.md)
- [Development workflow & assumptions](docs/development.md)
- [Scraping foundation](scripts/scrape/README.md)
