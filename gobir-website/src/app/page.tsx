"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/site/navbar";
import { Hero, HeroBadgeRow } from "@/components/site/hero";
import { Benefits } from "@/components/site/benefits";
import { Courses } from "@/components/site/courses";
import { Counters } from "@/components/site/counters";
import { HowItWorks } from "@/components/site/how-it-works";
import { Testimonials } from "@/components/site/testimonials";
import { Pricing } from "@/components/site/pricing";
import { Booking } from "@/components/site/booking";
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
    <div className="flex min-h-screen flex-col">
      <Navbar onManage={() => setManageOpen(true)} />
      <main className="flex-1">
        <Hero />
        <HeroBadgeRow />
        <Benefits />
        <Courses />
        <Counters />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <Booking />
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
      <StickyCta />
    </div>
  );
}
