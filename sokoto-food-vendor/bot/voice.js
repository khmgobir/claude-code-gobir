/*
 * Voice + AI helpers for the WhatsApp bot.
 *  - transcribe(): turn a customer's voice note into text (Whisper).
 *  - extractItems(): understand a natural-language order ("two jollof and a coke")
 *    and map it to menu item ids (GPT-4o-mini).
 *  - speak(): optional — turn the bot's reply into an audio file (TTS) so it can
 *    answer with a voice note.
 *
 * Provider is swappable. Default is OpenAI. Set keys in bot/.env:
 *    OPENAI_API_KEY=sk-...
 *    (optional) DEEPGRAM_API_KEY=...   # if ai.provider = "deepgram"
 *
 * Whisper auto-detects language, so Hausa / English / Pidgin voice notes all work.
 * Node 18+ provides fetch / FormData / Blob globally (no extra packages needed).
 */
const fs = require("fs");
const path = require("path");

const OPENAI = "https://api.openai.com/v1";

async function transcribe(filePath, ai) {
  const provider = (ai && ai.provider) || "openai";
  if (provider === "deepgram") return transcribeDeepgram(filePath, ai);
  return transcribeOpenAI(filePath, ai);
}

async function transcribeOpenAI(filePath, ai) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const fd = new FormData();
  fd.append("model", "whisper-1");
  fd.append("file", new Blob([fs.readFileSync(filePath)]), path.basename(filePath));
  if (ai && ai.language && ai.language !== "auto") fd.append("language", ai.language);
  const r = await fetch(`${OPENAI}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: fd,
  });
  if (!r.ok) throw new Error(`Whisper ${r.status}: ${await r.text()}`);
  return (await r.json()).text?.trim() || "";
}

async function transcribeDeepgram(filePath, ai) {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) return null;
  const r = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true" +
      (ai && ai.language && ai.language !== "auto" ? `&language=${ai.language}` : "&detect_language=true"),
    { method: "POST", headers: { Authorization: `Token ${key}`, "Content-Type": "audio/ogg" }, body: fs.readFileSync(filePath) }
  );
  if (!r.ok) throw new Error(`Deepgram ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() || "";
}

// Map a natural-language order to menu item ids. Returns [{id, qty}] (possibly []).
async function extractItems(text, menu) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null; // caller falls back to the number parser
  const list = menu.map((m) => `${m.id}: ${m.name} (${m.price})`).join("\n");
  const sys =
    `You convert a customer's food order into menu item IDs.\nMENU (id: name (price)):\n${list}\n\n` +
    `Return ONLY JSON: {"items":[{"id":<number>,"qty":<number>}]}. ` +
    `Include an item only if it clearly matches a menu line. Quantities default to 1. ` +
    `If the message contains no orderable items, return {"items":[]}.`;
  const r = await fetch(`${OPENAI}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [ { role: "system", content: sys }, { role: "user", content: text } ],
    }),
  });
  if (!r.ok) throw new Error(`GPT ${r.status}: ${await r.text()}`);
  const content = (await r.json()).choices?.[0]?.message?.content || "{}";
  let parsed = {};
  try { parsed = JSON.parse(content); } catch { parsed = {}; }
  return (parsed.items || [])
    .map((it) => ({ id: Number(it.id), qty: Math.max(1, Number(it.qty) || 1) }))
    .filter((it) => menu.some((m) => m.id === it.id));
}

// Optional: synthesize speech (OpenAI TTS) to an .mp3 file. Returns the path.
async function speak(text, outPath, ai) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const r = await fetch(`${OPENAI}/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "tts-1", voice: (ai && ai.ttsVoice) || "alloy", input: text.slice(0, 900), format: "mp3" }),
  });
  if (!r.ok) throw new Error(`TTS ${r.status}: ${await r.text()}`);
  fs.writeFileSync(outPath, Buffer.from(await r.arrayBuffer()));
  return outPath;
}

module.exports = { transcribe, extractItems, speak };
