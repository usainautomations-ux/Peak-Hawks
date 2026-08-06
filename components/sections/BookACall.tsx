import type { BookIntro } from "@/lib/content/defaults";
import { LeadForm } from "@/components/LeadForm";
import { BookingWidget } from "@/components/BookingWidget";
import { Accent } from "@/components/ui/Accent";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { SecMeta } from "@/components/SecMeta";

/**
 * The lead form + booking calendar block. Section label, eyebrow,
 * heading, paragraph and the numbered checklist are all editable in
 * Sanity → "Book A Call". The checklist numbers itself, so steps can be
 * added or removed freely.
 */
export function BookACall({ intro }: { intro: BookIntro }) {
  return (
    <section id="book-a-call" className="py-20 lg:py-[110px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <SecMeta num={8} label={intro.sectionLabel || "Contact"} />
        <Reveal
          data-dropdown-boundary
          className="relative grid gap-10 rounded-3xl border border-line-strong p-6 sm:gap-14 sm:p-14 lg:grid-cols-[1fr_1.15fr] [background:radial-gradient(600px_280px_at_85%_-10%,rgba(234,92,0,.13),transparent_60%),#FFFFFF]"
        >
          <div>
            {intro.eyebrow ? <Eyebrow>{intro.eyebrow}</Eyebrow> : null}
            <h2 className="mb-4 whitespace-pre-line">
              <Accent text={intro.heading} accent={intro.headingAccent} />
            </h2>
            {intro.body ? <p>{intro.body}</p> : null}
            {intro.steps?.length ? (
              <ul className="mt-7 flex flex-col gap-3.5">
                {intro.steps.map((t, i) => (
                  <li key={`book-step-${i}`} className="flex items-center gap-3 text-[.9rem] text-silver">
                    <span className="flex-none rounded-md border border-ember/35 bg-ember/10 px-2 py-0.5 font-mono text-[.65rem] text-ember">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <LeadForm />
        </Reveal>

        <BookingWidget />
      </div>
    </section>
  );
}
