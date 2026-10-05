"""Extract paragraphs from a publicly downloadable PDF report (PyMuPDF)."""
from __future__ import annotations

import re


def extract_pdf_paragraphs(pdf_bytes: bytes) -> list[tuple[int, str]]:
    """Return (page_number, paragraph) tuples. Page numbers are 1-based."""
    import fitz  # PyMuPDF — imported lazily so HTML-only runs don't need it

    out: list[tuple[int, str]] = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for index, page in enumerate(doc, start=1):
            for block in page.get_text("blocks"):
                text = re.sub(r"\s+", " ", block[4]).strip()
                if text:
                    out.append((index, text))
    return out
