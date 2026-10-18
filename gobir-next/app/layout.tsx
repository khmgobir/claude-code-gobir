import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gobirdigital.netlify.app"),
  title: "Gobir Digital — Learn Smarter. Master AI & Digital Skills",
  description:
    "Gobir Digital — learn smarter. AI & productivity, computer basics, kids digital learning, app building and business growth. Coaching in Sokoto, Nigeria and online worldwide. Book a session.",
  keywords: [
    "Gobir Digital", "learn AI Nigeria", "computer training Sokoto",
    "digital skills", "AI coaching", "kids coding", "business online", "Sokoto tutor",
  ],
  manifest: "/gobir-manifest.webmanifest",
  icons: {
    icon: [{ url: "/gobir-icon-192.png", sizes: "192x192" }, { url: "/gobir-logo-emblem.png" }],
    apple: "/gobir-icon-180.png",
  },
  openGraph: {
    title: "Gobir Digital — Learn AI & Digital Skills",
    description: "Learn smarter. Book a session — online worldwide or in person in Sokoto.",
    images: ["/gobir-og.png"],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/gobir-og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#0a1733",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Gobir Digital",
  description:
    "Learn smarter — AI & digital skills coaching: AI tools, computer basics, kids digital learning, app building and business growth.",
  slogan: "Learn Digital · Build Smart · Grow",
  areaServed: "Worldwide (online) and Sokoto, Nigeria (in person)",
  telephone: "+2347066637888",
  address: { "@type": "PostalAddress", addressLocality: "Sokoto", addressCountry: "NG" },
  openingHours: "Mo-Su 16:00-22:00",
  sameAs: ["https://wa.me/2347066637888"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
          rel="stylesheet"
        />
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Gobir Digital" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
