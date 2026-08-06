"use client";

import { useEffect, useRef, useState } from "react";

type Line = { x1: number; y1: number; x2: number; y2: number };

/**
 * The dashed lines that run from each diagnosis card to the rim of the
 * score dial.
 *
 * These are measured from the real rendered positions rather than being
 * hard-coded, which is the whole point: the client can add a fifth, sixth
 * or seventh card in Sanity and every line still starts at the correct
 * card edge and lands on the dial rim at the correct angle. Nothing here
 * is load-bearing — it's decoration layered on top of the grid, so if
 * measurement fails or JavaScript never runs, the section renders exactly
 * as it does now, just without the connectors.
 *
 * Desktop only (the cards sit above/below the dial on smaller screens,
 * where a connector would cross the layout rather than point at it).
 */
export function ProblemConnectors() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const host = hostRef.current;
    const grid = host?.parentElement;
    if (!host || !grid) return;

    const measure = () => {
      // The two-column layout only exists from `lg` up — below that the
      // cards wrap above and below the dial and lines make no sense.
      if (window.innerWidth < 1024) {
        setLines([]);
        return;
      }

      const dial = grid.querySelector<HTMLElement>("[data-dial]");
      const cards = grid.querySelectorAll<HTMLElement>("[data-problem-card]");
      if (!dial || !cards.length) {
        setLines([]);
        return;
      }

      const box = grid.getBoundingClientRect();
      const d = dial.getBoundingClientRect();
      const cx = d.left + d.width / 2 - box.left;
      const cy = d.top + d.height / 2 - box.top;
      // Stop just outside the painted rim so the line touches the dial
      // rather than disappearing under it.
      const radius = d.width / 2 + 6;

      const next: Line[] = [];
      cards.forEach((card) => {
        const c = card.getBoundingClientRect();
        const side = card.dataset.side === "right" ? "right" : "left";
        const x1 = (side === "left" ? c.right : c.left) - box.left;
        const y1 = c.top + c.height / 2 - box.top;

        const angle = Math.atan2(y1 - cy, x1 - cx);
        const x2 = cx + Math.cos(angle) * radius;
        const y2 = cy + Math.sin(angle) * radius;

        // Skip anything that would draw backwards through the dial.
        const reach = Math.hypot(x1 - cx, y1 - cy);
        if (reach <= radius + 8) return;

        next.push({ x1, y1, x2, y2 });
      });

      setSize({ w: box.width, h: box.height });
      setLines(next);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    window.addEventListener("resize", measure);
    // Fonts landing late can shift card heights after first paint.
    const t = window.setTimeout(measure, 400);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
    >
      {lines.length > 0 && size.w > 0 ? (
        <svg
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          className="h-full w-full"
        >
          {lines.map((l, i) => (
            <g key={`connector-${i}`}>
              <line
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="rgba(21,23,26,.22)"
                strokeWidth="1"
                strokeDasharray="4 5"
                strokeLinecap="round"
              />
              {/* the dot that sits against the card edge */}
              <circle cx={l.x1} cy={l.y1} r="3" fill="rgba(21,23,26,.28)" />
            </g>
          ))}
        </svg>
      ) : null}
    </div>
  );
}
