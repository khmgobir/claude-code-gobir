"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Play } from "lucide-react";

type Story = { src: string; label: string; alt: string };

const STORIES: Story[] = [
  { src: "/img/stories/story-01.webp", label: "Learn AI", alt: "Learn AI in 60 minutes with ChatGPT, Claude and Gemini" },
  { src: "/img/stories/story-02.webp", label: "Computer basics", alt: "Computer basics, from zero to confident daily use" },
  { src: "/img/stories/story-03.webp", label: "Your idea", alt: "Turn your idea into a clear, do-able plan" },
  { src: "/img/stories/story-04.webp", label: "Grow business", alt: "Promote your business online and get real customers" },
  { src: "/img/stories/story-05.webp", label: "For kids", alt: "Kids digital learning, a fun safe start with tech and AI" },
  { src: "/img/stories/story-06.webp", label: "With friends", alt: "Group sessions, bring up to 5 friends and split the price" },
  { src: "/img/stories/story-07.webp", label: "Online", alt: "Learn online on Google Meet or Zoom from anywhere" },
  { src: "/img/stories/story-08.webp", label: "Anywhere", alt: "Online or in person in Sokoto, Nigeria" },
  { src: "/img/stories/story-09.webp", label: "Real results", alt: "Real skills and real results you can use the same day" },
  { src: "/img/stories/story-10.webp", label: "Build an app", alt: "Turn your app idea into a first working plan" },
];

const DURATION = 5000;

export function Stories() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="stories-strip"
      className="py-12 sm:py-16"
      aria-label="Gobir Digital stories"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Tap a <span className="text-gradient">story</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quick 9:16 looks at what you can learn. Tap to play, swipe through.
            </p>
          </div>
        </div>

        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {STORIES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setOpen(i)}
              className="group shrink-0 text-center"
              aria-label={`Play story: ${s.label}`}
            >
              <span className="block rounded-[1.5rem] bg-brand-gradient p-[2.5px] shadow-soft transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-brand">
                <span className="block overflow-hidden rounded-[1.4rem] bg-white p-[2px]">
                  <span className="relative block overflow-hidden rounded-[1.25rem]">
                    <img
                      src={s.src}
                      alt={s.alt}
                      loading="lazy"
                      width={720}
                      height={1280}
                      className="h-44 w-[99px] object-cover transition-transform duration-500 group-hover:scale-105 sm:h-52 sm:w-[117px]"
                    />
                    <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white/85 text-primary shadow-soft">
                        <Play className="ml-0.5 h-4 w-4 fill-current" />
                      </span>
                    </span>
                  </span>
                </span>
              </span>
              <span className="mt-2 block max-w-[99px] truncate text-xs font-semibold text-foreground/80 sm:max-w-[117px]">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {open !== null && (
        <StoryViewer
          stories={STORIES}
          start={open}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

function StoryViewer({
  stories,
  start,
  onClose,
}: {
  stories: Story[];
  start: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(start);
  const [progress, setProgress] = useState(0);
  const paused = useRef(false);

  const next = useCallback(() => {
    setIdx((i) => {
      if (i >= stories.length - 1) {
        onClose();
        return i;
      }
      return i + 1;
    });
    setProgress(0);
  }, [stories.length, onClose]);

  const prev = useCallback(() => {
    setIdx((i) => Math.max(0, i - 1));
    setProgress(0);
  }, []);

  // Auto-advance with a smooth progress bar for the active story.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!paused.current) {
        elapsed += dt;
        const p = Math.min(1, elapsed / DURATION);
        setProgress(p);
        if (p >= 1) {
          next();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, next]);

  // Lock body scroll + keyboard controls.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [next, prev, onClose]);

  const s = stories[idx];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Story viewer"
    >
      <div
        className="relative w-full max-w-[420px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* progress bars */}
        <div className="absolute inset-x-3 top-3 z-20 flex gap-1.5">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: i < idx ? "100%" : i === idx ? `${progress * 100}%` : "0%",
                  transition: i === idx ? "none" : "width 0.2s",
                }}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-7 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
        >
          <X className="h-5 w-5" />
        </button>

        {/* image */}
        <div className="relative overflow-hidden rounded-2xl bg-brand-navy shadow-brand">
          <img
            src={s.src}
            alt={s.alt}
            className="aspect-[9/16] w-full object-cover"
            draggable={false}
          />

          {/* tap zones + hold-to-pause */}
          <button
            type="button"
            onClick={prev}
            onPointerDown={() => (paused.current = true)}
            onPointerUp={() => (paused.current = false)}
            onPointerLeave={() => (paused.current = false)}
            aria-label="Previous story"
            className="absolute inset-y-0 left-0 w-1/3 cursor-default"
          />
          <button
            type="button"
            onClick={next}
            onPointerDown={() => (paused.current = true)}
            onPointerUp={() => (paused.current = false)}
            onPointerLeave={() => (paused.current = false)}
            aria-label="Next story"
            className="absolute inset-y-0 right-0 w-2/3 cursor-default"
          />
        </div>

        <a
          href="#book"
          onClick={onClose}
          className="bg-brand-gradient shadow-brand mt-3 flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white"
        >
          Book this session
        </a>
      </div>
    </div>
  );
}
