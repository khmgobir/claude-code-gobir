"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "./reveal";

type Slide = { src: string; alt: string };

const SLIDES: Slide[] = [
  { src: "/img/gallery/slide-01.webp", alt: "Gobir Digital — master AI and digital skills in 60 minutes, from ₦5,000" },
  { src: "/img/gallery/slide-02.webp", alt: "How to Use AI — get your work done in minutes with ChatGPT, Claude and Gemini" },
  { src: "/img/gallery/slide-03.webp", alt: "Computer Basics — go from nervous to confident on any computer" },
  { src: "/img/gallery/slide-04.webp", alt: "Turn your idea into reality — leave with a clear, do-able plan" },
  { src: "/img/gallery/slide-05.webp", alt: "Promote your business online — get real customers from social media" },
  { src: "/img/gallery/slide-06.webp", alt: "Kids Digital Learning — a fun, safe start with tech and AI, ages 6 to 15" },
  { src: "/img/gallery/slide-07.webp", alt: "Learn online — join on Google Meet or Zoom from anywhere" },
  { src: "/img/gallery/slide-08.webp", alt: "Group sessions — bring up to 5 friends and split the flat ₦10,000 price" },
  { src: "/img/gallery/slide-09.webp", alt: "Real results — practical skills you can use the same day" },
  { src: "/img/gallery/slide-10.webp", alt: "Book your session — evenings 4 to 10pm, online or in person in Sokoto" },
];

const AUTOPLAY_MS = 4500;

export function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  const scrollTo = useCallback((i: number, smooth = true) => {
    const n = SLIDES.length;
    const next = ((i % n) + n) % n;
    const track = trackRef.current;
    const el = slideRefs.current[next];
    if (!track || !el) return;
    const left = el.offsetLeft - (track.clientWidth - el.clientWidth) / 2;
    track.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    setIndex(next);
  }, []);

  // Keep the active dot in sync when the visitor swipes/scrolls manually.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        slideRefs.current.forEach((el, i) => {
          if (!el) return;
          const c = el.offsetLeft + el.clientWidth / 2;
          const d = Math.abs(c - center);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        setIndex(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Auto-advance (respects reduced-motion, pauses on hover / off-screen tab).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      if (paused.current || document.hidden) return;
      setIndex((i) => {
        const next = (i + 1) % SLIDES.length;
        scrollTo(next);
        return next;
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [scrollTo]);

  return (
    <section
      id="gallery"
      className="bg-brand-gradient-soft py-16 sm:py-24"
      aria-label="A look at Gobir Digital"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="A look inside"
          title={
            <>
              See what <span className="text-gradient">learning looks like</span>
            </>
          }
          sub="A quick peek at the skills you can pick up, swipe through and book the one that's for you."
        />

        <div
          className="relative mt-12"
          onMouseEnter={() => (paused.current = true)}
          onMouseLeave={() => (paused.current = false)}
          onPointerDown={() => (paused.current = true)}
        >
          {/* arrows */}
          <button
            type="button"
            onClick={() => scrollTo(index - 1)}
            aria-label="Previous"
            className="absolute -left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border bg-white/90 shadow-brand backdrop-blur transition hover:bg-white sm:grid lg:-left-5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(index + 1)}
            aria-label="Next"
            className="absolute -right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border bg-white/90 shadow-brand backdrop-blur transition hover:bg-white sm:grid lg:-right-5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* track */}
          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {SLIDES.map((s, i) => (
              <div
                key={s.src}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className="w-[78%] shrink-0 snap-center sm:w-[46%] lg:w-[31%]"
              >
                <div className="group overflow-hidden rounded-3xl border bg-muted shadow-brand ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1.5">
                  <img
                    src={s.src}
                    alt={s.alt}
                    loading="lazy"
                    width={860}
                    height={1075}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* dots */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={index === i}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === i ? "bg-brand-gradient w-7" : "w-2.5 bg-primary/25 hover:bg-primary/40"
                }`}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="#book"
              className="bg-brand-gradient shadow-brand inline-flex items-center rounded-full px-7 py-3 text-base font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Book your session
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
