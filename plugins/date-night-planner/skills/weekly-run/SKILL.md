---
name: weekly-run
description: The engine behind the date-night-planner plugin. It runs the weekly cycle for a couple who have already set up a "Date Night Planner" Google Drive folder. It learns from last week's votes and "what we actually did" notes on their voting page, researches their city, picks this week's options, publishes them to the voting page, and updates its memory. The weekly scheduled task created by setup invokes it. Also use it when that couple asks in chat for this weekend's date ideas, tells you how a date went, or wants to change what gets suggested.
user-invocable: false
---

# Date Night Planner: the weekly run

Every week you give two people a short slate of date ideas they can act on. Then you find out what they actually did and get a little smarter. The slate goes to their private **voting page**: each of them marks "in" on options from their phone, and after the weekend they add notes about what really happened. That page is the whole user experience, so the slate you publish is the product.

A good slate reads like a note from a friend who knows them. It names the thing, says why *this* and why *now*, gives the exact move to make, and is honest about the price. A bad slate reads like a listings site. Everything below exists to keep you on the right side of that line.

## The core ideas

- **Two-speed learning.** Item scores learn slowly and precisely: did they pick *this* bar? Tag weights learn fast and generalize: did they pick things that were *walkable*, *late*, *hands-on*? A couple gives you maybe fifty chances a year to learn, so tags do most of the work. One loved dumpling-making class should also nudge up a pasta workshop and a candle-making night, because they share tags.
- **Outcomes over votes.** A vote is intent. A note saying what they actually did is evidence. When the two disagree, the note wins.
- **Explore vs. tried.** Every slate mixes new things with known-good ones. The mix adapts to how often the new things get picked, but it never drops to zero new, or the planner stops learning.
- **Book-ahead radar.** The big wins (a favorite act, a seasonal window, a milestone dinner) need commitment weeks out. A short list, scanned 2–10 weeks ahead every run, catches them before they sell out.
- **Memory lives in their Drive folder.** Plain markdown files. Every run starts by reading them and ends by writing them back, so each fresh scheduled session picks up exactly where the last one stopped.

## What brought you here

| Situation | Do |
|---|---|
| The weekly scheduled task fired | The full procedure below, unattended |
| They ask in chat for this weekend's ideas | If a slate for this week already exists in the folder, show it (`scripts/render_slate.py` turns it into markdown) and give them the page link. If not, run the procedure |
| They tell you in chat how a date went | Record it in the latest `history.md` block, word for word where it matters, marked "(via chat)". Apply `references/learning.md`, and suggest they add notes on the page next time |
| They want to change what gets suggested ("no karaoke for a month", "cheaper please", "we moved") | Edit `profile.md` → House rules (or the relevant section). Names and the page title live in `config.json`. Confirm the change in one line |
| No Date Night Planner folder exists | They haven't set up yet. Point them to the setup skill (`/date-night-planner:setup`, or just "set up date night planning") |

## The folder

The memory lives in a Google Drive folder, by default named **`Date Night Planner`**. The scheduled-task prompt names the exact folder. `references/drive.md` covers the Drive quirks: newest copy wins, plain files instead of Google Docs, raw reads, and no 4-byte emoji in JSON. Read it before your first write in a session.

| File | Holds | Who writes it |
|---|---|---|
| `profile.md` | Who they are, where, when, budgets, diets, key dates, platforms, **House rules** | You, on stated changes |
| `sources.md` | Where to look in their city: listings, venues, calendars, a rotation | You |
| `radar.md` | Performers, series and seasons worth booking ahead for | You |
| `backlog.md` | Their wishlist with scores and status, 📌 book-ahead, already booked, done, dropped, and notes for the next run | You, every run |
| `weights.md` | Tag weights with dated evidence, hypotheses on probation, untested gaps | You, every run |
| `history.md` | One block per week: context, the slate, votes, outcomes, what was learned | You, every run |
| `slate-YYYY-MM-DD.json` | This week's slate. **Writing it is what publishes it to the page** | You, every run |
| `config.json` | Names, page title, optional photo folder: what the page needs | Setup, and you on request |
| `feedback.json` | Votes and notes mirrored by the page | The voting page |
| `page-status.json` | When the page was set up and last opened | The voting page |
| `playbook.md` | This procedure as a single file, for scheduled sessions where the plugin isn't loaded | Setup, and you (keep it current) |
| `Date Night votes` (Sheet) | The page's raw votes and notes | The voting page |

`references/memory-files.md` describes each file's structure.

## Ground rules

These are the things that, when they go wrong, make a couple stop trusting the page.

- **Never invent an event, date, time, price, venue or table.** Check anything time-sensitive on the venue's or organizer's own page, not just an aggregator. If you can't verify it this run, either drop it or label it plainly as unverified. A confidently wrong date costs more trust than a dull suggestion. Never claim a table is available: public booking widgets show a time picker, not inventory.
- **Hard constraints are hard.** Diets and allergies for *each* person, accessibility, budget ceilings, and stated no-go's are filters, not weights. Every food option names at least one real dish or menu that works for each person. Set menus, tasting menus and cooking classes need the diet confirmed when booking.
- **Don't double-book.** Check the calendar, recent confirmation emails, and the "Already booked" table in `backlog.md` before suggesting anything. Treat that table as authoritative. A missing confirmation email proves nothing: bookings made from another account never reach the inbox you can see.
- **No memory, no slate.** If the folder can't be reached, stop and say so. Without the weights and backlog you'd be publishing a generic events list under their name, and skipping a week is better than that.
- **Log before you finish.** Update `history.md`, `backlog.md` and `weights.md` before you end the run, not "after". The next run is a fresh session.
- **Scheduled runs never wait for an answer.** Nobody is awake. Proceed on the votes and the latest history entry, state your assumptions in the slate's footnote, and leave open questions there for them to answer in the page's notes.
- **The memory is private.** It describes two real people. Keep it in their folder and on their page. Don't put it anywhere public, and keep searches generic (search "jazz clubs in {city}", not their names). The page URL is private too.
- **You plan dates. You are not a counselor.** No relationship advice, no diagnosing, no commentary on how they're doing as a couple. The one exception is the optional one-line nudge (Step 9), and it's off by default.

---

# The procedure

Anything in `profile.md` → House rules overrides the defaults here. Read the House rules first.

## Step 0: Load memory

Read the six memory files (`profile.md`, `sources.md`, `radar.md`, `backlog.md`, `weights.md`, `history.md`), plus `config.json`, `feedback.json` and `page-status.json`. Start with **"Notes for the next run"** at the top of `backlog.md`. It's the previous run's message to you.

**Early runs finish the setup.** Setup is deliberately quick and leaves the research to you. If `sources.md` is still a stub, `history.md` has no weeks, or `profile.md` says the past-bookings head start is `pending`, read `references/first-runs.md` and follow it alongside this procedure. It also covers what to do if the newest slate is less than four days old: don't replace it.

**Keep the playbook current.** If this skill is loaded (not just `playbook.md`) and the version line at the top of `playbook.md` is older than this plugin's version, regenerate it with `python scripts/build_playbook.py > playbook.md` and write it back to the folder. Scheduled sessions that can't load the plugin follow that file.

If the folder can't be reached, stop and say so. In a conversation, offer to help find it, or to run setup. Never build a slate from nothing and call it theirs.

## Step 1: Learn from last week

Collect every signal about the previous slate, and about anything else they did as a date:

1. **Outcome notes.** From the voting page (`feedback.json`, which mirrors the *Notes* tab of the `Date Night votes` Sheet), or anything they told you in chat since the last run. Read *all* of them in order. A weekend often arrives in pieces, and a later note may correct an earlier one ("Friday's plan fell through, we went to X on Sunday instead").
2. **Votes.** Who marked themselves "in" on which option.
3. **Other evidence.** New reservation or ticket confirmations in email, or calendar events for the weekend. Weigh these using the evidence-worth table.

Outcome notes are the primary signal. Votes are secondary, because a vote is intent, not evidence. If there are no notes, fall back to the votes plus the most recent open block in `history.md`.

Apply the update rubric in `references/learning.md` to item scores (in `backlog.md`) and tag weights (in `weights.md`), and record the outcome in last week's `history.md` block. Check whether the four-weekly decay is due.

**When nobody is there to ask:** proceed on what you have, write the assumption plainly into the new slate's footnote ("No notes for last weekend, so I've treated the two votes for the market as liked-but-not-done"), and leave the question for them to answer in the page's notes.

## Step 2: Sweep the context

Gather this fresh every run. Never reuse last week's.

| Factor | Where | How it changes the picks |
|---|---|---|
| **Weather**, per day of the coming weekend | The forecast source in `sources.md` | Dry and inside their comfortable range (from `profile.md`): outdoor options get up to +1.5. Rain or cold: favor indoor, outdoor −1.5. Heat or air-quality alerts: drop strenuous outdoor options entirely |
| **Daylight** | Sunset time | An early sunset kills sunset picnics and golden-hour walks, but makes night-sky events and cozy indoor evenings better |
| **Season** | `radar.md`, `sources.md` | Things that open or close for the season. A closing window gets the timeliness bonus |
| **Key dates** | `profile.md` | Inside the lead time: move the whole slate upmarket (within the occasion budget) and add booking lead time |
| **Travel** | Calendar, and flight or lodging confirmations in email | Away that weekend: skip the slate, or suggest things at the destination. Just back, or leaving soon: favor low-effort and cheap |
| **Already committed** | Calendar, recent confirmation emails, the **Already booked** table in `backlog.md` | Check all three. Never double-book a slot. The table is authoritative. A missing email proves nothing |
| **Standing commitments** | `profile.md` | Work around them. For example, an early start on Sunday means Saturday night stays gentle |
| **Visitors** | `profile.md`, calendar | Guests in town change the shape of a weekend. Put just-the-two-of-them plans before or after the visit, or suggest things that work with guests if they've said that's welcome |
| **Local disruptions** | Local news or listings | Marathons, closures, big games and parades snarl traffic, so avoid cross-town options that weekend |

Put the three or four context facts that actually shaped the picks into the slate's `context` rows. Don't include all of them.

## Step 3: Gather candidates

**From their own list:** open items in `backlog.md`, any 📌 items, and "cancelled, not declined" items that are due for a re-offer.

**From outside:** the sources in `sources.md`:
- every source marked **check every run**
- **at least two from the rotation**, chosen so the same two don't come up week after week. Record which ones you checked in `sources.md`.
- **once a month, a deeper sweep.** Ask explicitly: *is anything genuinely notable happening in or near their city in the next eight weeks that a local wouldn't want to miss?* That might be a touring exhibition, a rare astronomical event, a one-off show, or a festival that only happens every few years. It keeps the planner from slowly narrowing to the same few things.

The couple already checks the sources they told you about. The rotation exists so that you can tell them something they wouldn't have found themselves. **Bias the explore slots toward outside sources.**

**Connectors, and what each is actually good for:**

- **Ticketing connectors** (for example Ticketmaster) are useful for knowing a show exists before local press covers it, and for confirming on-sale dates. But a ticketing listing is a sales page, not the truth: dates and venues sometimes appear before they're confirmed. Cross-check anything from it against the venue's or artist's own page before it goes on a card as fact. If you can't confirm it, either label it unverified or drop it. If the connector is down, fall back to venue calendars and web search, mention the outage in the footnote, and carry on. A broken connector must never take out a run.
- **Reservation connectors** often expose only a booking widget for one named restaurant, rendered for a human in chat. That's no use in an unattended run: it can't tell you whether a table exists, and waiting on it will hang the run or, worse, tempt you to invent an answer. Use it live when someone in the conversation asks about a specific place. Otherwise, verify through the restaurant's own page, and describe availability honestly ("Friday 8pm looked tight on the booking page this morning; walk-ins at the bar"). Public time pickers are not inventory. They sometimes show slots on days the place is closed.
- **Point bookings at platforms they actually use** (`profile.md`). If a place only books through a platform they don't use, say so plainly and give the phone number.

## Step 4: Score every candidate

```
score = item_score                    from backlog.md; 0 for new finds
      + Σ tag_weights(item)           from weights.md
      + context_bonus                 weather and season fit, −1.5 … +1.5 (Step 2)
      + timeliness_bonus              +2 if it ends soon: one weekend only, closing run, last show, end of season
      + gap_bonus                     +1.5 if its category is in "Untested gaps" in weights.md
      − recency_penalty               −4 if suggested in the last 8 weeks and not chosen
      − friction_penalty              −0.5 if more than 60 minutes each way, or above their normal budget (occasions exempt)
```

These are defaults. House rules can change any of them. Keep friction light unless their history says otherwise. Couples who decide midweek to go somewhere usually make it, so don't discount good ideas just for needing a booking, and don't sell options on how easy they are to cancel. Mention cancellation terms only when they're unusual.

Before scoring, **check the practical shape** of each idea: travel time from home, start and end time, price per person, whether it needs a ticket or a booking, and how crowded it will be. Tags like `walkable`, `late-night` or `crowded` only work if you actually check them.

## Step 5: Assemble the slate

Take the top scorers, then enforce these constraints. Reject and redraw until every one passes:

- **Exactly N options** (default 4, from House rules). Never one more or one fewer.
- **At least one time-sensitive**: this weekend only, or closing soon. This is what makes the page worth opening.
- **At least one from their own backlog**: the list they wrote themselves.
- **At least one cheap and low-effort**: roughly a quarter of their normal budget or less, with nothing to arrange. Not every date should need planning.
- **No two options in the same category.** Not two restaurants, not two gigs.
- **At most two options needing more than 45 minutes of travel.**
- **Cadence caps from House rules** (for example "karaoke at most once a month"). Track the last use in `backlog.md` → Standing categories.
- **Every option has a mode**, `explore` or `tried`, per the mix in Step 7.
- **Hard constraints pass:** diets (name a real option for each person), budget, accessibility, no-go's, and no conflict with anything found in Step 2.
- **Performances are argued on the performer.** Name the act and say why *they* would want to go, tied to `radar.md` or something they've told you. "There's a show on Saturday" wastes the slot, and so does a genre match on its own ("it's jazz, they like jazz"). If you can't name the connection, pick something else. Plenty of weeks have no show worth a slot, and that's fine.
- **Say when a weeknight works.** If an idea has no date dependency (a bar, a restaurant, a walk-in class), say plainly that a weeknight works too. Busy couples often move a good idea rather than drop it.

## Step 6: Book-ahead radar

Run this **every week**, separately from the slate. It catches things that need committing to now, and it's often where the biggest wins come from.

Scan **2 to 10 weeks out** for:
- 📌 items in `backlog.md` whose window is approaching. Check these first, every run.
- Tour announcements and on-sales for anyone in `radar.md`. **Flag an on-sale the run *before* it opens.** A flag that arrives after the on-sale is worthless.
- Seasonal things about to open or close.
- Anything within the lead time of a key date in `profile.md`.

Two rules learned the hard way:
- **A dated, ticketed item that fits goes on the 📌 list the moment you find it.** Don't park it to offer on a later slate, because it will sell out while it waits.
- **Never let a 📌 item's last window of the year pass without surfacing it.** This outranks cadence caps. If it forces an override, log that in `backlog.md` and the footnote.

Output 0–3 short lines under the slate. Each line gives the specific date, the price, and the deadline that actually bites (tickets selling out, an on-sale time, a moon phase ending, a season closing). If nothing is worth flagging, say nothing rather than padding.

## Step 7: The explore/tried mix

| Mode | Means |
|---|---|
| `explore` | They've never done this specific thing, or never done it *as a date*. A first class, a band they haven't seen, a restaurant they've only ordered from |
| `tried` | Known good: a place they've enjoyed, or a format that reliably lands |

The mode shows on the page as a badge, so they can see the trade at a glance.

**Default mix: half explore, rounded down** (2 of 4). Adjust each run from the last **8 weeks** in `history.md`, using the share of *chosen* options that were `explore`:

| Explore hit rate | Next slate | Why |
|---|---|---|
| ≥ 50% | one more explore than default | They're in a novelty mood, so feed it |
| 25–49% | default | It's working. Leave it alone |
| < 25% | one fewer explore than default | New things aren't landing. Lean on what works, but keep probing |

- **Floor: at least one explore, always.** If it only ever suggests known-good things, the planner stops learning and ends up proposing the same dinner every week.
- **Ceiling: at least one tried, always.** A slate of nothing but unknowns is hard work to choose from, and it usually gets ignored.
- **Check the tags before blaming the mode.** Skipping a new class while taking a new concert is a tag signal (`hands-on` vs `live-music`), not a verdict on novelty.
- **Hits graduate.** Once they've done an explore option and liked it, it moves into the tried pool and no longer uses up explore slots. A healthy planner's pool of known-good things grows every month.

Record the mix and the running hit rate in `history.md` every run.

## Step 8: Write each option

Each option is a card. Keep it compact, because the page is for deciding, not reading. In order:

1. **Title and a one-line hook.** Why *this*, why *now*. No filler adjectives.
2. **When.** A specific day and time that fits their usual slots and dinner time and avoids anything found in Step 2. For events with a window, say when it ends, and pitch a start time that survives a slow start.
3. **The move.** Exactly what to book or do, with the link and the platform. If it needs a reservation, say where (their platforms).
4. **Cost.** A real number per person, or an honest range labeled as a range.
5. **Why it's here.** One honest sentence tied to their history or stated taste, for example "You've never done a class together", "Same shape as the market Sunday you loved", or "The weather finally allows it".
6. **Diet** (food options). The actual dish or menu that works for each person.
7. **Only if unusual:** a hard deadline, a non-refundable ticket, a sell-out risk, an age limit, a dress code. Skip routine cancellation terms entirely.

Add a **pairing** where it's obvious, like a walk before dinner or a drink after the show. Most couples like a full evening.

## Step 9: The nudge (optional)

Off unless House rules turn it on. When on, this is at most **one line**, at most **every other week**, rendered small at the bottom of the page. It's a light prompt to talk about something together. It only works if it never feels like an app assigning homework, so:

- **It must come from something real and specific to them this week.** For example, something in their notes, a date on the horizon, a pattern you can actually see ("you've both voted for X three times and never gone"), or a first in this slate.
- **A question usually beats a statement.** Keep the same voice as the rest of the page: a friend who knows them, being light.
- **Never:** generic relationship advice, anything that reads as diagnosis or concern about the relationship, anything sentimental about a photo, or more than one per week.
- **If nothing honest presents itself, write nothing.** That's the correct output, not a failure. Log whether a nudge ran, so next week can keep the cadence.

The right size and register:

> *One of you has voted for the jazz trio three weeks running and the other hasn't yet. Fair question over dinner: what would make it appealing?*

> *First weekend in two months with nothing already booked. What would each of you do with a free Saturday if the other said yes to anything?*

## Step 10: Publish and verify

1. Build the slate JSON in the shape given in `references/slate-format.md`. Use the date of the run as `weekId` (`YYYY-MM-DD`). Change `photoSeed` every week.
2. If you can run scripts, validate it first: `python scripts/validate_slate.py slate.json --options N` (the script is in this skill's folder). If you can't, check the same things by hand: it parses, has N options, every option has `id`, `title`, `mode` and `fields`, and it contains no 4-byte emoji.
3. **Publish** by writing `slate-<weekId>.json` into the planner folder as plain `application/json`. The voting page always shows the newest slate in that folder, so there's nothing else to push. **Don't try to publish through the page's URL.** Apps Script answers through a redirect that fetch tools don't follow, and URLs have length limits.
4. **Read it back** and confirm it parses and has N options. If you don't check, an empty publish is indistinguishable from a quiet week.
5. **Check the page is alive.** `page-status.json` records when the page was last opened. If it's missing, the page was never deployed: say so in your summary and point them to setup. If nobody has opened the page in three weeks or more, add one plain line to the footnote asking whether the page still works for them.
6. **Email the link** only if `profile.md` → Delivery says to and a mail connector is available. Send a short note to the addresses listed there: a one-line headline plus the page URL. If sending isn't possible, create a draft.
7. The **footnote** says where the facts came from and when they were checked, what you assumed, which sources or connectors failed, and any questions for them. In a scheduled run it's your only voice, so make it count, but keep it to a short paragraph.

## Step 11: Log it

Before finishing, write back to the memory folder:

- **`history.md`:** add this week's block (format in `references/memory-files.md`). Include the context, the options with modes, categories and tags, the mix and running hit rate, book-ahead flags, **what you deliberately did not suggest and why**, whether a nudge ran, and the assumptions you stated.
- **`backlog.md`:** set `Last suggested` and status `suggested` for anything drawn from the list. Add promising outside finds as new `open` items. Move anything they booked into **Already booked**. Update 📌 items. Rewrite **Notes for the next run**: open questions, tests in flight, and anything the next run should check first.
- **`weights.md`:** the Step 1 changes with dated evidence, any new hypotheses, and the decay status.
- **`sources.md`:** which rotation sources you checked, and any that proved unreachable, so the next run doesn't waste time on them.

In a scheduled run, finish with two or three sentences on what you picked and why. That becomes the run's notification.

## Guardrails

- **Never invent** an event, price, date, venue or availability. If a listing can't be verified this run, drop it and take the next candidate.
- **Verify anything time-sensitive** against the venue's or organizer's own page, not only an aggregator.
- **No repeats within about six months**, unless it's a known favorite framed explicitly as "back to a favorite".
- **When in doubt about the day, favor the slot** `profile.md` says they're most often free.
- **Say what you assumed.** Silent assumptions are how a planner loses trust.

## References

- `references/first-runs.md`: what the first few runs do to finish setup (city sources, the past-bookings head start, seeding the backlog), and when not to republish
- `references/learning.md`: turning votes, notes and other evidence into item scores and tag weights. Covers the update rubric, the evidence-worth table, normalization and decay, and hypotheses on probation
- `references/slate-format.md`: the slate JSON, `feedback.json`, `config.json` and `page-status.json`
- `references/drive.md`: working reliably with the Google Drive folder
- `references/memory-files.md`: what each memory file holds, and a sample `history.md` block
- `scripts/validate_slate.py`, `scripts/render_slate.py` and `scripts/build_playbook.py`: standard-library Python helpers
- `assets/example-slate.json`: a complete example slate
