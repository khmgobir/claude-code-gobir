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
    <LegalShell title="Privacy Policy" updated="12 November 2026">
      <p>
        Gobir Digital (&quot;we&quot;, &quot;us&quot;) helps people in Sokoto,
        Nigeria and online learn AI and digital skills. This policy explains what
        information we collect when you use this website or book a session, and
        how we look after it. It is written to follow the Nigeria Data Protection
        Act, 2023 (NDPA) and the general principles of the Nigeria Data
        Protection Regulation (NDPR): we collect only what we need, we use it
        only for the purposes below, and you stay in control of your data.
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
          We also collect basic, non-identifying usage data (pages visited,
          approximate country) through Google Analytics if you accept the
          analytics cookie banner. Analytics is loaded only after you press
          &quot;Accept&quot;; if you decline, no analytics cookies are set and your
          visit is not measured. IP addresses are anonymised where possible.
        </p>
      </LegalSection>

      <LegalSection heading="Why we may use your data (lawful basis)">
        <p>
          Under the NDPA we rely on three lawful bases. <strong>Consent</strong>:
          you tick the privacy box when booking and choose whether to allow
          analytics. <strong>Contract</strong>: the details are needed to arrange
          and run the session you booked. <strong>Legitimate interest</strong>:
          keeping basic business records of bookings and payments.
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
          Access to our booking records is protected and limited to Gobir
          Digital. This site is served over a secure (HTTPS) connection, and the
          owner console is protected by a PIN that locks after repeated wrong
          attempts.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep your data">
        <p>
          Booking records (name, contact, topic, attendance) are kept for up to
          24 months after your last session, so we can honour reschedules,
          handle disputes and keep sensible business accounts. Analytics data is
          kept by Google for the standard period set in your consent settings.
          You can ask us to delete your records sooner at any time (see
          &quot;Your choices&quot; below).
        </p>
      </LegalSection>

      <LegalSection heading="Children&apos;s data">
        <p>
          We teach children (Kids Digital Learning and Home Schooling programs),
          so bookings for a child are made by a parent or guardian, using the
          parent&apos;s own contact details. We do not knowingly collect data
          directly from children under 18 without parental or guardian consent.
          If you believe a child&apos;s details were sent to us without a
          parent&apos;s permission, contact us and we will delete them promptly.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices &amp; your rights">
        <p>
          You can ask us to view, correct or delete the information we hold about
          you at any time. You can also cancel or reschedule a booking yourself
          using the manage link we email you. Under the NDPA you may also
          request a copy of your data, withdraw consent, or ask us to stop a
          particular use of it. To exercise any right, message or email us (see
          below). We respond as quickly as we can, usually within 7 days. If
          you are not satisfied with how we handle your data, you may complain
          to the Nigeria Data Protection Commission (NDPC).
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
