"""Focused readiness check for X, TikTok, and YouTube."""

from __future__ import annotations

import json

from .preflight import PLATFORMS, platform_status


VIDEO_PLATFORMS = ("x", "tiktok", "youtube")


def main() -> int:
    rows = [platform_status(name, PLATFORMS[name]) for name in VIDEO_PLATFORMS]
    print(json.dumps({"platforms": rows}, indent=2))
    return 0 if all(row["headless_ready"] for row in rows) else 1


if __name__ == "__main__":
    raise SystemExit(main())

