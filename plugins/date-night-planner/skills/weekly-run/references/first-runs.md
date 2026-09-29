# The first few runs: finishing what setup skipped

Setup is deliberately quick. It collects answers and writes skeleton files, and leaves the research to the weekly runs. The first run usually starts right after setup, and it and the next few runs fill in the rest, a little at a time. **The slate always comes first.** Bootstrapping never delays or thins out a slate.

## How to tell you're in an early run

Any of these:
- `sources.md` says `Status: stub` or `Status: partial`.
- `history.md` has no week blocks yet.
- `profile.md` → Delivery and schedule says the past-bookings head start is `pending`.
- `playbook.md` is missing from the folder.
- `backlog.md` has fewer than about 10 open ideas.

## The first run, in order

1. **Just enough sources for one good slate.** Find and verify a reliable forecast for their city, the city's two or three main events listings, and two or three venue calendars that fit their taste (a small music venue, a theatre, a food-openings column). Record them in `sources.md` and set `Status: partial`. Stop there: the rest can wait.
2. **The head start from past bookings, if they allowed it** (`pending` in `profile.md`).
   - Skim one to two years of reservation and ticket confirmations in email, plus calendar events that look like outings.
   - Apply the evidence-worth table in `learning.md`. Repeat visits are the strongest signal. Takeout and delivery count for a quarter. Weekday lunches, groups of six or more, and work events count for nothing.
   - Derive repeat favorites for the tried pool, cuisines, typical days and times, real price level, how far ahead they book, and which booking platforms they use.
   - Keep only a summary: places, rough dates, counts, price level. No order numbers, seat details or amounts per order.
   - Record the blind spot in `profile.md`: this is **one account's view**. Bookings made from any other account won't appear, so "no evidence" for a category means *unknown*, not *untried*.
   - Mark the head start `done`. If it's taking long, cap it at the most recent year and move on.
3. **Build and publish the slate** with the normal procedure. With no history yet:
   - Lean on the interview: best dates, this-or-that answers, their wishlist, and anything the head start found.
   - Mix is half explore, half tried. The tried options come from what they said they already love.
   - The footnote says, briefly, that this is week one and deliberately rough, and that voting and adding a note after the weekend is how it gets good.
4. **Seed the backlog** with 5–8 researched, verified ideas beyond the slate that fit their answers, each tagged. The page's votes act as the suggestion round, so there's no need to ask about them one by one.
5. **Write `playbook.md`** if it's missing (`scripts/build_playbook.py`).

## Later runs, until the setup is complete

Each run, alongside the normal slate:
- **Sources:** add up to two new rotation sources, favoring niche ones that match their taste and rarely reach mainstream listings (a genre-specific venue, a community promoter, a garden's or observatory's events page), plus a "within about three hours" list for day trips. At around 8–10 good sources, set `Status: complete`.
- **Backlog:** while there are fewer than about 12 open ideas, add 3–5 verified ones.
- **Unconfirmed defaults:** confirm at most one `(default, unconfirmed)` line from `profile.md` per week, by asking about it in the footnote.

## Don't republish too soon

If the newest slate in the folder is **less than four days old** (usually because the first run ran on setup day, just before the first Wednesday), don't replace it with a new slate. They may already be voting on it. Do the learning, the bookkeeping and the bootstrapping above. If the book-ahead list or the weather context genuinely changed, rewrite **the same file with the same option ids**. Then finish, and say so in your summary.
