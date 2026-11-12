# Gobir Digital — Owner Operations Runbook

Everything the business owner needs to run the booking system day-to-day.
Nothing here needs a developer — every step is point-and-click.

---

## 1. Update the booking backend to v3 (one-time, ~5 minutes)

The v3 script adds: PIN brute-force lock, booking-reference lookup throttle,
an audit **Logs** sheet, a **Change PIN** button in the owner console, and
correct manage links in confirmation emails.

1. Open the Google Sheet that holds your bookings → **Extensions → Apps Script**.
2. Select all the code in the editor and replace it with the contents of
   `gobir-updates/Code.gs` (v3).
3. Press **Deploy → Manage deployments → (pencil) → Version: New version → Deploy**.
   The web-app URL stays the same, so the website needs no change.
4. Reload the website, press **Manage booking** (or open `?owner=1`) and do one
   check lookup — the new **Logs** sheet appears in the spreadsheet the first
   time something is logged.

## 2. Change your owner PIN (do this first!)

The console still uses the factory PIN (`gobir2025`). The site now warns you
about it until you change it:

1. Open the site → footer → **Owner console** (`your-site/?owner=1`).
2. Unlock with the current PIN.
3. Scroll to **Change owner PIN → Show**, enter a new PIN (6+ characters,
   not `gobir2025`), press **Save new PIN**.
4. If you ever forget it: open the spreadsheet → **Settings** sheet → edit the
   `OwnerPIN` row value.

Wrong-PIN protection: 5 wrong attempts lock the console for 5 minutes
(client) and all PIN actions for 10 minutes (server).

## 3. Keep the site online (uptime monitoring, 5 minutes)

Free and automatic — you get an email when the site is down:

1. Create a free account at **uptimerobot.com**.
2. **Add New Monitor → HTTP(s)**.
3. Friendly name: `Gobir Digital site`. URL: `https://gobir-digital.netlify.app/`.
4. Interval: 30 minutes. Alert contacts: your email (or Telegram).
5. Optional second monitor for the booking API:
   `https://script.google.com/macros/s/AKfycbwxvoeuikW6ovZBp6axU4Tmz9GYsTOLsQAMyfjxq_Q14oOlwRkVV92zLoDOgiT4_dpo7Q/exec`
   — expect a 200; it responds with a short text line.

## 4. Weekly backup of the booking sheet (2 minutes, once a week)

The spreadsheet is the single source of truth for bookings.

**Manual (recommended):**
1. Open the spreadsheet on Monday morning.
2. **File → Make a copy** → name it `Bookings backup YYYY-MM-DD`.
3. Copies go to your Drive root; you can move them into a `Gobir Backups` folder.

**Or automatic ( Sheets-only trick ):** the v3 script keeps a trimmed audit
`Logs` sheet, but full row history is not versioned — so the weekly copy is
your real backup. Google Sheets also keeps **File → Version history** for 30
days as a second safety net.

## 5. Read the audit Logs sheet

New **Logs** tab (keeps the latest ~500 events):

| Action | Meaning |
| --- | --- |
| `book` | A session was booked (name · topic · slot · reference) |
| `cancel` / `reschedule` | Client used their manage link |
| `request` | Home-schooling or research request submitted |
| `pin_fail` / `pin_locked` | Wrong owner-PIN attempts / console locked |
| `lookup_fail` / `lookup_locked` | Wrong booking references / lookups throttled |
| `delete` / `setpin` | Owner removed a booking / changed the PIN |

If you see `pin_locked` or bursts of `lookup_fail` that you did not cause,
just wait for the lock to expire — the throttles reset themselves.

## 6. Daily / weekly operation checklist

- **Open or close bookings:** footer → Owner console → Open/Close per mode
  (All, Online, In-person). Changes apply to the site instantly.
- **Block a date:** Owner console → Block/unblock a date (whole day or one slot).
- **Remove a test/duplicate booking:** Owner console → Remove a booking (paste
  the reference — also clickable in the "This week" list).
- **Revenue check:** Owner console dashboard (this month / all time), or the
  **Summary** and **Analytics** tabs in the sheet with charts.

## 7. Site hosting notes

- The site is a static export (Netlify). The only live backend is the Apps
  Script web app — redeploying the script never changes the site URL.
- Files that must stay in sync: `gobir-updates/Code.gs` (backend) and the
  website source zip. If you ever move to a custom domain, update `SiteUrl`
  in the Settings sheet (or the `SITE_URL` constant) so confirmation emails
  contain the right manage links.

## 8. Accepting payments today (and optional Paystack later)

**Now:** after a booking, WhatsApp the customer the bank-transfer details;
payment confirms the slot. The booking dialog already shows "pay after
booking" so nothing to configure.

**Later (optional):** create a Paystack business account → Payment Pages →
copy the page link → paste it in your WhatsApp confirmation message. That
gives card/USSD payments without any website changes. Full in-site Paystack
checkout is possible but needs a small server component first — ask the
developer when you're ready.
