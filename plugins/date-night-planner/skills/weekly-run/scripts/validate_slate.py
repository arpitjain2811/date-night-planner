#!/usr/bin/env python3
"""Check a date-night slate before publishing it.

Usage: python validate_slate.py slate-YYYY-MM-DD.json [--options N]

Exits 0 when the slate is publishable (warnings are printed but allowed),
1 when something would break the voting page or the weekly run.
Standard library only.
"""
import argparse
import json
import re
import sys
from html.parser import HTMLParser

ALLOWED_TAGS = {"a", "b", "strong", "i", "em", "br"}
HTML_FIELDS_HINT = "HTML is only allowed in alert, fields[].html and bookAhead[].html"


class TagCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.bad_tags, self.bad_links = set(), []

    def handle_starttag(self, tag, attrs):
        if tag not in ALLOWED_TAGS:
            self.bad_tags.add(tag)
        if tag == "a":
            href = dict(attrs).get("href") or ""
            if not re.match(r"^https?://", href, re.I):
                self.bad_links.append(href or "(missing href)")


def astral(text):
    """Characters outside the Basic Multilingual Plane (most emoji)."""
    return sorted({ch for ch in text if ord(ch) > 0xFFFF})


def check_html(label, value, errors, warnings):
    parser = TagCollector()
    parser.feed(value)
    if parser.bad_tags:
        warnings.append(f"{label}: tags the page will strip: {', '.join(sorted(parser.bad_tags))}")
    for href in parser.bad_links:
        warnings.append(f"{label}: link will be dropped (not http/https): {href}")


def validate(slate, n_options, name):
    errors, warnings = [], []
    if not isinstance(slate, dict):
        return ["top level must be a JSON object"], warnings

    m = re.search(r"slate-(\d{4}-\d{2}-\d{2})\.json$", name or "")
    week = slate.get("weekId")
    if not week and not m:
        errors.append("no weekId, and the filename isn't slate-YYYY-MM-DD.json")
    if week and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(week)):
        errors.append(f"weekId must be YYYY-MM-DD, got {week!r}")
    if week and m and week != m.group(1):
        warnings.append(f"weekId {week} differs from filename date {m.group(1)}; the page uses the filename")

    for key in ("title", "footnote"):
        if not str(slate.get(key, "")).strip():
            warnings.append(f"missing {key}")

    options = slate.get("options")
    if not isinstance(options, list):
        errors.append("options must be a list")
        options = []
    if n_options and len(options) != n_options:
        errors.append(f"expected exactly {n_options} options, found {len(options)}")

    seen, categories, explore = set(), [], 0
    for i, o in enumerate(options, 1):
        label = f"option {i}"
        if not isinstance(o, dict):
            errors.append(f"{label}: must be an object")
            continue
        oid = str(o.get("id", "")).strip()
        if not oid:
            errors.append(f"{label}: missing id")
        elif oid in seen:
            errors.append(f"{label}: duplicate id {oid!r}")
        seen.add(oid)
        if not str(o.get("title", "")).strip():
            errors.append(f"{label}: missing title")
        mode = o.get("mode")
        if mode not in ("explore", "tried"):
            errors.append(f"{label}: mode must be 'explore' or 'tried', got {mode!r}")
        explore += mode == "explore"
        if not str(o.get("hook", "")).strip():
            warnings.append(f"{label}: no hook")
        cat = o.get("category")
        if cat:
            categories.append(cat)
        else:
            warnings.append(f"{label}: no category (needed for the no-two-alike rule)")
        tags = o.get("tags", [])
        if not isinstance(tags, list):
            errors.append(f"{label}: tags must be a list")
        else:
            for t in tags:
                if isinstance(t, dict) and t.get("kind") not in (None, "hot", "new"):
                    warnings.append(f"{label}: tag kind {t.get('kind')!r} isn't hot/new, so it renders plain")
        fields = o.get("fields")
        if not isinstance(fields, list) or not fields:
            errors.append(f"{label}: fields must be a non-empty list")
        else:
            keys = []
            for f in fields:
                if not isinstance(f, dict) or "k" not in f or ("v" not in f and "html" not in f):
                    errors.append(f"{label}: every field needs k and v (or html)")
                    continue
                keys.append(str(f["k"]).lower())
                if "html" in f:
                    check_html(f"{label} field {f['k']!r}", str(f["html"]), errors, warnings)
            for want in ("when", "cost"):
                if not any(want in k for k in keys):
                    warnings.append(f"{label}: no '{want.title()}' field")

    dupes = {c for c in categories if categories.count(c) > 1}
    if dupes:
        errors.append(f"two options share a category: {', '.join(sorted(dupes))}")
    if options and explore == 0:
        errors.append("no explore option; the slate needs at least one")
    if options and explore == len(options):
        errors.append("every option is explore; the slate needs at least one tried")

    if slate.get("alert"):
        check_html("alert", str(slate["alert"]), errors, warnings)
    for j, b in enumerate(slate.get("bookAhead") or [], 1):
        if isinstance(b, dict) and "html" in b:
            check_html(f"bookAhead {j}", str(b["html"]), errors, warnings)
    for key in ("title", "subtitle", "nudge", "footnote", "eyebrow"):
        if key in slate and "<" in str(slate[key]):
            warnings.append(f"{key} looks like it contains HTML; it will show as text. {HTML_FIELDS_HINT}")
    nudge = str(slate.get("nudge", ""))
    if len(nudge) > 280:
        warnings.append(f"nudge is {len(nudge)} characters; keep it to one line")

    bad = astral(json.dumps(slate, ensure_ascii=False))
    if bad:
        errors.append("4-byte characters that some Drive connectors corrupt: " + " ".join(bad))
    return errors, warnings


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("path")
    ap.add_argument("--options", type=int, default=4, help="expected number of options (default 4)")
    args = ap.parse_args()
    try:
        with open(args.path, encoding="utf-8") as fh:
            slate = json.load(fh)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: can't read {args.path}: {exc}")
        return 1
    errors, warnings = validate(slate, args.options, args.path)
    for w in warnings:
        print(f"warning: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    if errors:
        print(f"FAIL: {len(errors)} error(s)")
        return 1
    print(f"OK: {len(slate.get('options', []))} options, {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
