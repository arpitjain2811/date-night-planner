# Date Night Planner

**A date-night planner that learns what the two of you actually enjoy.** It's a Claude plugin: set it up once, and every week it puts a fresh slate of date ideas for your city on a private voting page. It learns from what you pick, and from what you actually did.

- **Every week, on its own:** four options (restaurants, shows, classes, outdoors, markets, day trips), each with a specific day and time, what to book and where, the price, and one honest line on why it suits you.
- **A voting page for both phones:** each of you taps "in". When you both are, the card lights up. After the weekend, add a line about what you really did.
- **It gets better:** it learns at two speeds, the specific places *and* the traits behind them (walkable, late-night, hands-on, cheap…), so it improves at things it has never suggested.
- **Book ahead:** it watches 2–10 weeks out for on-sales, closing windows and your key dates, so the big things don't sell out before you notice.
- **Your data stays yours:** the memory lives in *your* Google Drive and the page runs in *your* Google account. Nothing is hosted anywhere else.

## Install

One step, in whichever app you use:

- **Claude app** (desktop or web): **Customize → Plugins → Add marketplace**, enter `arpitjain2811/date-night-planner`, then click **Install** on *Date Night Planner*.
- **Claude Code:** `/plugin install date-night-planner --marketplace arpitjain2811/date-night-planner`

## Set up (once, about 15 minutes)

Say **"set up date night planning"**, or run `/date-night-planner:setup`. Claude will:

1. **Ask a few questions, with suggested answers:** your names, neighborhood, usual date nights, each person's diet, budget, key dates, hard no's, best dates so far, and what you're into. Skip anything you like.
2. **Build your memory folder** in Google Drive (`Date Night Planner`). It researches your city's listings and venues and suggests a dozen ideas to keep or drop.
3. **Walk you through your voting page.** You paste one file into Google Apps Script and click Deploy. About five minutes on a computer, and no editing needed.
4. **Publish your first slate**, so the page has this week's options the moment you open it.
5. **Schedule the weekly run** (Wednesday morning by default).

After that there's nothing to run and nothing to remember. Open the page, tap "in", and after the weekend write a line about what you did.

Want to change something? Just tell Claude: *"no karaoke for a month"*, *"we moved"*, *"cheaper this month"*, *"move it to Thursdays"*.

## What you need

- A **Claude** plan with **scheduled tasks** (for the weekly run) and the **Google Drive** connector.
- A **Google account** for the Drive folder and the voting page.
- Optional: Gmail and Google Calendar connectors. With them, it avoids clashing with plans you've already booked, can start from your past reservations, and can email you the link each week. A ticketing connector helps it hear about shows early.

## How it learns

| What happened | The item | Its traits (tags) |
|---|---|---|
| Did it, loved it | +3 | +1.0 each |
| Did it, it was fine | +1 | +0.3 each |
| Did it, didn't like it | −2 | −0.8 each |
| You both voted for it but it didn't happen | +0.5 | +0.2 each |
| Picked, then cancelled (weather, logistics) | 0 | 0, and it's offered again later |
| Did something else entirely | — | +1.0 on *that* thing's tags |

Notes beat votes, because a vote is intent and a note is evidence. Every slate mixes *something new* with *tried and tested*, and the mix shifts with how often the new things win. It never stops trying at least one new thing. Weights fade slowly, so your tastes are allowed to change. The full rules are in [`learning.md`](plugins/date-night-planner/skills/weekly-run/references/learning.md).

## What's in the repo

```
.claude-plugin/marketplace.json          the marketplace (this repo)
plugins/date-night-planner/
├── .claude-plugin/plugin.json
└── skills/
    ├── setup/                           the one thing you run
    │   ├── SKILL.md
    │   ├── references/                  interview, voting page, scheduling
    │   ├── templates/                   starting memory files and config.json
    │   └── webapp/Code.gs               the voting page (one file, Google Apps Script)
    └── weekly-run/                      the engine the weekly schedule runs (hidden from menus)
        ├── SKILL.md                     the weekly procedure
        ├── references/                  learning, file formats, Drive, memory files
        ├── scripts/                     validate / render a slate, build the playbook
        └── assets/example-slate.json
```

The weekly run uses the plugin when it's available. As a fallback, setup also saves the procedure to your Drive folder as `playbook.md`, so a scheduled run always has its instructions.

## Privacy

- This repository contains no personal data. The examples use made-up people and places.
- Your planner's memory stays in your Google Drive folder, and your votes and notes stay in a Google Sheet in that folder. The page runs under your Google account.
- The page is set to "Anyone with the link" so neither phone needs a Google sign-in. Treat the link like a private note, and don't post it publicly.
- If you fork this repo, keep your own `Date Night Planner` folder out of it. The `.gitignore` guards the common names.

## License

MIT
