/**
 * Date Night Planner: the voting page
 * ---------------------------------------------------------------------------
 * A small Google Apps Script web app that runs in your own Google account.
 *
 *  - Shows the newest slate the planner wrote to your Drive folder.
 *  - Lets each of you mark yourself "in" on options from your own phone.
 *  - Keeps a running list of "what we actually did" notes: the thing the
 *    planner learns from most.
 *  - Shows past weeks, what each of you picked, and what happened.
 *
 * Votes and notes are stored in a Google Sheet inside the planner folder and
 * mirrored to feedback.json in the same folder, which the weekly run reads.
 *
 * SETUP (about five minutes; the planner walks you through it)
 *   1. Open https://script.new, signed in to the Google account that holds
 *      the "Date Night Planner" folder. Replace the sample code with this file.
 *   2. Save. Choose "setup" in the function menu at the top, click Run, and
 *      approve access. (It's your own script, so Google shows an "unverified
 *      app" warning: Advanced -> Go to project -> Allow.)
 *   3. Deploy -> New deployment -> Select type: Web app.
 *      Execute as: Me.  Who has access: Anyone.  Deploy, and copy the URL.
 *   4. Open that URL on both phones, pick your name, add it to the home screen.
 *
 * You shouldn't need to edit anything below. Names, the page title and an
 * optional photo folder come from config.json in the planner folder, which
 * the planner writes during setup.
 *
 * Changed this code later? Saving alone doesn't update the live page:
 * Deploy -> Manage deployments -> edit (pencil) -> Version: New version -> Deploy.
 */

var PLANNER_FOLDER = 'Date Night Planner';   // must match the planner's Drive folder
var VERSION = '1.2.0';

var SLATE_RE = /^slate-(\d{4}-\d{2}-\d{2})\.json$/;
var HISTORY_WEEKS = 26;       // weeks shown on the History tab
var MIRROR_WEEKS = 12;        // weeks mirrored into feedback.json
var MAX_NOTE = 2000;          // characters per note
var PHOTO_W = 560;            // thumbnail width; larger may overflow the cache
var PHOTO_TTL = 21600;        // 6 hours


/* ========================================================================= */
/* One-time setup                                                             */
/* ========================================================================= */

/** Run once from the editor. Safe to run again. */
function setup() {
  var folder = plannerFolder_(true);
  var ss = sheet_();
  mirror_();
  writeStatus_({ status: 'setup-complete', setupAt: new Date().toISOString() });
  Logger.log('Setup complete. Folder: "%s". Votes sheet: %s', folder.getName(), ss.getUrl());
  Logger.log('Next: Deploy -> New deployment -> Web app (Execute as: Me, Who has access: Anyone).');
}


/* ========================================================================= */
/* Web entry point                                                            */
/* ========================================================================= */

function doGet(e) {
  var p = (e && e.parameter) || {};

  // Human-readable health check: <URL>?action=status
  if (p.action === 'status') {
    return ContentService.createTextOutput(JSON.stringify(status_(), null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var cfg = config_();
    var slate = currentSlate_();
    var photos = [];
    try { photos = photoStrip_(slate.photoSeed || slate.weekId || 0, cfg); } catch (err) { photos = []; }

    noteServed_(slate);

    var html = pageHtml_({
      slate: slate,
      voters: cfg.voters,
      title: cfg.title,
      photos: photos
    });

    return HtmlService.createHtmlOutput(html)
      .setTitle(cfg.title)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');

  } catch (err) {
    // Never show a raw script error: it looks broken, and some browsers keep
    // showing it after the problem is gone. Show a calm page instead, and
    // record the error where the planner can read it (page-status.json).
    try { writeStatus_({ lastError: String(err), lastErrorAt: new Date().toISOString() }); } catch (e2) { /* ignore */ }
    return HtmlService.createHtmlOutput(errorPage_())
      .setTitle('Date Night')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

function errorPage_() {
  var url = '';
  try { url = ScriptApp.getService().getUrl(); } catch (err) { url = ''; }
  return '<!DOCTYPE html><html><head><base target="_top"><meta charset="utf-8"><style>' +
    'body{margin:0;font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#faf8fa;color:#1c1a1d}' +
    '@media (prefers-color-scheme:dark){body{background:#151216;color:#f1ecf2}}' +
    '.w{max-width:420px;margin:18vh auto 0;padding:0 20px;text-align:center}h1{font-size:22px;margin:0 0 8px}' +
    'p{color:#8a8290;margin:0 0 20px}a{display:inline-block;padding:12px 22px;border-radius:12px;background:#8a3b6b;color:#fff;text-decoration:none;font-weight:600}' +
    '</style></head><body><div class="w"><h1>One moment\u2026</h1>' +
    '<p>The page couldn\u2019t load this week\u2019s options just now. This is usually temporary.</p>' +
    (url ? '<a href="' + url + '">Try again</a>' : '') + '</div></body></html>';
}

/** Called by the page to check for a newer slate without reloading. */
function getSlate() {
  return currentSlate_();
}


/* ========================================================================= */
/* Drive helpers                                                              */
/* ========================================================================= */

function props_() { return PropertiesService.getScriptProperties(); }

/**
 * The planner folder. Remembered by id after the first lookup. If several
 * folders share the name, prefer the one that holds profile.md.
 */
function plannerFolder_(createIfMissing) {
  var id = props_().getProperty('FOLDER_ID');
  if (id) {
    try {
      var f = DriveApp.getFolderById(id);
      if (!f.isTrashed()) return f;
    } catch (err) { /* stale id, look it up again */ }
  }
  var it = DriveApp.getFoldersByName(PLANNER_FOLDER);
  var first = null, best = null;
  while (it.hasNext()) {
    var folder = it.next();
    if (folder.isTrashed()) continue;
    if (!first) first = folder;
    if (folder.getFilesByName('profile.md').hasNext()) { best = folder; break; }
  }
  var chosen = best || first;
  if (!chosen && createIfMissing) chosen = DriveApp.createFolder(PLANNER_FOLDER);
  if (chosen) props_().setProperty('FOLDER_ID', chosen.getId());
  return chosen;
}

/** Newest non-trashed file with this exact name in the planner folder. */
function fileInFolder_(name) {
  var folder = plannerFolder_(false);
  if (!folder) return null;
  var it = folder.getFilesByName(name), newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (f.isTrashed()) continue;
    if (!newest || f.getLastUpdated().getTime() > newest.getLastUpdated().getTime()) newest = f;
  }
  return newest;
}

/** Overwrite the newest copy if it exists, otherwise create it. */
function writeFile_(name, content, mime) {
  var existing = fileInFolder_(name);
  if (existing) { existing.setContent(content); return existing; }
  var folder = plannerFolder_(true);
  return folder.createFile(name, content, mime || 'text/plain');
}

function readJson_(name) {
  var f = fileInFolder_(name);
  if (!f) return null;
  try { return JSON.parse(f.getBlob().getDataAsString('UTF-8')); } catch (err) { return null; }
}


/* ========================================================================= */
/* Config (config.json in the planner folder)                                 */
/* ========================================================================= */

function config_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('CONFIG');
  if (hit) { try { return JSON.parse(hit); } catch (err) { /* reload */ } }

  var cfg = { title: 'Date Night', voters: ['Partner A', 'Partner B'], photoFolder: '', photoCount: 1 };
  var file = readJson_('config.json');
  if (file) {
    if (file.title) cfg.title = String(file.title).slice(0, 60);
    if (Array.isArray(file.voters) && file.voters.length) {
      cfg.voters = file.voters.map(function (v) { return String(v).trim().slice(0, 30); })
        .filter(function (v) { return v; });
    }
    if (file.photoFolder) cfg.photoFolder = String(file.photoFolder);
    if (file.photoCount) cfg.photoCount = Math.max(0, Math.min(3, parseInt(file.photoCount, 10) || 0));
    if (file.voterAliases && typeof file.voterAliases === 'object') cfg.voterAliases = file.voterAliases;
  }
  cache.put('CONFIG', JSON.stringify(cfg), 300);
  return cfg;
}

/** Map an old or differently-cased name onto a current voter. */
function normVoter_(v, cfg) {
  var s = normId_(v);
  cfg = cfg || config_();
  var aliases = cfg.voterAliases || {};
  for (var k in aliases) { if (k.toLowerCase() === s.toLowerCase()) return String(aliases[k]); }
  for (var i = 0; i < cfg.voters.length; i++) {
    if (cfg.voters[i].toLowerCase() === s.toLowerCase()) return cfg.voters[i];
  }
  return s;
}


/* ========================================================================= */
/* Slates                                                                     */
/* ========================================================================= */

/** All slate files, one per week (newest copy of each), newest week first. */
function slateFiles_() {
  var folder = plannerFolder_(false);
  if (!folder) return [];
  var byWeek = {};
  var it = folder.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    if (f.isTrashed()) continue;
    var m = SLATE_RE.exec(f.getName());
    if (!m) continue;
    var wk = m[1], at = f.getLastUpdated().getTime();
    // Duplicate names happen when a connector can't overwrite. Newest copy wins.
    if (!byWeek[wk] || at > byWeek[wk].at) byWeek[wk] = { file: f, at: at, weekId: wk };
  }
  var list = Object.keys(byWeek).map(function (k) { return byWeek[k]; });
  // Order by the date in the filename, never by timestamps: copying old
  // slates into the folder would otherwise jump them to the front.
  list.sort(function (a, b) { return a.weekId < b.weekId ? 1 : -1; });
  return list;
}

function parseSlate_(entry) {
  try {
    var s = JSON.parse(entry.file.getBlob().getDataAsString('UTF-8'));
    s.weekId = entry.weekId;   // the filename is authoritative
    s.options = Array.isArray(s.options) ? s.options : [];
    return s;
  } catch (err) {
    return null;
  }
}

function currentSlate_() {
  var files = slateFiles_();
  for (var i = 0; i < files.length; i++) {
    var s = parseSlate_(files[i]);
    if (s) return s;
  }
  return {
    weekId: todayId_(),
    waiting: true,
    eyebrow: 'Getting started',
    title: 'Your first options are on the way',
    subtitle: 'The planner is researching this week\u2019s ideas. This page fills itself in when they\u2019re ready, so there\u2019s no need to refresh.',
    context: [], options: [], bookAhead: []
  };
}

function titleFor_(weekId, optionId) {
  var files = slateFiles_();
  for (var i = 0; i < files.length; i++) {
    if (files[i].weekId !== weekId) continue;
    var s = parseSlate_(files[i]);
    if (!s) return '';
    for (var j = 0; j < s.options.length; j++) {
      if (String(s.options[j].id) === String(optionId)) return String(s.options[j].title || '');
    }
  }
  return '';
}

function todayId_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}


/* ========================================================================= */
/* The Sheet: Votes and Notes tabs                                            */
/* ========================================================================= */

var SHEET_NAME = 'Date Night votes';

function sheet_() {
  var id = props_().getProperty('SHEET_ID');
  var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; } }
  if (ss) return ss;

  ss = SpreadsheetApp.create(SHEET_NAME);
  try { DriveApp.getFileById(ss.getId()).moveTo(plannerFolder_(true)); } catch (err) { /* stays in My Drive */ }

  var votes = ss.getSheets()[0];
  votes.setName('Votes');
  votes.appendRow(['timestamp', 'weekId', 'optionId', 'optionTitle', 'voter', 'in']);
  votes.setFrozenRows(1);

  var notes = ss.insertSheet('Notes');
  notes.appendRow(['timestamp', 'weekId', 'voter', 'text']);
  notes.setFrozenRows(1);

  plainTextIds_(ss);
  props_().setProperty('SHEET_ID', ss.getId());
  return ss;
}

/**
 * Sheets turns a string like "2031-05-14" into a Date on write, and reading
 * it back gives "Wed May 14 2031 00:00:00 GMT...", which never matches the
 * string you wrote. Keep id columns as plain text, and compare ids via normId_.
 */
function plainTextIds_(ss) {
  try {
    ss.getSheetByName('Votes').getRange('B:C').setNumberFormat('@');
    ss.getSheetByName('Notes').getRange('B:B').setNumberFormat('@');
  } catch (err) { /* best effort */ }
}

function normId_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(v === null || v === undefined ? '' : v).trim();
}

function tab_(name) {
  var ss = sheet_();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function stamp_(v) {
  if (v instanceof Date) return v.toISOString();
  var d = new Date(v);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}


/* ========================================================================= */
/* Called from the page (google.script.run)                                   */
/* ========================================================================= */

function castVote(weekId, optionId, voter, isIn) {
  var cfg = config_();
  var who = normVoter_(voter, cfg);
  if (cfg.voters.indexOf(who) < 0) throw new Error('Unknown voter');
  var wk = normId_(weekId), opt = normId_(optionId);

  withLock_(function () {
    var sh = tab_('Votes');
    var data = sh.getDataRange().getValues();
    var row = -1;
    for (var i = data.length - 1; i >= 1; i--) {
      if (normId_(data[i][1]) === wk && normId_(data[i][2]) === opt && normVoter_(data[i][4], cfg) === who) {
        row = i + 1; break;
      }
    }
    var values = [new Date(), wk, opt, titleFor_(wk, opt), who, isIn ? 'yes' : 'no'];
    if (row > 0) sh.getRange(row, 1, 1, 6).setValues([values]);
    else sh.appendRow(values);
  });
  mirror_();
  return getVotes(wk);
}

/** { optionId: { voter: true|false } } for one week. Later rows win. */
function getVotes(weekId) {
  var cfg = config_();
  var wk = normId_(weekId);
  var data = tab_('Votes').getDataRange().getValues();
  var out = {};
  for (var i = 1; i < data.length; i++) {
    if (normId_(data[i][1]) !== wk) continue;
    var id = normId_(data[i][2]);
    out[id] = out[id] || {};
    out[id][normVoter_(data[i][4], cfg)] = normId_(data[i][5]) === 'yes';
  }
  return out;
}

function addNote(weekId, voter, text) {
  var cfg = config_();
  var t = String(text || '').trim().slice(0, MAX_NOTE);
  if (!t) return { ok: false, error: 'empty note' };
  var who = normVoter_(voter, cfg);
  if (cfg.voters.indexOf(who) < 0) who = '';
  var wk = normId_(weekId || currentSlate_().weekId);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(wk)) return { ok: false, error: 'bad week' };
  withLock_(function () { tab_('Notes').appendRow([new Date(), wk, who, t]); });
  mirror_();
  return { ok: true, weekId: wk, notes: getNotes(wk) };
}

/**
 * Remove one note, matched on timestamp and text rather than row number: a
 * row number goes stale the moment the other phone adds a note, and deleting
 * the wrong note is far worse than deleting nothing.
 */
function deleteNote(weekId, at, text) {
  var wk = normId_(weekId), want = String(text || '').trim();
  withLock_(function () {
    var sh = tab_('Notes');
    var data = sh.getDataRange().getValues();
    for (var i = data.length - 1; i >= 1; i--) {
      if (normId_(data[i][1]) !== wk) continue;
      if (String(data[i][3] || '').trim() !== want) continue;
      if (at && stamp_(data[i][0]) !== at) continue;
      sh.deleteRow(i + 1);
      break;
    }
  });
  mirror_();
  return { ok: true, weekId: wk, notes: getNotes(wk) };
}

/** Notes for one week, oldest first. */
function getNotes(weekId) {
  var wk = normId_(weekId);
  return allNotes_()[wk] || [];
}

function allNotes_() {
  var cfg = config_();
  var data = tab_('Notes').getDataRange().getValues();
  var out = {};
  for (var i = 1; i < data.length; i++) {
    var wk = normId_(data[i][1]);
    var text = String(data[i][3] || '').trim();
    if (!wk || !text) continue;
    (out[wk] = out[wk] || []).push({ at: stamp_(data[i][0]), by: normVoter_(data[i][2], cfg), text: text });
  }
  return out;
}

function allVotes_() {
  var cfg = config_();
  var data = tab_('Votes').getDataRange().getValues();
  var out = {};
  for (var i = 1; i < data.length; i++) {
    var wk = normId_(data[i][1]), id = normId_(data[i][2]);
    if (!wk || !id) continue;
    out[wk] = out[wk] || {};
    out[wk][id] = out[wk][id] || {};
    out[wk][id][normVoter_(data[i][4], cfg)] = normId_(data[i][5]) === 'yes';
  }
  return out;
}

/**
 * Week-over-week view for the History tab: what was offered, who wanted what,
 * what actually happened, and the running explore hit rate (last 8 weeks).
 */
function getHistory() {
  var cfg = config_();
  var votes = allVotes_(), notes = allNotes_();
  var files = slateFiles_().slice(0, HISTORY_WEEKS);
  var weeks = [], exploreChosen = 0, chosen = 0;

  for (var i = 0; i < files.length; i++) {
    var s = parseSlate_(files[i]);
    if (!s) continue;
    var wv = votes[s.weekId] || {};
    var opts = s.options.map(function (o) {
      var picks = wv[String(o.id)] || {};
      var yes = cfg.voters.filter(function (v) { return picks[v] === true; });
      var all = yes.length === cfg.voters.length && yes.length > 0;
      return { id: String(o.id), title: o.title || '', mode: o.mode || '', voters: yes, all: all };
    });
    if (i < 8) {
      opts.forEach(function (o) { if (o.all) { chosen++; if (o.mode === 'explore') exploreChosen++; } });
    }
    weeks.push({ weekId: s.weekId, eyebrow: s.eyebrow || s.weekId, options: opts, notes: notes[s.weekId] || [] });
  }

  return {
    weeks: weeks,
    voters: cfg.voters,
    exploreHitRate: chosen ? Math.round(exploreChosen / chosen * 100) : null,
    weeksWithNotes: weeks.filter(function (w) { return w.notes.length; }).length
  };
}


/* ========================================================================= */
/* Mirrors the planner reads                                                  */
/* ========================================================================= */

/** feedback.json: votes and notes for recent weeks, plain JSON. */
function mirror_() {
  try {
    var cfg = config_();
    var votes = allVotes_(), notes = allNotes_();
    var keys = {};
    Object.keys(votes).forEach(function (k) { keys[k] = true; });
    Object.keys(notes).forEach(function (k) { keys[k] = true; });
    var recent = Object.keys(keys).sort().reverse().slice(0, MIRROR_WEEKS);
    var weeks = {};
    recent.forEach(function (wk) { weeks[wk] = { votes: votes[wk] || {}, notes: notes[wk] || [] }; });
    writeFile_('feedback.json', JSON.stringify({
      updatedAt: new Date().toISOString(),
      voters: cfg.voters,
      weeks: weeks
    }, null, 2), 'application/json');
  } catch (err) {
    Logger.log('mirror failed: ' + err);
  }
}

/** page-status.json lets the planner confirm the page works without fetching it. */
function writeStatus_(extra) {
  var prev = readJson_('page-status.json') || {};
  var s = status_();
  for (var k in extra) s[k] = extra[k];
  if (!s.setupAt && prev.setupAt) s.setupAt = prev.setupAt;
  writeFile_('page-status.json', JSON.stringify(s, null, 2), 'application/json');
}

function status_() {
  var folder = plannerFolder_(false);
  var slate = folder ? currentSlate_() : null;
  var cfg = config_();
  return {
    ok: !!folder,
    version: VERSION,
    folder: folder ? folder.getName() : 'MISSING: ' + PLANNER_FOLDER,
    configFound: !!fileInFolder_('config.json'),
    voters: cfg.voters,
    slateWeekId: slate && slate.options && slate.options.length ? slate.weekId : null,
    photoCount: cfg.photoFolder ? photoIds_(cfg).length : 0,
    checkedAt: new Date().toISOString()
  };
}

/** Record that the page was opened (at most every 10 minutes). */
function noteServed_(slate) {
  var cache = CacheService.getScriptCache();
  if (cache.get('SERVED')) return;
  cache.put('SERVED', '1', 600);
  try {
    writeStatus_({ lastServedAt: new Date().toISOString(), servedWeekId: slate.weekId });
  } catch (err) { /* never block the page */ }
}


/* ========================================================================= */
/* Photos (optional, read-only)                                               */
/* ========================================================================= */
/*
 * If config.json names a photoFolder, a few of its pictures are shown at the
 * top of the page, rotated by the slate's photoSeed. They're inlined as data
 * URIs, so the folder stays private: no link sharing, no sign-in on the phones.
 */

function photoIds_(cfg) {
  if (!cfg.photoFolder) return [];
  var cache = CacheService.getScriptCache();
  var hit = cache.get('PHOTO_IDS');
  if (hit) { try { return JSON.parse(hit); } catch (err) { /* refetch */ } }
  var ids = [];
  try {
    var it = DriveApp.getFoldersByName(cfg.photoFolder);
    while (it.hasNext()) {
      var folder = it.next();
      if (folder.isTrashed()) continue;
      var files = folder.getFiles();
      while (files.hasNext()) {
        var f = files.next();
        if (!f.isTrashed() && String(f.getMimeType()).indexOf('image/') === 0) ids.push(f.getId());
      }
      break;
    }
  } catch (err) { return []; }
  ids.sort();
  cache.put('PHOTO_IDS', JSON.stringify(ids), PHOTO_TTL);
  return ids;
}

function photoDataUri_(id) {
  var cache = CacheService.getScriptCache();
  var key = 'PH_' + id + '_' + PHOTO_W;
  var hit = cache.get(key);
  if (hit) return hit;

  var uri = '';
  try {
    // Ask the Drive API for a signed thumbnail link WITH the token, then fetch
    // the link WITHOUT it (sending the token to the signed link gets a 403).
    var meta = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + id + '?fields=thumbnailLink', {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true
    });
    if (meta.getResponseCode() === 200) {
      var link = JSON.parse(meta.getContentText()).thumbnailLink;
      if (link) {
        link = link.replace(/=[sw]\d+(-h\d+)?$/, '=s' + PHOTO_W);
        var res = UrlFetchApp.fetch(link, { muteHttpExceptions: true });
        var b = res.getBlob();
        if (res.getResponseCode() === 200 && String(b.getContentType()).indexOf('image/') === 0) {
          uri = 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
        }
      }
    }
  } catch (err) { /* fall through */ }

  if (!uri) {
    try {   // lower resolution, but always works
      var tb = DriveApp.getFileById(id).getThumbnail();
      if (tb) uri = 'data:' + tb.getContentType() + ';base64,' + Utilities.base64Encode(tb.getBytes());
    } catch (err2) { /* no photo */ }
  }
  if (uri && uri.length < 95000) cache.put(key, uri, PHOTO_TTL);   // cache values max out at 100KB
  return uri;
}

function photoStrip_(seed, cfg) {
  var ids = photoIds_(cfg);
  var n = Math.min(cfg.photoCount || 0, ids.length);
  if (!n) return [];
  var s = Math.abs(parseInt(String(seed).replace(/\D/g, ''), 10) || 0);
  var stride = Math.max(1, Math.floor(ids.length / n));
  var out = [];
  for (var i = 0; i < n; i++) {
    var uri = photoDataUri_(ids[(s + i * stride) % ids.length]);
    if (uri) out.push(uri);
  }
  return out;
}


/* ========================================================================= */
/* The page                                                                   */
/* ========================================================================= */

/** JSON that is safe to drop inside a <script> tag. */
function embed_(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function pageHtml_(data) {
  return '<!DOCTYPE html><html><head><base target="_top"><meta charset="utf-8">' +
    '<style>' + PAGE_CSS + '</style></head><body>' + PAGE_BODY +
    '<script>var DATA = ' + embed_(data) + ';</script>' +
    '<script>' + PAGE_JS + '</script></body></html>';
}

var PAGE_CSS = [
  ':root{color-scheme:light dark;',
  '--ink:#1c1a1d;--soft:#46404a;--muted:#6d6571;--faint:#9a929e;--line:#e7e1e8;--wash:#f3eff4;',
  '--paper:#faf8fa;--card:#ffffff;--accent:#8a3b6b;--accent-ink:#6e2d55;--accent-bg:#f8eef4;',
  '--green:#2f7a55;--green-bg:#eaf5ef;--amber:#94650f;--amber-bg:#fcf5e6;--explore:#2a6f97;--explore-bg:#eaf3f9;',
  '--shadow:0 1px 2px rgba(30,20,30,.05),0 10px 26px -18px rgba(30,20,30,.35);--r:14px;--r-sm:9px;--pill:999px}',
  '@media (prefers-color-scheme:dark){:root{',
  '--ink:#f1ecf2;--soft:#d5ccd8;--muted:#a79dab;--faint:#7e7482;--line:#332d35;--wash:#27222a;',
  '--paper:#151216;--card:#1e1a20;--accent:#d88cbc;--accent-ink:#e7a9cf;--accent-bg:#2e1d28;',
  '--green:#7cc49c;--green-bg:#1b2b22;--amber:#dcb160;--amber-bg:#2c2416;--explore:#7fb6d9;--explore-bg:#1a2833;',
  '--shadow:0 1px 2px rgba(0,0,0,.45),0 10px 26px -18px rgba(0,0,0,.9)}}',
  '*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}',
  'body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;padding-bottom:env(safe-area-inset-bottom)}',
  '.wrap{max-width:680px;margin:0 auto;padding:22px 16px 72px}',
  '#gate{position:fixed;inset:0;background:var(--paper);z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:28px;text-align:center}',
  '#gate .mark,.eyebrow{font-size:11px;letter-spacing:.17em;text-transform:uppercase;color:var(--accent);font-weight:700}',
  '#gate h2{margin:4px 0;font-size:23px}#gate p{margin:0 0 16px;color:var(--muted);font-size:14px;max-width:300px}',
  '#gate button{font:inherit;font-weight:600;width:100%;max-width:280px;padding:14px;border-radius:var(--r);border:1px solid var(--ink);background:var(--ink);color:var(--paper);cursor:pointer;margin-bottom:8px}',
  '#gate button.alt{background:transparent;color:var(--ink)}',
  'header{padding-bottom:14px}h1{font-size:clamp(25px,6.5vw,32px);line-height:1.12;margin:8px 0 8px;letter-spacing:-.02em}',
  '.sub{color:var(--muted);font-size:15px;margin:0}.whoami{margin-top:12px;font-size:12.5px;color:var(--faint)}',
  '.whoami b{color:var(--soft)}.whoami a{color:var(--accent);cursor:pointer;margin-left:6px;border-bottom:1px solid currentColor}',
  '.photos{display:grid;gap:7px;margin:0 0 20px}.photos figure{margin:0;border-radius:var(--r);overflow:hidden;background:var(--wash)}',
  '.photos img{width:100%;height:100%;object-fit:cover;display:block}.photos.n1 figure{aspect-ratio:16/9}',
  '.photos.n2{grid-template-columns:1fr 1fr}.photos.n2 figure{aspect-ratio:4/3}.photos.n3{grid-template-columns:repeat(3,1fr)}.photos.n3 figure{aspect-ratio:1}',
  '.tabs{display:flex;gap:3px;background:var(--wash);padding:3px;border-radius:var(--pill);margin-bottom:18px}',
  '.tabs button{flex:1;font:inherit;font-size:14px;font-weight:600;padding:9px;border:0;background:none;color:var(--muted);border-radius:var(--pill);cursor:pointer}',
  '.tabs button.on{background:var(--card);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.08)}',
  '.box{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:14px 16px;margin-bottom:12px}',
  '.box h2,.ahead h2{font-size:10.5px;letter-spacing:.15em;text-transform:uppercase;color:var(--faint);margin:0 0 8px;font-weight:700}',
  '.row{display:flex;gap:12px;font-size:14px;padding:5px 0}.row+.row{border-top:1px solid var(--wash)}',
  '.row b{flex:0 0 84px;color:var(--muted);font-weight:600;font-size:12.5px}.row span{color:var(--soft)}',
  '.alert{background:var(--amber-bg);border:1px solid var(--line);border-left:3px solid var(--amber);border-radius:var(--r-sm);padding:12px 14px;font-size:14px;margin-bottom:18px;color:var(--soft)}',
  '.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px 19px;margin-bottom:14px;box-shadow:var(--shadow);transition:border-color .2s,box-shadow .2s}',
  '.card.match{border-color:var(--green);box-shadow:var(--shadow),0 0 0 3px var(--green-bg)}',
  '.chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}',
  '.chip{font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;padding:4px 9px;border-radius:var(--pill);background:var(--wash);color:var(--muted)}',
  '.chip.hot{background:var(--accent-bg);color:var(--accent-ink)}.chip.new{background:var(--green-bg);color:var(--green)}',
  '.chip.explore{background:var(--explore-bg);color:var(--explore)}',
  '.card h3{margin:0 0 5px;font-size:20px;line-height:1.25;letter-spacing:-.015em}.hook{color:var(--muted);font-size:14.5px;margin:0 0 13px}',
  'dl{margin:0;display:grid;grid-template-columns:78px 1fr;gap:8px 12px;font-size:14px}',
  'dt{color:var(--faint);font-weight:700;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;padding-top:3px}',
  'dd{margin:0;color:var(--soft);overflow-wrap:anywhere}a{color:var(--accent)}',
  '.votes{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:15px;padding-top:13px;border-top:1px solid var(--wash)}',
  '.votes .lbl{font-size:10.5px;color:var(--faint);letter-spacing:.1em;text-transform:uppercase;font-weight:700}',
  'button.vote{font:inherit;font-size:13.5px;font-weight:600;padding:8px 16px;border-radius:var(--pill);border:1px solid var(--line);background:var(--card);color:var(--muted);cursor:pointer}',
  'button.vote.on{background:var(--green);border-color:var(--green);color:#fff}button.vote:disabled{cursor:default;opacity:.92}',
  '.both{margin-left:auto;font-size:12px;font-weight:700;color:var(--green)}',
  '.ahead{background:var(--accent-bg);border:1px solid var(--line);border-radius:18px;padding:16px 19px;margin-top:22px}',
  '.ahead h2{color:var(--accent-ink)}.ahead ul{margin:0;padding-left:18px}.ahead li{font-size:14px;margin-bottom:8px;color:var(--soft)}',
  '.nudge{margin:24px 0 0;padding:2px 0 2px 14px;border-left:2px solid var(--line);font-size:14.5px;color:var(--muted);font-style:italic}',
  '.outcome{margin-top:24px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px 19px}',
  '.outcome h2{font-size:16px;margin:0 0 6px}.outcome p{font-size:13.5px;color:var(--muted);margin:0 0 12px}',
  '.note{display:flex;gap:10px;padding:10px 12px;background:var(--green-bg);border-radius:var(--r-sm);margin-bottom:7px;font-size:14px;color:var(--soft)}',
  '.note .body{flex:1;min-width:0;overflow-wrap:anywhere}.note .when{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--green);margin-bottom:3px}',
  '.note .del{border:0;background:none;color:var(--faint);font-size:18px;line-height:1;cursor:pointer;padding:2px 5px}',
  '.empty-notes{padding:10px 12px;background:var(--wash);border-radius:var(--r-sm);margin-bottom:12px;font-size:13.5px;color:var(--faint)}',
  'textarea{font:inherit;font-size:15px;width:100%;min-height:74px;padding:11px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--paper);color:var(--ink);resize:vertical}',
  'textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-bg)}',
  'button.save{margin-top:10px;font:inherit;font-size:14.5px;font-weight:600;padding:10px 20px;border-radius:var(--r-sm);border:1px solid var(--ink);background:var(--ink);color:var(--paper);cursor:pointer}',
  '.saved{font-size:13px;color:var(--green);font-weight:600;margin-left:10px}',
  '.spin{width:22px;height:22px;border:2px solid var(--line);border-top-color:var(--accent);border-radius:50%;margin:0 auto 12px;animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}.small{font-size:13px}',
  '.foot{margin-top:22px;font-size:12.5px;color:var(--faint);line-height:1.65}.empty{text-align:center;padding:48px 16px;color:var(--faint)}',
  '.hsum{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:13px 15px;margin-bottom:14px;font-size:14px;color:var(--muted)}.hsum b{color:var(--ink)}',
  '.hweek{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin-bottom:12px}',
  '.hweek h3{margin:0 0 2px;font-size:16.5px}.hweek .wk{font-size:11.5px;color:var(--faint);margin:0 0 10px}',
  '.hopt{display:flex;gap:8px;align-items:baseline;padding:6px 0;font-size:14.5px;border-top:1px solid var(--wash)}.hopt:first-of-type{border-top:0}',
  '.hopt .m{flex:0 0 14px;color:var(--green)}.hopt .t{flex:1;color:var(--soft)}.hopt.all .t{font-weight:700;color:var(--ink)}.hopt.none .t{color:var(--faint)}',
  '.who{font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;font-weight:700;color:var(--green);white-space:nowrap}',
  '.mini{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;padding:2px 7px;border-radius:var(--pill);margin-left:4px}',
  '.mini.explore{background:var(--explore-bg);color:var(--explore)}.mini.tried{background:var(--wash);color:var(--muted)}',
  '.fb{margin-top:10px;padding:10px 12px;background:var(--green-bg);border-radius:var(--r-sm);font-size:14px;color:var(--soft)}',
  '.fb b{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--green);margin-bottom:3px}',
  '.fb.none{background:var(--wash);color:var(--faint)}.fb.none b{color:var(--faint)}',
  '.fbedit textarea{min-height:52px;font-size:14px;margin-top:8px}.fbedit button{margin-top:6px;font:inherit;font-size:13px;font-weight:600;padding:7px 14px;border-radius:var(--r-sm);border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}',
  '@media (prefers-reduced-motion:reduce){*{transition:none!important}}'
].join('');

var PAGE_BODY = [
  '<div id="gate"><div class="mark" id="gateMark"></div><h2>Who\u2019s this?</h2>',
  '<p>So your votes land under the right name. Asked once per device.</p><div id="gateBtns"></div></div>',
  '<div class="wrap" id="app" style="visibility:hidden">',
  '<header><div class="eyebrow" id="eyebrow"></div><h1 id="title"></h1><p class="sub" id="subtitle"></p>',
  '<div class="whoami">Voting as <b id="meName"></b><a id="switchMe">switch</a></div></header>',
  '<div id="photoBand"></div>',
  '<div class="tabs"><button id="tabWeek" class="on">This week</button><button id="tabHist">History</button></div>',
  '<div id="weekView"><div id="contextBox"></div><div id="alertBox"></div><div id="cards"></div>',
  '<div id="aheadBox"></div><div id="nudgeBox"></div>',
  '<div class="outcome" id="outcomeBox"><h2>What did you actually do?</h2>',
  '<p>This is what teaches the planner most. Be blunt: \u201cwent, loved it\u201d, \u201cskipped all four, did X instead\u201d. Add as many as you like through the weekend; either of you can.</p>',
  '<div id="notesList"></div><textarea id="noteText" placeholder="We ended up\u2026"></textarea>',
  '<div><button class="save" id="saveNote">Add note</button><span class="saved" id="savedFlag" style="display:none">Added</span></div></div>',
  '<p class="foot" id="foot"></p></div>',
  '<div id="histView" hidden><div id="histBody"><div class="empty">Loading\u2026</div></div>',
  '<p class="foot">A week counts as <b>chosen</b> when you both marked yourselves in. What you actually did comes from the notes, and that is what the planner learns from.</p></div>',
  '</div>'
].join('');

var PAGE_JS = [
  'var S=DATA.slate||{},VOTERS=DATA.voters||[],VOTES={},NOTES=[],ME=null,histLoaded=false;',
  'function $(id){return document.getElementById(id);}',
  'function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}',
  // Allow only a few inline tags, and only http(s) links.
  'var OK={A:1,B:1,STRONG:1,I:1,EM:1,BR:1},DROP={SCRIPT:1,STYLE:1,IFRAME:1,OBJECT:1,EMBED:1,TEMPLATE:1,svg:1,SVG:1};',
  'function clean(node){Array.prototype.slice.call(node.childNodes).forEach(function(k){',
  ' if(k.nodeType===3)return; if(k.nodeType!==1||DROP[k.tagName]){node.removeChild(k);return;}',
  ' if(!OK[k.tagName]){clean(k);while(k.firstChild)node.insertBefore(k.firstChild,k);node.removeChild(k);return;}',
  ' var href=k.tagName==="A"?k.getAttribute("href"):null;',
  ' Array.prototype.slice.call(k.attributes).forEach(function(a){k.removeAttribute(a.name);});',
  ' if(href&&/^https?:\\/\\//i.test(href)){k.setAttribute("href",href);k.setAttribute("target","_blank");k.setAttribute("rel","noopener noreferrer");}',
  ' clean(k);});}',
  'function safe(s){var t=document.createElement("template");t.innerHTML=String(s==null?"":s);clean(t.content);var d=document.createElement("div");d.appendChild(t.content.cloneNode(true));return d.innerHTML;}',
  'function fmtWhen(iso){if(!iso)return "";var d=new Date(iso);if(isNaN(d.getTime()))return "";',
  ' return d.toLocaleDateString(undefined,{weekday:"short"})+" "+d.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});}',
  // identity
  'function loadMe(){try{return localStorage.getItem("dnp-who");}catch(e){return null;}}',
  'function setMe(n){ME=n;try{localStorage.setItem("dnp-who",n);}catch(e){}$("gate").style.display="none";$("app").style.visibility="visible";$("meName").textContent=n;render();}',
  '$("gateMark").textContent=DATA.title||"Date Night";',
  'VOTERS.forEach(function(v,i){var b=document.createElement("button");b.textContent=v;if(i>0)b.className="alt";b.onclick=function(){setMe(v);};$("gateBtns").appendChild(b);});',
  '$("switchMe").onclick=function(){try{localStorage.removeItem("dnp-who");}catch(e){}$("gate").style.display="flex";$("app").style.visibility="hidden";};',
  // render
  'function render(){',
  ' $("eyebrow").textContent=S.eyebrow||S.weekId||"";$("title").textContent=S.title||"This week";$("subtitle").textContent=S.subtitle||"";',
  ' var ph=(DATA.photos||[]).filter(Boolean);',
  ' $("photoBand").innerHTML=ph.length?"<div class=\\"photos n"+ph.length+"\\">"+ph.map(function(src){return "<figure><img alt=\\"\\" src=\\""+esc(src)+"\\"></figure>";}).join("")+"</div>":"";',
  ' var ctx=S.context||[];',
  ' $("contextBox").innerHTML=ctx.length?"<div class=\\"box\\"><h2>This week</h2>"+ctx.map(function(r){return "<div class=\\"row\\"><b>"+esc(r.label)+"</b><span>"+esc(r.value)+"</span></div>";}).join("")+"</div>":"";',
  ' $("alertBox").innerHTML=S.alert?"<div class=\\"alert\\">"+safe(S.alert)+"</div>":"";',
  ' var opts=S.options||[];',
  ' $("outcomeBox").hidden=!opts.length;',
  ' if(!opts.length){$("cards").innerHTML="<div class=\\"empty\\"><div class=\\"spin\\"></div>Researching this week\\u2019s options\\u2026<br><span class=\\"small\\">This page updates by itself.</span></div>";waitForSlate();}',
  ' else{$("cards").innerHTML=opts.map(function(o){',
  '  var chips=(o.tags||[]).map(function(t){var k=t.kind==="hot"?" hot":(t.kind==="new"?" new":"");return "<span class=\\"chip"+k+"\\">"+esc(t.label||t)+"</span>";}).join("");',
  '  if(o.mode==="explore")chips="<span class=\\"chip explore\\">Something new</span>"+chips;else if(o.mode==="tried")chips="<span class=\\"chip\\">Tried &amp; tested</span>"+chips;',
  '  var rows=(o.fields||[]).map(function(f){return "<dt>"+esc(f.k)+"</dt><dd>"+(f.html?safe(f.html):esc(f.v))+"</dd>";}).join("");',
  '  return "<div class=\\"card\\" data-id=\\""+esc(o.id)+"\\">"+(chips?"<div class=\\"chips\\">"+chips+"</div>":"")+"<h3>"+esc(o.title)+"</h3>"+(o.hook?"<p class=\\"hook\\">"+esc(o.hook)+"</p>":"")+(rows?"<dl>"+rows+"</dl>":"")+',
  '   "<div class=\\"votes\\"><span class=\\"lbl\\">In?</span>"+VOTERS.map(function(v){return "<button class=\\"vote\\" data-voter=\\""+esc(v)+"\\">"+esc(v)+"</button>";}).join("")+"<span class=\\"both\\" hidden>Both in</span></div></div>";',
  ' }).join("");wireVotes();}',
  ' var ba=S.bookAhead||[];',
  ' $("aheadBox").innerHTML=ba.length?"<div class=\\"ahead\\"><h2>Book ahead</h2><ul>"+ba.map(function(b){return "<li>"+(b.html?safe(b.html):esc(b.text||b))+"</li>";}).join("")+"</ul></div>":"";',
  ' $("nudgeBox").innerHTML=S.nudge?"<p class=\\"nudge\\">"+esc(S.nudge)+"</p>":"";',
  ' $("foot").innerHTML=(S.footnote?esc(S.footnote)+"<br>":"")+"Votes and notes save to your own Google Sheet, so you both see them on any device.";',
  ' if(opts.length){refreshVotes();loadNotes();}}',
  // Poll while the first slate is being researched; stop as soon as it lands.
  'var waiting=null,waitTries=0;',
  'function waitForSlate(){if(waiting)return;waiting=setInterval(function(){waitTries++;if(waitTries>60){clearInterval(waiting);waiting=null;return;}',
  ' google.script.run.withSuccessHandler(function(s){if(s&&s.options&&s.options.length){clearInterval(waiting);waiting=null;S=s;render();}}).getSlate();},45000);}',
  // Coming back to the page (e.g. from the home screen) picks up a newer week.
  'document.addEventListener("visibilitychange",function(){if(document.hidden||!ME)return;',
  ' google.script.run.withSuccessHandler(function(s){if(s&&s.options&&s.options.length&&s.weekId!==S.weekId){S=s;histLoaded=false;render();}}).getSlate();});',
  // votes
  'function wireVotes(){Array.prototype.forEach.call(document.querySelectorAll("button.vote"),function(b){',
  ' var v=b.getAttribute("data-voter");if(v!==ME){b.disabled=true;return;}',
  ' b.onclick=function(){var id=b.closest(".card").getAttribute("data-id");var now=!(VOTES[id]&&VOTES[id][ME]);',
  '  VOTES[id]=VOTES[id]||{};VOTES[id][ME]=now;paint();',
  '  google.script.run.withSuccessHandler(function(v){VOTES=v||{};paint();}).withFailureHandler(function(){}).castVote(S.weekId,id,ME,now);};});}',
  'function paint(){Array.prototype.forEach.call(document.querySelectorAll(".card"),function(c){var p=VOTES[c.getAttribute("data-id")]||{};',
  ' Array.prototype.forEach.call(c.querySelectorAll("button.vote"),function(b){b.classList.toggle("on",!!p[b.getAttribute("data-voter")]);});',
  ' var all=VOTERS.length>0&&VOTERS.every(function(v){return !!p[v];});c.classList.toggle("match",all);c.querySelector(".both").hidden=!all;});}',
  'function refreshVotes(){google.script.run.withSuccessHandler(function(v){VOTES=v||{};paint();}).getVotes(S.weekId);}',
  // notes
  'function renderNotes(){var box=$("notesList");',
  ' if(!NOTES.length){box.innerHTML="<div class=\\"empty-notes\\">Nothing yet. One line is plenty.</div>";return;}',
  ' box.innerHTML=NOTES.map(function(n,i){return "<div class=\\"note\\"><div class=\\"body\\"><span class=\\"when\\">"+esc(fmtWhen(n.at))+(n.by?" \\u00b7 "+esc(n.by):"")+"</span>"+esc(n.text)+"</div><button class=\\"del\\" data-i=\\""+i+"\\" title=\\"Remove\\">&times;</button></div>";}).join("");',
  ' Array.prototype.forEach.call(box.querySelectorAll(".del"),function(b){b.onclick=function(){var n=NOTES[+b.getAttribute("data-i")];if(!n)return;b.disabled=true;',
  '  google.script.run.withSuccessHandler(function(r){NOTES=(r&&r.notes)||[];renderNotes();}).withFailureHandler(function(){b.disabled=false;}).deleteNote(S.weekId,n.at,n.text);};});}',
  'function loadNotes(){google.script.run.withSuccessHandler(function(l){NOTES=l||[];renderNotes();}).withFailureHandler(renderNotes).getNotes(S.weekId);}',
  '$("saveNote").onclick=function(){var ta=$("noteText"),t=ta.value.trim();if(!t){ta.focus();return;}var btn=this;btn.disabled=true;',
  ' google.script.run.withSuccessHandler(function(r){btn.disabled=false;if(r&&r.notes){NOTES=r.notes;renderNotes();}ta.value="";$("savedFlag").style.display="inline";setTimeout(function(){$("savedFlag").style.display="none";},2500);})',
  ' .withFailureHandler(function(){btn.disabled=false;}).addNote(S.weekId,ME,t);};',
  // history
  'function showTab(w){var wk=w==="week";$("weekView").hidden=!wk;$("histView").hidden=wk;$("tabWeek").classList.toggle("on",wk);$("tabHist").classList.toggle("on",!wk);',
  ' if(!wk&&!histLoaded){histLoaded=true;loadHistory();}}',
  '$("tabWeek").onclick=function(){showTab("week");};$("tabHist").onclick=function(){showTab("hist");};',
  'function loadHistory(){google.script.run.withSuccessHandler(renderHistory).withFailureHandler(function(e){$("histBody").innerHTML="<div class=\\"empty\\">Couldn\\u2019t load history.<br>"+esc(String(e))+"</div>";}).getHistory();}',
  'function renderHistory(h){var box=$("histBody");',
  ' if(!h||!h.weeks||!h.weeks.length){box.innerHTML="<div class=\\"empty\\">No weeks yet.<br>History starts with the first published slate.</div>";return;}',
  ' var head="<div class=\\"hsum\\"><b>"+h.weeks.length+"</b> week"+(h.weeks.length===1?"":"s")+" \\u00b7 <b>"+h.weeksWithNotes+"</b> with notes"+(h.exploreHitRate===null?"":" \\u00b7 <b>"+h.exploreHitRate+"%</b> of what you both picked lately was something new")+"</div>";',
  ' box.innerHTML=head+h.weeks.map(function(w){',
  '  var opts=w.options.map(function(o){var cls=o.all?"all":(o.voters.length?"":"none");var mark=o.all?"\\u2713":(o.voters.length?"\\u00b7":"");',
  '   var badge=o.mode?"<span class=\\"mini "+esc(o.mode)+"\\">"+(o.mode==="explore"?"New":"Tried")+"</span>":"";',
  '   var who=o.all?"<span class=\\"who\\">Both</span>":(o.voters.length?"<span class=\\"who\\">"+esc(o.voters.join(", "))+"</span>":"");',
  '   return "<div class=\\"hopt "+cls+"\\"><span class=\\"m\\">"+mark+"</span><span class=\\"t\\">"+esc(o.title)+" "+badge+"</span>"+who+"</div>";}).join("");',
  '  var fb=w.notes.length?w.notes.map(function(n){return "<div class=\\"fb\\"><b>"+esc(fmtWhen(n.at)||"What happened")+(n.by?" \\u00b7 "+esc(n.by):"")+"</b>"+esc(n.text)+"</div>";}).join(""):"<div class=\\"fb none\\"><b>No notes yet</b>Add a line below: it\\u2019s what the planner learns from.</div>";',
  '  var edit="<div class=\\"fbedit\\"><textarea data-week=\\""+esc(w.weekId)+"\\" placeholder=\\"We ended up\\u2026\\"></textarea><button data-week=\\""+esc(w.weekId)+"\\">Add note</button></div>";',
  '  return "<div class=\\"hweek\\"><h3>"+esc(w.eyebrow||w.weekId)+"</h3><p class=\\"wk\\">"+esc(w.weekId)+"</p>"+opts+fb+edit+"</div>";}).join("");',
  ' Array.prototype.forEach.call(box.querySelectorAll(".fbedit button"),function(b){b.onclick=function(){var wk=b.getAttribute("data-week");',
  '  var ta=box.querySelector("textarea[data-week=\\""+wk+"\\"]");if(!ta.value.trim()){ta.focus();return;}b.textContent="Adding\\u2026";',
  '  google.script.run.withSuccessHandler(function(){b.textContent="Added";setTimeout(function(){histLoaded=false;loadHistory();if(wk===S.weekId)loadNotes();},600);})',
  '  .withFailureHandler(function(){b.textContent="Failed, retry";}).addNote(wk,ME,ta.value);};});}',
  // boot
  'var saved=loadMe();if(saved&&VOTERS.indexOf(saved)>=0)setMe(saved);'
].join('\n');
