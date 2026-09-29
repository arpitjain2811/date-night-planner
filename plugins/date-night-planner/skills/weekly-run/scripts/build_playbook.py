#!/usr/bin/env python3
"""Bundle the weekly-run skill into a single playbook.md for the Drive folder.

Scheduled sessions that can't load the plugin read playbook.md from the
planner folder and follow it, so it must be self-contained.

Usage: python build_playbook.py > playbook.md
Standard library only.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
PLUGIN = os.path.dirname(os.path.dirname(SKILL))
PARTS = ["references/first-runs.md", "references/learning.md", "references/slate-format.md",
         "references/drive.md", "references/memory-files.md"]


def version():
    try:
        with open(os.path.join(PLUGIN, ".claude-plugin", "plugin.json"), encoding="utf-8") as fh:
            return json.load(fh).get("version", "unknown")
    except (OSError, ValueError):
        return "unknown"


def read(rel):
    with open(os.path.join(SKILL, rel), encoding="utf-8") as fh:
        return fh.read()


def strip_frontmatter(text):
    return re.sub(r"\A---\n.*?\n---\n", "", text, count=1, flags=re.S)


def demote(text):
    """Push headings down one level so each part nests under its own H1."""
    return re.sub(r"^(#{1,5}) ", lambda m: "#" + m.group(1) + " ", text, flags=re.M)


def main():
    out = [
        f"<!-- date-night-planner playbook, version {version()} -->",
        "# Date Night Planner: playbook",
        "",
        "This file is the weekly-run skill bundled into one document. Scheduled runs follow it "
        "when the date-night-planner plugin isn't loaded. References to `references/...` point to "
        "the sections further down this file. The helper scripts aren't available in that case, "
        "so do their checks by hand. Regenerated automatically when the plugin updates.",
        "",
        demote(strip_frontmatter(read("SKILL.md"))),
    ]
    for rel in PARTS:
        out += ["", "---", "", f"# Appendix: {rel}", "", demote(read(rel))]
    sys.stdout.write("\n".join(out).rstrip() + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
