"use client";

import { useEffect, useState } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { sanityThumb } from "@/lib/sanity/imageUrl";

/**
 * Runs once on first load. Dispatches a `peakhawks:preloader-done` event
 * on <body> when finished — Hero listens for this to start its own
 * entrance timeline immediately after, exactly like the original mockup.
 *
 * `logo` is the same site-wide upload used in the nav bar (Sanity →
 * Footer → "Site Logo"). When set, it replaces the hand-drawn hawk-feather
 * SVG below with the uploaded image — carrying the `pre-feather` and
 * `pre-mark` classes so it still picks up the exact same GSAP entrance
 * (fade/rise in, then scale + glow) without any animation code changing.
 */
export function Preloader({ logo }: { logo?: string }) {
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      document.body.classList.remove("loading");
      document.body.dispatchEvent(new CustomEvent("peakhawks:preloader-done"));
      setDone(true);
      return;
    }

    document.body.classList.add("loading");
    let ctx: { revert: () => void } | undefined;

    // Safety net: if GSAP fails to load for any reason (network hiccup,
    // blocked chunk, etc.), the preloader must never stay stuck covering
    // the entire page forever. This finishes it the plain way after a
    // generous timeout that's well past the ~2.5s the animation normally
    // takes, so it never interferes with a normal run.
    const finish = () => {
      document.body.classList.remove("loading");
      document.body.dispatchEvent(new CustomEvent("peakhawks:preloader-done"));
      setDone(true);
    };
    const rescueTimer = window.setTimeout(finish, 6000);

    getGsap()
      .then(({ gsap }) => {
        ctx = gsap.context(() => {
          const state = { v: 0 };
          gsap
            .timeline({
              onComplete: () => {
                window.clearTimeout(rescueTimer);
                finish();
              },
            })
            .to(".pre-feather", {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.45,
              stagger: 0.08,
              ease: "power2.out",
            })
            .to(
              state,
              {
                v: 100,
                duration: 1.5,
                ease: "power2.inOut",
                onUpdate: () => setPct(Math.round(state.v)),
              },
              "-=0.5",
            )
            .to(".pre-mark", {
              scale: 1.12,
              filter: "drop-shadow(0 0 60px rgba(234,92,0,.45))",
              duration: 0.35,
              ease: "power2.in",
            })
            .to("#preloader", { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "+=0.1");
        });
      })
      .catch(() => {
        // GSAP failed to load — the rescue timer will still finish this
        // cleanly a few seconds later.
      });

    return () => {
      window.clearTimeout(rescueTimer);
      ctx?.revert();
    };
  }, []);

  if (done) return null;

  const FEATHERS: [string, string][] = [
    ["M6 8 L22 14 L27 19 L14 17 Z", "#5F5F5F"],
    ["M8 22 L24 21 L27 24 L13 27 Z", "#7A7A7E"],
    ["M13 32 L26 27 L28 30 L18 37 Z", "#8B8B90"],
    ["M22 39 L28 32 L30 34 L26 42 Z", "#A9A9AD"],
    ["M31 33 L30 27 L33 28 L34 34 Z", "#C6C6C9"],
    ["M36 30 L33 25 L37 25 L39 29 Z", "#DBDBDD"],
  ];

  return (
    <div
      id="preloader"
      role="status"
      aria-live="polite"
      aria-label="Loading PeakHawks"
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-8 bg-bg"
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sanityThumb(logo, 260)}
          alt=""
          className="pre-mark pre-feather h-[110px] w-[110px] object-contain drop-shadow-[0_0_40px_rgba(234,92,0,.2)]"
          style={{ opacity: 0, transform: "translate(0, 6px)" }}
        />
      ) : (
        <svg viewBox="0 0 48 48" className="pre-mark h-[110px] w-[110px] drop-shadow-[0_0_40px_rgba(234,92,0,.2)]">
          {FEATHERS.map(([d, fill], i) => (
            <path
              key={i}
              d={d}
              fill={fill}
              className="pre-feather"
              style={{ opacity: 0, transform: "translate(-6px, 6px)" }}
            />
          ))}
          <path d="M27 14 L34 12 L38 15 L33 19 L28 18 Z" fill="#F97316" className="pre-feather" style={{ opacity: 0 }} />
          <path d="M34 12 L41 14 L37 16 Z" fill="#EA5C00" className="pre-feather" style={{ opacity: 0 }} />
        </svg>
      )}

      <div className="flex items-baseline gap-1.5 font-mono text-4xl font-bold text-ink">
        {pct}
        <small className="text-sm text-ember tracking-wider">% ALT</small>
      </div>

      <div className="h-0.5 w-[210px] overflow-hidden rounded-full bg-line">
        <div
          className="h-full bg-ember shadow-[0_0_14px_rgba(234,92,0,.6)] transition-[width] duration-100"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="font-mono text-[.62rem] uppercase tracking-[.3em] text-grey">
        PeakHawks // Ascending
      </div>
    </div>
  );
}
