"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/booking";

export function Footer({ onManage, onOwner }: { onManage: () => void; onOwner: () => void }) {
  return (
    <footer className="mt-auto border-t bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="/gobir-icon-512.png"
                alt="Gobir Digital logo"
                className="h-9 w-9 rounded-xl object-cover"
              />
              <span className="font-display text-lg font-bold">Gobir Digital</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/60">
              Friendly, practical coaching in AI and digital skills — helping people
              and small businesses thrive online. Learn Digital · Build Smart · Grow.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp us
            </a>
          </div>

          <nav aria-label="Learn">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-background/50">
              Learn
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["How to Use AI", "#courses"],
                ["Computer Basics", "#courses"],
                ["Kids Learning", "#courses"],
                ["Promote Your Business", "#courses"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-background/70 transition-colors hover:text-background">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Visit">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-background/50">
              Visit
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#how" className="text-background/70 transition-colors hover:text-background">
                  How it works
                </a>
              </li>
              <li>
                <a href="#contact" className="text-background/70 transition-colors hover:text-background">
                  Contact &amp; location
                </a>
              </li>
              <li>
                <a href="#faq" className="text-background/70 transition-colors hover:text-background">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#book" className="text-background/70 transition-colors hover:text-background">
                  Book a session
                </a>
              </li>
              <li>
                <button
                  onClick={onManage}
                  className="text-background/70 transition-colors hover:text-background"
                >
                  Manage my booking
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-background/10 pt-6 text-xs text-background/50 sm:flex-row">
          <p>© 2026 Gobir Digital · Open daily 4:00pm – 10:00pm (WAT)</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy/" className="text-background/70 transition-colors hover:text-background">
              Privacy
            </Link>
            <Link href="/terms/" className="text-background/70 transition-colors hover:text-background">
              Terms
            </Link>
            <button
              onClick={onOwner}
              className="rounded-full px-3 py-1.5 text-background/35 transition-colors hover:bg-background/10 hover:text-background/70"
              title="Owner console"
            >
              Owner
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
