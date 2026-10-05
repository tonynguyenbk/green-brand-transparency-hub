"""Extract readable paragraphs from an HTML page."""
from __future__ import annotations

from bs4 import BeautifulSoup

SKIP_TAGS = ("script", "style", "noscript", "nav", "footer", "header", "form", "svg")


def extract_paragraphs(html: str) -> tuple[str, list[str]]:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(SKIP_TAGS):
        tag.decompose()
    title = soup.title.get_text(strip=True) if soup.title else ""
    paragraphs = [
        el.get_text(" ", strip=True)
        for el in soup.find_all(["p", "li", "h2", "h3", "blockquote", "td"])
    ]
    return title, [p for p in paragraphs if p]
