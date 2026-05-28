"""Focused readiness check for X, TikTok, and Bluesky.

This wraps the broader preflight module and reports only the three platforms
currently used for short-form social publishing.
"""

from __future__ import annotations

import json

from .preflight import PLATFORMS, platform_status


CORE_PLATFORMS = ("x", "tiktok", "bluesky")


def main() -> int:
    rows = [platform_status(name, PLATFORMS[name]) for name in CORE_PLATFORMS]
    print(json.dumps({"platforms": rows}, indent=2))
    return 0 if all(row["headless_ready"] for row in rows) else 1


if __name__ == "__main__":
    raise SystemExit(main())

