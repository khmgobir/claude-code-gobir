import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/site/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy · Gobir Digital",
  description:
    "How Gobir Digital collects, uses and protects the information you share when you book a coaching session.",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="19 October 2026">
      <p>
        Gobir Digital (&quot;we&quot;, &quot;us&quot;) helps people in Sokoto,
        Nigeria and online learn AI and digital skills. This policy explains what
        information we collect when you use this website or book a session, and
        how we look after it.
      </p>

      <LegalSection heading="Information we collect">
        <p>When you book a session, you choose to share:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your name</li>
          <li>Your phone number (for WhatsApp confirmation and reminders)</li>
          <li>Your email address (to send your booking &amp; manage link)</li>
          <li>The topic, date, time and mode (online or in person)</li>
          <li>For in-person sessions, the meeting address you give us</li>
        </ul>
        <p>
          We also collect basic, non-identifying usage data (such as pages
          visited) if website analytics are enabled, to understand what&apos;s
          useful and improve the site.
        </p>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <ul className="list-disc space-y-1 pl-5">
          <li>To confirm, schedule and run your coaching session</li>
          <li>To send reminders and your booking management link</li>
          <li>To reply to your questions over WhatsApp or email</li>
          <li>To keep simple records of bookings and revenue for our own business</li>
        </ul>
        <p>We do not sell your information, and we do not share it for advertising.</p>
      </LegalSection>

      <LegalSection heading="Where your data is stored">
        <p>
          Booking details are stored in Google Sheets and Google Calendar, which
          are operated by Google. Confirmation messages are sent via WhatsApp and
          email. These providers process the data on our behalf under their own
          security and privacy terms.
        </p>
      </LegalSection>

      <LegalSection heading="Keeping your data safe">
        <p>
          Access to our booking records is protected and limited to Gobir Digital.
          This site is served over a secure (HTTPS) connection. We keep booking
          records only for as long as needed to serve you and to keep sensible
          business records.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <p>
          You can ask us to view, correct or delete the information we hold about
          you at any time. You can also cancel or reschedule a booking yourself
          using the manage link we email you.
        </p>
      </LegalSection>

      <LegalSection heading="Contact us">
        <p>
          Questions about this policy? Message us on WhatsApp at{" "}
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
