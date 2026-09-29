---
name: setup
description: Sets up the Date Night Planner for a couple, end to end. It runs a short interview with suggested answers, creates their Google Drive memory folder, publishes a first slate of date ideas, walks them through deploying their private voting website, and schedules a weekly run so the planner keeps working on its own. Use this whenever someone wants to start planning date nights with Claude, set up or redo the date night planner, fix or redeploy the voting page, or change when the weekly run happens.
argument-hint: "[optional: your city, or anything to know up front]"
---

# Set up the Date Night Planner

When this finishes, the couple has three things, and after that they never need to talk to you again unless they want to:

1. **A Google Drive folder, `Date Night Planner`,** holding the planner's memory: who they are, what they like, what they've done.
2. **Their own private voting page,** live, with this week's options already on it. Each of them marks "in" from their phone, and after the weekend they add a line about what they actually did.
3. **A weekly scheduled run** that learns from those votes and notes, researches their city, and publishes a fresh slate to the page. Every week, on its own.

Their whole job from then on: open the page, tap "in", and write a line about what they actually did. Tell them this at the start, because it's the promise that makes fifteen minutes of setup worth it.

**Time:** about 15–20 minutes. That's roughly 8 minutes of questions and 5 minutes of clicking through the page setup, while you build their first slate in the background.

## 0. Check the ground, quietly

Before the first question, work out what this environment can do. Don't narrate the checks. Just use the results.

| Need | Why | If it's missing |
|---|---|---|
| **Google Drive connector** (read and write files) | The memory lives there, and the voting page reads from it | Required. Help them connect it (suggest the connector if the environment can), then continue. You can run the interview while they connect it |
| **Scheduled tasks** (a tool to create recurring tasks; look for "schedule", "trigger" or "routine" tools, including deferred ones) | The weekly run | Say plainly that the planner needs an app that supports scheduled tasks to run on its own. Set up everything else anyway. Until then, they can say "date night" once a week to get a slate |
| **Web search and fetch** | Researching their city | Required for good slates |
| Gmail / calendar connectors | Avoiding double-booking, a head start from past bookings, emailing the page link | Optional. Mention once what they'd add |
| Ticketing connector | Hearing about shows early | Optional |
| Browser automation (acting in their browser) | Doing the page setup clicks for them | Optional. Otherwise, guide them |

**Already set up?** If a `Date Night Planner` folder with `profile.md` exists, don't re-interview. Ask what they want: start over, fix the voting page, change the schedule, or change a preference. Jump to the matching section below.

## 1. The interview

Follow `references/interview.md`. It's three short rounds of up to four questions each, every one with suggested answers, and skipping is allowed. Then a few defaults to confirm, and an optional head start from their email and calendar. Keep it brisk and warm. Two people planning fun, not a form.

Things you must get right, because they're expensive to discover later: **each person's diet**, **budget**, **key dates**, **hard no's**, and **their names as they want them on the page**.

## 2. Build the folder

Read `../weekly-run/references/drive.md` before the first write. It covers plain files instead of Google Docs, newest copy wins, and no 4-byte emoji in JSON.

1. **Create the folder** `Date Night Planner` in their Drive, or reuse an empty one. Use exactly this name: the voting page finds the folder by it.
2. **Write `config.json`:**
   ```json
   { "title": "Date Night", "voters": ["<name A>", "<name B>"], "photoFolder": "", "photoCount": 1, "voterAliases": {} }
   ```
   If they want their own photos at the top of the page, put the name of a Drive folder of theirs in `photoFolder`. It's optional and read-only.
3. **Write the six memory files** from `templates/`, filled in from the interview. `references/interview.md` §7 covers how to research `sources.md`, run the ideas round for `backlog.md`, and seed `weights.md`. `../weekly-run/references/memory-files.md` describes each file.
4. **Write `playbook.md`.** Generate it with `python ../weekly-run/scripts/build_playbook.py > playbook.md` (the path is relative to this skill's folder, and the plugin root is two folders up), then upload it. Scheduled sessions that can't load the plugin follow this file, so it has to be there. If you can't run scripts, concatenate `../weekly-run/SKILL.md` and its `references/` files into one markdown file by hand.
5. **Read one file back** to confirm the writes landed as plain markdown.

## 3. The voting page

This is the part they'll use every week, so make it smooth. Follow `references/voting-page.md`.

Send the setup steps **first**, then build the first slate while they click through (step 4). The page takes them about five minutes, and the slate takes you about that long too, so when they open the page it already has this week's options on it.

- Give them the code file (`webapp/Code.gs` in this skill's folder) the easiest way the environment allows. Attach it as a file if you can. It needs no edits.
- If browser automation is available and they'd like it, do the clicks for them in their browser. They still approve Google's permission screen themselves.
- When they paste the web app URL, save it in `profile.md` → Delivery and schedule. **Verify** by reading `page-status.json` in the folder: `setup-complete` means the script ran, and a recent `lastServedAt` means the page opened. Don't try to fetch the URL yourself: Apps Script answers through a redirect that fetch tools don't follow.

## 4. The first slate

Run the weekly-run skill's procedure now (`../weekly-run/SKILL.md`), interactively. There's no history yet, so:
- Lean on the interview: their best dates, this-or-that answers, the ideas they kept in the suggestion round, and their wishlist.
- The explore/tried mix defaults to half and half. The "tried" options come from what they said they already love.
- Publish `slate-<today>.json` to the folder, and log the first `history.md` block.

When the page is live, tell them to open it: *"This weekend's options should be there now."* Confirm with `page-status.json` (`servedWeekId` should match the new slate).

## 5. Schedule the weekly run

Follow `references/schedule.md`. The default is **Wednesday around 7am in their time zone**, which leaves time to vote and book before the weekend. Create the task with the standalone prompt from that file. Make sure the Drive connector is available to it, plus Gmail and calendar if they're connected. Turn on the run's completion notification. If the environment asks whether runs need approval, say which setting the task got. A run that stops for approval at 7am never finishes.

Tell them when the first automatic run will happen.

## 6. Wrap up

A short, warm closing message:

- **The page link**, and: *"Open it on both phones, pick your name, and add it to your home screen."*
- **What happens now:** *"Every {Wednesday} morning I'll research what's on, check the weather and your calendar, and put four new options on the page. Anything worth booking weeks ahead shows up under Book ahead."*
- **The two habits that make it good:** *"Tap 'in' on what appeals. And after the weekend, add a line saying what you actually did, even if it was none of the four. That's how it learns."*
- **Changing things:** *"Just tell me: 'no karaoke for a month', 'we moved', 'cheaper this month'."*

Keep it to about six lines. Don't recap the setup steps.

## Fixing or changing things later

- **The page shows nothing, or looks wrong:** see the troubleshooting table in `references/voting-page.md`.
- **Plugin updated with new page code:** in Apps Script, paste the new `Code.gs`, then Deploy → Manage deployments → edit (pencil) → Version: *New version* → Deploy. The URL stays the same.
- **Change the day or time:** update the scheduled task, then `profile.md` → Delivery and schedule.
- **Rename someone:** update `voters` in `config.json`, and add the old name to `voterAliases` so their past votes stay theirs.
- **Start over:** make sure they mean it, rename the old folder (for example `Date Night Planner (old)`) rather than deleting it, and run setup again.
