"use client";

import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Wraps any block in a GSAP ScrollTrigger fade+rise reveal — the same
 * `.reveal` treatment every section used in the original HTML mockup.
 * Falls back to fully visible immediately under reduced motion.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 36,
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: keyof React.JSX.IntrinsicElements;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    let trigger: { kill: () => void } | undefined;
    el.style.opacity = "0";
    el.style.transform = `translateY(${y}px)`;

    getGsap().then(({ gsap, ScrollTrigger }) => {
      const tween = gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay,
        scrollTrigger: { trigger: el, start: "top 86%" },
      });
      trigger = tween.scrollTrigger ?? undefined;
    });

    return () => trigger?.kill();
  }, [delay, y]);

  const Comp = Tag as React.ElementType;
  return (
    <Comp ref={ref} className={className} {...rest}>
      {children}
    </Comp>
  );
}
