# Gobir Digital Website

Modern, animated booking website for Gobir Digital (Sokoto, Nigeria) — AI & digital skills coaching.
Built with Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui. Fonts: Sora (display) + Inter (body).

## What's inside

```
gobir-website/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Fonts, SEO metadata, theme color
│   │   ├── globals.css           # Design system + BRAND COLORS (see below)
│   │   ├── page.tsx              # Single-page site (assembles all sections)
│   │   └── api/route.ts          # Placeholder health-check API
│   ├── components/site/          # All website sections
│   │   ├── navbar.tsx            # Sticky glass navbar
│   │   ├── hero.tsx              # Gradient hero + photo
│   │   ├── benefits.tsx          # Why-choose cards
│   │   ├── courses.tsx           # 5 course cards
│   │   ├── counters.tsx          # Animated stat counters
│   │   ├── how-it-works.tsx      # 3-step process
│   │   ├── testimonials.tsx      # Reviews carousel
│   │   ├── pricing.tsx           # ₦5,000 solo / ₦10,000 group
│   │   ├── booking.tsx           # FULL BOOKING FORM (live slots from Google Sheets)
│   │   ├── faq.tsx               # Accordion FAQ
│   │   ├── contact.tsx           # Contact cards + WhatsApp CTA
│   │   ├── footer.tsx
│   │   ├── manage-dialog.tsx     # ?manage=TOKEN — customer cancel/reschedule
│   │   ├── owner-dialog.tsx      # ?owner=1 — PIN owner console (open/close, block dates)
│   │   └── reveal.tsx            # Scroll animation helper
│   └── lib/booking.ts            # JSONP client for the Apps Script booking API
├── public/
│   ├── img/                      # Hero photos
│   ├── gobir-logo-mark.png, gobir-og.png, icons, manifest
│   └── logo.svg, robots.txt
├── package.json, tsconfig.json, next.config.ts, tailwind/postcss/eslint configs
└── prisma/schema.prisma          # Scaffold DB schema (site does NOT need a database)
```

## Run it

Requires Node.js 18+ (or Bun).

```bash
npm install        # or: bun install / pnpm install
npm run dev        # develop at http://localhost:3000
```

Production:

```bash
npm run build
npm run start      # serves the standalone build
```

The site is fully static-friendly: booking talks directly to your Google Apps Script
endpoint via JSONP from the browser — **no server database is required**.

## Booking engine (already connected & live-tested)

- Endpoint (Apps Script Web App) is configured in `src/lib/booking.ts`.
- Actions used: `slots`, `book`, `cancel`, `reschedule`, `booking`, `ownerstatus`,
  `setopen`, `setblock`, `unsetblock`.
- Customer deep link: `https://your-domain/?manage=<TOKEN>`
- Owner console: `https://your-domain/?owner=1` (asks for your PIN)

## Editing your brand colors

All colors are tokens at the top of `src/app/globals.css`:

```css
@theme {
  --color-brand-navy: #0e2452;
  --color-brand-royal: #1a6dff;
  --color-brand-blue:  #2f9dff;
  --color-brand-sky:   #45c4ff;
  --color-brand-cyan:  #1fd0ff;
  --color-brand-coral: #ff5f73;
  --color-brand-green: #12d18a;
  --color-brand-wa:    #25d366;
}
```

Change a value there and the whole site updates (gradients, buttons, badges).
Gradients themselves live just below in the same file (`.text-gradient`,
`.bg-brand-gradient`, `.bg-hero-mesh`, ...).

## Editing content

- Texts, sections order, prices, hours: `src/components/site/*.tsx` and `src/app/page.tsx`
- Site title/description/social preview: `src/app/layout.tsx`
- Hero image: replace `public/img/hero-site.png` (1152×864 recommended)
