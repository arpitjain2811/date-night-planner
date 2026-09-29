# The memory files

Six markdown files in the couple's Google Drive folder, plus the weekly slates and the files the voting page maintains. Setup creates them from the templates in the setup skill's `templates/` folder.

Keep them plain markdown with tables. The same files are read by the couple, by you in a fresh session every week, and by nobody else. Simple structure beats clever structure. Use ISO dates (`YYYY-MM-DD`) everywhere.

## Folder layout

```
Date Night Planner/            (Google Drive)
├── profile.md                 memory: who they are, House rules
├── sources.md                 memory: where to look
├── radar.md                   memory: worth booking ahead
├── backlog.md                 memory: wishlist and working list
├── weights.md                 memory: what's been learned
├── history.md                 memory: what happened each week
├── playbook.md                this procedure as one file, for scheduled sessions without the plugin
├── config.json                names, title, photo folder, read by the page
├── slate-YYYY-MM-DD.json      one per run; the page shows the newest
├── feedback.json              votes and notes, written by the page
├── page-status.json           page health, written by the page
└── Date Night votes           Google Sheet: the page's raw votes and notes
```

You write the six memory files, the slates and `playbook.md`, and `config.json` only at setup or on request. The page writes `feedback.json`, `page-status.json` and the Sheet. The couple mostly talks to you through the page's votes and notes, but they can edit any memory file whenever they like. If a file looks hand-edited, treat the edit as the latest truth.

## profile.md: who they are

It changes rarely: at setup, and when they tell you something durable ("we moved", "someone's gone vegan", "new budget").

Sections: **Who** (names and each person's diet), **Where** (home base at neighborhood level, how they get around, travel range, comfortable outdoor weather), **When** (usual date slots, dinner time, weeknights, standing commitments), **Money** (normal and occasion budgets, per person), **Dates to plan around** (with lead times), **Taste** (as stated at setup; learned taste lives in `weights.md`), **Platforms** they actually use, **Known blind spots** (for example "tickets are often booked from the other partner's account"), **Delivery and schedule**, and **House rules**.

**House rules** are overrides of the skill's defaults, like the number of options, cadence caps, nudges on or off, or scoring tweaks. Record each rule with the default it replaces, the date, and why. When the couple says "don't do X any more", it goes here, not in `weights.md`, because it's a rule, not a preference to be learned.

## sources.md: where to look

Built at setup by researching their city. Sections: **Where we already look**, **Check every run**, **Rotation** (with a *last checked* column), **Weather and conditions**, and **Known unreachable** (sites that block automated reading, so runs don't waste time on them). Update it when a source dies, a new one proves useful, or a rotation source keeps producing nothing.

## radar.md: worth booking ahead

This file answers one question: **when something is announced, would they care enough to commit weeks out?** Sections: performers and acts (with *why* for each), clusters from a music library if they shared one, recurring events and seasons (with typical lead time), and near-misses they've ruled out. Being on the radar is never, by itself, a reason to put something on a slate. It's a filter for the book-ahead scan and for judging whether a show is worth a slot.

## backlog.md: their wishlist and the planner's working list

Updated every run. Sections, in this order:

1. **Notes for the next run.** Your message to your future self: open questions to check, tests in flight, process lessons. Keep it short and clear items once handled. The next run reads this first.
2. **📌 Book ahead.** Dated things that need committing to, with the deadline that bites.
3. **Already booked.** Every commitment you know about. Authoritative: never double-book against it.
4. **Standing categories.** Cadence caps and category-level rules, with the date each was last used.
5. **Ideas, open.** Columns: item, category, tags, mode, score, status, last suggested, notes (verification date, price, how to book).
6. **Done, known good.** The tried pool, with times done and verdicts.
7. **Cancelled, not declined.** Items to re-offer, with a re-offer-after date.
8. **Dropped.** With the reason. Don't re-suggest these.

Status lifecycle: `open` → `suggested` → `booked` → `done` (with verdict), or `cancelled` (re-offer), or `dropped` (after two rejections, or by request).

## weights.md: what's been learned

Updated every run. The header records the range (−5 … +5), the last feedback update, the last decay and the next decay due, and a rescale log. Then:

- **Hypotheses on probation:** patterns inferred from thin evidence, each with the fair test that would settle it.
- **Tag tables by group** (format and vibe, activity, food and drink, geography): tag, weight, and dated evidence, newest first.
- **Untested gaps:** categories with no evidence either way. These get the gap bonus so they're eventually tried.
- **Change log:** one line per run summarizing what moved and why.

## history.md: what happened each week

One block per run, **newest first**, written before the run finishes, with outcomes filled in when feedback arrives. The header holds the running explore hit rate over the last 8 weeks.

A block contains:

```markdown
## Week of 2031-05-14 (slate-2031-05-14)

**Context:** Fri showers, Sat/Sun dry 24–26 °C · sunset 20:08 · nothing booked · birthday in 5 weeks (inside lead time)
**Mix:** 2 explore / 2 tried · 8-week hit rate going in: 43%

| # | Option | Mode | Category | Tags | Votes | Outcome |
|---|---|---|---|---|---|---|
| 1 | Night lantern walk, botanical garden | explore | outdoors | outdoor, seasonal, walkable, cheap | A ✓ B ✓ | did it, loved it |
| 2 | Salsa for beginners | explore | class | hands-on, class, late-night | A ✓ | not done |
| 3 | Trivia at the corner pub | tried | games | cheap, walkable, spontaneous-friendly | — | not picked |
| 4 | Rooftop tapas | tried | food | spanish, scenic, splurge | B ✓ | cancelled (rain) |

**Book ahead flagged:** jazz festival passes on sale Tue 10:00; lantern walk final weekend is 5/29–31
**Deliberately not suggested:** karaoke (cadence cap, last used 5/03) · the big arena show (performer not on radar)
**Nudge:** none (last ran 2031-04-30)
**Assumptions in footnote:** no notes for last weekend, so treated votes as liked-but-not-done
**Outcome notes (verbatim):** 5/17 A: "lantern walk was magical, go earlier next time, the queue at 8 was long"
**Learning applied:** lantern walk +3, outdoor/seasonal/walkable +1.0; salsa +0.25 (one vote); tapas 0 (cancelled, re-offer after 6/04)
```

**Keep it readable.** Once blocks are older than about 12 weeks, fold each month into a short summary: what got picked, what was loved, what changed. The weights already carry the arithmetic, so the history only needs the story.
