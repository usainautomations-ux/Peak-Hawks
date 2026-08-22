"use client";

import { useEffect, useState } from "react";

const PEAK = 29032; // ft — "your peak"

/** Right-rail scroll altitude meter, ported from the HTML mockup. */
export function Altimeter() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - innerHeight;
      setP(max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-[26px] top-1/2 z-[150] hidden -translate-y-1/2 select-none flex-col items-center gap-3 font-mono text-[.62rem] tracking-[.14em] text-grey xl:flex"
    >
      <span>ALT</span>
      <div className="relative h-[150px] w-0.5 overflow-hidden rounded bg-line">
        <div
          className="absolute left-0 top-0 w-full bg-ember"
          style={{ height: `${p * 100}%` }}
        />
      </div>
      <span className="font-bold text-ember">
        {Math.round(p * PEAK).toLocaleString()} FT
      </span>
    </div>
  );
}
