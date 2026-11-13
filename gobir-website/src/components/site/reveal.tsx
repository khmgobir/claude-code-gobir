"use client";

import { Component, type ReactNode } from "react";
import type { ErrorInfo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Error boundary around Reveal: on very old Android WebViews framer-motion's
 * IntersectionObserver code can throw during mount. Without this boundary the
 * whole page white-screens; with it the section simply renders statically.
 */
class RevealBoundary extends Component<
  { children: ReactNode; className?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* swallow, static fallback is acceptable */
  }

  render() {
    if (this.state.failed) {
      return (
        <div className={this.props.className}>{this.props.children}</div>
      );
    }
    return this.props.children;
  }
}

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <RevealBoundary className={className}>
      {/* initial is UNCONDITIONAL so the server HTML matches the client's first
          render (hydration-safe); reduced motion is honoured via zero-duration
          transition instead of changing the rendered markup. */}
      <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{
          duration: reduce ? 0 : 0.65,
          delay: reduce ? 0 : delay,
          ease: [0.21, 0.6, 0.35, 1],
        }}
      >
        {children}
      </motion.div>
    </RevealBoundary>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={`max-w-2xl ${
        align === "center" ? "mx-auto text-center" : "text-left"
      }`}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-gradient" />
        {eyebrow}
      </span>
      <h2 className="font-display mt-4 text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {sub ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {sub}
        </p>
      ) : null}
    </Reveal>
  );
}
