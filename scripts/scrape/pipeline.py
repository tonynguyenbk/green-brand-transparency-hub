"""Candidate-claim pipeline.

    Brand URL → discover sustainability pages → fetch permitted public pages
    → extract text → detect candidate paragraphs → export JSON → human review

Usage:
    python scripts/scrape/pipeline.py --brand-slug my-brand --url https://brand.example/ [--max-pages 5] [--delay 3]

Then:
    npm run import:candidates -- scripts/scrape/output/my-brand-<page>.json
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

from crawler import PoliteSession, discover_sustainability_pages
from detect_claims import detect_candidates
from export_json import export_candidates
from extract_html import extract_paragraphs
from extract_pdf import extract_pdf_paragraphs

OUTPUT_DIR = Path(__file__).parent / "output"


def run(brand_slug: str, url: str, max_pages: int, delay: float) -> None:
    session = PoliteSession(delay_seconds=delay)
    pages = [url, *discover_sustainability_pages(session, url, limit=max_pages)][: max_pages + 1]
    print(f"Checking {len(pages)} page(s) for {brand_slug}")
    for page_url in pages:
        resp = session.get(page_url)
        if resp is None:
            continue
        ctype = resp.headers.get("content-type", "")
        if "pdf" in ctype:
            title, paragraphs = page_url.rsplit("/", 1)[-1], [t for _, t in extract_pdf_paragraphs(resp.content)]
        elif "html" in ctype:
            title, paragraphs = extract_paragraphs(resp.text)
        else:
            continue
        candidates = detect_candidates(paragraphs)
        if not candidates:
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", page_url.lower()).strip("-")[-60:]
        out = OUTPUT_DIR / f"{brand_slug}-{slug}.json"
        export_candidates(out, brand_slug, page_url, title, candidates)
        print(f"  {len(candidates)} candidate(s) → {out}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--brand-slug", required=True)
    parser.add_argument("--url", required=True)
    parser.add_argument("--max-pages", type=int, default=5)
    parser.add_argument("--delay", type=float, default=3.0, help="Seconds between requests (minimum 1)")
    args = parser.parse_args()
    run(args.brand_slug, args.url, args.max_pages, max(args.delay, 1.0))
