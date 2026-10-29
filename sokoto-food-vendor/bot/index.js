/*
 * Sokoto food vendor — WhatsApp ordering bot (whatsapp-web.js)
 * ------------------------------------------------------------
 * What it does, in plain terms:
 *   1. A customer messages your business WhatsApp number.
 *   2. The bot greets them, shows the menu, and takes the order step by step
 *      (items -> quantity -> name -> delivery address -> confirm).
 *   3. It works out the total + delivery fee and reads it back.
 *   4. When the customer confirms, the bot:
 *        - sends YOU (ownerNotify number) the full order summary + a
 *          "tap to chat the customer" link, and
 *        - PAUSES itself for that customer so you can take over by hand
 *          ("human intervention"). It will not auto-reply to that chat again
 *          until you resume it.
 *   5. A customer can also type "agent" at any time to reach a human.
 *
 * Config (name, number, menu, prices, hours, delivery fee) is read from
 * ../landing/config.json — the SAME file the website uses. Edit it once.
 *
 * NOTE: whatsapp-web.js is an UNOFFICIAL automation of WhatsApp. Use it only
 * for your own customers who message you first. Do not send bulk/unsolicited
 * messages — that risks your number being banned by WhatsApp. See the README.
 */

const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

// ---- load config (single source of truth, shared with the website) ----
const CONFIG_PATH = path.join(__dirname, "..", "landing", "config.json");
let CFG = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const naira = (n) => CFG.business.currency + Number(n).toLocaleString("en-NG");

const OWNER = String(CFG.business.ownerNotify).replace(/\D/g, "");
const ORDERS_LOG = path.join(__dirname, "orders.json");

// ---- per-customer conversation state (in memory) ----
// NOTE: state resets if the process restarts. For production persistence,
// swap this Map for a small file/db (see README). Orders are still logged.
const sessions = new Map(); // chatId -> { step, order:[], name, address }
const STEP = {
  IDLE: "idle",
  ORDERING: "ordering",
  NAME: "await_name",
  ADDRESS: "await_address",
  CONFIRM: "await_confirm",
  PAUSED: "paused", // human has taken over
};
const get = (id) => sessions.get(id) || { step: STEP.IDLE, order: [] };
const set = (id, s) => sessions.set(id, s);

// ---- helpers ----
function isOpenNow() {
  try {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })
    );
    const [oh, om] = CFG.hours.open.split(":").map(Number);
    const [ch, cm] = CFG.hours.close.split(":").map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= oh * 60 + om && mins <= ch * 60 + cm;
  } catch {
    return true;
  }
}

function menuText() {
  const cats = [];
  CFG.menu.forEach((m) => !cats.includes(m.cat) && cats.push(m.cat));
  let t = `*${CFG.business.name} — Menu* 🍽️\n_Reply with item numbers, e.g. *1 x2, 8* (two Jollof + one Shawarma)._\n`;
  cats.forEach((c) => {
    t += `\n*${c}*\n`;
    CFG.menu.filter((m) => m.cat === c).forEach((m) => {
      t += `${m.id}. ${m.name} — ${naira(m.price)}\n`;
    });
  });
  t += `\nWhen you're done adding, type *done*. Type *cancel* to start over.`;
  return t;
}

// parse "1 x2, 8, 3*1" -> [{item, qty}]
function parseItems(text) {
  const out = [];
  text.split(/[,\n]+/).forEach((tok) => {
    const m = tok.match(/(\d+)\s*(?:x|\*|×)?\s*(\d+)?/i);
    if (!m) return;
    const id = parseInt(m[1], 10);
    const qty = Math.max(1, parseInt(m[2] || "1", 10));
    const item = CFG.menu.find((x) => x.id === id);
    if (item) out.push({ item, qty });
  });
  return out;
}

function orderLines(order) {
  return order.map((o) => `• ${o.qty} x ${o.item.name} — ${naira(o.qty * o.item.price)}`).join("\n");
}
function subtotal(order) {
  return order.reduce((s, o) => s + o.qty * o.item.price, 0);
}
function deliveryFee(sub) {
  return CFG.delivery.freeFrom && sub >= CFG.delivery.freeFrom ? 0 : CFG.delivery.feeFlat;
}
function summary(s) {
  const sub = subtotal(s.order);
  const fee = deliveryFee(sub);
  return (
    `${orderLines(s.order)}\n\n` +
    `Subtotal: ${naira(sub)}\n` +
    `Delivery: ${fee ? naira(fee) : "FREE"}\n` +
    `*Total: ${naira(sub + fee)}*`
  );
}
function logOrder(ref, chatId, s) {
  let all = [];
  try { all = JSON.parse(fs.readFileSync(ORDERS_LOG, "utf8")); } catch {}
  all.push({
    ref, at: new Date().toISOString(), customer: chatId.replace("@c.us", ""),
    name: s.name || "", address: s.address || "",
    items: s.order.map((o) => ({ name: o.item.name, qty: o.qty, price: o.item.price })),
    total: subtotal(s.order) + deliveryFee(subtotal(s.order)),
  });
  fs.writeFileSync(ORDERS_LOG, JSON.stringify(all, null, 2));
}

// ---- WhatsApp client ----
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, ".wwebjs_auth") }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // On a cheap server with Chromium installed, set the path instead of
    // downloading one: executablePath: "/usr/bin/chromium-browser",
  },
});

client.on("qr", (qr) => {
  console.log("\nScan this QR with the BUSINESS WhatsApp (Linked devices):\n");
  qrcode.generate(qr, { small: true });
});
client.on("authenticated", () => console.log("✓ Authenticated."));
client.on("ready", () => console.log(`✓ ${CFG.business.name} bot is live. Waiting for customers…`));
client.on("disconnected", (r) => console.log("Disconnected:", r));

client.on("message", async (msg) => {
  try {
    if (msg.from.endsWith("@g.us")) return; // ignore groups
    const chatId = msg.from;
    const from = chatId.replace(/\D/g, "");
    const text = (msg.body || "").trim();
    const lc = text.toLowerCase();

    // ---------- OWNER COMMANDS (from your personal number) ----------
    if (from === OWNER && text.startsWith("!")) {
      const [cmd, arg] = [lc.split(/\s+/)[0], text.split(/\s+/)[1]];
      if (cmd === "!help")
        return msg.reply("Owner commands:\n!orders — recent orders\n!resume <number> — let the bot handle that chat again\n!pause <number> — stop the bot for that chat");
      if (cmd === "!orders") {
        let all = [];
        try { all = JSON.parse(fs.readFileSync(ORDERS_LOG, "utf8")); } catch {}
        const last = all.slice(-5).reverse().map((o) => `${o.ref} · ${o.name || o.customer} · ${naira(o.total)}`).join("\n");
        return msg.reply(last ? `Last orders:\n${last}` : "No orders logged yet.");
      }
      if (cmd === "!resume" && arg) {
        const id = arg.replace(/\D/g, "") + "@c.us";
        set(id, { step: STEP.IDLE, order: [] });
        return msg.reply(`Bot resumed for ${arg}.`);
      }
      if (cmd === "!pause" && arg) {
        const id = arg.replace(/\D/g, "") + "@c.us";
        set(id, { ...get(id), step: STEP.PAUSED });
        return msg.reply(`Bot paused for ${arg}. You handle that chat now.`);
      }
      return;
    }

    const s = get(chatId);

    // ---------- while a human is handling this chat ----------
    if (s.step === STEP.PAUSED) {
      // Let the customer restart the bot themselves if they say so:
      if (["menu", "order", "restart", "start"].includes(lc)) {
        set(chatId, { step: STEP.ORDERING, order: [] });
        return msg.reply(menuText());
      }
      return; // otherwise stay silent — the owner is replying by hand
    }

    // ---------- universal commands ----------
    if (["cancel", "restart", "start over"].includes(lc)) {
      set(chatId, { step: STEP.IDLE, order: [] });
      return msg.reply("No problem, I've cleared that. Type *menu* to start again. 🙂");
    }
    if (["agent", "human", "call", "help me", "speak to someone"].includes(lc)) {
      set(chatId, { ...s, step: STEP.PAUSED });
      await notifyOwner(`🙋 *Customer wants a human*\nFrom: wa.me/${from}\nSay hi 👋`);
      return msg.reply(`Got it — someone from ${CFG.business.name} will reply here shortly. 🙏`);
    }
    if (["hi", "hello", "hey", "menu", "order", "good morning", "good afternoon", "good evening"].includes(lc) || s.step === STEP.IDLE) {
      const closed = isOpenNow() ? "" : `\n\n⚠️ We're currently *closed* (${CFG.hours.label}). You can still place your order and we'll prepare it when we open.`;
      set(chatId, { step: STEP.ORDERING, order: [] });
      return msg.reply(`Welcome to *${CFG.business.name}* 🍲\n${CFG.business.tagline}.${closed}\n\n${menuText()}`);
    }

    // ---------- order flow ----------
    if (s.step === STEP.ORDERING) {
      if (lc === "done") {
        if (!s.order.length) return msg.reply("Your basket is empty. Add items by number first (e.g. *1 x2*), then type *done*.");
        set(chatId, { ...s, step: STEP.NAME });
        return msg.reply(`Nice choice! 😋\n\n${summary(s)}\n\nWhat *name* should we put on the order?`);
      }
      const picked = parseItems(text);
      if (!picked.length)
        return msg.reply("Please reply with item *numbers*, e.g. *1 x2, 8*. Type *menu* to see the list again, or *done* when finished.");
      // merge into the basket
      picked.forEach((p) => {
        const ex = s.order.find((o) => o.item.id === p.item.id);
        if (ex) ex.qty += p.qty; else s.order.push(p);
      });
      set(chatId, s);
      return msg.reply(`Added ✅\n\n${summary(s)}\n\nAdd more by number, or type *done* to continue.`);
    }

    if (s.step === STEP.NAME) {
      s.name = text.slice(0, 60);
      set(chatId, { ...s, step: STEP.ADDRESS });
      return msg.reply(`Thanks ${s.name}! 📍 What's your *delivery address* in Sokoto? (area + landmark, or send your live location)`);
    }

    if (s.step === STEP.ADDRESS) {
      s.address = text.slice(0, 200);
      set(chatId, { ...s, step: STEP.CONFIRM });
      return msg.reply(
        `Please confirm your order:\n\n${summary(s)}\n\n👤 ${s.name}\n📍 ${s.address}\n\n${CFG.payment.label}\n\nReply *YES* to place the order, or *cancel* to start over.`
      );
    }

    if (s.step === STEP.CONFIRM) {
      if (["yes", "y", "confirm", "ok", "okay"].includes(lc)) {
        const ref = "ORD" + Date.now().toString().slice(-6);
        logOrder(ref, chatId, s);
        // Hand off to the human: notify owner, pause this chat.
        await notifyOwner(
          `🧾 *NEW ORDER ${ref}*\n\n${summary(s)}\n\n👤 ${s.name}\n📍 ${s.address}\n📱 Customer: wa.me/${from}\n\nReply to the customer directly to confirm payment & delivery.\n_(Bot is now paused for this chat. Type !resume ${from} to re-enable it.)_`
        );
        set(chatId, { ...s, step: STEP.PAUSED });
        return msg.reply(
          `🎉 Order *${ref}* received, ${s.name}!\n\n${summary(s)}\n\nWe'll confirm payment & delivery here in a moment. Thank you for choosing ${CFG.business.name}! 🍽️`
        );
      }
      if (["no", "n", "cancel"].includes(lc)) {
        set(chatId, { step: STEP.IDLE, order: [] });
        return msg.reply("Cancelled. Type *menu* whenever you're ready. 🙂");
      }
      return msg.reply("Reply *YES* to place the order, or *cancel* to start over.");
    }
  } catch (e) {
    console.error("message handler error:", e);
  }
});

async function notifyOwner(body) {
  try {
    if (!OWNER || OWNER === "2348000000000") {
      console.log("[owner notify skipped — set ownerNotify in config.json]\n" + body);
      return;
    }
    await client.sendMessage(OWNER + "@c.us", body);
  } catch (e) {
    console.error("could not notify owner:", e.message);
  }
}

console.log("Starting WhatsApp bot… (first run shows a QR code to scan)");
client.initialize();
