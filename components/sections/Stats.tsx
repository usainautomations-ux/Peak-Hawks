"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionIntro, Stat } from "@/lib/content/defaults";
import { Accent } from "@/components/ui/Accent";
import { SecMeta } from "@/components/SecMeta";

/**
 * Dark "silver feather" stats band.
 *
 * Section label, optional heading and every number/prefix/suffix/label
 * are editable in Sanity → "Stats". The row auto-fits, so three, five or
 * six stats all lay out evenly instead of leaving a ragged last row.
 */
export function Stats({ items, intro }: { items: Stat[]; intro: SectionIntro }) {
  if (!items.length) return null;

  return (
    <section
      id="results"
      className="border-y border-white/10 bg-[radial-gradient(700px_300px_at_50%_0%,rgba(234,92,0,.06),transparent_70%)] bg-[#15171A]"
    >
      <div className="mx-auto max-w-[1180px] px-6 pt-9">
        <SecMeta num={intro.sectionNumber ?? 3} label={intro.sectionLabel || "Proof"} dark />
        {intro.heading ? (
          <div className="mx-auto mb-10 max-w-[640px] text-center">
            {intro.eyebrow ? (
              <span className="mb-3 inline-block font-mono text-[.72rem] uppercase tracking-[.22em] text-ember">
                {intro.eyebrow}
              </span>
            ) : null}
            <h2 className="text-[#F5F4F2]">
              <Accent text={intro.heading} accent={intro.headingAccent} className="text-orange" />
            </h2>
            {intro.subhead ? (
              <p className="mx-auto mt-3.5 max-w-[520px] text-[#A6A6AC]">{intro.subhead}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
        {items.map((s, i) => (
          <StatCell key={`stat-${i}`} stat={s} first={i === 0} />
        ))}
      </div>
    </section>
  );
}

function StatCell({ stat, first }: { stat: Stat; first: boolean }) {
  const [n, setN] = useState(0);
  const [lit, setLit] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(stat.value);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;
        const duration = 1600;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(stat.value * eased));
          if (p < 1) requestAnimationFrame(tick);
          else setLit(true);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [stat.value]);

  return (
    <div
      ref={ref}
      className={[
        "border-white/10 px-8 py-14 text-center transition-colors hover:bg-ember/[.05]",
        first ? "" : "border-l max-lg:odd:border-l-0 max-lg:border-t",
      ].join(" ")}
    >
      <div className="font-mono text-[clamp(2rem,3.6vw,2.9rem)] font-bold tracking-tight text-[#F5F4F2]">
        {stat.prefix ?? ""}
        {n}
        <span
          className={[
            "text-orange transition-[text-shadow] duration-700",
            lit ? "[text-shadow:0_0_40px_rgba(249,115,22,.9)]" : "",
          ].join(" ")}
        >
          {stat.suffix}
        </span>
      </div>
      <div className="mt-2.5 font-mono text-[.68rem] uppercase tracking-[.18em] text-[#8E8E95]">
        {stat.label}
      </div>
    </div>
  );
}
