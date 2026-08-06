"use client";

import { useEffect, useRef, useState } from "react";
import type { ProcessStep, SectionIntro } from "@/lib/content/defaults";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { Accent } from "@/components/ui/Accent";
import { Eyebrow } from "@/components/Eyebrow";
import { SecMeta } from "@/components/SecMeta";

/** Dark accent section — matches Stats/Case Studies inverted treatment. */
export function Process({
  steps,
  intro,
}: {
  steps: ProcessStep[];
  intro: SectionIntro;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const grid = gridRef.current;
    const line = lineRef.current;
    if (!grid || !line) return;

    if (prefersReducedMotion()) {
      setActiveCount(steps.length);
      return;
    }

    let st: { kill: () => void } | undefined;

    getGsap().then(({ gsap, ScrollTrigger }) => {
      const stepEls = grid.querySelectorAll<HTMLElement>("[data-step]");
      gsap.set(stepEls, { autoAlpha: 0, y: 44 });
      gsap.set(line, { scaleX: 0 });

      gsap.to(stepEls, {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.16,
        scrollTrigger: { trigger: grid, start: "top 82%" },
      });

      const tween = gsap.to(line, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: grid,
          start: "top 75%",
          end: "+=440",
          scrub: 1,
          onUpdate: (self) =>
            setActiveCount(Math.floor(self.progress * steps.length + 0.5)),
        },
      });
      st = tween.scrollTrigger ?? undefined;
    });

    return () => st?.kill();
  }, [steps.length]);

  return (
    <section id="process" className="bg-[#15171A] py-20 lg:py-[110px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <SecMeta num={6} label={intro.sectionLabel || "Flight Path"} dark />
        <div className="mx-auto mb-14 max-w-[640px] text-center">
          {intro.eyebrow ? (
            <Eyebrow className="justify-center">{intro.eyebrow}</Eyebrow>
          ) : null}
          <h2 className="text-[#F5F4F2]">
            <Accent text={intro.heading} accent={intro.headingAccent} className="text-orange" />
          </h2>
          {intro.subhead ? (
            <p className="mx-auto mt-3.5 max-w-[520px] text-[#A6A6AC]">{intro.subhead}</p>
          ) : null}
        </div>
        <div
          ref={gridRef}
          className="relative grid gap-6 md:grid-cols-[repeat(auto-fit,minmax(210px,1fr))]"
        >
          <div className="absolute left-[8%] right-[8%] top-[26px] hidden h-px bg-white/15 md:block" />
          <div
            ref={lineRef}
            className="absolute left-[8%] top-[26px] hidden h-0.5 origin-left bg-ember md:block"
            style={{ right: "8%" }}
          />
          {steps.map((s, i) => (
            <div key={`step-${i}`} data-step className="relative pt-16">
              <span
                className={[
                  "absolute left-0 top-3.5 flex h-[26px] w-[26px] items-center justify-center rounded-full border font-mono text-[.6rem] shadow-[0_0_0_6px_#15171A] transition",
                  i < activeCount
                    ? "border-ember bg-ember/25 text-orange shadow-[0_0_0_6px_#15171A,0_0_26px_rgba(234,92,0,.6)]"
                    : "border-white/20 bg-white/5 text-[#8E8E95]",
                ].join(" ")}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mb-2 block font-mono text-[.62rem] uppercase tracking-[.16em] text-[#8E8E95]">
                {s.tag}
              </span>
              <h4 className="mb-2.5 font-display text-lg font-bold text-[#F5F4F2]">{s.title}</h4>
              <p className="text-[.88rem] text-[#A6A6AC]">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
