import { CONFIG } from "./config";

let seq = 0;

/** Call the Google Apps Script endpoint via JSONP (works from any static host). */
export function api<T = any>(params: Record<string, any>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!CONFIG.scriptUrl) {
      reject(new Error("noconfig"));
      return;
    }
    const cb = "gcb" + Date.now() + seq++;
    let s: HTMLScriptElement | null = null;
    const cleanup = () => {
      clearTimeout(timer);
      try {
        delete (window as any)[cb];
      } catch {
        (window as any)[cb] = undefined;
      }
      if (s && s.parentNode) s.parentNode.removeChild(s);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("timeout"));
    }, 15000);
    (window as any)[cb] = (d: any) => {
      cleanup();
      resolve((d || {}) as T);
    };
    const q = Object.keys(params)
      .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k] ?? ""))
      .join("&");
    s = document.createElement("script");
    s.src = CONFIG.scriptUrl + "?" + q + "&callback=" + cb;
    s.onerror = () => {
      cleanup();
      reject(new Error("network"));
    };
    document.body.appendChild(s);
  });
}
