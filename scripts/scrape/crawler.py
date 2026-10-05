"""Polite crawler: robots.txt aware, rate-limited, same-origin only.

It never bypasses authentication, paywalls, CAPTCHAs or anti-bot controls.
If a page is disallowed or returns 401/403/429, it is skipped.
"""
from __future__ import annotations

import time
import urllib.robotparser
from dataclasses import dataclass, field
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

USER_AGENT = "GreenBrandTransparencyHub-Research/0.1 (+academic portfolio project; contact via repository)"
SUSTAINABILITY_HINTS = (
    "sustainab", "esg", "impact", "responsib", "environment", "climate", "planet", "csr", "report",
)


@dataclass
class PoliteSession:
    delay_seconds: float = 3.0
    timeout: int = 20
    _last_request: float = 0.0
    _robots: dict[str, urllib.robotparser.RobotFileParser] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.http = requests.Session()
        self.http.headers["User-Agent"] = USER_AGENT

    def allowed(self, url: str) -> bool:
        parsed = urlparse(url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        if origin not in self._robots:
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(urljoin(origin, "/robots.txt"))
            try:
                rp.read()
            except Exception:  # unreachable robots.txt → be conservative
                rp.disallow_all = True
            self._robots[origin] = rp
        return self._robots[origin].can_fetch(USER_AGENT, url)

    def get(self, url: str) -> requests.Response | None:
        if urlparse(url).scheme not in ("http", "https"):
            return None
        if not self.allowed(url):
            print(f"  robots.txt disallows {url} — skipped")
            return None
        wait = self.delay_seconds - (time.monotonic() - self._last_request)
        if wait > 0:
            time.sleep(wait)
        self._last_request = time.monotonic()
        try:
            resp = self.http.get(url, timeout=self.timeout)
        except requests.RequestException as exc:
            print(f"  request failed for {url}: {exc}")
            return None
        if resp.status_code in (401, 403, 429):
            print(f"  {resp.status_code} for {url} — access restricted, not retried")
            return None
        if not resp.ok:
            return None
        return resp


def discover_sustainability_pages(session: PoliteSession, home_url: str, limit: int = 10) -> list[str]:
    """Find same-origin links on the homepage whose text or URL suggests sustainability content."""
    resp = session.get(home_url)
    if resp is None or "html" not in resp.headers.get("content-type", ""):
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    origin = urlparse(home_url).netloc
    found: list[str] = []
    for a in soup.find_all("a", href=True):
        href = urljoin(home_url, a["href"]).split("#")[0]
        if urlparse(href).netloc != origin or href in found:
            continue
        haystack = f"{href} {a.get_text(' ', strip=True)}".lower()
        if any(h in haystack for h in SUSTAINABILITY_HINTS):
            found.append(href)
        if len(found) >= limit:
            break
    return found
