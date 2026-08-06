"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FAQ as FAQItem, SectionIntro } from "@/lib/content/defaults";
import { Accent } from "@/components/ui/Accent";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { SecMeta } from "@/components/SecMeta";

export function FAQ({ items, intro }: { items: FAQItem[]; intro: SectionIntro }) {
  const [open, setOpen] = useState(-1);
  return (
    <section id="faq" className="pb-[110px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <SecMeta num={9} label={intro.sectionLabel || "Questions"} />
        <Reveal className="mx-auto mb-14 max-w-[640px] text-center">
          {intro.eyebrow ? (
            <Eyebrow className="justify-center">{intro.eyebrow}</Eyebrow>
          ) : null}
          <h2>
            <Accent text={intro.heading} accent={intro.headingAccent} />
          </h2>
          {intro.subhead ? (
            <p className="mx-auto mt-4 max-w-[560px]">{intro.subhead}</p>
          ) : null}
        </Reveal>
        <Reveal className="mx-auto max-w-[780px]">
          {items.map((f, i) => (
            <div
              key={`faq-${i}`}
              className={[
                "mb-3 overflow-hidden rounded-[14px] border bg-surface transition",
                open === i ? "border-ember/50" : "border-line hover:border-ember/35",
              ].join(" ")}
            >
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-5 p-6 text-left font-display font-semibold"
              >
                {f.q}
                <span
                  className={[
                    "flex-none text-xl text-ember transition-transform",
                    open === i ? "rotate-45" : "",
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
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-[.93rem]">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </Reveal>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </section>
  );
}
