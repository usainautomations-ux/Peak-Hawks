import { SanityImage as Image } from "@/components/ui/SanityImage";
import Link from "next/link";
import type { CaseStudiesIntro, CaseStudy } from "@/lib/content/defaults";
import { Accent } from "@/components/ui/Accent";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { SecMeta } from "@/components/SecMeta";

/** Dark accent section — matches the HTML mockup's inverted case-studies band.
 * Cards link to their own /case-studies/[slug] page when the case study is
 * backed by a real Sanity document (has a slug); fallback/demo content
 * without a matching page renders as a plain, non-linked card instead. */
export function CaseStudies({
  items,
  intro,
}: {
  items: CaseStudy[];
  intro: CaseStudiesIntro;
}) {
  if (!items.length) return null;

  return (
    <section id="case-studies" className="bg-[#15171A] py-20 lg:py-[110px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <SecMeta num={intro.sectionNumber ?? 4} label={intro.sectionLabel || "Launches"} dark />
        <Reveal className="mb-14 flex max-w-[900px] flex-wrap items-end justify-between gap-6">
          <div>
            {intro.eyebrow ? <Eyebrow>{intro.eyebrow}</Eyebrow> : null}
            <h2 className="text-[#F5F4F2]">
              <Accent text={intro.heading} accent={intro.headingAccent} className="text-orange" />
            </h2>
            {intro.subhead ? (
              <p className="mt-3.5 max-w-[560px] text-[#A6A6AC]">{intro.subhead}</p>
            ) : null}
          </div>
          {intro.linkLabel ? (
            <Link
              href={intro.linkHref || "/case-studies"}
              className="flex-none font-mono text-[.72rem] font-bold uppercase tracking-wider text-orange transition hover:underline"
            >
              {intro.linkLabel}
            </Link>
          ) : null}
        </Reveal>
        <div className="grid gap-5 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] md:items-stretch">
          {items.map((c, i) => {
            const card = (
              <article className="glow-card group relative flex flex-1 flex-col overflow-hidden rounded-[18px] border border-white/10 bg-[#1D2126] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,.5)]">
                <div className="relative aspect-[4/3] border-b border-dashed border-white/15 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.015)_0_12px,transparent_12px_24px)]">
                  {c.image ? (
                    <Image src={c.image} alt={c.title} fill className="object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-[.7rem] uppercase tracking-wider text-[#8E8E95]">
                      Client product image #{i + 1}
                    </div>
                  )}
                </div>
                <div className="p-7">
                  <span className="font-mono text-[.66rem] uppercase tracking-wider text-orange">
                    {c.tag}
                  </span>
                  <h3 className="mb-1.5 mt-1 text-xl text-[#F5F4F2] transition group-hover:text-orange">
                    {c.title}
                  </h3>
                  <dl className="mt-5 border-t border-white/10">
                    {[
                      ["Positioning", c.positioning],
                      ["Angle", c.angle],
                      ["Competition", c.competition],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="grid grid-cols-[104px_1fr] gap-3.5 border-b border-white/10 py-2.5 text-[.85rem]"
                      >
                        <dt className="pt-0.5 font-mono text-[.64rem] uppercase tracking-wider text-[#8E8E95]">
                          {k}
                        </dt>
                        <dd className="text-[#D6D6D6]">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex items-center justify-between font-mono text-[.8rem] text-orange">
                    <span>▲ {c.result}</span>
                    {c.slug && <span className="text-[.72rem] opacity-0 transition group-hover:opacity-100">Read case study →</span>}
                  </div>
                </div>
              </article>
            );

            return (
              <Reveal key={`case-${i}`} delay={i * 0.08} className="flex flex-col">
                {c.slug ? (
                  <Link href={`/case-studies/${c.slug}`} className="flex flex-1 flex-col">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
