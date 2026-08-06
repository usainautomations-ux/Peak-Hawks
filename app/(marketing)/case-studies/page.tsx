import type { Metadata } from "next";
import Link from "next/link";
import { SanityImage as Image } from "@/components/ui/SanityImage";
import { getMergedCaseStudyList } from "@/lib/content/caseStudyMerged";
import { getMergedContent } from "@/lib/content/merged";
import { Testimonials } from "@/components/sections/Testimonials";
import { BookACall } from "@/components/sections/BookACall";

export const dynamic = "force-dynamic"; // always fetch fresh from Sanity, no caching

export const metadata: Metadata = {
  title: "Case Studies — PeakHawks | Amazon Product Launches",
  description:
    "Real Amazon product launches — the positioning decisions, the competitive angle, and the results.",
};

export default async function CaseStudiesPage() {
  const [items, content] = await Promise.all([
    getMergedCaseStudyList(),
    getMergedContent(),
  ]);

  return (
    <main className="min-h-screen pt-[100px]">
      {/* header */}
      <div className="border-b border-white/10 bg-[#15171A] py-20 text-center">
        <span className="eyebrow justify-center">Proof of Work</span>
        <h1 className="mt-2 text-[clamp(2.4rem,5vw,3.6rem)] text-[#F5F4F2]">
          Amazon Launch <span className="text-orange">Case Studies</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[1.05rem] text-[#A6A6AC]">
          How research-led positioning decisions turned into rank and revenue —
          every launch, start to finish.
        </p>
      </div>

      <div className="mx-auto max-w-[1180px] px-6 py-20">
        {items.length === 0 ? (
          <div className="py-32 text-center">
            <div className="mb-4 font-mono text-[.72rem] uppercase tracking-wider text-grey">
              Coming soon
            </div>
            <h2 className="text-2xl">No case studies published yet.</h2>
            <p className="mt-3 text-grey">
              Check back soon — or{" "}
              <Link href="#book-a-call" className="text-ember hover:underline">
                book a strategy call
              </Link>{" "}
              in the meantime.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((cs) => (
              <Link key={cs.slug} href={`/case-studies/${cs.slug}`} className="group">
                <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-surface transition hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(21,23,26,.10)]">
                  <div className="relative aspect-[4/3] bg-surface-2">
                    {cs.coverImage ? (
                      <Image
                        src={cs.coverImage}
                        alt={cs.title}
                        fill
                        className="object-contain transition group-hover:scale-[1.02]"
                        sizes="(max-width:768px)100vw,(max-width:1180px)50vw,380px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[repeating-linear-gradient(45deg,rgba(21,23,26,.02)_0_12px,transparent_12px_24px)] font-mono text-[.7rem] uppercase tracking-wider text-grey">
                        No cover image
                      </div>
                    )}
                    {cs.tag && (
                      <span className="absolute left-3 top-3 rounded-full bg-ember/90 px-3 py-1 font-mono text-[.62rem] uppercase tracking-wider text-white">
                        {cs.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="mb-2 font-display text-lg font-bold leading-snug transition group-hover:text-ember">
                      {cs.title}
                    </h2>
                    {cs.excerpt && (
                      <p className="line-clamp-3 flex-1 text-[.9rem]">{cs.excerpt}</p>
                    )}
                    {cs.result && (
                      <div className="mt-4 font-mono text-[.8rem] text-ember">▲ {cs.result}</div>
                    )}
                    <div className="mt-3 font-mono text-[.72rem] font-bold uppercase tracking-wider text-ember">
                      Read case study →
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Testimonials items={content.testimonials} intro={content.testimonialsIntro} hideMeta />
      <BookACall intro={content.bookIntro} hideMeta />
    </main>
  );
}
