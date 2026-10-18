# Gobir Digital — Setup Guide

Your website is ready. Follow these steps **once** to make bookings drop
straight into a Google Sheet (and email you).

Total time: about 10 minutes. No coding needed — just copy & paste.

---

## Part 1 — Connect bookings to your Google Sheet

### Step 1. Create the Google Sheet
1. Go to <https://sheets.google.com> and create a **new blank spreadsheet**.
2. Name it something like **"Gobir Digital — Bookings"**.
   (You don't need to add any columns — the script adds them automatically.)

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

**Done!** Every booking now appears as a new row in your sheet, and you get
an email. Test it by submitting a booking on the site, then checking the
"Bookings" tab of your sheet.

---

## Part 2 — (Optional) Add your WhatsApp number

Putting your number in `whatsapp` does two things:
- The WhatsApp icon in the footer links to your chat.
- After someone books, they get a **"Confirm on WhatsApp"** button that
  opens a chat pre-filled with their booking details.

Use the **full international format, digits only** (no `+`, no spaces):

```js
whatsapp: "2348030000000",   // 234 = Nigeria, then your number without the leading 0
```

So `0803 000 0000` becomes `2348030000000`.

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

## Updating prices later
- **Price:** in `gobir-digital.html`, change `pricePerSeat: 5000` and the
  two places the text `₦5,000` appears (hero + pricing panel).
- **Hours / slots:** change the `<option>` times in the "Time slot" dropdown.

If you'd rather I make any of these changes, just say the word.
