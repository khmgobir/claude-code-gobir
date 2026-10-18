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
    sh.appendRow([
      new Date(), d.name || "", d.phone || "", d.email || "", d.topic || "",
      d.mode || "", d.date || "", d.time || "", d.people || "", d.total || "", d.notes || ""
    ]);

    lock.releaseLock();

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

function doGet() {
  return ContentService.createTextOutput("Gobir Digital booking endpoint is live.");
}
