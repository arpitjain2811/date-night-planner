# The setup interview

About eight minutes of questions, not a complete profile. Ask only what's expensive to get wrong (diets, budget, key dates, hard no's, where they live) plus enough taste to make the first slate reasonable. Everything else gets learned from what they pick on the page and what they say they actually did. Say so, because it makes rough answers feel fine.

**No research during the interview.** Don't search the web for their city, venues or ideas. That's the first weekly run's job.

## Contents
1. How to ask
2. Round 1: the basics
3. Round 2: what you must never get wrong
4. Round 3: taste (rough is fine)
5. Confirm, with the defaults
6. Filling the files from the answers

---

## 1. How to ask

- **Read the room first.** If their opening message already answers something ("we're in {city}, one of us is vegan, we love live music"), don't ask it again.
- Ask in **rounds of up to four questions**. If the environment has a structured question tool (multiple choice plus free text), use it. Otherwise use a numbered list with lettered options, and tell them a reply like `1b 2a 3: Fridays and Sunday daytime` is fine.
- **Suggested answers must be generic.** They help people answer faster, so offer them, with the most common one first and marked *(suggested)*. But never build them from what you happen to know or guess about this person: their city, their neighborhoods, their venues, their habits. This planner is used by anyone, anywhere. If you already know something from earlier in the conversation or from context, **ask them to confirm it** ("Still based in {city}?") rather than slipping it in as a suggestion.
- **Some questions have no sensible generic options**, like their city or their names. Ask those as open questions, in plain text if the question tool insists on options.
- **"Skip" is always fine.** Use the default and mark it `(default, unconfirmed)` in `profile.md`. The weekly runs will confirm it later.
- **Ask about both people** wherever the answer can differ, especially diets.

## 2. Round 1: the basics

1. **What should the page call you two?** Open question. These are the names on the voting buttons.
2. **Where do you live?** Open question: their **city** first, then their neighborhood or a nearby landmark. That's enough for walking and driving times. Don't ask for a street address, and don't offer place names as options.
3. **How far will you go for a normal date night?**
   *Walking or transit only · Up to ~30 min (suggested) · Up to an hour · Happy to do day trips too*
4. **When do dates usually happen?** Pick all that apply, plus a dinner time.
   *Friday evening · Saturday daytime · Saturday evening · Sunday daytime · Weeknights are fine for things with no fixed date*
   *Dinner: early (6–7) · around 7:30 (suggested) · late (8:30+)*

## 3. Round 2: what you must never get wrong

Frame it in one line: *"A few things that, if I get them wrong, make the suggestions useless."*

5. **Diet, for each of you.** Ask person by person.
   *No restrictions · Vegetarian · Vegan · Pescatarian · Halal · Kosher · Gluten-free · Allergy (which?) · No alcohol*
6. **Budget per person.** Ask for a normal date and for a special occasion, in local currency.
   *Normal: under 25 · 25–60 (suggested) · 60–120 · 120+ · Occasion: up to 2× normal (suggested) · no ceiling*
7. **Dates to plan around.** Anniversary, both birthdays, anything else you celebrate. It starts suggesting things 3 weeks ahead unless they'd like more notice.
8. **What shapes your weekends, and what's off the table?**
   - Standing commitments, like a game you always watch, religious observance, kids or pets, or on-call work.
   - Hard no's, like crowds, heights, horror, clubs, long drives, or anything else.

## 4. Round 3: taste (rough is fine)

Open the round with the learning promise, in your own words:

> *"Last few, about what you enjoy. Rough answers are fine: this is just a starting point. It learns your real taste from what you vote for and, even more, from what you actually end up doing."*

9. **Two or three of your best dates so far**, and what made them good. This seeds the "tried and tested" pool and the first preferences.
10. **Quick "this or that".** One pick per pair, or "both".
    *Doing something ↔ watching something · Somewhere new ↔ an old favorite · Small room ↔ big event · Planned ahead ↔ decided on the day · Active ↔ chilled out*
11. **What's in?** Multi-select.
    *Restaurants · Bars · Live music · Comedy · Theatre, dance or classical · Film · Classes and workshops · Outdoors and nature · Active (hikes, climbing, bikes, water) · Games (bowling, trivia, board games, escape rooms) · Museums and exhibitions · Markets and festivals · Spa and wellness · Day trips · Night sky and nature events · Live sports*
    Also ask about cuisines, loved and avoided, and anything specific already on their wishlist.
12. **Anyone you'd book weeks ahead for?** Optional. Artists, comedians, teams, a festival. The planner watches for their dates.

## 5. Confirm, with the defaults

One message: a compact summary of what you understood (names, city, days, each diet, budget, key dates, top loves and no's), then these defaults. They can reply "yes" or correct any line.

- **Weekly run:** Wednesdays around 7am, {their time zone}.
- **Options per week:** 4 (3 or 5 also work).
- **Adventurousness:** balanced, adapting to what you pick (or mostly new things, or mostly favorites).
- **Learn from past bookings:** *yes / no*. With their OK, the first weekly run skims past restaurant and ticket confirmations in their email and calendar for a head start. It keeps only a summary (places, rough dates, how often, price level), never order numbers or seat details. Only offer this if a mail or calendar connector is available.
- **Photos on the page:** none, or the name of a Google Drive folder of their photos.
- **A weekly email with the link:** off, or on to both addresses. Only offer this if a mail connector is available.
- **Conversation nudge:** off. When on, it's an occasional one-line prompt at the bottom of the page.

## 6. Filling the files from the answers

Quick transcription, no research. Templates are in `../templates/`, and `../weekly-run/references/memory-files.md` describes each file.

- **`profile.md`:** everything from the interview and the confirmed defaults. Mark skipped answers `(default, unconfirmed)`. Under Delivery and schedule, record the past-bookings head start as `pending` (if they said yes) or `declined`. Put any dial they changed into House rules.
- **`weights.md`:** seed modestly, because stated preferences are weaker than observed ones.
  - A clear pick in a this-or-that pair: +1.0 on that side's tag, −0.5 on the opposite.
  - A category marked "in": +0.5.
  - Something named in a best date: +1.0 on each of its tags.
  - A hard no is **not** a weight. It goes in `profile.md` as a constraint, so it filters instead of scoring low.
  - Everything else stays at 0 and goes under "Untested gaps", so the runs try it eventually.
  - Log each seed in the change log with where it came from ("setup: best date #2").
- **`backlog.md`:** their best dates go into the tried pool with item score +3. Their wishlist goes in as `open`. Leave the rest for the runs to fill.
- **`radar.md`:** anyone they named in question 12, with a line on why.
- **`sources.md`:** just the header, the city, and `Status: stub`. The first run researches it.
- **`history.md`:** just the header.
