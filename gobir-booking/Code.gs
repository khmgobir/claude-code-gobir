/**
 * Gobir Digital — Booking API (Google Apps Script)
 * ------------------------------------------------------------------
 * Serves the website (via JSONP ?callback=) and stores bookings in
 * this spreadsheet. Features:
 *   • availability — only free 4–9pm slots are offered
 *   • owner on/off — set BookingOpen = NO in the "Settings" sheet when busy
 *   • block times  — add rows to the "Blocked" sheet (date, or date+time)
 *   • cancel / reschedule — each booking gets a token (manage link)
 *   • Google Calendar event per booking with a 30-minute reminder
 *
 * Deploy: Deploy → New deployment → Web app → Execute as: Me →
 *         Who has access: Anyone. Re-deploy a NEW VERSION after edits.
 * Set the Apps Script time zone to (GMT+01:00) Lagos (Project Settings).
 */

var SLOTS = ["4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM"];
var TZ = "Africa/Lagos";
// Your live site URL (for the client's cancel/reschedule link in emails).
// Either set it here, or add a "SiteUrl" row in the Settings sheet.
var SITE_URL = "";   // e.g. "https://gobir-digital.netlify.app"
var WHATSAPP = "2347066637888";
var ONLINE_CAP = 5;   // up to 5 independent clients can book the same ONLINE slot

/* ---------------- entry points ---------------- */
function doGet(e)  { return handle(e); }
function doPost(e) {
  // still accept JSON POST (legacy) — treat as a booking
  try {
    var d = JSON.parse(e.postData.contents);
    var p = {}; for (var k in d) p[k] = d[k]; p.action = d.action || "book";
    return respond(e, route(p));
  } catch (err) {
    return respond(e, { ok:false, error:String(err) });
  }
}
function handle(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  if (!p.action) return respond(e, null, "Gobir Digital booking endpoint is live.");
  return respond(e, route(p));
}

function route(p) {
  switch (p.action) {
    case "slots":      return apiSlots(p);
    case "booking":    return apiBooking(p);
    case "book":       return apiBook(p);
    case "cancel":     return apiCancel(p);
    case "delete":     return apiDeleteBooking(p);
    case "reschedule": return apiReschedule(p);
    case "ownerstatus":return apiOwnerStatus(p);
    case "setopen":    return apiSetOpen(p);
    case "setblock":   return apiSetBlock(p);
    case "unsetblock": return apiUnsetBlock(p);
    case "bookings":   return apiBookingsList(p);
    case "config":     return apiConfig(p);
    case "setconfig":  return apiSetConfig(p);
    case "stats":      return apiStats(p);
    default:           return { ok:false, reason:"unknown_action" };
  }
}

/* ---------------- API handlers ---------------- */
function apiSlots(p) {
  var date = p.date;
  if (!date) return { ok:false, reason:"nodate" };
  var mode = p.mode || "Online";
  if (!modeOpen(mode)) return { ok:true, open:false, date:date, slots:[] };
  var bl = blockedFor(date);
  if (bl.wholeDay) return { ok:true, open:false, date:date, slots:[] };
  var usage = slotUsage(date);
  var free = SLOTS.filter(function(t){ return bl.times.indexOf(t) < 0 && slotFree(usage, t, mode); });
  return { ok:true, open:true, date:date, slots:free };
}

function apiBooking(p) {
  var f = findByToken(p.token);
  if (!f || String(f.row[idx("Status")]).toLowerCase() === "cancelled") return { ok:true, found:false };
  return { ok:true, found:true, booking:{
    name:  f.row[idx("Name")], topic: f.row[idx("Topic")], mode: f.row[idx("Mode")],
    date:  f.row[idx("Date")], time:  f.row[idx("Time")], people: f.row[idx("People")]
  }};
}

function apiBook(p) {
  if (p.company) return { ok:true };                 // honeypot → ignore silently
  if (!p.name || !p.phone || !p.email || !p.date || !p.time) return { ok:false, reason:"invalid" };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    if (!modeOpen(p.mode || "Online")) return { ok:false, reason:"closed" };
    var bl = blockedFor(p.date);
    if (bl.wholeDay || bl.times.indexOf(p.time) >= 0) return { ok:false, reason:"closed" };
    if (!slotFree(slotUsage(p.date), normTime(p.time), p.mode || "Online")) return { ok:false, reason:"taken" };

    var sh = bookingsSheet();
    p.total = ((parseInt(p.people,10)||1) > 1 ? priceGroup() : priceSolo());
    var token = Utilities.getUuid().replace(/-/g,"").slice(0,10);
    var eventId = createCalendarEvent(p);
    sh.appendRow([ new Date(), token, "Booked",
      safe(p.name), safe(p.phone), safe(p.email), safe(p.topic), safe(p.mode),
      safe(p.date), safe(p.time), safe(p.people), safe(p.total), safe(p.notes), eventId || "", safe(p.address) ]);
    notifyOwner(p);
    sendClientEmail(p, token);
    buildAnalytics();
    return { ok:true, token:token };
  } finally { lock.releaseLock(); }
}

function apiCancel(p) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var f = findByToken(p.token);
    if (!f) return { ok:false, reason:"notfound" };
    f.sheet.getRange(f.rowIndex, idx("Status")+1).setValue("Cancelled");
    deleteCalendarEvent(f.row[idx("EventId")]);
    return { ok:true };
  } finally { lock.releaseLock(); }
}

function apiDeleteBooking(p) {
  // Owner-only: permanently remove a booking row (and its calendar event) by
  // reference, so test/cancelled rows stop counting toward revenue and stats.
  if (String(p.pin) !== ownerPin()) return { ok:false, reason:"pin" };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var f = findByToken(p.token);
    if (!f) return { ok:false, reason:"notfound" };
    var name = String(f.row[idx("Name")] || "");
    deleteCalendarEvent(f.row[idx("EventId")]);
    f.sheet.deleteRow(f.rowIndex);
    buildAnalytics();
    return { ok:true, name:name };
  } finally { lock.releaseLock(); }
}

function apiReschedule(p) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var f = findByToken(p.token);
    if (!f) return { ok:false, reason:"notfound" };
    if (!p.date || !p.time) return { ok:false, reason:"invalid" };
    var rmode = f.row[idx("Mode")] || "Online";
    if (!modeOpen(rmode)) return { ok:false, reason:"closed" };
    var bl = blockedFor(p.date);
    if (bl.wholeDay || bl.times.indexOf(p.time) >= 0) return { ok:false, reason:"closed" };
    // slot must be free for this booking's mode (ignoring this same booking)
    if (!slotFree(slotUsage(p.date, p.token), normTime(p.time), rmode)) return { ok:false, reason:"taken" };

    f.sheet.getRange(f.rowIndex, idx("Date")+1).setValue(p.date);
    f.sheet.getRange(f.rowIndex, idx("Time")+1).setValue(p.time);
    // move the calendar event (delete + recreate)
    deleteCalendarEvent(f.row[idx("EventId")]);
    var merged = {
      name:f.row[idx("Name")], phone:f.row[idx("Phone")], email:f.row[idx("Email")],
      topic:f.row[idx("Topic")], mode:f.row[idx("Mode")], people:f.row[idx("People")],
      total:f.row[idx("Total")], notes:f.row[idx("Notes")], date:p.date, time:p.time
    };
    var newId = createCalendarEvent(merged);
    f.sheet.getRange(f.rowIndex, idx("EventId")+1).setValue(newId || "");
    return { ok:true };
  } finally { lock.releaseLock(); }
}

/* ---------------- sheet helpers ---------------- */
var HEADERS = ["Timestamp","Token","Status","Name","Phone","Email","Topic","Mode","Date","Time","People","Total (NGN)","Notes","EventId","Address"];
function idx(name){
  var map = {Timestamp:0,Token:1,Status:2,Name:3,Phone:4,Email:5,Topic:6,Mode:7,Date:8,Time:9,People:10,Total:11,Notes:12,EventId:13,Address:14};
  return map[name];
}
function bookingsSheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Bookings");
  if (!sh) { sh = ss.insertSheet("Bookings"); }
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  // make sure the trailing columns (EventId, Address) exist on older sheets
  if (sh.getLastColumn() < HEADERS.length) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sh;
}
function bookingOpen(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Settings");
  if (!sh) { sh = ss.insertSheet("Settings"); sh.appendRow(["Setting","Value"]); sh.appendRow(["BookingOpen","YES"]); return true; }
  var v = sh.getDataRange().getValues();
  for (var i=0;i<v.length;i++){ if (String(v[i][0]).trim().toLowerCase()==="bookingopen"){ return String(v[i][1]).trim().toUpperCase()!=="NO"; } }
  return true;
}
function ownerPin(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Settings");
  if (!sh) { sh = ss.insertSheet("Settings"); sh.appendRow(["Setting","Value"]); sh.appendRow(["BookingOpen","YES"]); }
  var v = sh.getDataRange().getValues(), found = null;
  for (var i=0;i<v.length;i++){ if (String(v[i][0]).trim().toLowerCase()==="ownerpin") found = String(v[i][1]).trim(); }
  if (found === null) { sh.appendRow(["OwnerPIN","gobir2025"]); found = "gobir2025"; }
  return found;
}
function setBookingOpen(open){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Settings");
  if (!sh) { sh = ss.insertSheet("Settings"); sh.appendRow(["Setting","Value"]); }
  var v = sh.getDataRange().getValues(), row = -1;
  for (var i=0;i<v.length;i++){ if (String(v[i][0]).trim().toLowerCase()==="bookingopen") row = i+1; }
  if (row < 0) sh.appendRow(["BookingOpen", open?"YES":"NO"]);
  else sh.getRange(row,2).setValue(open?"YES":"NO");
}
function flagOpen(key){ var x = getSetting(key); return x===null || String(x).trim().toUpperCase()!=="NO"; }
function onlineOpen(){ return flagOpen("OnlineOpen"); }
function inPersonOpen(){ return flagOpen("InPersonOpen"); }
/** overall must be open AND the specific mode must be open */
function modeOpen(mode){
  if (!bookingOpen()) return false;
  return String(mode).toLowerCase().indexOf("person") >= 0 ? inPersonOpen() : onlineOpen();
}
function apiOwnerStatus(p){
  if (String(p.pin) !== ownerPin()) return { ok:false, reason:"pin" };
  return { ok:true, open:bookingOpen(), online:onlineOpen(), inperson:inPersonOpen() };
}
function apiBookingsList(p){
  if (String(p.pin) !== ownerPin()) return { ok:false, reason:"pin" };
  var sh = bookingsSheet(), v = sh.getDataRange().getValues();
  var today = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd");
  var out = [];
  for (var i=1;i<v.length;i++){
    if (String(v[i][idx("Status")]).toLowerCase()==="cancelled") continue;
    var d = fmtDate(v[i][idx("Date")]); if (d < today) continue;
    out.push({
      token:String(v[i][idx("Token")]),
      date:d, time:normTime(v[i][idx("Time")]), name:String(v[i][idx("Name")]),
      phone:String(v[i][idx("Phone")]), topic:String(v[i][idx("Topic")]),
      mode:String(v[i][idx("Mode")]), people:String(v[i][idx("People")]),
      address:String(v[i][idx("Address")]||"")
    });
  }
  out.sort(function(a,b){ return (a.date+" "+a.time) < (b.date+" "+b.time) ? -1 : 1; });
  return { ok:true, bookings: out.slice(0, 50) };
}

/* ---------- settings-driven price / duration ---------- */
function getSetting(key){
  var ss = SpreadsheetApp.getActiveSpreadsheet(); var sh = ss.getSheetByName("Settings");
  if (!sh) { sh = ss.insertSheet("Settings"); sh.appendRow(["Setting","Value"]); sh.appendRow(["BookingOpen","YES"]); }
  var v = sh.getDataRange().getValues();
  for (var i=0;i<v.length;i++){ if (String(v[i][0]).trim().toLowerCase()===String(key).toLowerCase()) return v[i][1]; }
  return null;
}
function setSetting(key, val){
  var ss = SpreadsheetApp.getActiveSpreadsheet(); var sh = ss.getSheetByName("Settings");
  if (!sh) { sh = ss.insertSheet("Settings"); sh.appendRow(["Setting","Value"]); }
  var v = sh.getDataRange().getValues(), row = -1;
  for (var i=0;i<v.length;i++){ if (String(v[i][0]).trim().toLowerCase()===String(key).toLowerCase()) row = i+1; }
  if (row < 0) sh.appendRow([key, val]); else sh.getRange(row,2).setValue(val);
}
function numSetting(key, def){ var x = getSetting(key); var n = parseFloat(x); return (x===null||x===""||isNaN(n)) ? def : n; }
function priceSolo(){ return numSetting("PriceSolo", 5000); }
function priceGroup(){ return numSetting("PriceGroup", 10000); }
function durationMin(){ return numSetting("Duration", 60); }

function apiConfig(p){
  return { ok:true, priceSolo:priceSolo(), priceGroup:priceGroup(), duration:durationMin(),
           online:modeOpen("Online"), inperson:modeOpen("In person") };
}
function apiSetConfig(p){
  if (String(p.pin) !== ownerPin()) return { ok:false, reason:"pin" };
  if (p.priceSolo !== undefined && p.priceSolo !== "")   setSetting("PriceSolo", parseFloat(p.priceSolo) || priceSolo());
  if (p.priceGroup !== undefined && p.priceGroup !== "") setSetting("PriceGroup", parseFloat(p.priceGroup) || priceGroup());
  if (p.duration !== undefined && p.duration !== "")     setSetting("Duration", parseInt(p.duration,10) || durationMin());
  return { ok:true, priceSolo:priceSolo(), priceGroup:priceGroup(), duration:durationMin() };
}

function apiStats(p){
  if (String(p.pin) !== ownerPin()) return { ok:false, reason:"pin" };
  var sh = bookingsSheet(), v = sh.getDataRange().getValues();
  var today = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd");
  var month = today.slice(0,7);
  var weekDt = new Date(); weekDt.setDate(weekDt.getDate()+7);
  var weekEnd = Utilities.formatDate(weekDt, TZ, "yyyy-MM-dd");
  var active=0, upcoming=0, people=0, revTotal=0, revMonth=0, wk=[];
  for (var i=1;i<v.length;i++){
    if (String(v[i][idx("Status")]).toLowerCase()==="cancelled") continue;
    active++;
    var tot = parseFloat(v[i][idx("Total")]) || 0; revTotal += tot;
    var d = fmtDate(v[i][idx("Date")]);
    if (d.slice(0,7) === month) revMonth += tot;
    if (d >= today) {
      upcoming++; people += parseInt(v[i][idx("People")],10) || 0;
      if (d <= weekEnd) wk.push({ date:d, time:normTime(v[i][idx("Time")]), name:String(v[i][idx("Name")]), topic:String(v[i][idx("Topic")]), mode:String(v[i][idx("Mode")]), people:String(v[i][idx("People")]), token:String(v[i][idx("Token")]) });
    }
  }
  wk.sort(function(a,b){ return (a.date+" "+a.time) < (b.date+" "+b.time) ? -1 : 1; });
  return { ok:true, active:active, upcoming:upcoming, people:people, revenueTotal:revTotal, revenueMonth:revMonth, week:wk };
}
function apiSetOpen(p){
  if (String(p.pin) !== ownerPin()) return { ok:false, reason:"pin" };
  var val = String(p.value).toLowerCase();
  var open = (val==="yes"||val==="open"||val==="true"||val==="1");
  var which = String(p.which||"all").toLowerCase();
  if (which==="online") setSetting("OnlineOpen", open?"YES":"NO");
  else if (which==="inperson"||which==="in person"||which==="person") setSetting("InPersonOpen", open?"YES":"NO");
  else setBookingOpen(open);
  return { ok:true, open:bookingOpen(), online:onlineOpen(), inperson:inPersonOpen() };
}
function blockedFor(date){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Blocked");
  if (!sh) { sh = ss.insertSheet("Blocked"); sh.appendRow(["Date (YYYY-MM-DD)","Time (blank = whole day)"]); return { wholeDay:false, times:[] }; }
  var v = sh.getDataRange().getValues(), times=[], whole=false;
  for (var i=1;i<v.length;i++){
    var d = fmtDate(v[i][0]); if (d !== date) continue;
    var t = String(v[i][1]||"").trim();
    if (!t) whole = true; else times.push(normTime(t));
  }
  return { wholeDay:whole, times:times };
}
// Per-slot usage for a date: {time: {online:n, inperson:n}}
function slotUsage(date, exceptToken){
  var sh = bookingsSheet(), v = sh.getDataRange().getValues(), map = {};
  for (var i=1;i<v.length;i++){
    if (String(v[i][idx("Status")]).toLowerCase()==="cancelled") continue;
    if (exceptToken && String(v[i][idx("Token")])===String(exceptToken)) continue;
    if (fmtDate(v[i][idx("Date")]) !== date) continue;
    var t = normTime(v[i][idx("Time")]);
    var isPerson = String(v[i][idx("Mode")]).toLowerCase().indexOf("person") >= 0;
    if (!map[t]) map[t] = { online:0, inperson:0 };
    if (isPerson) map[t].inperson++; else map[t].online++;
  }
  return map;
}
// A slot is free for a requested mode.
//  In person  -> exclusive (no other booking of any kind)
//  Online     -> up to ONLINE_CAP independent clients, and no in-person booking
function slotFree(usage, time, mode){
  var u = usage[time] || { online:0, inperson:0 };
  var isPerson = String(mode).toLowerCase().indexOf("person") >= 0;
  if (isPerson) return u.online === 0 && u.inperson === 0;
  return u.inperson === 0 && u.online < ONLINE_CAP;
}

/* ---------- owner: block / unblock specific days or slots ---------- */
function apiSetBlock(p){
  if (String(p.pin) !== ownerPin()) return { ok:false, reason:"pin" };
  if (!p.date) return { ok:false, reason:"nodate" };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Blocked");
  if (!sh) { sh = ss.insertSheet("Blocked"); sh.appendRow(["Date (YYYY-MM-DD)","Time (blank = whole day)"]); }
  sh.appendRow([ p.date, p.time || "" ]);
  return { ok:true };
}
function apiUnsetBlock(p){
  if (String(p.pin) !== ownerPin()) return { ok:false, reason:"pin" };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Blocked");
  if (!sh) return { ok:true };
  var v = sh.getDataRange().getValues();
  for (var i=v.length-1;i>=1;i--){
    if (fmtDate(v[i][0]) === p.date && normTime(v[i][1]) === normTime(p.time)) sh.deleteRow(i+1);
  }
  return { ok:true };
}
function findByToken(token){
  if (!token) return null;
  var sh = bookingsSheet(), v = sh.getDataRange().getValues();
  for (var i=1;i<v.length;i++){ if (String(v[i][idx("Token")])===String(token)) return { sheet:sh, rowIndex:i+1, row:v[i] }; }
  return null;
}

/* ---------------- calendar ---------------- */
function createCalendarEvent(p){
  try {
    var start = parseStart(p.date, p.time); if (!start) return "";
    var end = new Date(start.getTime() + durationMin()*60*1000);
    var title = "Gobir class: " + (p.topic||"Session") + " — " + (p.name||"");
    var desc = ["Student: "+p.name,"Phone: "+p.phone,"Email: "+p.email,"Topic: "+p.topic,
                "Mode: "+p.mode,"People: "+p.people,"Total: NGN "+p.total,"Notes: "+(p.notes||"-")].join("\n");
    var ev = CalendarApp.getDefaultCalendar().createEvent(title, start, end, { description:desc });
    ev.removeAllReminders(); ev.addPopupReminder(30); ev.addEmailReminder(30);
    return ev.getId();
  } catch (e) { return ""; }
}
function deleteCalendarEvent(id){
  try { if (!id) return; var ev = CalendarApp.getDefaultCalendar().getEventById(id); if (ev) ev.deleteEvent(); } catch (e) {}
}
function getSiteUrl(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Settings");
  if (sh) {
    var v = sh.getDataRange().getValues();
    for (var i=0;i<v.length;i++){ if (String(v[i][0]).trim().toLowerCase()==="siteurl" && String(v[i][1]).trim()) return String(v[i][1]).trim(); }
  }
  return SITE_URL;
}
function sendClientEmail(p, token){
  try {
    if (!p.email || p.email.indexOf("@") < 0) return;
    var base = getSiteUrl().replace(/\/+$/,"");
    var link = base ? (base + "/gobir-digital.html?manage=" + token) : "";
    var body = [
      "Hi " + (p.name || "") + ",", "",
      "Your Gobir Digital session is booked ✅  Here are the details:", "",
      "Topic:  " + p.topic,
      "Mode:   " + p.mode,
      (String(p.mode).toLowerCase().indexOf("person")>=0 ? "Address: " + (p.address||"-") : null),
      "Date:   " + p.date,
      "Time:   " + p.time + " (Nigeria time, WAT)",
      "People: " + p.people,
      "Total:  NGN " + p.total, "",
      (link
        ? ("Need to cancel or reschedule? Use your private link:\n" + link)
        : ("Your booking reference: " + token)),
      "",
      "Questions? WhatsApp us: https://wa.me/" + WHATSAPP, "",
      "See you soon!",
      "Gobir Digital — Learn Digital · Build Smart · Grow"
    ].join("\n");
    MailApp.sendEmail({ to: p.email, subject: "Your Gobir Digital session is booked ✅", body: body });
  } catch (e) {}
}
function notifyOwner(p){
  try {
    MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(),
      subject: "New booking: " + (p.name||"") + " — " + (p.topic||""),
      body: ["New session booking:","","Name: "+p.name,"Phone: "+p.phone,"Email: "+p.email,
             "Topic: "+p.topic,"Mode: "+p.mode,"Address: "+(p.address||"-"),"Date: "+p.date,"Time: "+p.time,
             "People: "+p.people,"Total: NGN "+p.total,"Notes: "+(p.notes||"-")].join("\n") });
  } catch (e) {}
}

/* ---------------- utils ---------------- */
function parseStart(dateStr, timeStr){
  if (!dateStr || !timeStr) return null;
  var pz = String(dateStr).split("-"); if (pz.length!==3) return null;
  var y=+pz[0], mo=+pz[1]-1, da=+pz[2];
  var m = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if (!m) return null;
  var h=+m[1], mi=+m[2], ap=m[3].toUpperCase();
  if (ap==="PM" && h!==12) h+=12; if (ap==="AM" && h===12) h=0;
  var dt = new Date(y,mo,da,h,mi,0); return isNaN(dt.getTime())?null:dt;
}
function fmtDate(v){
  if (v instanceof Date) return Utilities.formatDate(v, TZ, "yyyy-MM-dd");
  return String(v).trim();
}
function normTime(t){
  // A Time cell can come back as a Date value (Sheets auto-parsed "8:00 PM"),
  // so format it to a clean "h:mm a" string before normalising.
  if (t instanceof Date) t = Utilities.formatDate(t, TZ, "h:mm a");
  t = String(t).trim().toUpperCase().replace(/\s+/g," ");
  var m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/); if (!m) return t;
  return parseInt(m[1],10)+":"+m[2]+" "+m[3];
}
function safe(v){ v=(v==null?"":String(v)).slice(0,500); return /^[=+\-@]/.test(v) ? "'"+v : v; }

/* ---------------- response (JSONP or JSON) ---------------- */
/* ---------- Summary + Analytics sheets (with charts) ---------- */
function buildAnalytics(){
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var bs = ss.getSheetByName("Bookings"); if (!bs) return;
    var v = bs.getDataRange().getValues();
    var rows = v.length > 1 ? v.slice(1) : [];
    function isCancel(r){ return String(r[idx("Status")]).toLowerCase()==="cancelled"; }
    var act = rows.filter(function(r){ return !isCancel(r); });
    var cancelled = rows.length - act.length;
    var revenue = act.reduce(function(s,r){ return s + (parseFloat(r[idx("Total")])||0); }, 0);
    var people  = act.reduce(function(s,r){ return s + (parseInt(r[idx("People")],10)||0); }, 0);
    var today = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd");
    var upcoming = act.filter(function(r){ return fmtDate(r[idx("Date")]) >= today; }).length;
    var byTopic = {}, byMode = { online:0, inperson:0 }, byDay = {};
    act.forEach(function(r){
      var tp = String(r[idx("Topic")]||"—"); if(!byTopic[tp]) byTopic[tp]={n:0,rev:0};
      byTopic[tp].n++; byTopic[tp].rev += (parseFloat(r[idx("Total")])||0);
      (String(r[idx("Mode")]).toLowerCase().indexOf("person")>=0 ? byMode.inperson++ : byMode.online++);
      var d = fmtDate(r[idx("Date")]); byDay[d] = (byDay[d]||0) + 1;
    });
    var now = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm");

    // --- Summary sheet ---
    var sum = ss.getSheetByName("Summary") || ss.insertSheet("Summary");
    sum.clear();
    sum.getRange(1,1,10,2).setValues([
      ["Gobir Digital — Summary",""],
      ["Updated", now],
      ["",""],
      ["Active bookings", act.length],
      ["Upcoming (today onward)", upcoming],
      ["Cancelled", cancelled],
      ["Total people taught", people],
      ["Revenue (active, NGN)", revenue],
      ["Avg per booking (NGN)", act.length ? Math.round(revenue/act.length) : 0],
      ["Total records", rows.length]
    ]);
    sum.getRange(1,1,1,2).merge().setFontWeight("bold").setFontSize(14);
    sum.getRange(4,1,7,1).setFontWeight("bold");
    sum.setColumnWidth(1,230); sum.setColumnWidth(2,170);

    // --- Analytics sheet (tables + charts) ---
    var an = ss.getSheetByName("Analytics") || ss.insertSheet("Analytics");
    an.getCharts().forEach(function(c){ an.removeChart(c); });
    an.clear();
    var topicRows = [["Topic","Bookings","Revenue (NGN)"]];
    Object.keys(byTopic).forEach(function(k){ topicRows.push([k, byTopic[k].n, byTopic[k].rev]); });
    if (topicRows.length === 1) topicRows.push(["(no data)",0,0]);
    an.getRange(1,1,topicRows.length,3).setValues(topicRows);
    var modeRows = [["Mode","Count"],["Online",byMode.online],["In person",byMode.inperson]];
    an.getRange(1,5,modeRows.length,2).setValues(modeRows);
    var days = Object.keys(byDay).sort(); var dayRows = [["Date","Bookings"]];
    days.forEach(function(d){ dayRows.push([d, byDay[d]]); });
    if (dayRows.length === 1) dayRows.push([today,0]);
    an.getRange(1,8,dayRows.length,2).setValues(dayRows);
    an.getRange(1,1,1,3).setFontWeight("bold");
    an.getRange(1,5,1,2).setFontWeight("bold");
    an.getRange(1,8,1,2).setFontWeight("bold");
    var base = Math.max(topicRows.length, dayRows.length) + 3;
    an.insertChart(an.newChart().asColumnChart().addRange(an.getRange(1,1,topicRows.length,2)).setPosition(base,1,0,0).setOption("title","Bookings by topic").build());
    an.insertChart(an.newChart().asPieChart().addRange(an.getRange(1,5,modeRows.length,2)).setPosition(base,5,0,0).setOption("title","Online vs In person").build());
    an.insertChart(an.newChart().asLineChart().addRange(an.getRange(1,8,dayRows.length,2)).setPosition(base+18,1,0,0).setOption("title","Bookings per day").build());
  } catch (e) {}
}
function onOpen(){
  try { SpreadsheetApp.getUi().createMenu("Gobir Digital").addItem("Refresh summary & analytics","buildAnalytics").addToUi(); } catch(e){}
}

function respond(e, obj, text){
  var cb = e && e.parameter ? e.parameter.callback : null;
  if (text && !obj) {
    if (cb) return js(cb + "(" + JSON.stringify({ok:true,message:text}) + ")");
    return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
  }
  var body = JSON.stringify(obj);
  if (cb) return js(cb + "(" + body + ")");
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
function js(s){ return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JAVASCRIPT); }
