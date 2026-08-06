import type {
  Problem,
  ProblemsIntro,
  ProblemsGauge,
  ProblemsBannerItem,
} from "@/lib/content/defaults";
import { Icon, IconBubble } from "@/components/ui/Icon";
import { Accent } from "@/components/ui/Accent";
import { Reveal } from "@/components/Reveal";
import { SecMeta } from "@/components/SecMeta";
import { ProblemConnectors } from "@/components/sections/ProblemConnectors";
import { sanityThumb } from "@/lib/sanity/imageUrl";

/** Text sizing for a Diagnosis Summary Bar block, keyed by the Studio's
 * "Text size" dropdown. "md" matches the size this bar has always used. */
const BANNER_SIZES = {
  sm: {
    value: "text-[clamp(1.3rem,5vw,1.9rem)]",
    text: "text-[.8rem] sm:text-[.84rem]",
    textOnly: "text-[clamp(0.95rem,3.6vw,1.2rem)]",
  },
  md: {
    value: "text-[clamp(1.8rem,7vw,2.8rem)]",
    text: "text-[.92rem] sm:text-[.98rem]",
    textOnly: "text-[clamp(1.1rem,4.4vw,1.5rem)]",
  },
  lg: {
    value: "text-[clamp(2.2rem,8vw,3.4rem)]",
    text: "text-[1rem] sm:text-[1.08rem]",
    textOnly: "text-[clamp(1.3rem,5vw,1.9rem)]",
  },
} as const;

/**
 * "Diagnosis" section — a dark score dial in the middle with the
 * bottleneck cards arranged around it, closing on a dark summary bar.
 *
 * Everything here is editable in Sanity Studio (Homepage / New Sellers
 * Page → "Diagnosis" tab): the section label, eyebrow + icon, heading,
 * orange accent phrase, subheading, each card's number/category/heading/
 * body/warning pill/icon, the dial's label, score, maximum and status,
 * and the summary bar blocks. Icons come from a fixed dropdown
 * (lib/icons.ts) so the client never has to supply an SVG — but every
 * icon slot can also be overridden with an uploaded image.
 *
 * Nothing is fixed at four cards: the array is split down the middle,
 * first half down the left column, second half down the right, and the
 * dashed connector lines are measured from the real card positions
 * (see ProblemConnectors) so they stay correct at any count.
 */

/**
 * The dark score dial.
 *
 * Deliberately a plain range readout, not a stepped volume-knob: one
 * quiet track arc, one orange arc filled to score/scoreMax, and nothing
 * else on the rim. The arc leaves a gap at the bottom so it reads as a
 * gauge rather than a closed ring.
 */
function ScoreDial({ data }: { data: ProblemsGauge }) {
  const max = data.scoreMax > 0 ? data.scoreMax : 100;
  const pct = Math.max(0, Math.min(1, data.score / max));

  const R = 98;
  const C = 2 * Math.PI * R;
  const SWEEP = 0.78; // fraction of the full circle the range spans
  const arc = C * SWEEP;
  // 0.25 of a turn is the bottom of the circle in SVG coordinates; half
  // the remaining gap is added so the opening sits centred on the bottom.
  const START = 0.25 + (1 - SWEEP) / 2;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px]">
      <svg viewBox="0 0 240 240" className="h-full w-full">
        {/* dial body */}
        <circle cx="120" cy="120" r="92" fill="#15171A" />
        <circle cx="120" cy="120" r="92" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" />
        <circle cx="120" cy="120" r="78" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1" />

        <g transform={`rotate(${START * 360} 120 120)`}>
          {/* the empty part of the range */}
          <circle
            cx="120"
            cy="120"
            r={R}
            fill="none"
            stroke="rgba(21,23,26,.12)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${arc} ${C}`}
          />
          {/* the filled part — this is the whole gauge */}
          <circle
            cx="120"
            cy="120"
            r={R}
            fill="none"
            stroke="#EA5C00"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${arc * pct} ${C}`}
          />
        </g>
      </svg>

      {/* dial face content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-11 text-center">
        <span className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-[11px] bg-ember/15 text-ember">
          {data.iconImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sanityThumb(data.iconImage, 64)} alt="" className="h-5 w-5 object-contain" />
          ) : (
            <Icon name={data.icon} size={20} />
          )}
        </span>
        <span className="max-w-[150px] font-mono text-[.6rem] uppercase leading-[1.5] tracking-[.16em] text-[#C9C9CE]">
          {data.label}
        </span>
        <div className="mt-1 flex items-baseline font-display font-extrabold leading-none tracking-tight">
          <span className="text-[clamp(2.6rem,6vw,3.4rem)] text-ember">{data.score}</span>
          <span className="text-[clamp(1.2rem,2.6vw,1.5rem)] text-[#8E8E95]">/{max}</span>
        </div>
        <span className="mt-2.5 h-px w-14 bg-white/15" />
        <p className="mt-2.5 max-w-[160px] font-display text-[.82rem] font-bold leading-tight text-[#F5F4F2]">
          <Accent text={data.status} accent={data.statusAccent} />
        </p>
      </div>
    </div>
  );
}

/** One bottleneck card. `side` tells the connector layer which edge its
 * dashed line should leave from. */
function ProblemCard({ item, side }: { item: Problem; side: "left" | "right" }) {
  return (
    <div
      data-problem-card
      data-side={side}
      className="group relative z-10 h-full rounded-[18px] border border-line bg-surface p-5 shadow-[0_16px_40px_-28px_rgba(21,23,26,.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(21,23,26,.13)] sm:p-6"
    >
      {/* Icon sits in its own fixed-width column; everything else — title,
          divider, body, badge — lives in the column to its right so it all
          shares one left edge. Previously the divider/body/badge spanned
          the card's full width, running back under the icon, which left
          no clear space beneath it. */}
      <div className="flex items-start gap-3.5 sm:gap-4">
        <IconBubble icon={item.icon} image={item.iconImage} alt="" size="cardResponsive" />
        <div className="min-w-0 flex-1 pt-0.5">
          {(item.number || item.category) && (
            <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[.66rem] uppercase tracking-[.16em] sm:text-[.68rem] sm:tracking-[.18em]">
              {item.number ? <b className="text-ember">{item.number}</b> : null}
              {item.category ? <span className="text-grey">{item.category}</span> : null}
            </div>
          )}
          <h3 className="text-[1.05rem] leading-tight sm:text-[1.15rem]">{item.title}</h3>

          <span className="mt-4 block h-[3px] w-10 rounded-full bg-ember" />
          <p className="mt-3.5 text-[.92rem] leading-relaxed">{item.body}</p>

          {item.badge ? (
            <span className="mt-5 inline-flex max-w-full items-start gap-2 rounded-lg bg-ember/10 px-3 py-1.5 text-left text-[.76rem] font-medium leading-snug text-ember sm:text-[.78rem]">
              <Icon name="alert" size={14} className="mt-0.5 flex-none" />
              {item.badge}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Problems({
  items,
  intro,
  gauge,
  banner,
}: {
  items: Problem[];
  intro: ProblemsIntro;
  gauge: ProblemsGauge;
  banner: ProblemsBannerItem[];
}) {
  const split = Math.ceil(items.length / 2);
  const left = items.slice(0, split);
  const right = items.slice(split);

  return (
    <section id="problems" className="py-20 lg:py-[110px]">
      <div className="mx-auto max-w-[1220px] px-6">
        <SecMeta num={intro.sectionNumber ?? 1} label={intro.sectionLabel || "Diagnosis"} />

        {/* ── heading ─────────────────────────────────────────────── */}
        <Reveal className="mx-auto mb-14 max-w-[760px] text-center">
          {intro.eyebrow ? (
            <span className="mb-4 inline-flex items-center gap-2.5 font-mono text-[.66rem] uppercase tracking-[.2em] text-ember sm:text-[.72rem] sm:tracking-[.22em]">
              <Icon name={intro.eyebrowIcon} size={16} className="flex-none" />
              {intro.eyebrow}
            </span>
          ) : null}
          <h2 className="text-[clamp(1.75rem,5.5vw,3.2rem)]">
            <Accent text={intro.heading} accent={intro.headingAccent} />
          </h2>
          {intro.headingSub ? (
            <h2 className="mt-1.5 text-[clamp(1.3rem,4.2vw,2.3rem)]">
              <Accent text={intro.headingSub} accent={intro.headingAccent} />
            </h2>
          ) : null}
          {intro.subhead ? (
            <p className="mx-auto mt-4 max-w-[560px]">
              <Accent text={intro.subhead} accent={intro.subheadAccent} />
            </p>
          ) : null}
        </Reveal>

        {/* ── cards around the dial ───────────────────────────────────
            The two side wrappers are `display: contents` below lg, so the
            cards become direct grid items of this container and reflow
            1-up / 2-up on small screens instead of being trapped in two
            tall columns. From lg they turn back into real flex columns
            either side of the dial, and ProblemConnectors draws the
            dashed lines between them at whatever count the client set. */}
        <div className="relative grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-x-14 lg:gap-y-6">
          <ProblemConnectors />

          <div className="contents lg:flex lg:flex-col lg:gap-6">
            {left.map((p, i) => (
              <Reveal key={`problem-l-${i}`} delay={i * 0.08} className="h-full">
                <ProblemCard item={p} side="left" />
              </Reveal>
            ))}
          </div>

          <Reveal className="order-first sm:col-span-2 lg:order-none lg:col-span-1 lg:w-[340px]">
            <div data-dial className="relative z-10">
              <ScoreDial data={gauge} />
            </div>
          </Reveal>

          <div className="contents lg:flex lg:flex-col lg:gap-6">
            {right.map((p, i) => (
              <Reveal key={`problem-r-${i}`} delay={i * 0.08} className="h-full">
                <ProblemCard item={p} side="right" />
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── dark summary bar ──────────────────────────────────────
            Auto-fits: two blocks sit side by side, three or more wrap
            onto as many rows as they need without the layout breaking. */}
        {banner.length ? (
          <Reveal delay={0.1} className="mt-8">
            <div className="grid gap-7 rounded-[20px] bg-[#15171A] px-6 py-8 sm:px-9 sm:py-9 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] md:gap-x-0 md:px-12">
              {banner.map((b, i) => {
                const size = BANNER_SIZES[b.textSize ?? "md"];
                return (
                  <div
                    key={`banner-${i}`}
                    className={[
                      // Icon top-aligns with the content column, same rule
                      // as the Diagnosis cards above — the icon sits at the
                      // top rather than centered against the block's full
                      // height, so a two-line block (like "Growth Fails In
                      // Systems. Not Channels.") doesn't visually drag the
                      // icon down or leave it looking randomly placed.
                      "flex items-start gap-4 sm:gap-5",
                      i > 0
                        ? "border-t border-white/10 pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0"
                        : "",
                      "md:pr-10",
                    ].join(" ")}
                  >
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-ember sm:h-14 sm:w-14">
                      {b.iconImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sanityThumb(b.iconImage, 64)} alt="" className="h-6 w-6 object-contain" />
                      ) : (
                        <Icon name={b.icon} size={22} />
                      )}
                    </span>
                    {b.value ? (
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1 sm:pt-1.5">
                        <span className={`font-display ${size.value} font-extrabold leading-none tracking-tight text-ember`}>
                          {b.value}
                        </span>
                        <span className={`font-display ${size.text} font-bold leading-snug text-[#F5F4F2]`}>
                          <Accent text={b.text} accent={b.textAccent} />
                        </span>
                      </div>
                    ) : (
                      <span className={`font-display ${size.textOnly} pt-1.5 block font-extrabold leading-tight tracking-tight text-[#F5F4F2] sm:pt-2`}>
                        <Accent text={b.text} accent={b.textAccent} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
