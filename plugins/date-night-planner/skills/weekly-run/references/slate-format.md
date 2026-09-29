# File formats: the slate, and what the voting page writes back

## Contents
- The slate: `slate-YYYY-MM-DD.json`
- `feedback.json`: votes and notes from the page
- `config.json`: what the page needs to know
- `page-status.json`: is the page alive?
- Showing a slate in chat

---

## The slate: `slate-YYYY-MM-DD.json`

Written to the planner folder once per run. The date is the day of the run. The voting page shows the newest one by the date in the filename. A complete example is in `assets/example-slate.json`.

```json
{
  "weekId": "2031-05-14",
  "eyebrow": "Weekend of May 16-18",
  "title": "A one-line headline for the week",
  "subtitle": "One or two sentences on what shaped this week: weather, a booking, a date on the horizon.",
  "alert": "Optional heads-up, e.g. a clash you spotted. Limited HTML.",
  "context": [
    { "label": "Friday", "value": "Showers after 6pm, 17 °C" },
    { "label": "Already booked", "value": "Dinner with friends, Sat 7pm" }
  ],
  "options": [
    {
      "id": "1",
      "title": "Night lantern walk at the botanical garden",
      "mode": "explore",
      "category": "outdoors",
      "learningTags": ["outdoor", "seasonal", "walkable", "cheap"],
      "hook": "One sentence: why this, why now.",
      "tags": [
        { "label": "Final two weekends", "kind": "hot" },
        { "label": "Never done this", "kind": "new" },
        { "label": "Walkable" }
      ],
      "fields": [
        { "k": "When", "v": "Saturday, arrive 7:30pm; runs to 10pm" },
        { "k": "Book", "html": "<a href=\"https://example.org/lanterns\">Timed tickets</a>, pick the 7:30 slot" },
        { "k": "Cost", "v": "$18 per person" },
        { "k": "Why", "v": "One honest sentence tied to their history." }
      ]
    }
  ],
  "bookAhead": [
    { "html": "<b>Jazz festival passes</b>: on sale Tue 10am, $65pp, usually gone by Thursday." }
  ],
  "nudge": "Optional, one line, absent most weeks.",
  "photoSeed": 7,
  "footnote": "Where the facts came from and when they were checked, what was assumed, what failed, and questions for them."
}
```

Field notes:
- **`options`** has exactly N entries (default 4). **`id`** values are short strings, unique within the slate, and must stay the same for the week, because votes are keyed to them. Don't republish the same week with different ids.
- **`mode`** is `explore` or `tried`. The page shows it as a "Something new" or "Tried & tested" badge.
- **`category`** and **`learningTags`** aren't shown on the page. They let history and scoring work without re-deriving them.
- **`tags`** are the display chips. `kind` is optional: `hot` means time-sensitive, `new` means a first for them. Leave it off for a plain chip.
- **`fields`** are the card's rows. Use `v` for plain text, which is always escaped. Use `html` only when you need a link or emphasis.
- **HTML** is allowed only in `alert`, `fields[].html` and `bookAhead[].html`, and only these tags: `a` (http/https links only), `b`, `strong`, `i`, `em`, `br`. The page strips everything else.
- **`nudge`** is plain text. Omit it most weeks.
- **`photoSeed`** is any integer, and it rotates the page's photos if they set up a photo folder. Change it every run.
- **No 4-byte characters** (most emoji). Some connectors corrupt them.

## `feedback.json`: votes and notes from the page

Written by the page every time someone votes or adds or removes a note. It covers the most recent 12 weeks that have any activity. Read it; never edit it.

```json
{
  "updatedAt": "2031-05-18T21:04:00Z",
  "voters": ["Sam", "Jordan"],
  "weeks": {
    "2031-05-14": {
      "votes": { "1": { "Sam": true, "Jordan": true }, "2": { "Sam": true, "Jordan": false } },
      "notes": [ { "at": "2031-05-17T22:10:00Z", "by": "Sam", "text": "Lantern walk was magical. Go earlier, the queue at 8 was long." } ]
    }
  }
}
```

- A vote of `false` means they un-ticked it. It's not a rejection.
- An option **everyone** voted `true` on counts as *chosen* for the explore hit rate.
- Notes can be about any week, including older ones added from the page's History tab. Read every week that has new notes since the last run, not just the latest.
- If `feedback.json` is missing or stale, the same data is in the `Date Night votes` Sheet in the folder, on the *Votes* and *Notes* tabs.

## `config.json`: what the page needs to know

Written at setup. The page reads it, so keep it small:

```json
{
  "title": "Date Night",
  "voters": ["Sam", "Jordan"],
  "photoFolder": "",
  "photoCount": 1,
  "voterAliases": {}
}
```

- **`voters`** are the names on the "Who's this?" screen and the vote buttons. If someone renames themselves, add the old name to `voterAliases` (`{"Old": "New"}`) so past votes stay attached to the right person.
- **`photoFolder`** is the name of a Drive folder of their own photos to decorate the page, or empty for none. **`photoCount`** is 0–3.

## `page-status.json`: is the page alive?

Written by the page when `setup` runs and when the page is opened (at most every 10 minutes). Use it to confirm a deployment worked, to notice a page nobody opens any more, and to spot load errors (`lastError`, which the page records instead of showing a raw error).

```json
{
  "ok": true,
  "version": "1.0.0",
  "folder": "Date Night Planner",
  "configFound": true,
  "voters": ["Sam", "Jordan"],
  "slateWeekId": "2031-05-14",
  "status": "setup-complete",
  "setupAt": "2031-05-10T18:02:11Z",
  "lastServedAt": "2031-05-14T07:41:30Z",
  "servedWeekId": "2031-05-14",
  "lastError": "(only present if a page load failed)",
  "lastErrorAt": "2031-05-14T07:40:02Z"
}
```

## Showing a slate in chat

When someone asks in chat what's on this week, `python scripts/render_slate.py slate-….json` turns a slate into clean markdown. Or write it in the same shape: the headline, the context, the cards, Book ahead, and the footnote. End with the page link, so the votes and notes still land where the planner learns from them.
