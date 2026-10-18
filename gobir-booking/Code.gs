/**
 * Gobir Digital — Booking endpoint (Google Apps Script)
 * Receives bookings from the website and saves each one as a row
 * in your Google Sheet, then emails you a notification.
 *
 * Setup is explained in GOBIR-SETUP.md.
 */

function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(20000); // avoid two bookings writing at the same time

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName("Bookings") || ss.insertSheet("Bookings");

    // Add a header row the first time
    if (sh.getLastRow() === 0) {
      sh.appendRow(["Timestamp", "Name", "Phone", "Email", "Topic", "Mode",
                    "Date", "Time", "People", "Total (NGN)", "Notes"]);
      sh.setFrozenRows(1);
    }

    var d = JSON.parse(e.postData.contents);

    // Ignore bot submissions (honeypot field filled in)
    if (d.company) {
      lock.releaseLock();
      return ContentService.createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Protect against spreadsheet formula injection ( =, +, -, @ )
    function safe(v) {
      v = (v == null ? "" : String(v)).slice(0, 500);
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    }

    sh.appendRow([
      new Date(), safe(d.name), safe(d.phone), safe(d.email), safe(d.topic),
      safe(d.mode), safe(d.date), safe(d.time), safe(d.people), safe(d.total), safe(d.notes)
    ]);

    lock.releaseLock();

    // Add it to your Google Calendar with a 30-minute reminder (popup + email)
    try {
      var start = parseStart(d.date, d.time);
      if (start) {
        var end = new Date(start.getTime() + 60 * 60 * 1000); // 60-minute class
        var title = "Gobir class: " + (d.topic || "Session") + " — " + (d.name || "");
        var desc = [
          "Student: " + d.name,
          "Phone:   " + d.phone,
          "Email:   " + d.email,
          "Topic:   " + d.topic,
          "Mode:    " + d.mode,
          "People:  " + d.people,
          "Total:   NGN " + d.total,
          "Notes:   " + (d.notes || "-")
        ].join("\n");
        var ev = CalendarApp.getDefaultCalendar().createEvent(title, start, end, { description: desc });
        ev.removeAllReminders();
        ev.addPopupReminder(30);   // notification 30 minutes before
        ev.addEmailReminder(30);   // email 30 minutes before
      }
    } catch (calErr) { /* calendar is optional; ignore failures */ }

    // Email yourself a heads-up (optional — remove this block if you don't want it)
    try {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: "New booking: " + (d.name || "") + " — " + (d.topic || ""),
        body: [
          "You have a new session booking:", "",
          "Name:   " + d.name,
          "Phone:  " + d.phone,
          "Email:  " + d.email,
          "Topic:  " + d.topic,
          "Mode:   " + d.mode,
          "Date:   " + d.date,
          "Time:   " + d.time,
          "People: " + d.people,
          "Total:  NGN " + d.total,
          "Notes:  " + (d.notes || "-")
        ].join("\n")
      });
    } catch (mailErr) { /* email is optional; ignore failures */ }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Turn "2026-10-20" + "4:00 PM" into a Date in the script's time zone.
 * Make sure the Apps Script project time zone is (GMT+01:00) Lagos
 * (File/Project Settings) so class times match Nigeria time.
 */
function parseStart(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  var p = String(dateStr).split("-"); // YYYY-MM-DD
  if (p.length !== 3) return null;
  var y = parseInt(p[0], 10), mo = parseInt(p[1], 10) - 1, da = parseInt(p[2], 10);
  var m = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  var h = parseInt(m[1], 10), mi = parseInt(m[2], 10), ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  var dt = new Date(y, mo, da, h, mi, 0);
  return isNaN(dt.getTime()) ? null : dt;
}

function doGet() {
  return ContentService.createTextOutput("Gobir Digital booking endpoint is live.");
}
