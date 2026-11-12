/**
 * Program request models — Home Schooling & Research/Data Analysis.
 * Designed by the two specialist panels:
 *   • Program/pricing specialists → plan & service menus with their own prices
 *   • UX specialist → single-screen intake with live totals, no account needed
 *   • File-handling engineer → 3 files max, ≤4MB each, base64 POST to Apps
 *     Script (stored in Google Drive), JSONP poll to confirm receipt
 */
import { api, API_URL } from "./booking";

export const PROGRAM_ENDPOINT_NOTE =
  "Requests are saved to the owner's Google Sheet; files go to a Drive folder.";

/* ---------------- Home Schooling model ---------------- */

export type HsPlanId = "essential" | "standard" | "intensive";

export const HS_PLANS: {
  id: HsPlanId;
  name: string;
  perWeek: number;
  perChild: number;
  blurb: string;
}[] = [
  {
    id: "essential",
    name: "Essential",
    perWeek: 2,
    perChild: 20000,
    blurb: "2 sessions a week — steady school support",
  },
  {
    id: "standard",
    name: "Standard",
    perWeek: 3,
    perChild: 28000,
    blurb: "3 sessions a week — the sweet spot",
  },
  {
    id: "intensive",
    name: "Intensive",
    perWeek: 4,
    perChild: 36000,
    blurb: "4 sessions a week — catch up fast",
  },
];

export const HS_SUBJECTS = [
  "Reading & Writing",
  "Mathematics",
  "English",
  "Computer Basics",
  "AI & Tech for Kids",
  "Homework Support",
] as const;

export const HS_TIMES = [
  "After school (4–6pm)",
  "Mornings",
  "Weekends",
  "Flexible",
] as const;

export const HS_SIBLING_DISCOUNT = 0.25; // 25% off each child after the first
export const HS_ASSESSMENT_PRICE = 5000; // one-off, credited if you continue

export function hsTotal(planId: HsPlanId, children: number): number {
  const plan = HS_PLANS.find((p) => p.id === planId);
  if (!plan || children < 1) return 0;
  return (
    plan.perChild +
    Math.round((children - 1) * plan.perChild * (1 - HS_SIBLING_DISCOUNT))
  );
}

export function hsPriceBreakdown(planId: HsPlanId, children: number): string {
  const plan = HS_PLANS.find((p) => p.id === planId);
  if (!plan) return "";
  if (children <= 1) return `${plan.name}: ₦${plan.perChild.toLocaleString()} / month`;
  return `${plan.name}: ₦${plan.perChild.toLocaleString()} + ₦${Math.round(
    plan.perChild * (1 - HS_SIBLING_DISCOUNT)
  ).toLocaleString()} × ${children - 1} (25% sibling discount)`;
}

/* ---------------- Research & Data Analysis model ---------------- */

export type RsServiceId =
  | "questionnaire"
  | "cleaning"
  | "excel"
  | "spss"
  | "powerbi"
  | "fullproj"
  | "interpretation";

export const RS_SERVICES: {
  id: RsServiceId;
  name: string;
  from: number;
}[] = [
  { id: "questionnaire", name: "Questionnaire design & review", from: 10000 },
  { id: "cleaning", name: "Data entry & cleaning", from: 10000 },
  { id: "excel", name: "Analysis in Excel (descriptives, charts)", from: 15000 },
  { id: "spss", name: "SPSS analysis (tests, cross-tabs)", from: 25000 },
  { id: "powerbi", name: "Power BI dashboard", from: 30000 },
  { id: "fullproj", name: "Full project analysis (Ch. 4 & 5)", from: 40000 },
  { id: "interpretation", name: "Results interpretation & write-up help", from: 10000 },
];

export const RS_ROLES = [
  "Student (undergraduate)",
  "Postgraduate / Masters",
  "Lecturer / Researcher",
  "NGO / Organisation",
  "Business",
  "Other",
] as const;

export const RS_DATA_STATUS = [
  "Ready — I'll upload now",
  "Ready — I'll send on WhatsApp",
  "Not yet — help me collect it",
] as const;

export function rsFromTotal(selected: RsServiceId[]): number {
  return selected.reduce(
    (sum, id) => sum + (RS_SERVICES.find((s) => s.id === id)?.from ?? 0),
    0
  );
}

/* ---------------- file handling ---------------- */

export const FILE_MAX_MB = 4;
export const FILE_MAX_COUNT = 3;
export const FILE_ACCEPT = ".xlsx,.xls,.csv,.docx,.doc,.pdf";

export function validateFiles(files: File[]): string | null {
  if (files.length > FILE_MAX_COUNT)
    return `Please attach at most ${FILE_MAX_COUNT} files.`;
  for (const f of files) {
    if (f.size > FILE_MAX_MB * 1024 * 1024)
      return `“${f.name}” is larger than ${FILE_MAX_MB}MB. Please compress it or send it on WhatsApp.`;
  }
  return null;
}

function fileToB64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

/* ---------------- submission pipeline ---------------- */

export type ProgramRequestResult = {
  ok: boolean;
  ref: string;
  confirmed: boolean; // true if the sheet confirmed receipt via poll
  error?: string;
};

export type ProgramRequestPayload = {
  type: "homeschool" | "research";
  name: string;
  phone: string;
  email: string;
  details: string; // compact human-readable summary of the intake fields
  company?: string; // honeypot
};

export async function submitProgramRequest(
  payload: ProgramRequestPayload,
  files: File[]
): Promise<ProgramRequestResult> {
  const prefix = payload.type === "homeschool" ? "HS" : "RD";
  const ref = `${prefix}-${Date.now().toString(36).toUpperCase().slice(-7)}${Math.floor(
    Math.random() * 36
  )
    .toString(36)
    .toUpperCase()}`;

  let encoded: { name: string; type: string; size: number; b64: string }[] = [];
  try {
    encoded = await Promise.all(
      files.map(async (f) => ({
        name: f.name,
        type: f.type || "application/octet-stream",
        size: f.size,
        b64: await fileToB64(f),
      }))
    );
  } catch {
    return { ok: false, ref, confirmed: false, error: "Could not read your files." };
  }

  // Apps Script only receives POST bodies reliably with text/plain (no preflight),
  // and no-cors keeps the browser from needing CORS headers on the reply.
  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, action: "request", ref, files: encoded }),
    });
  } catch {
    return {
      ok: false,
      ref,
      confirmed: false,
      error: "No internet connection — please try again or send it on WhatsApp.",
    };
  }

  // The POST is fire-and-forget (no-cors), so confirm via JSONP poll.
  for (let i = 0; i < 5; i++) {
    await new Promise((r) => setTimeout(r, 1800));
    try {
      const r = await api<{ ok: boolean; found: boolean }>("requeststatus", { ref });
      if (r?.ok && r.found) return { ok: true, ref, confirmed: true };
    } catch {
      /* keep polling */
    }
  }
  // Request most likely landed; if the poll never confirmed, the UI falls back
  // to the WhatsApp handoff so the owner still gets the request one way or another.
  return { ok: true, ref, confirmed: false };
}

/* ---------------- WhatsApp fallback ---------------- */

export function waProgramLink(ref: string, summary: string): string {
  const msg = `Hello Gobir Digital! I just submitted a program request (${ref}). Details: ${summary}`;
  return `https://wa.me/2347066637888?text=${encodeURIComponent(msg.slice(0, 1400))}`;
}
