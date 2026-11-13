/*
 * Sokoto food vendor — WhatsApp ordering bot (whatsapp-web.js) + voice notes
 * -------------------------------------------------------------------------
 * Customers can order by TYPING or by sending a VOICE NOTE (English/Hausa/
 * Pidgin). The bot:
 *   1. Greets, shows the menu.
 *   2. Understands the order (item numbers, OR natural language like
 *      "two jollof and a coke" via GPT, OR a voice note via Whisper).
 *   3. Collects name + delivery address, reads back the total + delivery fee.
 *   4. On confirm, tells the customer to HOLD FOR CONFIRMATION, alerts YOU
 *      with the full order + a tap-to-chat/call link, and PAUSES itself for
 *      that chat so you take over (price/delivery/call-back) by hand.
 *   5. "agent" at any time reaches a human immediately.
 *
 * Config: ../landing/config.json (shared with the website).
 * AI keys: bot/.env  (OPENAI_API_KEY). Without a key the bot still works with
 * typed item numbers; voice notes then ask the customer to type instead.
 *
 * NOTE: whatsapp-web.js automates a NORMAL WhatsApp number. Use it only to
 * reply to customers who message you first. See README for the ban-risk note.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const voiceAI = require("./voice");

const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "landing", "config.json"), "utf8"));
const AI = CFG.ai || {};
const naira = (n) => CFG.business.currency + Number(n).toLocaleString("en-NG");
const OWNER = String(CFG.business.ownerNotify).replace(/\D/g, "");
const ORDERS_LOG = path.join(__dirname, "orders.json");
const TMP = path.join(__dirname, ".tmp");
fs.mkdirSync(TMP, { recursive: true });
const hasAIKey = () => !!process.env.OPENAI_API_KEY || !!process.env.DEEPGRAM_API_KEY;

// ---- per-customer conversation state (in memory) ----
const sessions = new Map();
const STEP = { IDLE: "idle", ORDERING: "ordering", NAME: "await_name", ADDRESS: "await_address", CONFIRM: "await_confirm", PAUSED: "paused" };
const get = (id) => sessions.get(id) || { step: STEP.IDLE, order: [] };
const set = (id, s) => sessions.set(id, s);

const DONE_WORDS = ["done", "that's all", "thats all", "that is all", "finish", "finished", "i'm done", "im done", "nothing else", "that's it", "thats it"];
const AGENT_WORDS = ["agent", "human", "call", "call me", "help me", "speak to someone", "talk to someone"];

// ---- helpers ----
function isOpenNow() {
  try {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
    const [oh, om] = CFG.hours.open.split(":").map(Number);
    const [ch, cm] = CFG.hours.close.split(":").map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= oh * 60 + om && mins <= ch * 60 + cm;
  } catch { return true; }
}
function menuText() {
  const cats = [];
  CFG.menu.forEach((m) => !cats.includes(m.cat) && cats.push(m.cat));
  let t = `*${CFG.business.name} — Menu* 🍽️\n_Reply with item numbers (e.g. *1 x2, 8*), type it in words, or send a *voice note* — I'll understand._\n`;
  cats.forEach((c) => {
    t += `\n*${c}*\n`;
    CFG.menu.filter((m) => m.cat === c).forEach((m) => (t += `${m.id}. ${m.name} — ${naira(m.price)}\n`));
  });
  t += `\nWhen finished, say *done*. Say *cancel* to start over.`;
  return t;
}
function parseItems(text) {
  const out = [];
  text.split(/[,\n]+/).forEach((tok) => {
    const m = tok.match(/(\d+)\s*(?:x|\*|×)?\s*(\d+)?/i);
    if (!m) return;
    const item = CFG.menu.find((x) => x.id === parseInt(m[1], 10));
    if (item) out.push({ item, qty: Math.max(1, parseInt(m[2] || "1", 10)) });
  });
  return out;
}
const orderLines = (o) => o.map((x) => `• ${x.qty} x ${x.item.name} — ${naira(x.qty * x.item.price)}`).join("\n");
const subtotal = (o) => o.reduce((s, x) => s + x.qty * x.item.price, 0);
const deliveryFee = (sub) => (CFG.delivery.freeFrom && sub >= CFG.delivery.freeFrom ? 0 : CFG.delivery.feeFlat);
function summary(s) {
  const sub = subtotal(s.order), fee = deliveryFee(sub);
  return `${orderLines(s.order)}\n\nSubtotal: ${naira(sub)}\nDelivery: ${fee ? naira(fee) : "FREE"}\n*Total: ${naira(sub + fee)}*`;
}
function addItems(s, picked) {
  picked.forEach((p) => {
    const ex = s.order.find((o) => o.item.id === p.item.id);
    if (ex) ex.qty += p.qty; else s.order.push(p);
  });
}
function logOrder(ref, chatId, s) {
  let all = [];
  try { all = JSON.parse(fs.readFileSync(ORDERS_LOG, "utf8")); } catch {}
  all.push({ ref, at: new Date().toISOString(), customer: chatId.replace("@c.us", ""), name: s.name || "", address: s.address || "",
    items: s.order.map((o) => ({ name: o.item.name, qty: o.qty, price: o.item.price })), total: subtotal(s.order) + deliveryFee(subtotal(s.order)) });
  fs.writeFileSync(ORDERS_LOG, JSON.stringify(all, null, 2));
}

// ---- WhatsApp client ----
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, ".wwebjs_auth") }),
  puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
});
client.on("qr", (qr) => { console.log("\nScan this QR with the BUSINESS WhatsApp (Linked devices):\n"); qrcode.generate(qr, { small: true }); });
client.on("authenticated", () => console.log("✓ Authenticated."));
client.on("ready", () => console.log(`✓ ${CFG.business.name} bot is live.${hasAIKey() ? " Voice notes ON." : " (No AI key — typed orders only.)"}`));
client.on("disconnected", (r) => console.log("Disconnected:", r));

// send a reply (and, if enabled, also a voice-note version)
async function say(chatId, text, wantVoice) {
  await client.sendMessage(chatId, text);
  if (wantVoice && AI.replyWithVoice && process.env.OPENAI_API_KEY) {
    try {
      const mp3 = path.join(TMP, `r_${Date.now()}.mp3`);
      await voiceAI.speak(text.replace(/[*_~`]/g, ""), mp3, AI);
      const media = MessageMedia.fromFilePath(mp3);
      await client.sendMessage(chatId, media, { sendAudioAsVoice: true });
      fs.unlink(mp3, () => {});
    } catch (e) { console.error("voice reply failed (text was sent):", e.message); }
  }
}
async function notifyOwner(body) {
  if (!OWNER || OWNER === "2348000000000") { console.log("[owner notify skipped — set ownerNotify in config.json]\n" + body); return; }
  try { await client.sendMessage(OWNER + "@c.us", body); } catch (e) { console.error("notify owner:", e.message); }
}

client.on("message", async (msg) => {
  try {
    if (msg.from.endsWith("@g.us")) return; // ignore groups
    const chatId = msg.from;
    const from = chatId.replace(/\D/g, "");

    // ---- OWNER COMMANDS (typed from your personal number) ----
    if (from === OWNER && (msg.body || "").startsWith("!")) return ownerCommand(msg);

    // ---- resolve the message text (typed OR transcribed voice note) ----
    let text = (msg.body || "").trim();
    let wantVoice = false;
    const isVoice = msg.type === "ptt" || msg.type === "audio";
    if (isVoice) {
      wantVoice = true;
      if (!AI.transcribeVoiceNotes || !hasAIKey()) {
        return say(chatId, "🎙️ I got your voice note! I can't play it back right now — please *type* your order, or type *menu* to see the list.");
      }
      try {
        const media = await msg.downloadMedia();
        const file = path.join(TMP, `v_${Date.now()}.ogg`);
        fs.writeFileSync(file, Buffer.from(media.data, "base64"));
        text = (await voiceAI.transcribe(file, AI)) || "";
        fs.unlink(file, () => {});
      } catch (e) {
        console.error("transcription error:", e.message);
        return say(chatId, "🎙️ Sorry, I couldn't hear that clearly. Please send it again or type your order.");
      }
      if (!text) return say(chatId, "🎙️ I couldn't catch that — please try again or type your order.");
      await client.sendMessage(chatId, `🎙️ I heard: "_${text}_"`);
    }

    await route(chatId, text, wantVoice);
  } catch (e) { console.error("handler error:", e); }
});

async function route(chatId, text, wantVoice) {
  const lc = text.toLowerCase().trim();
  const s = get(chatId);

  // while a human is handling this chat
  if (s.step === STEP.PAUSED) {
    if (["menu", "order", "restart", "start"].includes(lc)) { set(chatId, { step: STEP.ORDERING, order: [] }); return say(chatId, menuText(), wantVoice); }
    return; // stay silent — owner is replying by hand
  }

  if (["cancel", "restart", "start over"].includes(lc)) { set(chatId, { step: STEP.IDLE, order: [] }); return say(chatId, "No problem, cleared. Say *menu* to start again. 🙂", wantVoice); }
  if (AGENT_WORDS.includes(lc)) {
    set(chatId, { ...s, step: STEP.PAUSED });
    await notifyOwner(`🙋 *Customer wants a human*\nFrom: wa.me/${chatId.replace(/\D/g, "")}\nSay hi 👋`);
    return say(chatId, `Got it — someone from ${CFG.business.name} will reply here shortly. 🙏`, wantVoice);
  }
  if (["hi", "hello", "hey", "menu", "order", "good morning", "good afternoon", "good evening", "salam", "sannu"].includes(lc) || s.step === STEP.IDLE) {
    const closed = isOpenNow() ? "" : `\n\n⚠️ We're currently *closed* (${CFG.hours.label}). You can still order and we'll prepare it when we open.`;
    set(chatId, { step: STEP.ORDERING, order: [] });
    return say(chatId, `Welcome to *${CFG.business.name}* 🍲\n${CFG.business.tagline}.${closed}\n\n${menuText()}`, wantVoice);
  }

  if (s.step === STEP.ORDERING) {
    if (DONE_WORDS.includes(lc)) {
      if (!s.order.length) return say(chatId, "Your basket is empty. Add items first (numbers like *1 x2*, words, or a voice note), then say *done*.", wantVoice);
      set(chatId, { ...s, step: STEP.NAME });
      return say(chatId, `Nice choice! 😋\n\n${summary(s)}\n\nWhat *name* should we put on the order?`, wantVoice);
    }
    // 1) try item numbers; 2) fall back to AI natural-language understanding
    let picked = parseItems(text);
    if (!picked.length && AI.understandOrders && process.env.OPENAI_API_KEY) {
      try {
        const ai = await voiceAI.extractItems(text, CFG.menu);
        if (ai && ai.length) picked = ai.map((x) => ({ item: CFG.menu.find((m) => m.id === x.id), qty: x.qty })).filter((x) => x.item);
      } catch (e) { console.error("extractItems:", e.message); }
    }
    if (!picked.length)
      return say(chatId, "I didn't catch any items. Reply with numbers (e.g. *1 x2, 8*), say the dishes in words, or send a voice note. Type *menu* to see the list, or *done* when finished.", wantVoice);
    addItems(s, picked); set(chatId, s);
    return say(chatId, `Added ✅\n\n${summary(s)}\n\nAdd more, or say *done* to continue.`, wantVoice);
  }

  if (s.step === STEP.NAME) {
    s.name = text.slice(0, 60); set(chatId, { ...s, step: STEP.ADDRESS });
    return say(chatId, `Thanks ${s.name}! 📍 What's your *delivery address* in Sokoto? (area + landmark, or share your live location)`, wantVoice);
  }
  if (s.step === STEP.ADDRESS) {
    s.address = text.slice(0, 200); set(chatId, { ...s, step: STEP.CONFIRM });
    return say(chatId, `Please confirm your order:\n\n${summary(s)}\n\n👤 ${s.name}\n📍 ${s.address}\n\n${CFG.payment.label}\n\nReply *YES* to place it, or *cancel* to start over.`, wantVoice);
  }
  if (s.step === STEP.CONFIRM) {
    if (["yes", "y", "confirm", "ok", "okay", "yes please", "go ahead"].includes(lc)) {
      const ref = "ORD" + Date.now().toString().slice(-6);
      logOrder(ref, chatId, s);
      await notifyOwner(`🧾 *NEW ORDER ${ref}*\n\n${summary(s)}\n\n👤 ${s.name}\n📍 ${s.address}\n📱 Customer: wa.me/${chatId.replace(/\D/g, "")}\n\nConfirm price & delivery with them (reply here, or call back). _(Bot paused for this chat — type !resume ${chatId.replace(/\D/g, "")} to re-enable it.)_`);
      set(chatId, { ...s, step: STEP.PAUSED });
      return say(chatId, `🎉 Order *${ref}* received, ${s.name}!\n\n${summary(s)}\n\n⏳ *Please hold for confirmation* — we'll confirm the price & delivery here in a moment, and may call you to confirm. Thank you for choosing ${CFG.business.name}! 🍽️`, wantVoice);
    }
    if (["no", "n", "cancel"].includes(lc)) { set(chatId, { step: STEP.IDLE, order: [] }); return say(chatId, "Cancelled. Say *menu* whenever you're ready. 🙂", wantVoice); }
    return say(chatId, "Reply *YES* to place the order, or *cancel* to start over.", wantVoice);
  }
}

async function ownerCommand(msg) {
  const parts = msg.body.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase(); const arg = parts[1];
  if (cmd === "!help") return msg.reply("Owner commands:\n!orders — recent orders\n!resume <number> — bot handles that chat again\n!pause <number> — stop the bot for that chat");
  if (cmd === "!orders") {
    let all = []; try { all = JSON.parse(fs.readFileSync(ORDERS_LOG, "utf8")); } catch {}
    const last = all.slice(-5).reverse().map((o) => `${o.ref} · ${o.name || o.customer} · ${naira(o.total)}`).join("\n");
    return msg.reply(last ? `Last orders:\n${last}` : "No orders logged yet.");
  }
  if (cmd === "!resume" && arg) { set(arg.replace(/\D/g, "") + "@c.us", { step: STEP.IDLE, order: [] }); return msg.reply(`Bot resumed for ${arg}.`); }
  if (cmd === "!pause" && arg) { const id = arg.replace(/\D/g, "") + "@c.us"; set(id, { ...get(id), step: STEP.PAUSED }); return msg.reply(`Bot paused for ${arg}.`); }
}

console.log("Starting WhatsApp bot… (first run shows a QR code to scan)");
client.initialize();
