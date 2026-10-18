# Gobir Digital — Setup Guide

Your website is ready. Follow these steps **once** to make bookings drop
straight into a Google Sheet (and email you).

Total time: about 10 minutes. No coding needed — just copy & paste.

---

## Your links (already set up for you)
- **Bookings Sheet** (created in your Drive):
  <https://docs.google.com/spreadsheets/d/1QYqZi48TxxAVvPv2w4kbUQoVskg6HsTFt68iTlJ2b4s/edit>
- **WhatsApp** already wired into the site: **+234 706 526 5144**

---

## Part 1 — Connect bookings to your Google Sheet + Calendar

### Step 1. Open your Bookings Sheet
Open the sheet linked above (**"Gobir Digital — Bookings"**). The columns are
added automatically on the first booking — you don't need to add anything.

### Step 2. Open the script editor
1. In that sheet, click the menu: **Extensions → Apps Script**.
2. Delete whatever code is shown in the editor.
3. Open the file **`Code.gs`** (sent with your site), copy **all** of it,
   and paste it into the editor.
4. Click the **Save** icon (💾).

### Step 3. Deploy it as a Web App
1. Click **Deploy → New deployment**.
2. Click the gear ⚙️ next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** `Gobir booking`
   - **Execute as:** **Me (your email)**
   - **Who has access:** **Anyone**   ← important, so the website can reach it
4. Click **Deploy**.
5. Google will ask you to **Authorize access** → choose your account →
   if it warns "Google hasn't verified this app", click **Advanced →
   Go to (your project) → Allow**. (This is normal for your own script.)
   It will ask for permission to your **Spreadsheet, Calendar and Gmail** —
   that's so it can save bookings, add classes to your calendar, and email you.
6. Copy the **Web app URL** it gives you. It looks like:
   `https://script.google.com/macros/s/AKfy....../exec`

### Step 4. Paste the URL into your website
1. Open **`gobir-digital.html`** in a text editor.
2. Near the bottom, find this block:
   ```js
   var CONFIG = {
     scriptUrl: "",          // <-- paste your Google Apps Script Web App URL here
     whatsapp:  "",          // <-- optional: your number, e.g. "2348030000000"
   ```
3. Paste your URL between the quotes for `scriptUrl`. Example:
   ```js
   scriptUrl: "https://script.google.com/macros/s/AKfy....../exec",
   ```
4. Save the file and re-upload / re-deploy it (or tell me and I'll push it).

### Step 5. Set your time zone (so class times are correct)
In the Apps Script editor, click the **gear ⚙️ (Project Settings)** on the left
and make sure **Time zone** is **(GMT+01:00) Lagos**. This keeps your 4–10pm
Nigeria class times accurate on your calendar.

**Done!** Now, every booking will:
- appear as a new row in your **Bookings** sheet, and
- create a **class event in your Google Calendar** with a **reminder 30 minutes
  before** (a phone/desktop pop-up **and** an email), and
- send you an **email** with the booking details.

Test it: submit a booking on the site, then check your sheet and your
Google Calendar for that date/time.

> **Note:** your WhatsApp number (**+234 706 526 5144**) is already built into
> the site — the footer chat button and the "Confirm on WhatsApp" message after
> booking both use it. To change it later, edit the `whatsapp` line in
> `gobir-digital.html`.

---

## Your settings (already built in)

| Setting              | Value                          |
|----------------------|--------------------------------|
| Session length       | 60 minutes                     |
| Price                | ₦5,000 per person              |
| People per session   | 1 to 5                         |
| Available hours      | 4:00pm – 10:00pm (WAT), daily  |
| Time slots           | 4, 5, 6, 7, 8, 9 PM            |

Want to change any of these? They're easy to edit — just ask.

---

## Managing availability & bookings (NEW)

After pasting the updated `Code.gs` and re-deploying a **New version**
(Deploy → Manage deployments → ✏️ → Version: New version → Deploy), your
booking page becomes smart:

**Clients only see free times.** When someone picks a date, the page shows
only the 4–9pm slots that aren't already booked or blocked.

**Turn booking OFF when you're busy.** Open your spreadsheet → the **Settings**
tab (created automatically) → set **BookingOpen** to `NO`. The site then shows
"Booking is closed" and takes no new bookings. Set it back to `YES` to reopen.

**Block specific days or times.** Open the **Blocked** tab (created
automatically) and add a row:
- `2026-11-02` with an **empty** time → blocks the **whole day**
- `2026-11-02` and `6:00 PM` → blocks just that **one slot**

**Cancellations & rescheduling.** Every booking now gets a private **manage
link** (shown after booking, e.g. `…/gobir-digital.html?manage=abc123`). The
client opens it to **cancel** or **reschedule** themselves — the sheet and
Google Calendar update automatically. There's also a "Manage / cancel booking"
link in the footer where they can paste their link.

> One session per time slot (a group of up to 5 still counts as one booking).
> Cancelled bookings free the slot again automatically.

---

## Updating prices later
- **Price:** in `gobir-digital.html`, change `pricePerSeat: 5000` and the
  two places the text `₦5,000` appears (hero + pricing panel).
- **Hours / slots:** change the `<option>` times in the "Time slot" dropdown.

If you'd rather I make any of these changes, just say the word.
