import { SanityImage as Image } from "@/components/ui/SanityImage";
import type { WhyUsRow, WhyUsIntro, OutcomeIcon } from "@/lib/content/defaults";
import { Accent } from "@/components/ui/Accent";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { SecMeta } from "@/components/SecMeta";

/**
 * The "growth loop" capability section — alternating rows of copy and a
 * large visual panel, each closing on a highlighted Outcome callout.
 *
 * Everything here is editable in Sanity Studio (Homepage / New Sellers
 * Page → "Why Us" tab): the section heading and its orange accent word,
 * plus per-row eyebrow, heading, body, bullet points, outcome label,
 * outcome statement, outcome icon and the image itself. Any field left
 * blank falls through to lib/content/defaults.ts (or newSellerDefaults.ts),
 * and the outcome box is simply omitted for rows with no outcome text.
 */

/** Small fixed icon set for the outcome callout — chosen by a dropdown in
 * the Studio, so the client never has to supply an SVG. */
function OutcomeGlyph({ icon = "growth" }: { icon?: OutcomeIcon }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "target":
      return (
        <svg {...common} aria-hidden>
          <circle cx="11" cy="13" r="8" />
          <circle cx="11" cy="13" r="3.4" />
          <path d="M13.4 10.6 21 3" />
          <path d="M17.4 3h3.4v3.4" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.2 12.3 2.6 2.6 5-5.4" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3.2 13.9 9l5.8 1.9-5.8 1.9L12 18.6l-1.9-5.8L4.3 10.9 10.1 9 12 3.2Z" />
          <path d="M18.6 16.4 19.4 19l2.6.8-2.6.8-.8 2.6" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <path d="M4 20V13.5" />
          <path d="M9.3 20v-9" />
          <path d="M14.6 20V8" />
          <path d="M13 4.6h6.4V11" />
          <path d="m19.4 4.6-8 8" />
        </svg>
      );
  }
}

export function WhyUs({ rows, intro }: { rows: WhyUsRow[]; intro: WhyUsIntro }) {
  return (
    <section id="why-us" className="bg-surface py-20 lg:py-[110px]">
      <div className="mx-auto max-w-[1220px] px-6">
        <SecMeta num={intro.sectionNumber ?? 2} label={intro.sectionLabel || "Capability"} />
        <Reveal className="mb-16 max-w-[680px]">
          {intro.eyebrow ? <Eyebrow>{intro.eyebrow}</Eyebrow> : null}
          <h2>
            <Accent text={intro.heading} accent={intro.headingAccent} />
          </h2>
          {intro.subhead ? <p className="mt-4">{intro.subhead}</p> : null}
        </Reveal>

        <div className="flex flex-col gap-14 sm:gap-20 lg:gap-24">
          {rows.map((row, i) => {
            /* Row 1 puts the visual on the right, row 2 on the left, and
               so on — matching the zig-zag in the approved design. */
            const visualRight = i % 2 === 0;

            return (
              <div
                key={`whyus-${i}`}
                className="grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-16"
              >
                {/* ── copy column ───────────────────────────────────── */}
                <Reveal
                  className={[
                    "lg:col-span-5",
                    visualRight ? "lg:order-1" : "lg:order-2",
                  ].join(" ")}
                >
                  <Eyebrow>{row.eyebrow}</Eyebrow>
                  <h3 className="text-[clamp(1.6rem,3vw,2.35rem)] leading-[1.12]">
                    {row.title}
                  </h3>
                  <span className="mt-6 block h-[3px] w-12 rounded-full bg-ember" />
                  <p className="mt-6 text-[1.03rem] leading-[1.75]">{row.body}</p>

                  {row.points?.length ? (
                    <ul className="mt-6 flex flex-col gap-3">
                      {row.points.map((pt, pi) => (
                        <li
                          key={`point-${i}-${pi}`}
                          className="flex items-start gap-3 text-[.93rem] text-silver"
                        >
                          <span className="mt-0.5 flex-none rounded-md border border-ember/30 bg-ember/10 px-1.5 text-ember">
                            ✓
                          </span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {row.outcome ? (
                    <div className="mt-8 flex items-start gap-4 border-t border-dashed border-line-strong pt-7 sm:mt-9 sm:gap-5 sm:pt-8">
                      <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full bg-ember/10 text-ember sm:h-[62px] sm:w-[62px]">
                        <OutcomeGlyph icon={row.outcomeIcon} />
                      </span>
                      <div className="pt-1">
                        <span className="font-mono text-[.68rem] uppercase tracking-[.22em] text-ember">
                          {row.outcomeLabel?.trim() || "Outcome"}
                        </span>
                        <p className="mt-2 font-display text-[clamp(1.02rem,1.5vw,1.2rem)] font-extrabold leading-snug tracking-tight text-ink">
                          {row.outcome}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </Reveal>

                {/* ── visual column ─────────────────────────────────── */}
                <Reveal
                  delay={0.1}
                  className={[
                    "lg:col-span-7",
                    visualRight ? "lg:order-2" : "lg:order-1",
                  ].join(" ")}
                >
                  <div className="rounded-[20px] border border-line bg-surface p-2 shadow-[0_34px_80px_-38px_rgba(21,23,26,.42)] sm:rounded-[24px] sm:p-2.5">
                    <div
                      className={[
                        "relative aspect-[16/10] overflow-hidden rounded-[14px] sm:rounded-[18px]",
                        row.image
                          ? "bg-surface-2/40"
                          : "border border-dashed border-line-strong bg-[repeating-linear-gradient(45deg,rgba(21,23,26,.02)_0_12px,transparent_12px_24px),linear-gradient(160deg,#F6F6F8,#ECECEF)]",
                      ].join(" ")}
                    >
                      {row.image ? (
                        <Image
                          src={row.image}
                          alt={row.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 700px"
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-6 text-center font-mono text-[.72rem] uppercase tracking-wider text-grey">
                          Client image
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
