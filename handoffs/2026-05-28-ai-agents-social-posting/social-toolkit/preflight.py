"""Headless publishing readiness checks.

This prints presence/placeholder status only. It never prints credential
values or token contents.
"""

from __future__ import annotations

import json
import os
from pathlib import Path


HERE = Path(__file__).resolve().parent
STATE_DIR = HERE / "state"
KEYS_DIR = (
    Path(os.environ.get("USERPROFILE", os.path.expanduser("~")))
    / "OneDrive - Technijian, Inc"
    / "Documents"
    / "VSCODE"
    / "keys"
)


PLATFORMS = {
    "tiktok": {
        "key_file": "tiktok.md",
        "token_file": "social_token_tiktok.json",
        "required_keys": ["client_key", "client_secret", "redirect_uri"],
    },
    "x": {
        "key_file": "x.md",
        "token_file": "social_token_x.json",
        "required_keys": ["client_id", "client_secret", "redirect_uri"],
    },
    "youtube": {
        "key_file": "youtube.md",
        "token_file": "social_token_youtube.json",
        # channel_id is an optional override; YouTube Data API upload uses
        # the authenticated channel by default.
        "required_keys": [],
        "extra_files": [
            Path.home() / ".creds" / "google" / "youtube_client_secret.json",
            Path.home() / ".creds" / "google" / "youtube_token.json",
        ],
    },
    "bluesky": {
        "key_file": "bluesky.md",
        "token_file": "social_token_bluesky.json",
        "required_keys": ["handle", "app_password"],
    },
    "linkedin": {
        "key_file": "linkedin.md",
        "token_file": "social_token_linkedin.json",
        "required_keys": ["client_id", "client_secret", "redirect_uri", "organization_urn"],
    },
    "meta": {
        "key_file": "meta-graph.md",
        "token_file": "social_token_meta.json",
        "required_keys": ["app_id", "app_secret", "page_id", "ig_business_user_id"],
    },
    "threads": {
        "key_file": "threads.md",
        "token_file": "social_token_threads.json",
        "required_keys": ["app_id", "app_secret", "redirect_uri", "threads_user_id"],
    },
    "pinterest": {
        "key_file": "pinterest.md",
        "token_file": "social_token_pinterest.json",
        "required_keys": ["app_id", "app_secret", "redirect_uri"],
    },
}


def parse_key_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    out: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, _, value = line.partition(":")
        out[key.strip().lower().replace(" ", "_")] = value.strip().strip("`\"'")
    return out


def is_placeholder(value: str | None) -> bool:
    if not value:
        return True
    text = value.strip()
    return (
        not text
        or "REPLACE_WITH" in text
        or text.startswith("<")
        or text.upper() in {"TODO", "TBD"}
    )


def platform_status(name: str, spec: dict) -> dict:
    key_path = KEYS_DIR / spec["key_file"]
    token_path = STATE_DIR / spec["token_file"]
    values = parse_key_file(key_path)
    missing_keys = [
        key for key in spec["required_keys"]
        if is_placeholder(values.get(key))
    ]
    extra_files = spec.get("extra_files", [])
    missing_extra = [str(path) for path in extra_files if not path.exists()]
    ready = key_path.exists() and not missing_keys and token_path.exists() and not missing_extra
    return {
        "platform": name,
        "key_file_exists": key_path.exists(),
        "missing_or_placeholder_keys": missing_keys,
        "token_file_exists": token_path.exists(),
        "missing_extra_files": missing_extra,
        "headless_ready": ready,
    }


def main() -> int:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    rows = [platform_status(name, spec) for name, spec in PLATFORMS.items()]
    print(json.dumps({
        "keys_dir": str(KEYS_DIR),
        "state_dir": str(STATE_DIR),
        "platforms": rows,
    }, indent=2))
    return 0 if all(row["headless_ready"] for row in rows) else 1


if __name__ == "__main__":
    raise SystemExit(main())
