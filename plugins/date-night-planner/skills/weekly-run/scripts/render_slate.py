#!/usr/bin/env python3
"""Render a date-night slate as markdown (for chat or an email body).

Usage: python render_slate.py slate-YYYY-MM-DD.json [-o out.md] [--link URL]
Standard library only.
"""
import argparse
import html
import json
import re
import sys


def md_inline(fragment):
    """Turn the small HTML subset slates allow into markdown."""
    s = str(fragment or "")
    s = re.sub(r'<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)</a>', r"[\2](\1)", s, flags=re.I | re.S)
    s = re.sub(r"</?(b|strong)>", "**", s, flags=re.I)
    s = re.sub(r"</?(i|em)>", "*", s, flags=re.I)
    s = re.sub(r"<br\s*/?>", " ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s).strip()


def render(slate, link=None):
    out = []
    if slate.get("eyebrow"):
        out.append(f"*{slate['eyebrow']}*")
    out.append(f"## {slate.get('title', 'This week')}")
    if slate.get("subtitle"):
        out.append(slate["subtitle"])
    if slate.get("alert"):
        out.append(f"> {md_inline(slate['alert'])}")
    ctx = slate.get("context") or []
    if ctx:
        out.append("\n".join(f"- **{c.get('label', '')}:** {c.get('value', '')}" for c in ctx))
    for i, o in enumerate(slate.get("options") or [], 1):
        badge = {"explore": "Something new", "tried": "Tried & tested"}.get(o.get("mode"), "")
        chips = [badge] + [t.get("label", "") if isinstance(t, dict) else str(t) for t in o.get("tags") or []]
        out.append(f"### {i}. {o.get('title', '')}")
        line = " · ".join(c for c in chips if c)
        if line:
            out.append(f"*{line}*")
        if o.get("hook"):
            out.append(o["hook"])
        rows = []
        for f in o.get("fields") or []:
            val = md_inline(f["html"]) if "html" in f else str(f.get("v", ""))
            rows.append(f"- **{f.get('k', '')}:** {val}")
        if rows:
            out.append("\n".join(rows))
    ahead = slate.get("bookAhead") or []
    if ahead:
        out.append("### Book ahead")
        out.append("\n".join(f"- {md_inline(b.get('html') if isinstance(b, dict) else b)}" for b in ahead))
    if slate.get("nudge"):
        out.append(f"*{slate['nudge']}*")
    if slate.get("footnote"):
        out.append(f"<sub>{html.escape(slate['footnote'])}</sub>")
    if link:
        out.append(f"**Vote and add notes:** {link}")
    return "\n\n".join(out) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("path")
    ap.add_argument("-o", "--out")
    ap.add_argument("--link", help="voting page URL to append")
    args = ap.parse_args()
    with open(args.path, encoding="utf-8") as fh:
        text = render(json.load(fh), args.link)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(text)
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
