"use client";

import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

const GLYPHS = "▮#/<>+01XZ";

/**
 * The small orange mono label above every section heading. Scrambles into
 * place left-to-right the first time it scrolls into view — matches the
 * "flight data" feel of the altimeter throughout the site.
 */
export function Eyebrow({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const original = children;
    let trigger: { kill: () => void } | undefined;

    getGsap().then(({ ScrollTrigger }) => {
      trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          let frame = 0;
          const total = 16;
          const iv = setInterval(() => {
            frame++;
            const lock = Math.floor((frame / total) * original.length);
            el.textContent = original
              .split("")
              .map((ch, i) =>
                ch === " " || i < lock
                  ? ch
                  : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
              )
              .join("");
            if (frame >= total) {
              el.textContent = original;
              clearInterval(iv);
            }
          }, 38);
        },
      });
    });

    return () => trigger?.kill();
  }, [children]);

  return (
    <span className={`eyebrow ${className}`}>
      <span ref={ref}>{children}</span>
    </span>
  );
}
