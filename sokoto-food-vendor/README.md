# Sokoto Food Vendor — complete marketing + WhatsApp ordering kit

Everything needed to advertise a Sokoto food business (based at **UDUTH**, delivering
anywhere in Sokoto) and take orders on WhatsApp — **auto-handled until you need to step in.**

```
sokoto-food-vendor/
├── landing/            ← the link-in-bio website (deploy this folder)
│   ├── index.html
│   └── config.json     ← ⭐ EDIT THIS ONE FILE: name, number, menu, prices, hours
├── bot/                ← the WhatsApp ordering bot (whatsapp-web.js)
│   ├── index.js
│   └── package.json
├── creatives/          ← advert image generator
│   ├── generate.cjs
│   └── out/            ← the finished adverts (PNG) for every platform
└── README.md           ← you are here
```

Everything reads from **one file: `landing/config.json`.** Edit it once and the website,
the bot and the adverts all stay in sync.

---

## ✅ Before you launch — send me / fill in these 4 things

1. **Business name** (replace the sample "Sokoto Tasty Kitchen").
2. **Business WhatsApp number** — a **separate SIM** for the kitchen, in full
   international form, digits only (e.g. `2347012345678`).
3. **Your personal number** (for order alerts) — different from the business number.
4. **Your real menu + prices + delivery fee** (edit the `menu` list in `config.json`).

Optional: a **logo** (replace the 🍲 emoji), and your **Instagram/Facebook/TikTok** links.

---

## 1) Edit `landing/config.json`

Open `landing/config.json` and change the values marked with `_note`. Key ones:

| Field | What to put |
|---|---|
| `business.name` | Your real business name |
| `business.whatsapp` | Business WhatsApp number, digits only, no `+` |
| `business.ownerNotify` | YOUR personal number (gets order alerts), digits only |
| `business.phone` | Display phone (with `+`) shown on the flyer & "Call" button |
| `hours.open` / `hours.close` | 24-hour times, e.g. `09:00` and `21:00` |
| `delivery.feeFlat` | Delivery fee in Naira (e.g. `1000`) |
| `delivery.freeFrom` | Order value for free delivery (set very high to disable) |
| `payment.*` | Bank details sent to customers after they confirm |
| `menu` | Your dishes: `{ "id", "cat", "name", "price" }` — ids must be unique |

Prices are plain numbers in Naira. Keep each menu `id` unique.

---

## 2) The adverts (`creatives/out/`)

Four ready-to-post images are already generated:

| File | Size | Where to post |
|---|---|---|
| `feed-square.png` | 1080×1080 | Instagram feed, Facebook feed |
| `story.png` | 1080×1920 | Instagram/Facebook Story, **WhatsApp Status**, Reels cover |
| `link-card.png` | 1200×630 | Facebook link posts, X (Twitter) card |
| `flyer.png` | 1080×1350 | Instagram portrait post, printable flyer |

**To regenerate them after editing the menu/name:**

```bash
cd creatives
npm i -g playwright            # first time only (or use your own Chrome)
node generate.cjs
```

The adverts use clean typographic branding + food emojis (no stock photos, so nothing
to license). **Tip:** for even more appetite appeal, add your own real food photos later —
tell me and I'll wire a photo slot into the template.

> On every advert the call-to-action is **"Order on WhatsApp"** + your number, and the
> link you share points to the landing page below.

---

## 3) The landing page (your "link in bio")

A single page with your menu, prices, delivery info, and a big **Order on WhatsApp**
button that opens a pre-filled chat (customers can even tap items to build the order).

**Deploy it free on Netlify (2 minutes):**

1. Go to **app.netlify.com/drop**.
2. Drag the **`landing/`** folder onto the page.
3. Netlify gives you a link like `https://your-kitchen.netlify.app`.
4. Put that link in **every bio**: Instagram, Facebook, TikTok, WhatsApp "catalog"/about, X.

That's the one link all your adverts drive to. (Editing `config.json` and re-dragging the
folder updates the live site.)

**Cost:** ₦0 — Netlify's free tier is plenty for this.

---

## 4) The WhatsApp ordering bot

### What it does
- Greets the customer, shows the menu, takes the order (items → quantity → name →
  delivery address → shows total + delivery fee → asks them to confirm).
- On **confirm**, it:
  - sends **you** (your personal number) the full order + a *tap-to-chat-the-customer* link, and
  - **pauses itself** for that chat so **you take over by hand** ("human intervention").
- A customer can type **`agent`** any time to reach a human immediately.
- Knows your opening hours (tells customers if you're currently closed).

### 🎙️ Voice notes & natural-language orders (built in)
Customers don't have to type item numbers — they can **talk**:
- Send a **voice note** (English, **Hausa**, or Pidgin) → the bot transcribes it (Whisper),
  understands the order, and continues the normal flow.
- Or type naturally, e.g. *"two jollof and a coke"* → the bot (GPT) maps it to the menu.

**Turn it on:** copy `bot/.env.example` to `bot/.env` and add your `OPENAI_API_KEY`.
Without a key the bot still works — it just asks customers to type item numbers.

Settings live in `config.json → ai`:
| Setting | Meaning |
|---|---|
| `transcribeVoiceNotes` | understand customer voice notes (needs key) |
| `understandOrders` | understand typed/spoken natural language (needs key) |
| `replyWithVoice` | bot also answers with a voice note (needs `ffmpeg` installed) |
| `provider` | `openai` (default) or `deepgram` |
| `language` | `auto` (detects Hausa/English/Pidgin) or force e.g. `en` |

**AI cost (tiny):** Whisper ≈ **$0.006/min** of audio, GPT-4o-mini a fraction of a
cent per order. A busy day of voice orders is typically **under $1 (~₦1,500)**. You only
pay for what's used, billed by OpenAI.

### About phone *calls* (deferred, by your choice)
A WhatsApp bot can't auto-answer WhatsApp voice/video **calls** (Meta forbids it). Real
inbound AI phone calls need a telephony provider + number (Africa's Talking is the Nigerian
route). We've chosen to do **WhatsApp voice notes first**; when you're ready to add a phone
line that an AI answers (take order → "hold for confirmation" → call back), tell me and I'll
add the Africa's Talking call agent. Your alert already includes a `wa.me/<customer>` link so
you can **call the customer back** with one tap in the meantime.

### Prerequisites
- A computer or small server with **Node.js 18+**.
- A **separate WhatsApp number** for the business (a cheap second SIM). The bot logs in by
  scanning a QR code, exactly like WhatsApp Web — your phone must have that SIM's WhatsApp.

### Run it
```bash
cd bot
npm install
cp .env.example .env     # then paste your OPENAI_API_KEY (for voice notes) — optional
npm start
```
On first run a **QR code** appears in the terminal. On the business phone:
**WhatsApp → Settings → Linked devices → Link a device → scan the QR.**
When you see `✓ … bot is live`, message the business number from another phone to test.

The login is remembered (in `bot/.wwebjs_auth/`), so you only scan once.

### Owner commands (text these from your personal number to the business number)
| Command | Does |
|---|---|
| `!orders` | shows the last few orders |
| `!resume 2347012345678` | lets the bot handle that customer again |
| `!pause 2347012345678` | stops the bot for that customer (you handle it) |
| `!help` | lists commands |

### Keep it running 24/7
Run on a machine that stays on. To auto-restart on crash/reboot use **pm2**:
```bash
npm i -g pm2
pm2 start index.js --name food-bot
pm2 save && pm2 startup
```

### Where to host (pick one)
| Option | Good for | Rough cost |
|---|---|---|
| **Your own PC / a cheap Android mini-PC at the shop** | starting out | ₦0 (just electricity + data) |
| **Small VPS** (Hetzner, Contabo, DigitalOcean) | always-on, reliable | **~$5–6/month (~₦8k–10k)** |
| Raspberry Pi at the shop | one-time hardware | ~₦40k once, then ₦0 |

> Note: free "serverless"/static hosts (Netlify, Vercel) **cannot** run this bot — it needs a
> process that stays alive. The **landing page** goes on Netlify; the **bot** goes on a PC/VPS.

---

## 💰 Total cost summary

| Item | Cost |
|---|---|
| Adverts (all platforms) | ₦0 (generated here) |
| Landing page hosting (Netlify) | ₦0 |
| Business WhatsApp SIM | price of a new line + data |
| Bot hosting | ₦0 on your own PC, or ~₦8k–10k/mo on a VPS |
| whatsapp-web.js software | ₦0 (open source) |
| Voice notes + AI understanding (OpenAI, pay-per-use) | typically **< $1/day (~₦1.5k)** |
| **Optional custom domain** (e.g. sokototastykitchen.com) | ~₦15k/year |

So you can launch for **₦0 + a SIM** (bot on your own PC), or ~₦8–10k/month for a hands-off
always-on server.

---

## ⚠️ Important: use WhatsApp responsibly

`whatsapp-web.js` automates a **normal** WhatsApp account (it's not Meta's official API).
That's fine for **replying to customers who message you first**, which is exactly what this
bot does. **Do not** use it to send bulk or unsolicited messages — that can get your number
**banned** by WhatsApp. Keep it to genuine customer orders.

### When you outgrow this
If orders get large, move to the **official WhatsApp Cloud API** (Meta): free tier ~1,000
conversations/month, verified business profile, no ban risk. It needs a Meta Business account
and a short setup. The bot's ordering logic ports over — tell me when you're ready and I'll
migrate it.

---

## Questions / finishing touches I can do
- Drop in your **real logo** and **food photos**.
- Add a **printed A5/A4 flyer** version.
- Add **payment-on-confirm** with your bank details auto-sent.
- Migrate to the **official WhatsApp Cloud API**.
- Wire the landing page to a **custom domain**.
