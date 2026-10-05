"""Keyword-based candidate claim detection (mirror of lib/claims/candidate-detection.ts).

Detected paragraphs are CANDIDATES for human review — never verified claims.
"""
from __future__ import annotations

import re

KEYWORDS = [
    "sustainable", "carbon", "emission", "recycled", "renewable", "climate",
    "water", "waste", "packaging", "responsible", "certified", "net zero",
]
_KEYWORD_PATTERNS = [(k, re.compile(r"\b" + k.replace(" ", r"[\s-]") + r"\w*", re.I)) for k in KEYWORDS]
_METRIC = re.compile(r"\b\d+(?:[.,]\d+)?\s?(?:%|(?:percent|t(?:onnes?)?|tco2e?|kwh|mwh|litres?|kg)\b)", re.I)
_CERT = re.compile(r"\b(?:certified|certification|verified by|assured|audited|ISO\s?\d{4,5})\b", re.I)


def detect_candidates(paragraphs: list[str], min_length: int = 40, max_length: int = 1000) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for raw in paragraphs:
        text = re.sub(r"\s+", " ", raw).strip()
        if not (min_length <= len(text) <= max_length) or text.lower() in seen:
            continue
        keywords = [k for k, p in _KEYWORD_PATTERNS if p.search(text)]
        if not keywords:
            continue
        seen.add(text.lower())
        out.append({
            "text": text,
            "keywords": keywords,
            "hasMetric": bool(_METRIC.search(text)),
            "hasCertificationReference": bool(_CERT.search(text)),
            "status": "CANDIDATE",
        })
    return out


if __name__ == "__main__":
    sample = [
        "Our packaging is now made from 80% recycled cardboard, certified by an independent body.",
        "Welcome to our store. Free shipping on orders over 50 euros.",
        "We are committed to reaching net zero emissions across our operations by 2040.",
    ]
    for c in detect_candidates(sample):
        print(c)
