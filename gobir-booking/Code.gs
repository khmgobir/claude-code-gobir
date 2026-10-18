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
    case "reschedule": return apiReschedule(p);
    default:           return { ok:false, reason:"unknown_action" };
  }
}

/* ---------------- API handlers ---------------- */
function apiSlots(p) {
  var date = p.date;
  if (!date) return { ok:false, reason:"nodate" };
  if (!bookingOpen()) return { ok:true, open:false, date:date, slots:[] };
  var bl = blockedFor(date);
  if (bl.wholeDay) return { ok:true, open:false, date:date, slots:[] };
  var taken = activeTimes(date);
  var free = SLOTS.filter(function(t){ return bl.times.indexOf(t) < 0 && taken.indexOf(t) < 0; });
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
    if (!bookingOpen()) return { ok:false, reason:"closed" };
    var bl = blockedFor(p.date);
    if (bl.wholeDay || bl.times.indexOf(p.time) >= 0) return { ok:false, reason:"closed" };
    if (activeTimes(p.date).indexOf(p.time) >= 0)     return { ok:false, reason:"taken" };

    var sh = bookingsSheet();
    var token = Utilities.getUuid().replace(/-/g,"").slice(0,10);
    var eventId = createCalendarEvent(p);
    sh.appendRow([ new Date(), token, "Booked",
      safe(p.name), safe(p.phone), safe(p.email), safe(p.topic), safe(p.mode),
      safe(p.date), safe(p.time), safe(p.people), safe(p.total), safe(p.notes), eventId || "" ]);
    notifyOwner(p);
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

function apiReschedule(p) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var f = findByToken(p.token);
    if (!f) return { ok:false, reason:"notfound" };
    if (!p.date || !p.time) return { ok:false, reason:"invalid" };
    if (!bookingOpen()) return { ok:false, reason:"closed" };
    var bl = blockedFor(p.date);
    if (bl.wholeDay || bl.times.indexOf(p.time) >= 0) return { ok:false, reason:"closed" };
    // slot must be free (ignoring this same booking)
    var taken = activeTimes(p.date, p.token);
    if (taken.indexOf(p.time) >= 0) return { ok:false, reason:"taken" };

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
var HEADERS = ["Timestamp","Token","Status","Name","Phone","Email","Topic","Mode","Date","Time","People","Total (NGN)","Notes","EventId"];
function idx(name){
  var map = {Timestamp:0,Token:1,Status:2,Name:3,Phone:4,Email:5,Topic:6,Mode:7,Date:8,Time:9,People:10,Total:11,Notes:12,EventId:13};
  return map[name];
}
function bookingsSheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Bookings");
  if (!sh) { sh = ss.insertSheet("Bookings"); }
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
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
function activeTimes(date, exceptToken){
  var sh = bookingsSheet(), v = sh.getDataRange().getValues(), out=[];
  for (var i=1;i<v.length;i++){
    if (String(v[i][idx("Status")]).toLowerCase()==="cancelled") continue;
    if (exceptToken && String(v[i][idx("Token")])===String(exceptToken)) continue;
    if (fmtDate(v[i][idx("Date")]) === date) out.push(normTime(v[i][idx("Time")]));
  }
  return out;
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
    var end = new Date(start.getTime() + 60*60*1000);
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
function notifyOwner(p){
  try {
    MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(),
      subject: "New booking: " + (p.name||"") + " — " + (p.topic||""),
      body: ["New session booking:","","Name: "+p.name,"Phone: "+p.phone,"Email: "+p.email,
             "Topic: "+p.topic,"Mode: "+p.mode,"Date: "+p.date,"Time: "+p.time,
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
  t = String(t).trim().toUpperCase().replace(/\s+/g," ");
  var m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/); if (!m) return t;
  return parseInt(m[1],10)+":"+m[2]+" "+m[3];
}
function safe(v){ v=(v==null?"":String(v)).slice(0,500); return /^[=+\-@]/.test(v) ? "'"+v : v; }

/* ---------------- response (JSONP or JSON) ---------------- */
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
