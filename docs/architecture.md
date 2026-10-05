# Architecture

```text
Browser
   ↓
Next.js 16 App Router (React Server Components)
   ├── Public pages (app/*)            — server-rendered, read-only
   ├── Admin pages (app/admin/(protected)/*) — requireAdmin() in the layout
   ├── Server Actions (lib/admin/actions.ts)  — admin writes
   └── Route Handlers (app/api/*)             — JSON API
   ↓
Domain services (lib/services)
   ├── brand-service        public directory & profile view models
   ├── claim-service        claim CRUD, review transitions, evidence links, stored risk
   ├── evidence-service     sources, certifications, targets, audits, disclosure checklist
   ├── scoring-service      load verified data → assessBrand → insert BrandScore snapshot
   ├── comparison-service   2–4 brand comparison + neutral statements
   └── admin-service        brand admin, methodology versions, dashboard
   ↓
Scoring engines (lib/scoring) — pure functions, no I/O
   disclosure · evidence · verification · targets · accessibility
   transparency-score · claim-risk · confidence · gaps · assess-brand
   config.ts = single source of truth for weights & thresholds
   ↓
Prisma ORM (lib/db/prisma.ts)
   ↓
PostgreSQL (local or Supabase)
```

## Key principles

- **No scoring in UI components.** Components receive pre-computed values. The only "calculation" in
  components is rounding for display (`formatScore`).
- **One formula, one place.** All weights/thresholds live in `lib/scoring/config.ts`. The Claim Checker
  (`lib/claims/checker.ts`) derives components from wording rules and then calls the same
  `calculateClaimRiskFromComponents` used for reviewed claims. The Methodology page renders values from
  the same config.
- **Pure engines.** `assessBrand(input)` is deterministic given its input and `asOf` date, so it is unit
  tested without a database. `scoring-service` is the only bridge to Prisma.
- **Immutable snapshots.** `recalculateBrandScore` only ever `INSERT`s into `BrandScore`. The full
  calculation trace (explanations, confidence factors, gaps, weights) is stored in `detailsJson`, so the
  public profile shows exactly what was calculated.
- **Status gating.** Only `VERIFIED`/`PUBLISHED` claims and sources count. Pending-review certifications and
  targets are excluded. Only `PUBLISHED` brands are visible publicly.

## Authentication & authorisation

- `proxy.ts` (Next 16's replacement for middleware) performs an optimistic cookie check for `/admin/*`.
- The real boundary is `lib/auth/session.ts`: `requireAdmin()` (pages, server actions) and `authorizeApi()`
  (route handlers) verify the Supabase user + allowlist, or the HMAC-signed development cookie.
- Auth mode is selected in `lib/auth/config.ts` (`supabase` → `dev` → `disabled`).

## Rendering & caching

DB-backed pages use `export const dynamic = "force-dynamic"` so they always reflect the latest reviewed data;
server actions call `revalidatePath("/", "layout")` after writes. Static pages (Research, About, Claim
Checker shell) are prerendered.

## Client components

Only interactive parts are client components: search/filter forms, claims explorer + evidence sheet,
compare picker, Recharts charts, Claim Checker form, admin forms. Enum value lists are duplicated in
`lib/validation/enums.ts` (with compile-time exhaustiveness checks against Prisma types) so client bundles
never import Prisma.

## Analytics

`lib/analytics/client.ts` exposes `track(name, props)` behind an `AnalyticsProvider` interface. The default
provider logs to the console and beacons to `POST /api/analytics`, which logs server-side. A PostHog adapter
can be registered with `setAnalyticsProvider` without changing call sites.
