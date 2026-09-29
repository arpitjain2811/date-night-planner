# Learning from feedback

How votes, notes and other evidence turn into item scores (in `backlog.md`) and tag weights (in `weights.md`).

## Contents
- Why two levels
- Tags
- The update rubric
- Not all evidence is date evidence
- Reading notes well
- Normalization and decay
- Hypotheses on probation
- Common traps
- Writing it down

---

## Why two levels

- **Item score:** did they pick *this specific thing*? It's precise but slow. Each item gets tested maybe once a quarter.
- **Tag weights:** did they pick things that were *outdoor*, *late*, *hands-on*, *walkable*? It's fast, and it generalizes to things you've never suggested.

A single "we loved the dumpling-making class" should raise the odds of a pasta workshop and a candle-making night, because they share `hands-on` and `class`. Tag weights are what make the planner feel smarter within weeks rather than years.

## Tags

Give every candidate 3–7 tags. Use lowercase with hyphens. Reuse existing tags from `weights.md` before inventing new ones. Create a new tag when you notice a pattern that no existing tag captures, and write down why.

A starting vocabulary. Take what fits and add as you learn:

- **Format and vibe:** `outdoor`, `indoor`, `hands-on`, `class`, `participatory`, `spectating`, `late-night`, `daytime`, `walkable`, `day-trip`, `book-ahead`, `spontaneous-friendly`, `splurge`, `cheap`, `free`, `small-room`, `big-venue`, `crowded`, `two-part-evening`, `scenic`, `quiet`, `seasonal`
- **Activity:** `live-music`, `comedy`, `theatre`, `dance`, `classical`, `film`, `games`, `museum`, `wellness`, `active`, `water`, `nature`, `night-sky`, `market`, `festival`, `sports-live`, `tour`
- **Food and drink:** one tag per cuisine, plus `cocktail-bar`, `wine`, `brewery`, `dessert`, `tasting-menu`, `brunch`, `street-food`
- **Geography:** one tag per neighborhood or town they go to, so you can learn which areas actually work for them

## The update rubric

Accept any answer, including "nothing" and "something else entirely". Then apply:

| What happened | Item score | Tag weights (each tag) | Also |
|---|---|---|---|
| Did it, loved it | **+3** | **+1.0** | Mark `done`, move to the tried pool, log their verdict in their own words |
| Did it, it was fine | **+1** | **+0.3** | Mark `done` |
| Did it, didn't like it | **−2** | **−0.8** | Mark `done`, record *why*. The why is often a tag you didn't have yet |
| Picked it, but cancelled (logistics, illness, weather, operator cancelled) | **0** | **0** | **Don't penalize.** Move to "Cancelled, not declined" and re-offer in about 3 weeks |
| Not picked, no comment | **−0.25** | 0 | Gentle decay only. An ignored card isn't a rejection |
| Both voted for it, but it didn't happen | **+0.5** | **+0.2** | They liked the *idea*. Re-offer within a month, maybe framed differently |
| Only one voted for it | **+0.25** | **+0.1** | Note who. If a tag keeps splitting them, say so plainly on the page rather than averaging it away |
| "No thanks", actively rejected | **−2** | **−0.4** | Two rejections: move to Dropped |
| Did something else entirely | — | **+1.0** on the tags of *that* thing | The richest signal. Add it to the backlog as `done`, with its tags |
| A plan they announce before the weekend ("we've booked X for Saturday") | as a booking: **+2** | **+1.0** | Treat a stated plan as a booking. Add it to Already booked |

## Not all evidence is date evidence

When you learn from email, calendar or casual mentions, weigh each piece:

| Evidence | Worth |
|---|---|
| A dinner reservation for two, evening, on their usual date days | **Full** |
| Going back to the same place (a repeat visit) | **Double.** The strongest signal there is |
| Tickets for two | **Full** |
| Something they booked themselves off a 📌 book-ahead flag | **Full**, and it confirms the radar is working |
| A plan stated in advance in their notes | **Full**, same as a booking |
| Delivery or takeout from a restaurant | **A quarter.** Proves they like the food, not that it's a date venue |
| A weekday lunch, a table for six or more, or a work social | **Zero.** That's work or group life, not a date |
| A booking cancelled by them for logistics, or by the operator | **Zero**, and not negative. Don't read anything into the options they then didn't pick |
| A film, game or meal at home | **Zero** (the at-home rule). It's not an outing, unless `profile.md` says home dates count |
| How the day felt, for reasons unrelated to the plan | **Zero, both ways.** A bad week at work isn't a verdict on the restaurant |
| A music library, saved artists, follows | **Zero as appetite, full as a filter.** It tells you *which* act would land, not that they want a gig this week |
| A live rejection of a whole slate ("none of these, try again") | **Full on the items, half on the tags.** Ask which one, if any, they'd keep. What they keep tells you more than what they drop |
| A slate ignored in silence, with a different weekend done instead | **Full on what they did.** −0.25 on each ignored item, **no** tag penalty. Read what they chose, not what they skipped |

## Reading notes well

- **Later notes correct earlier ones.** Read them all before scoring anything.
- **Quote, don't paraphrase,** when you log a verdict. "The band was great, the seats were awful" says two different things about two different tags (`live-music` up, `big-venue` down). A paraphrase would blur that into "fine".
- **The category can convert while the venue doesn't.** If they skip the rooftop bar you suggested but go to a *different* rooftop bar the same weekend, the category is a hit, and your venue pick was the miss. Keep offering the category and vary the venue.
- **Framing matters.** An idea that failed as a bolt-on ("dessert somewhere after the movie") may work as the whole evening. Before retiring an idea, ask whether the idea failed or the framing did.
- **Look for the variable that actually predicts.** Before blaming a category, check the practical shape of what converted versus what didn't: distance from home, start time, price, ticket vs. walk-in, crowd size, day of the week. Often the real pattern is something like "nothing more than 20 minutes away ever happens" or "anything starting before 7 never happens". When you find one, make it a tag and weigh it explicitly.
- **Look at who voted.** A tag that one partner always votes for and the other never does is worth naming on the page. Averaging it away hides the most useful thing you know.

## Normalization and decay

- Keep tag weights in **−5 … +5**. If an update would push any weight past the range, **divide every weight by the same factor** so the largest magnitude is 5. That preserves their relative order. Log the rescale, because the numbers are no longer comparable with older ones.
- **Every four weeks, decay all tag weights 10% toward zero.** Tastes drift, and old evidence should fade. Record when decay last ran and when it's next due.
- Item scores don't decay, but the 8-week recency penalty and the 6-month no-repeat rule keep them moving.

## Hypotheses on probation

When one or two data points suggest a new pattern ("maybe they prefer doing over watching"), don't bake it in as a big weight. Record it in `weights.md` → Hypotheses on probation:

| Hypothesis | Evidence so far | A fair test | Status |
|---|---|---|---|
| Earlier dinners happen, late ones don't | Two 6:30 bookings kept, two 9pm ones cancelled | Offer one early and one late dinner on the same open weekend | testing |

- **A test that fails for unrelated reasons isn't a test.** If the class got cancelled, or the weekend filled up with a work event, the hypothesis is untested, not refuted. Say so in the log and keep it open.
- **Don't generalize from one rejection.** Turning down one tasting menu may be about that menu, not tasting menus. Wait for a second, independent data point before moving a tag hard.
- **When a hypothesis is overturned, say so plainly** and correct the weight. Being visibly wrong and fixing it is how the planner earns trust.

## Common traps

- **Over-reading silence.** Most weeks, most options go unpicked. That's normal. The −0.25 decay handles it, and nothing else should.
- **Double-counting.** A booking found in email *and* mentioned in notes is one event.
- **Letting volume stand in for preference.** Twenty takeout orders from one place is a lunch habit, not twenty dates.
- **Chasing the last data point.** One great night doesn't make a category a +5. Let the rubric do the arithmetic.
- **Parking a good dated item.** If it's ticketed and fits, put it on the 📌 list now. Holding it for a future slate is how it sells out.

## Writing it down

Every change gets a dated line of evidence next to it. In `weights.md` it goes in the tag's Evidence column. In `backlog.md` it goes in the item's Notes. Use their words where you have them, briefly: `2031-05-19: "loved it, want to go back in winter"`. Future runs, and the couple, should be able to see *why* a number is what it is.
