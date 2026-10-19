/**
 * Gobir Digital — Booking API client (JSONP → Google Apps Script)
 * Mirrors the exact contract in Code.gs:
 *   slots / book / cancel / reschedule / booking /
 *   ownerstatus / setopen / setblock / unsetblock
 */

export const API_URL =
  "https://script.google.com/macros/s/AKfycbwxvoeuikW6ovZBp6axU4Tmz9GYsTOLsQAMyfjxq_Q14oOlwRkVV92zLoDOgiT4_dpo7Q/exec";

export const WHATSAPP_NUMBER = "2347066637888";
export const WHATSAPP_DISPLAY = "+234 706 663 7888";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export const SLOTS = [
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
] as const;

export const TOPICS = [
  "How to Use AI",
  "Computer Basics & Skills",
  "Turn Your Idea Into Reality",
  "Promote Your Business Online",
  "Kids Digital Learning (personalised)",
  "Not sure yet — help me choose",
] as const;

export const SOLO_PRICE = 5000;
export const GROUP_PRICE = 10000;

export function priceFor(people: number): number {
  return people <= 1 ? SOLO_PRICE : GROUP_PRICE;
}

export function naira(n: number): string {
  return "₦" + n.toLocaleString("en-NG");
}

/** Format a YYYY-MM-DD string safely for display (never throws on bad input). */
export function prettyDateSafe(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

/** Fire a JSONP request against the Apps Script endpoint. */
export function api<T = Record<string, unknown>>(
  action: string,
  params: Record<string, string | number | undefined> = {},
  timeoutMs = 25000
): Promise<T & { ok: boolean }> {
  return new Promise((resolve, reject) => {
    const cbName = `__gobir_cb_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const q = new URLSearchParams({ action, callback: cbName });
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && String(v).length > 0) {
        q.set(k, String(v));
      }
    }

    const script = document.createElement("script");
    let done = false;

    const cleanup = () => {
      done = true;
      clearTimeout(timer);
      try {
        delete (window as unknown as Record<string, unknown>)[cbName];
      } catch {
        (window as unknown as Record<string, unknown>)[cbName] = undefined;
      }
      script.remove();
    };

    const timer = setTimeout(() => {
      if (done) return;
      cleanup();
      reject(new Error("Request timed out — check your internet connection."));
    }, timeoutMs);

    (window as unknown as Record<string, unknown>)[cbName] = (data: unknown) => {
      if (done) return;
      cleanup();
      resolve(data as T & { ok: boolean });
    };

    script.onerror = () => {
      if (done) return;
      cleanup();
      reject(
        new Error("Could not reach the booking service. Please try again.")
      );
    };

    script.src = `${API_URL}?${q.toString()}`;
    script.async = true;
    document.body.appendChild(script);
  });
}

/* ---------- typed responses ---------- */

export interface SlotsResponse {
  ok: boolean;
  open: boolean;
  date: string;
  slots: string[];
}

export interface BookingRecord {
  name: string;
  topic: string;
  mode: string;
  date: string;
  time: string;
  people: string;
}

export interface BookingLookupResponse {
  ok: boolean;
  found: boolean;
  booking?: BookingRecord;
}

export interface BookResponse {
  ok: boolean;
  token?: string;
  reason?: string;
}

export interface OwnerStatusResponse {
  ok: boolean;
  open?: boolean;
  reason?: string;
}

export type BookMode = "Online" | "In person";

export const REASON_TEXT: Record<string, string> = {
  closed: "Bookings are currently closed. Please check back soon or WhatsApp us.",
  taken: "Sorry — that slot was just taken. Please pick another time.",
  invalid: "Please fill in every required field.",
  pin: "Wrong PIN. Try again.",
  notfound: "We couldn't find that booking reference.",
  nodate: "Please pick a date first.",
};
