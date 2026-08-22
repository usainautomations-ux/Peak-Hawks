import type { FinalCta } from "@/lib/content/defaults";
import { Accent } from "@/components/ui/Accent";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

/**
 * The dark call-to-action band above the footer. Eyebrow, heading,
 * orange accent, subheading, button text and button destination are all
 * editable in Sanity → "Final CTA".
 *
 * This sits on the near-black `ink` background, so every piece of text in
 * here is explicitly light — the subheading in particular used to inherit
 * the dark body colour and all but vanished against the background.
 */
export function FinalCTA({ data }: { data: FinalCta }) {
  return (
    <section className="border-t border-white/10 bg-ink py-24 text-center sm:py-32 lg:py-[150px]">
      <Reveal className="mx-auto max-w-[1180px] px-5 sm:px-6">
        {data.eyebrow ? (
          <Eyebrow className="justify-center">{data.eyebrow}</Eyebrow>
        ) : null}
        <h2 className="mx-auto mb-5 max-w-[820px] text-[clamp(1.9rem,7vw,4.2rem)] text-white">
          <Accent text={data.heading} accent={data.headingAccent} className="text-orange" />
        </h2>
        {data.sub ? (
          <p className="mx-auto mb-9 max-w-[560px] text-[.98rem] text-white/85 sm:mb-10 sm:text-[1.08rem]">
            {data.sub}
          </p>
        ) : null}
        {data.buttonLabel ? (
          <a href={data.buttonHref || "#book-a-call"} className="btn-primary text-[1.05rem] !text-white">
            {data.buttonLabel} <span className="arrow">→</span>
          </a>
        ) : null}
      </Reveal>
    </section>
  );
}
