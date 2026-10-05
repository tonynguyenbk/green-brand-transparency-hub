# Development workflow

## Daily loop

```bash
npm run dev            # http://localhost:3000
npm test               # unit + component tests (Vitest, jsdom)
npm run typecheck      # next typegen && tsc --noEmit
npm run lint
```

Before committing: `npm run lint && npm run typecheck && npm test && npm run build`.

`npm run test:integration` runs DB-backed tests against `TEST_DATABASE_URL` (or `DATABASE_URL`); it creates
and deletes its own fictional brand. `npm run test:e2e` starts `next dev` on port 3200 and expects seeded data
(`npm run seed`). Flow D (admin) creates a claim on NovaTech Labs and a new snapshot — reseed afterwards for a
clean demo. Install the browser once with `npx playwright install chromium`.

## Admin data-entry workflow

1. Create brand (draft) → 2. add sources → 3. add claims (exact wording) → 4. link each claim to sources with
excerpts → 5. certifications (exact scope) → 6. targets → 7. accessibility audit → 8. disclosure checklist
→ 9. rate all five rubric components and mark claims verified → 10. Recalculate score (preview shows the
result or what is missing) → 11. Publish profile.

## Candidate import

```bash
python scripts/scrape/pipeline.py --brand-slug <slug> --url https://brand.example/
npm run import:candidates -- scripts/scrape/output/<file>.json --dry-run
npm run import:candidates -- scripts/scrape/output/<file>.json
```

Imported sources and claims are `CANDIDATE` and never affect scores. A sample file is in
`scripts/import/examples/`.

## Connecting Supabase

1. Create a Supabase project. In *Project Settings → Database*, copy the pooled connection string into
   `DATABASE_URL` (append `?pgbouncer=true`) and the direct connection string into `DIRECT_URL`.
2. Run `npm run db:deploy` (or `npx prisma migrate deploy`) and optionally `npm run seed`.
3. In *Project Settings → API*, copy the URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Setting these switches auth mode to Supabase and disables dev login.
4. In *Authentication → Users*, create admin users (e-mail + password). Disable public sign-ups.
5. Add their e-mails to `ADMIN_EMAILS` (or insert `AdminUser` rows). Any other Supabase user is rejected.

## Assumptions & decisions

- **Prisma 6, not 7/8.** npm's `latest` tag for Prisma pointed at an 8.0 release candidate during
  development; Prisma 6.19 was chosen for stability. Migrating later requires a `prisma.config.ts`.
- **Next.js 16.** `middleware.ts` is now `proxy.ts`; `params`/`searchParams` are async.
- **Claim rubric scale.** Components are entered on a 0–5 rubric (reviewer-friendly) and normalised ×20 to
  0–100 by the engine, matching the specification's 0–100 formula. `Claim.evidenceScore` doubles as the
  Evidence Level (0–5).
- **Disclosure "not found" = 0.** The dimension measures public disclosure; pending / not-applicable topics
  are excluded instead. At least 50% of applicable topics must be assessed.
- **Overall requires all five dimensions.** No partial reweighting; incomplete brands show no score.
- **Verification ladder** is computed from verified sources and certifications (see methodology.md) rather
  than entered by hand, to keep it reproducible.
- **Confidence points** (sources, quality, recency, missing data, verification share) and the "<3 sources ⇒
  LOW" cap are project choices.
- **Brand-level risk filter** uses the average claim risk of the latest snapshot, classified with the same
  thresholds.
- **Directory filtering** happens in memory after one query — adequate for tens/hundreds of brands.
- **Rich text.** No user content is rendered as HTML; React escapes everything, so no sanitiser is needed.
  If rich text is introduced, add a sanitiser (e.g. DOMPurify) at render time.
- **Dev auth.** HMAC-signed cookie, 8-hour expiry, only when Supabase is unconfigured and not in production
  (unless `ALLOW_DEV_AUTH=true`).
- **404 status with streaming.** Pages with `loading.tsx` stream, so `notFound()` renders the 404 UI with a
  200 status; the page includes `noindex` metadata.
- **Fictional seed data** uses invented certification bodies and `example.com` URLs only.
