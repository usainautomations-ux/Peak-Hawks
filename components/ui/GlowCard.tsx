"use client";

import { useRef } from "react";

/** Card with a cursor-tracking glow + lit border. */
export function GlowCard({
  children,
  className = "",
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={[
        "glow-card group relative h-full overflow-hidden rounded-[18px] border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(21,23,26,.13)]",
        padded ? "p-8" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
