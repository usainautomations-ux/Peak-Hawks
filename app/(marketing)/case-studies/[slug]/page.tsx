import type { Metadata } from "next";
import { SanityImage as Image } from "@/components/ui/SanityImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getMergedCaseStudy, getAllMergedCaseStudySlugs } from "@/lib/content/caseStudyMerged";
import { getMergedContent } from "@/lib/content/merged";
import { caseStudyPortableTextComponents } from "@/components/PortableTextRenderer";

export const dynamic = "force-dynamic"; // always fetch fresh from Sanity, no caching

/** Pre-build every known case study slug at deploy time */
export async function generateStaticParams() {
  const slugs = await getAllMergedCaseStudySlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = await getMergedCaseStudy(slug);
  if (!cs) return { title: "Case study not found" };
  return {
    title: cs.seo?.title ?? `${cs.title} — PeakHawks Case Study`,
    description: cs.seo?.description ?? cs.excerpt,
    openGraph: {
      title: cs.seo?.title ?? cs.title,
      description: cs.seo?.description ?? cs.excerpt,
      ...(cs.coverImage ? { images: [{ url: cs.coverImage }] } : {}),
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // The three summary-strip labels below live on the Homepage's Case
  // Studies tab in Sanity (shared across every case study, same pattern
  // as Testimonials/Book A Call on the Case Studies listing page) — so
  // this fetch pulls in that shared content alongside the study itself.
  const [cs, content] = await Promise.all([
    getMergedCaseStudy(slug),
    getMergedContent(),
  ]);
  if (!cs) notFound();

  const { positioningLabel, angleLabel, competitionLabel } = content.caseStudiesIntro;
  const summaryRows: [string, string][] = [
    [positioningLabel || "Positioning", cs.positioning],
    [angleLabel || "Angle", cs.angle],
    [competitionLabel || "Competition", cs.competition],
  ].filter(([, v]) => Boolean(v)) as [string, string][];

  return (
    <main className="min-h-screen pt-[90px]">
      {/* cover image */}
      {cs.coverImage && (
        <div className="relative h-[420px] w-full bg-surface-2 lg:h-[520px]">
          <Image
            src={cs.coverImage}
            alt={cs.title}
            fill
            className="object-contain"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-[760px] px-6 py-16">
        {/* breadcrumb */}
        <div className="mb-8 font-mono text-[.68rem] uppercase tracking-wider text-grey">
          <Link href="/case-studies" className="transition hover:text-ember">
            ← All Case Studies
          </Link>
          {cs.tag && (
            <>
              <span className="mx-2">·</span>
              <span>{cs.tag}</span>
            </>
          )}
        </div>

        {/* header */}
        <h1 className="mb-5 text-[clamp(2rem,5vw,3rem)] leading-tight">{cs.title}</h1>

        {cs.result && (
          <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-ember/35 bg-ember/10 px-4 py-2 font-mono text-[.78rem] font-bold text-ember">
            ▲ {cs.result}
          </div>
        )}

        {/* summary card */}
        {summaryRows.length > 0 && (
          <dl className="mb-10 grid gap-0 overflow-hidden rounded-[14px] border border-line sm:grid-cols-3">
            {summaryRows.map(([k, v], i) => (
              <div
                key={`${i}-${k}`}
                className={[
                  "p-5",
                  i > 0 ? "border-t border-line sm:border-l sm:border-t-0" : "",
                ].join(" ")}
              >
                <dt className="mb-1.5 font-mono text-[.62rem] uppercase tracking-wider text-grey">
                  {k}
                </dt>
                <dd className="text-[.9rem] text-silver">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* excerpt intro */}
        {cs.excerpt && (
          <p className="mb-10 text-[1.12rem] font-medium leading-relaxed text-ink">
            {cs.excerpt}
          </p>
        )}

        {/* full write-up */}
        {cs.body && cs.body.length > 0 ? (
          <div className="prose-peakhawks">
            <PortableText value={cs.body} components={caseStudyPortableTextComponents} />
          </div>
        ) : (
          <p className="text-grey">
            The full write-up for this launch is coming soon — the summary above covers the
            key positioning decision and result.
          </p>
        )}

        {/* CTA at end of case study */}
        <div className="mt-20 rounded-[18px] border border-line-strong bg-surface p-10 text-center [background:radial-gradient(600px_200px_at_50%_-10%,rgba(234,92,0,.10),transparent_70%),#FFFFFF]">
          <div className="eyebrow justify-center">Your Peak, Our Passion</div>
          <h3 className="mt-1 mb-3 text-2xl">Want a launch like this one?</h3>
          <p className="mb-6 text-[.95rem]">
            One strategy call is all it takes to map out your next product opportunity.
          </p>
          <Link href="/#book-a-call" className="btn-primary">
            Book a Strategy Call <span className="arrow">→</span>
          </Link>
        </div>

        {/* back to listing */}
        <div className="mt-10 text-center">
          <Link
            href="/case-studies"
            className="font-mono text-[.72rem] uppercase tracking-wider text-grey transition hover:text-ember"
          >
            ← Back to all case studies
          </Link>
        </div>
      </div>
    </main>
  );
}
