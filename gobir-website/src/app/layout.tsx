import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const APP_URL = "https://gobir-digital.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL("https://gobir-digital.netlify.app"),
  title: "Gobir Digital — Learn Smarter. Master AI & Digital Skills",
  description:
    "Practical, beginner-friendly coaching in AI, computer basics, app ideas and online business growth. Online or in person in Sokoto, Nigeria. Evening sessions, ₦5,000 solo or ₦10,000 for a group of 2–5.",
  keywords: [
    "Gobir Digital",
    "AI coaching Nigeria",
    "learn AI Sokoto",
    "computer basics",
    "digital skills",
    "online coaching",
    "kids digital learning",
  ],
  authors: [{ name: "Gobir Digital" }],
  icons: {
    icon: "/gobir-icon-512.png",
    apple: "/gobir-icon-512.png",
  },
  openGraph: {
    title: "Gobir Digital — Learn Digital. Build Smart. Grow Business.",
    description:
      "Friendly, practical coaching in AI and digital skills — online or in person (Sokoto, Nigeria). Sessions daily 4pm–10pm WAT.",
    url: APP_URL,
    siteName: "Gobir Digital",
    images: [{ url: "/gobir-og.png", width: 2400, height: 1260 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gobir Digital — Learn Digital. Build Smart. Grow Business.",
    description:
      "Practical coaching in AI, computer basics and growing your business online. Book a session today.",
    images: ["/gobir-og.png"],
  },
  alternates: { canonical: "/" },
  manifest: "/gobir-manifest.webmanifest",
};

// Local business / organization structured data for Google (local schema)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Gobir Digital",
  url: APP_URL,
  logo: `${APP_URL}/gobir-icon-512.png`,
  image: `${APP_URL}/gobir-og.png`,
  description:
    "Practical, beginner-friendly coaching in AI, computer basics, app ideas and online business growth — online or in person in Sokoto, Nigeria.",
  telephone: "+2347066637888",
  email: "khmgobir@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sokoto",
    addressRegion: "Sokoto",
    addressCountry: "NG",
  },
  areaServed: ["Sokoto", "Nigeria", "Online"],
  sameAs: ["https://wa.me/2347066637888"],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "16:00",
    closes: "22:00",
  },
};

export const viewport: Viewport = {
  themeColor: "#2f9dff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${sora.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
