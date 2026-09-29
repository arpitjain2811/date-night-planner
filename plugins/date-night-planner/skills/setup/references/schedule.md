# Scheduling the weekly run

The weekly run is what makes the planner "just work". Each firing starts a **fresh session** with no memory of this conversation, so everything it needs must be in the Drive folder and in the task's prompt.

## Before creating it

- **Find the scheduling tool.** Environments name it differently: scheduled tasks, triggers, routines. It may be a deferred tool you have to load first. Use one that runs in the cloud, so it works while their laptop sleeps. Avoid anything that only schedules inside the current session, because it vanishes when the session ends.
- **Connectors for the task:** Google Drive is required. Add Gmail and a calendar if they're connected: they help avoid double-booking, and they're needed to email the link. Add any ticketing connector.
- **Approval:** a 7am run with nobody awake can't stop to ask permission. If the scheduler offers automatic approval, it should be on. After creating the task, tell them which setting it got. If runs will ask first, tell them how to switch it to automatic.
- **Notifications:** turn on the completion notification, so the phone buzzes when a new slate is up.

## When

The default is **Wednesday about 7am in their time zone**. That's early enough to vote and book before the weekend, and it lands ahead of most Thursday and Friday on-sales. If they chose a different day at setup, use that. If the scheduler suggests avoiding round times to spread load, a few minutes earlier is fine, for example 6:48.

## The prompt

Fill in the braces and use this as the task's full prompt:

```text
Weekly date-night run for {NAMES} in {CITY} ({TIME ZONE}). This is a fresh, unattended session:
everything you need is in the Google Drive folder "{FOLDER NAME}".

1. Use the weekly-run skill from the date-night-planner plugin. If that skill isn't available in this
   session, open playbook.md in the folder and follow it exactly. It's the same procedure as one file.
2. Load the memory: the six files (profile, sources, radar, backlog, weights, history), plus config.json,
   feedback.json and page-status.json. Read raw file content, and if a filename appears more than once,
   use the newest copy. If the folder can't be reached, STOP and say so. Never publish a slate built
   without the memory.
3. Learn from last week's votes and notes, then research, score and assemble this week's {N} options
   and the book-ahead list.
4. Publish by writing slate-<today YYYY-MM-DD>.json to the same folder as plain JSON (no conversion,
   no 4-byte emoji). Read it back and confirm it parses and has {N} options. The voting page shows
   the newest slate automatically.{EMAIL LINE}
5. Before finishing, update history.md, backlog.md and weights.md in the folder.

Nobody is awake to answer questions. Never wait for a reply: proceed on the votes and the latest
history entry, state any assumptions in the slate's footnote, and leave open questions there.

Finish with two or three sentences on what you picked and why.
```

`{EMAIL LINE}`: leave it empty, or if they chose weekly email, use: ` Then email {ADDRESSES} a two-line note with the headline and the page link: {URL}.`

## After creating it

- Record it in `profile.md` → Delivery and schedule: the day, the time and time zone, and the approval setting.
- Tell them in one line when the first automatic run happens.
- **Test run (optional):** if the scheduler can fire a task immediately and they're keen, do it after the first slate is live. It will publish a second slate for the same week, which the page shows instead. Usually that's not worth it on setup day. The interactive first slate already proved the pipeline.

## If a run fails

The next run notices the gap: a `history.md` block with no matching slate file, or the reverse. It writes one line, *"Last week's run didn't complete; nothing was learned from that week"*, and carries on. If runs keep failing, check that the task still has the Drive connector and automatic approval.
