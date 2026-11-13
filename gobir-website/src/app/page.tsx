"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Courses } from "@/components/site/courses";
import { LearnYourWay } from "@/components/site/learn-your-way";
import { Testimonials } from "@/components/site/testimonials";
import { Gallery } from "@/components/site/gallery";
import { Stories } from "@/components/site/stories";
import { Pricing } from "@/components/site/pricing";
import { BookCta } from "@/components/site/book-cta";
import { BookingDialog } from "@/components/site/booking";
import { BookingProvider } from "@/components/site/booking-context";
import { Faq } from "@/components/site/faq";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { ManageDialog } from "@/components/site/manage-dialog";
import { OwnerDialog } from "@/components/site/owner-dialog";
import { StickyCta } from "@/components/site/sticky-cta";

export default function Home() {
  const [manageOpen, setManageOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [manageToken, setManageToken] = useState<string | undefined>(undefined);

  // Deep links: ?manage=TOKEN opens the manage dialog, ?owner opens owner console
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("manage") ?? undefined;
    const owner = params.get("owner") !== null;
    if (!t && !owner) return;
    const id = window.setTimeout(() => {
      if (t) {
        setManageToken(t);
        setManageOpen(true);
      }
      if (owner) setOwnerOpen(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <BookingProvider>
      <div className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="bg-brand-gradient sr-only z-[100] rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-brand focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Navbar onManage={() => setManageOpen(true)} />
        <main id="main" className="flex-1">
          <Hero />
          <Courses />
          <LearnYourWay />
          <Pricing />
          <BookCta />
          <Testimonials />
          <Gallery />
          <Stories />
          <Faq />
          <Contact />
        </main>
        <Footer
          onManage={() => setManageOpen(true)}
          onOwner={() => setOwnerOpen(true)}
        />
        <ManageDialog
          open={manageOpen}
          onOpenChange={setManageOpen}
          initialToken={manageToken}
        />
        <OwnerDialog open={ownerOpen} onOpenChange={setOwnerOpen} />
        <BookingDialog />
        <StickyCta />
      </div>
    </BookingProvider>
  );
}
