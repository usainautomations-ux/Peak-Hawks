"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SectionIntro, Service } from "@/lib/content/defaults";
import { Accent } from "@/components/ui/Accent";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { SecMeta } from "@/components/SecMeta";

/**
 * The services accordion. Section label, eyebrow, heading, orange accent
 * and every service row are editable in Sanity → "Services". Rows
 * renumber themselves, so services can be added, removed or dragged into
 * a new order without touching the code.
 */
export function Services({ items, intro }: { items: Service[]; intro: SectionIntro }) {
  const [open, setOpen] = useState(0);
  return (
    <section id="services" className="bg-surface py-20 lg:py-[110px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <SecMeta num={5} label={intro.sectionLabel || "Services"} />
        <Reveal className="mb-14 max-w-[640px]">
          {intro.eyebrow ? <Eyebrow>{intro.eyebrow}</Eyebrow> : null}
          <h2>
            <Accent text={intro.heading} accent={intro.headingAccent} />
          </h2>
          {intro.subhead ? <p className="mt-4">{intro.subhead}</p> : null}
        </Reveal>
        <Reveal className="border-t border-line">
          {items.map((s, i) => (
            <div key={`service-${i}`} className="border-b border-line transition hover:bg-ember/[.03]">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                className="grid w-full grid-cols-[70px_1fr_40px] items-center gap-5 py-7 text-left"
              >
                <span className="font-mono text-[.85rem] text-grey">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[clamp(1.1rem,2.2vw,1.55rem)] font-bold">
                  {s.title}
                </span>
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-grey transition",
                    open === i ? "rotate-45 border-ember text-ember" : "",
                  ].join(" ")}
                >
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-[760px] pb-8 pl-[92px] text-[.95rem]">{s.body}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
