import { HawkMark } from "@/components/Nav";
import { LegalTrigger } from "@/components/LegalModal";
import type { FooterContent } from "@/lib/content/footerDefaults";
import { FOOTER_CREDIT } from "@/lib/content/footerDefaults";
import { sanityThumb } from "@/lib/sanity/imageUrl";

/**
 * The site footer — black background, light text throughout, with the
 * large PEAKHAWKS wordmark left white.
 *
 * Every string here comes from the "Footer" document in Sanity Studio
 * (lib/content/merged.ts → getMergedFooter). The footer sits in the
 * marketing layout rather than on an individual page, so editing it once
 * updates it on the homepage, the New Sellers page, the blog and the case
 * studies together.
 *
 * Layout note: the brand block and the link columns are a flex row that
 * wraps, NOT a single grid. A single grid would need a flexible track for
 * the brand column (`1.4fr`) alongside `repeat(auto-fit, …)` for the
 * links, and CSS forbids mixing auto-fit with flexible or intrinsic
 * sizes — the browser discards the entire declaration and every child
 * stacks into one tall column. Splitting them keeps the auto-fit
 * behaviour (any number of link columns still balances) while staying
 * valid.
 */
export function Footer({ data }: { data: FooterContent }) {
  const year = new Date().getFullYear();
  const legalLinkClass = "text-white/60 transition hover:text-ember";

  return (
    <footer className="border-t border-white/10 bg-ink pb-8 pt-12 text-white sm:pb-9 sm:pt-16">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-6">
        <div className="mb-10 flex flex-col gap-10 sm:mb-14 sm:gap-12 lg:flex-row lg:items-start lg:gap-16">
          {/* ── brand block ────────────────────────────────────────── */}
          <div className="lg:w-[300px] lg:flex-none">
            <a
              href="/"
              className="flex items-center gap-2.5 font-display text-xl font-extrabold text-white"
            >
              {data.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sanityThumb(data.logo, 440)}
                  alt=""
                  className="h-8 w-auto max-w-[220px] object-contain"
                />
              ) : (
                <>
                  <HawkMark />
                  <span>
                    {data.brandNameStart}
                    <b className="text-ember">{data.brandNameAccent}</b>
                  </span>
                </>
              )}
            </a>
            {data.tagline ? (
              <p className="mt-4 max-w-[320px] text-[.88rem] leading-relaxed text-white/70">
                {data.tagline}
              </p>
            ) : null}
          </div>

          {/* ── link columns ───────────────────────────────────────
              Only auto-fit lives in this track list, so it stays valid:
              two columns on phones, then as many as fit from `sm` up —
              three, four or five all balance with no code change. */}
          <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-8 min-[420px]:grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] sm:gap-y-10">
            {data.columns.map((col, ci) => (
              <div key={`footer-col-${ci}`} className="min-w-0">
                {col.title ? (
                  <h5 className="mb-4 font-mono text-[.66rem] uppercase tracking-[.18em] text-white/55">
                    {col.title}
                  </h5>
                ) : null}
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link, li) => (
                    <li key={`footer-link-${ci}-${li}`} className="min-w-0">
                      <a
                        href={link.href}
                        className="break-words text-[.88rem] text-white/75 transition hover:text-ember"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* the oversized wordmark — the one thing that stays white */}
        {data.wordmark ? (
          <div
            aria-hidden
            className="my-4 select-none overflow-hidden whitespace-nowrap text-center font-display text-[clamp(1.9rem,11.5vw,10rem)] font-black leading-[.85] tracking-tight text-white"
          >
            {data.wordmark}
          </div>
        ) : null}

        {/* ── bottom bar ──────────────────────────────────────────
            Stacks and centres on phones, spreads onto one row from sm. */}
        <div className="flex flex-col items-center gap-4 border-t border-white/10 pt-6 text-center font-mono text-[.62rem] leading-relaxed tracking-wider text-white/60 sm:gap-5 sm:pt-7 sm:text-[.68rem] md:flex-row md:flex-wrap md:justify-between md:text-left">
          <span>{data.copyright.replace(/\{year\}/g, String(year))}</span>
          <span className="flex flex-wrap justify-center gap-4">
            <LegalTrigger id="terms" className={legalLinkClass}>
              {data.legalLabels.terms}
            </LegalTrigger>
            <LegalTrigger id="privacy" className={legalLinkClass}>
              {data.legalLabels.privacy}
            </LegalTrigger>
            <LegalTrigger id="disclaimer" className={legalLinkClass}>
              {data.legalLabels.disclaimer}
            </LegalTrigger>
          </span>
          {/* Fixed build credit — read from a code constant, not from
              Sanity, so it cannot be edited or deleted from the Studio. */}
          <span className="w-full border-t border-white/10 pt-5 text-center">
            {FOOTER_CREDIT.text}{" "}
            <a
              href={FOOTER_CREDIT.href}
              target="_blank"
              rel="noopener"
              className="text-white transition hover:text-ember"
            >
              <b>{FOOTER_CREDIT.label}</b>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
