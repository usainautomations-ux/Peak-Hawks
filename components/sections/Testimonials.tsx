import type { SectionIntro, Testimonial } from "@/lib/content/defaults";
import { GlowCard } from "@/components/ui/GlowCard";
import { Eyebrow } from "@/components/Eyebrow";
import { Accent } from "@/components/ui/Accent";
import { Reveal } from "@/components/Reveal";
import { SecMeta } from "@/components/SecMeta";
import { sanityThumb } from "@/lib/sanity/imageUrl";

/**
 * Client testimonials. Heading, eyebrow, section label and every
 * testimonial (quote, name, role, star rating, initials and an optional
 * uploaded photo) are editable in Sanity → "Testimonials".
 *
 * The grid auto-fits rather than being locked to three columns, so adding
 * a fourth, fifth or seventh testimonial rewraps cleanly instead of
 * leaving a broken row.
 */
export function Testimonials({
  items,
  intro,
}: {
  items: Testimonial[];
  intro: SectionIntro;
}) {
  if (!items.length) return null;

  return (
    <section id="testimonials" className="bg-surface py-20 lg:py-[110px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <SecMeta num={7} label={intro.sectionLabel || "Clients"} />
        <Reveal className="mx-auto mb-14 max-w-[640px] text-center">
          {intro.eyebrow ? (
            <Eyebrow className="justify-center">{intro.eyebrow}</Eyebrow>
          ) : null}
          <h2>
            <Accent text={intro.heading} accent={intro.headingAccent} />
          </h2>
          {intro.subhead ? (
            <p className="mx-auto mt-4 max-w-[520px]">
              <Accent text={intro.subhead} accent={intro.subheadAccent} />
            </p>
          ) : null}
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:items-stretch">
          {items.map((t, i) => {
            const stars = Math.max(0, Math.min(5, t.rating ?? 5));
            return (
              <Reveal key={`testimonial-${i}`} delay={i * 0.08} className="flex flex-col">
                <GlowCard className="flex flex-1 flex-col gap-5">
                  {stars > 0 ? (
                    <div className="tracking-[3px] text-ember" aria-label={`${stars} out of 5 stars`}>
                      {"\u2605".repeat(stars)}
                      <span className="text-line-strong">{"\u2605".repeat(5 - stars)}</span>
                    </div>
                  ) : null}
                  <p className="text-[.97rem] leading-relaxed text-silver">{t.quote}</p>
                  <div className="mt-auto flex items-center gap-3.5">
                    {t.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sanityThumb(t.avatar, 96)}
                        alt={t.name}
                        className="h-11 w-11 flex-none rounded-full border border-line-strong object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-line-strong bg-surface-2 font-display text-[.85rem] font-extrabold text-ember">
                        {t.initials}
                      </div>
                    )}
                    <div>
                      <div className="text-[.9rem] font-semibold">{t.name}</div>
                      <div className="font-mono text-[.66rem] uppercase tracking-wider text-grey">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
