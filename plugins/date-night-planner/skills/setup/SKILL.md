---
name: setup
description: Sets up the Date Night Planner for a couple in about ten minutes. It runs a short interview with suggested answers, creates their Google Drive memory folder, walks them through their private voting website, and schedules a weekly run that starts working straight away, so the first slate of date ideas lands on the page shortly after setup. Use this whenever someone wants to start planning date nights with Claude, set up or redo the date night planner, fix or redeploy the voting page, or change when the weekly run happens.
argument-hint: "[optional: your city, or anything to know up front]"
---

# Set up the Date Night Planner

When this finishes, the couple has three things, and after that they never need to talk to you again unless they want to:

1. **A Google Drive folder, `Date Night Planner`,** holding the planner's memory.
2. **Their own private voting page.** Each of them marks "in" from their phone, and after the weekend they add a line about what they actually did.
3. **A weekly scheduled run** that learns from those votes and notes, researches their city, and publishes a fresh slate to the page. Its first run starts **right away**, so the first options show up on the page soon after setup.

**Keep setup fast.** Setup only collects answers and wires things together. **It doesn't research.** Finding sources in their city, suggesting ideas, scanning past bookings and building the first slate all belong to the weekly runs (`../weekly-run/references/first-runs.md`), and the first of those starts in the background the moment setup is done. No web searches during setup. Aim for about 10 minutes of their time, most of it answering questions and clicking through the page setup.

Open with the promise, in two sentences: *"About ten minutes of questions and clicks, then it runs itself. Every week you'll get fresh options on your own page, and it learns from what you pick and what you actually do, so rough answers are fine."*

## 0. Check the ground, quietly

Work out what this environment can do. Don't narrate the checks.

| Need | If it's missing |
|---|---|
| **Google Drive connector** (read and write files) | Required. Help them connect it (suggest the connector if you can). You can run the interview while they do |
| **Scheduled tasks** (look for schedule, trigger or routine tools, including deferred ones). Note whether a task can be **run immediately** | Say plainly that the planner needs an app with scheduled tasks to run on its own. Set up everything else. You'll build the first slate here instead (§5) |
| Gmail / calendar connectors | Optional. They avoid double-booking, and the first run can learn from past bookings |
| Browser automation | Optional. You could do the page setup clicks for them |

**Already set up?** If a `Date Night Planner` folder with `profile.md` exists, don't re-interview. Ask what they want: start over, fix the voting page, change the schedule, or change a preference. Jump to the matching section at the end.

## 1. The interview

Follow `references/interview.md`: three short rounds of up to four questions each, with suggested answers, then a single confirmation message covering their answers and the defaults. Skipping is always fine.

Get these right, because they're expensive to discover later: **each person's diet**, **budget**, **key dates**, **hard no's**, **their city**, and **their names as they want them on the page**.

## 2. Start the voting page, then write the folder while they click

As soon as they confirm, do these two things in the same turn. The page setup takes them about five minutes, so let that overlap with your writing.

**a. Send the voting page steps and the code file** (`references/voting-page.md`). Attach `webapp/Code.gs` if you can. It needs no edits. If browser automation is available and they'd like you to, do the clicks for them. They still approve Google's permission screen themselves.

**b. Write the folder.** Read `../weekly-run/references/drive.md` first. It covers plain files instead of Google Docs, newest copy wins, and no 4-byte emoji in JSON.
1. Create the folder **`Date Night Planner`**, using exactly this name, because the page finds the folder by it.
2. Write **`config.json`**: `{ "title": "Date Night", "voters": ["<name A>", "<name B>"], "photoFolder": "", "photoCount": 1, "voterAliases": {} }`
3. Write the six memory files from `templates/`, filled **only from their answers**. `references/interview.md` §6 says what goes where. `sources.md` stays a stub, which the first run builds. `backlog.md` holds their own wishlist, and the runs add ideas.
4. If you can run scripts, also write **`playbook.md`**: `python ../weekly-run/scripts/build_playbook.py > playbook.md`. It's a fallback for scheduled sessions that can't load the plugin. If you can't run scripts, skip it, because the first run writes it.
5. Read one file back to confirm it landed as plain markdown.

## 3. Schedule the weekly run, and start the first one now

Follow `references/schedule.md`. The default is Wednesday around 7am in their time zone. Create the task with the prompt from that file, with the Drive connector available (plus Gmail and calendar if connected), automatic approval if offered, and the completion notification on.

Then **run it once immediately**, if the scheduler allows. That run notices it's the first one, builds the city sources, uses the past-bookings head start if they allowed it, and publishes the first slate, all in the background. It also proves the whole pipeline works before the first real Wednesday.

## 4. Finish the page

When they paste the web app URL:
- Save it in `profile.md` → Delivery and schedule.
- Check `page-status.json` in the folder. `setup-complete` means the script ran. A recent `lastServedAt` means the page opened. Don't fetch the URL yourself: Apps Script answers through a redirect that fetch tools don't follow. If something's off, use the troubleshooting table in `references/voting-page.md`.

Until the first run publishes, the page shows "Nothing here yet". That's expected.

## 5. If the first run can't start in the background

If there's no scheduler, or it can't run a task immediately, build the first slate here, and keep it lean: follow `../weekly-run/references/first-runs.md` for a first run, with only enough sources for one good slate. Tell them it takes a few minutes, and send the wrap-up first so they aren't waiting on you.

## 6. Wrap up

Keep it to about six lines. Don't recap the steps.

- **The page link**, and: *"Open it on both phones, pick your name, and add it to your home screen."*
- **What's happening now:** *"I'm researching {city} for your first four options. They'll appear on the page within about 20 minutes, and you'll get a notification."*
- **Every week:** *"Every {Wednesday} morning: fresh options, plus anything worth booking weeks ahead."*
- **The two habits that make it good:** *"Tap 'in' on what appeals. After the weekend, add a line saying what you actually did, even if it was none of them. That's how it learns."*
- **Changing things:** *"Just tell me: 'no karaoke for a month', 'we moved', 'cheaper this month'."*

## Fixing or changing things later

- **The page shows nothing or looks wrong:** see the troubleshooting table in `references/voting-page.md`.
- **Plugin updated with new page code:** paste the new `Code.gs` in Apps Script, then Deploy → Manage deployments → edit (pencil) → Version: *New version* → Deploy. The URL stays the same.
- **Change the day or time:** update the scheduled task, then `profile.md` → Delivery and schedule.
- **Rename someone:** update `voters` in `config.json`, and add the old name to `voterAliases` so their past votes stay theirs.
- **Start over:** make sure they mean it, rename the old folder (for example `Date Night Planner (old)`) rather than deleting it, and run setup again.
