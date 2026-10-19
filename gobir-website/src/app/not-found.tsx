import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found · Gobir Digital",
  description: "That page doesn't exist. Head back home to book a session or explore our courses.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <img
        src="/gobir-icon-512.png"
        alt="Gobir Digital logo"
        className="mb-6 h-16 w-16 rounded-2xl object-cover shadow-soft"
      />
      <p className="font-display text-6xl font-extrabold text-gradient">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The link may be broken or the page may have moved. Let&apos;s get you
        back on track.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.03]"
        >
          Back to home
        </Link>
        <Link
          href="/#book"
          className="rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-primary/5"
        >
          Book a session
        </Link>
      </div>
    </main>
  );
}
