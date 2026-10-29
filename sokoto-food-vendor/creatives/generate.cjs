/*
 * Generates branded advert images for every major platform from config.json.
 * Run:  node generate.cjs
 * Output: ./out/*.png
 *
 * Sizes:
 *   feed-square  1080x1080  Instagram / Facebook feed
 *   story        1080x1920  Instagram & Facebook Story, WhatsApp Status, Reels cover
 *   link-card    1200x630   Facebook link share / X (Twitter) card
 *   flyer        1080x1350  Instagram portrait / printable flyer
 */
const fs = require("fs");
const path = require("path");

const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "landing", "config.json"), "utf8"));
const B = CFG.business;
const naira = (n) => B.currency + Number(n).toLocaleString("en-NG");
const phone = B.phone && !B.phone.includes("000") ? B.phone : "+234 ___ ___ ____";

// a few highlight dishes (ids), falls back to first four on the menu
const HIGHLIGHT_IDS = [1, 8, 6, 10];
const highlights = HIGHLIGHT_IDS.map((id) => CFG.menu.find((m) => m.id === id)).filter(Boolean);
const picks = highlights.length ? highlights : CFG.menu.slice(0, 4);

function page(w, h) {
  const wide = w > h;
  // scalable unit: base on width normally, but on HEIGHT for wide/short cards
  // so content fits the short dimension.
  const u = wide ? h / 70 : w / 100;
  const emoji = ["🍛", "🌯", "🍔", "🍲", "🍚", "🍟", "🥤", "🍢"];
  const deco = Array.from({ length: wide ? 6 : 10 })
    .map((_, i) => {
      const e = emoji[i % emoji.length];
      const top = (i * 97) % 100;
      const left = (i * 53) % 100;
      const rot = ((i * 37) % 60) - 30;
      const sz = 6 + ((i * 13) % 6);
      return `<span class="deco" style="top:${top}%;left:${left}%;transform:rotate(${rot}deg);font-size:${sz * u}px">${e}</span>`;
    })
    .join("");

  // how many menu tiles fit this shape without overflowing
  const nPicks = wide ? 3 : h / w >= 1.6 ? 6 : h / w >= 1.2 ? 4 : 2;
  const pool = picks.concat(CFG.menu.filter((m) => !picks.some((p) => p.id === m.id)));
  const picksToShow = pool.slice(0, nPicks);
  const pickHtml = picksToShow
    .map(
      (p) => `<div class="pick"><span class="pe">${pe(p.name)}</span>
        <span class="pn">${p.name}</span><span class="pp">${naira(p.price)}</span></div>`
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf8"/>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;overflow:hidden}
  body{font-family:Inter,system-ui,sans-serif;color:#fff;position:relative;
    background:radial-gradient(${60 * u}px ${40 * u}px at 85% 6%,rgba(245,166,35,.65),transparent),
               radial-gradient(${70 * u}px ${50 * u}px at 10% 100%,rgba(18,138,59,.45),transparent),
               linear-gradient(135deg,#e23b2e 0%,#b81f14 55%,#7d140b 100%)}
  .deco{position:absolute;opacity:.12;filter:grayscale(.1)}
  .frame{position:absolute;inset:${3.5 * u}px;border:${0.5 * u}px solid rgba(255,255,255,.28);border-radius:${5 * u}px}
  .pad{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;overflow:hidden;
    padding:${6 * u}px ${6.5 * u}px;${wide ? "justify-content:center" : ""}}
  .top{display:flex;align-items:center;gap:${2.4 * u}px}
  .logo{width:${11 * u}px;height:${11 * u}px;border-radius:${3 * u}px;background:#fff;display:grid;place-items:center;font-size:${6.5 * u}px;box-shadow:0 ${1 * u}px ${3 * u}px rgba(0,0,0,.25)}
  .bn{font-family:"Baloo 2";font-weight:800;font-size:${6 * u}px;line-height:1}
  .bl{font-size:${2.5 * u}px;opacity:.9;margin-top:${0.6 * u}px}
  .eyebrow{display:inline-block;background:#128a3b;color:#fff;font-weight:800;font-size:${2.8 * u}px;
    letter-spacing:.12em;padding:${1.3 * u}px ${3 * u}px;border-radius:999px;margin:${3.4 * u}px 0 ${1.8 * u}px;align-self:flex-start;text-transform:uppercase}
  h1{font-family:"Baloo 2";font-weight:800;font-size:${wide ? 8 * u : h / w < 1.1 ? 8.8 * u : 10 * u}px;line-height:.98;letter-spacing:-.01em;
    text-shadow:0 ${0.6 * u}px ${2 * u}px rgba(0,0,0,.25)}
  h1 .y{color:#ffd23f}
  .sub{font-size:${3.2 * u}px;font-weight:600;opacity:.96;margin-top:${1.8 * u}px;max-width:${wide ? 55 : 94}%}
  .picks{display:${wide ? "flex" : "grid"};${wide ? "gap:" + 2 * u + "px;flex-wrap:wrap" : "grid-template-columns:1fr 1fr;gap:" + 2.2 * u + "px"};margin-top:${3.5 * u}px}
  .pick{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);border-radius:${3 * u}px;
    padding:${2.2 * u}px ${2.6 * u}px;display:flex;align-items:center;gap:${1.6 * u}px;${wide ? "flex:1;min-width:" + 34 * u + "px" : ""}}
  .pe{font-size:${5 * u}px}
  .pn{font-weight:700;font-size:${2.9 * u}px;flex:1;line-height:1.05}
  .pp{font-family:"Baloo 2";font-weight:800;font-size:${3.1 * u}px;color:#ffd23f;white-space:nowrap}
  .spacer{flex:1}
  .deliv{display:inline-flex;align-items:center;gap:${1.4 * u}px;background:#ffd23f;color:#7d140b;font-weight:800;
    font-size:${3.1 * u}px;padding:${1.6 * u}px ${3.2 * u}px;border-radius:999px;margin-top:${2.6 * u}px;align-self:flex-start}
  .cta{display:flex;align-items:center;gap:${2.2 * u}px;margin-top:${2.4 * u}px;background:#25D366;border-radius:999px;
    padding:${2.4 * u}px ${3.4 * u}px;align-self:flex-start;box-shadow:0 ${1.4 * u}px ${4 * u}px rgba(0,0,0,.3)}
  .cta .wa{font-size:${5.5 * u}px}
  .cta .t{line-height:1.05}
  .cta .t b{font-family:"Baloo 2";font-weight:800;font-size:${4 * u}px;display:block}
  .cta .t span{font-size:${2.7 * u}px;opacity:.95}
  .foot{margin-top:${1.8 * u}px;display:flex;align-items:center;gap:${1.6 * u}px;font-size:${2.6 * u}px;font-weight:600;opacity:.95;flex-wrap:wrap}
  .pill{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.26);padding:${1 * u}px ${2.2 * u}px;border-radius:999px}
</style></head>
<body>
  ${deco}
  <div class="frame"></div>
  <div class="pad">
    <div class="top">
      <div class="logo">🍲</div>
      <div><div class="bn">${B.name}</div><div class="bl">${B.tagline}</div></div>
    </div>
    ${
      wide
        ? `<h1 style="margin-top:${2.4 * u}px">Hot meals, <span class="y">delivered</span><br>anywhere in Sokoto.</h1>
    <div class="sub" style="margin-top:${1.8 * u}px;max-width:72%">Formal dishes + fast food, cooked fresh at ${B.location}.</div>
    <div class="row" style="display:flex;align-items:center;gap:${2.4 * u}px;flex-wrap:wrap">
      <div class="deliv">🛵 ${CFG.delivery.label.split(".")[0]}</div>
      <div class="cta"><span class="wa">🟢</span><div class="t"><b>Order on WhatsApp</b><span>${phone}</span></div></div>
    </div>`
        : `<span class="eyebrow">Food delivery · Sokoto</span>
    <h1>Hot meals,<br><span class="y">delivered</span> to you.</h1>
    <div class="sub">Formal dishes + fast food, cooked fresh at ${B.location} and delivered anywhere in Sokoto.</div>
    <div class="picks">${pickHtml}</div>
    <div class="spacer"></div>
    <div class="deliv">🛵 ${CFG.delivery.label.split(".")[0]}</div>
    <div class="cta"><span class="wa">🟢</span><div class="t"><b>Order on WhatsApp</b><span>${phone}</span></div></div>
    <div class="foot"><span class="pill">⏰ ${CFG.hours.label.replace("Open daily, ", "")}</span><span class="pill">📍 ${B.location}</span><span class="pill">💳 Pay on delivery</span></div>`
    }
  </div>
</body></html>`;
}

function pe(name) {
  const n = name.toLowerCase();
  const map = { jollof: "🍛", fried: "🍚", rice: "🍚", beans: "🫘", pounded: "🍠", amala: "🍲", spaghetti: "🍝", shawarma: "🌯", burger: "🍔", chips: "🍟", pie: "🥟", chops: "🍢", water: "💧", soft: "🥤", zobo: "🧃" };
  for (const k in map) if (n.includes(k)) return map[k];
  return "🍽️";
}

const SIZES = [
  ["feed-square", 1080, 1080],
  ["story", 1080, 1920],
  ["link-card", 1200, 630],
  ["flyer", 1080, 1350],
];

(async () => {
  const { chromium } = require(process.env.PW || "/opt/node-tools/node_modules/playwright");
  const outDir = path.join(__dirname, "out");
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || "/opt/pw-browsers/chromium" });
  for (const [name, w, h] of SIZES) {
    const pg = await browser.newPage({ viewport: { width: w, height: h } });
    await pg.setContent(page(w, h), { waitUntil: "networkidle" });
    await pg.waitForTimeout(600);
    await pg.screenshot({ path: path.join(outDir, `${name}.png`) });
    await pg.close();
    console.log("✓", name, `${w}x${h}`);
  }
  await browser.close();
  console.log("Done →", outDir);
})();
