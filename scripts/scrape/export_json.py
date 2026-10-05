"""Write candidates in the format expected by scripts/import/import-candidates.ts."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


def export_candidates(path: Path, brand_slug: str, source_url: str, source_title: str, candidates: list[dict]) -> None:
    for c in candidates:
        c["status"] = "CANDIDATE"  # enforced: imports are never verified automatically
    payload = {
        "brandSlug": brand_slug,
        "sourceUrl": source_url,
        "sourceTitle": source_title[:300] or source_url,
        "extractedAt": datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        "candidates": candidates[:500],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
