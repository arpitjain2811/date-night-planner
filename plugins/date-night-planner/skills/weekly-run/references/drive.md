# Working with the Google Drive folder

Everything lives in one Google Drive folder, by default **`Date Night Planner`**. It holds the memory files, the weekly slates, and the voting page's files. Scheduled runs happen in the cloud, and the voting page runs in the couple's Google account, so Drive is the one place both can reach.

Drive connectors differ in what they can do. These habits keep things working across all of them.

## Stay inside the folder

Only read and write inside the planner folder. The one exception is a photo folder named in `config.json`, and that one is read-only, and read by the page, not by you. If something the run needs isn't in the folder, say so. Don't go searching the rest of their Drive.

Find the folder by name, and prefer the one that contains `profile.md` if more than one exists. Then search *within* it for each file.

## Newest copy wins

Some connectors can't overwrite a file and create a second file with the same name instead. So:

- **Reading:** search the folder for the exact name and take the copy with the newest modified time. Never assume there's only one.
- **Writing:** update in place if the tool supports it. Otherwise create a new file with the same name. Old copies are clutter that nothing depends on. The voting page reads the newest copy too.

## Plain files, not Google Docs

- Save markdown as `text/markdown` and JSON as `application/json`, with **conversion to Google formats turned off**. A Google Doc mangles the tables, and the tables are most of what these files are. The voting page can't read a converted slate at all.
- **Read raw content.** Use the connector's download or raw-content path, not a "natural language" or summarized read. Summaries lose table structure and exact numbers. Raw downloads may come back base64-encoded, so decode them before use.

## Keep JSON free of 4-byte characters

Some connector pipelines corrupt characters outside the Basic Multilingual Plane, which covers most modern emoji. Plain punctuation like `— · ° – ’` is fine. `scripts/validate_slate.py` flags the risky ones. The 📌 marker in the markdown files usually survives. If a file ever comes back garbled around it, swap it for `[BOOK AHEAD]`.

## Verify after writing

Read the file back, and check that it parses and says what you meant. A write that silently failed looks exactly like a quiet week.

## Files you don't write

- `feedback.json`, `page-status.json` and the `Date Night votes` Sheet belong to the voting page. Read them. Never edit them.
- `config.json` is written at setup. Change it only when the couple asks for something it controls, like names, the page title or the photo folder. The page caches it for about five minutes.
