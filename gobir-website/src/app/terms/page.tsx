import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/site/legal-shell";

export const metadata: Metadata = {
  title: "Terms & Conditions — Gobir Digital",
  description:
    "The simple terms for booking and attending a Gobir Digital coaching session.",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms &amp; Conditions" updated="19 October 2026">
      <p>
        These terms cover booking and attending coaching sessions with Gobir
        Digital. By booking a session you agree to them. We&apos;ve kept them
        short and plain.
      </p>

      <LegalSection heading="Our sessions">
        <p>
          Gobir Digital offers coaching in AI, computer basics, turning ideas into
          reality, promoting your business online, and kids&apos; digital
          learning. Sessions run online or in person in Sokoto, Nigeria, usually
          in the evenings (4:00pm–10:00pm WAT).
        </p>
      </LegalSection>

      <LegalSection heading="Booking &amp; pricing">
        <ul className="list-disc space-y-1 pl-5">
          <li>A solo session is ₦5,000.</li>
          <li>A group session for 2–5 people is a flat ₦10,000.</li>
          <li>In-person sessions are one-to-one for the booked time slot.</li>
        </ul>
        <p>
          Prices and session length may change over time; the amount shown when
          you book is what applies to that booking.
        </p>
      </LegalSection>

      <LegalSection heading="Payment">
        <p>
          Payment arrangements are confirmed over WhatsApp after you book. Please
          settle your session as agreed before or at the start of the session.
        </p>
      </LegalSection>

      <LegalSection heading="Rescheduling &amp; cancellation">
        <p>
          You can reschedule or cancel using the manage link emailed to you. Please
          give us as much notice as you can so the slot can be offered to someone
          else. If we ever need to cancel a session on our side, we&apos;ll offer
          you a new time.
        </p>
      </LegalSection>

      <LegalSection heading="Your part">
        <p>
          For online sessions, please join on time with a working internet
          connection. For in-person sessions, please share an accurate meeting
          address. Treat your coach and other learners with respect.
        </p>
      </LegalSection>

      <LegalSection heading="What we can&apos;t promise">
        <p>
          We teach practical skills to the best of our ability, but learning
          outcomes depend on your own practice. We don&apos;t guarantee specific
          results, income, or exam or business success.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these terms? Message us on WhatsApp at{" "}
          <a className="font-semibold text-primary hover:underline" href="https://wa.me/2347066637888">
            +234 706 663 7888
          </a>{" "}
          or email{" "}
          <a className="font-semibold text-primary hover:underline" href="mailto:khmgobir@gmail.com">
            khmgobir@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
