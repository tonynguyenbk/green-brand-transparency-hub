# Scraping foundation (optional)

Not required for the MVP. Produces **candidate** claims for human review.

```bash
python -m venv .venv && .venv/Scripts/activate   # macOS/Linux: source .venv/bin/activate
pip install -r scripts/scrape/requirements.txt
python scripts/scrape/pipeline.py --brand-slug my-brand --url https://brand.example/
npm run import:candidates -- scripts/scrape/output/<file>.json --dry-run
npm run import:candidates -- scripts/scrape/output/<file>.json
```

Rules enforced by the code:

- `robots.txt` is checked for every origin; disallowed URLs are skipped (unreachable robots.txt ⇒ skip).
- At least 1 s (default 3 s) between requests; a descriptive User-Agent is sent.
- 401 / 403 / 429 responses are not retried. Authentication, paywalls and anti-bot controls are never bypassed.
- Only same-origin links from the homepage are followed.
- Every exported item has `status: "CANDIDATE"`; the importer stores claims and the source as `CANDIDATE`,
  so nothing affects public scores until an administrator verifies it.

Always check the site's terms of service before running the crawler. `pandas` is listed for later
analysis/export tasks; `playwright` is optional and only for JavaScript-rendered pages.
