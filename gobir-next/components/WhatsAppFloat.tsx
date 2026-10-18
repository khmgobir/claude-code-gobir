"use client";
import { waLink } from "@/lib/config";

export default function WhatsAppFloat() {
  const href = waLink("Hello Gobir Digital! I'd like to learn more about booking a session.");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[150] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-[1.7rem] text-white shadow-[0_10px_26px_rgba(37,211,102,.5)] transition-transform animate-waPulse hover:scale-110"
    >
      <i className="bi bi-whatsapp" />
    </a>
  );
}
