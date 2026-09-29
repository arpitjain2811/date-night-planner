# Deploying the voting page

The voting page is what the couple actually uses every week, so this step deserves care. It's a small Google Apps Script web app that runs in **their own Google account**. There's no server, no cost, and no one else's infrastructure. It reads slates from the `Date Night Planner` folder and stores votes and notes in a Google Sheet in the same folder.

The code is one file, `webapp/Code.gs`, in this skill's folder. It needs **no edits**. Names, the page title and the optional photo folder come from `config.json` in the Drive folder, which you wrote in step 2.

## Before you send the steps

- `config.json` and the memory files are already in the `Date Night Planner` folder.
- They'll need a **computer** for the Apps Script editor. It isn't practical on a phone. After that, the page itself is phone-first.
- They must be signed in to the **same Google account** that owns the folder.
- If they insisted on a different folder name, the one line they must change is `var PLANNER_FOLDER = 'Date Night Planner';` at the top of the file. Otherwise, leave the code untouched.

## Getting the code to them

Choose the smoothest way the environment allows:
1. **Attach the file** (`webapp/Code.gs`) with the environment's file-sending tool. This is best: they open it, select all, and copy.
2. Or upload it to their Drive folder as `voting-page-code.txt` and tell them to open it there and copy everything.
3. As a last resort, paste it in chat as one code block. It's long, but code blocks have a copy button.

## The steps to send them

Send these as one short numbered message. Adapt the wording, but keep the order.

> **Setting up your voting page (about 5 minutes, on a computer)**
> 1. Open **script.new**, signed in to the Google account with the *Date Night Planner* folder. A blank project opens.
> 2. Select all the sample code, delete it, and paste in the file I sent. Click **Save** (the disk icon). If you like, rename *Untitled project* to *Date Night*.
> 3. In the toolbar, pick **setup** from the function menu and click **Run**. Google asks for permission: **Review permissions** → choose your account → *"Google hasn't verified this app"* → **Advanced** → **Go to Date Night (unsafe)** → **Allow**. It says "unverified" only because it's your own private script, not a published app.
> 4. Click **Deploy** (top right) → **New deployment** → the gear icon → **Web app**. Set *Execute as:* **Me** and *Who has access:* **Anyone**, then **Deploy**. Copy the **Web app URL**.
> 5. Paste the URL here. Then open it on both phones, pick your name, and add it to your home screen.

While they do this, write the folder and schedule the weekly run (SKILL.md §2–3).

### If you can drive their browser

If browser automation is available and they'd like you to do it, run steps 1–4 in their browser yourself, with them watching. Rules:
- They must already be signed in to Google in that browser. Never type or ask for their password.
- The permission screens (step 3, and sometimes a second one when deploying) are **theirs to approve**. Stop, tell them what they'll see, and wait for them to click Allow.
- Paste the code by inserting it into the editor, then save. Confirm the editor shows the `PLANNER_FOLDER` line before running `setup`.

## Verifying it worked

Don't fetch the URL. Apps Script answers through a redirect that fetch tools don't follow. Read `page-status.json` in the folder instead:

| You see | Means |
|---|---|
| No `page-status.json` | `setup` hasn't run. They skipped step 3, it ran under a different Google account, or it couldn't find the folder by name |
| `"status": "setup-complete"`, `"configFound": true` | The script ran and found the folder and `config.json` |
| `"configFound": false` | `config.json` is missing or not valid JSON. Rewrite it as plain `application/json` |
| `lastServedAt` within the last few minutes | Someone opened the page |
| `servedWeekId` equals the newest slate's date | The page is showing the right slate |

Save the URL in `profile.md` → Delivery and schedule. It's private: anyone with the link can see the slate and vote, so never put it anywhere public.

## Troubleshooting

| Symptom | Cause, and fix |
|---|---|
| Page says "Nothing here yet" | No readable slate in the folder. Check the file is named `slate-YYYY-MM-DD.json`, sits in the folder itself (not a subfolder), and is plain JSON, not a converted Google Doc |
| "Script function not found: doGet" | The code wasn't saved before deploying. Save, then Deploy → Manage deployments → edit → *New version* → Deploy |
| Page asks them to sign in, or says access denied | *Who has access* isn't **Anyone**. Edit the deployment and change it |
| Code changes don't show up | Saving doesn't update the live page. Deploy → Manage deployments → edit (pencil) → Version: *New version* → Deploy. The URL stays the same |
| Names on the buttons are wrong | Fix `voters` in `config.json`. The page picks up changes within about 5 minutes |
| Photos don't appear | `photoFolder` must match a Drive folder name exactly and contain images. The photo list is cached for up to 6 hours |
| Votes don't stick | Open the Sheet `Date Night votes` in the folder and check it has *Votes* and *Notes* tabs. Running `setup` again is safe and recreates anything missing |
| They want to check it by hand | Open `<URL>?action=status` in a browser for a small health report |
