import type { Metadata } from "next";
import Link from "next/link";
import { getMergedNewSellerContent } from "@/lib/content/merged";
import { Hero } from "@/components/sections/Hero";
import { LogoMarquee } from "@/components/sections/LogoMarquee";
import { Problems } from "@/components/sections/Problems";
import { WhyUs } from "@/components/sections/WhyUs";
import { Stats } from "@/components/sections/Stats";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { BookACall } from "@/components/sections/BookACall";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Chatbot } from "@/components/Chatbot";

/**
 * Same page template as the homepage — identical sections, identical
 * design, identical animations. Only the content differs, and that
 * content now lives in Sanity (the "New Sellers Page" document), with
 * lib/content/newSellerDefaults.ts as the fallback if a field is empty.
 */
export const dynamic = "force-dynamic"; // always fetch fresh from Sanity, no caching

export default async function NewSellerPage() {
  const content = await getMergedNewSellerContent();

  return (
    <>
      {/* cross-link banner — redirects the wrong-audience visitor */}
      {content.topBanner.text || content.topBanner.linkLabel ? (
        <div className="mt-[72px] border-b border-line bg-surface-2 py-2.5 text-center">
          <p className="font-mono text-[.68rem] uppercase tracking-wider text-grey">
            {content.topBanner.text}{" "}
            <Link
              href={content.topBanner.linkHref || "/"}
              className="text-ember underline-offset-2 hover:underline"
            >
              {content.topBanner.linkLabel}
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-[72px]" />
      )}

      <Hero data={content.hero} />
      <LogoMarquee logos={content.brandLogos} intro={content.brandsIntro} />
      <Problems
        items={content.problems}
        intro={content.problemsIntro}
        gauge={content.problemsGauge}
        banner={content.problemsBanner}
      />
      <WhyUs rows={content.whyUs} intro={content.whyUsIntro} />
      <Stats items={content.stats} intro={content.statsIntro} />
      <CaseStudies items={content.caseStudies} intro={content.caseStudiesIntro} />
      <LogoMarquee logos={content.categories} intro={content.categoriesIntro} />
      <Services items={content.services} intro={content.servicesIntro} />
      <Process steps={content.process} intro={content.processIntro} />
      <Testimonials items={content.testimonials} intro={content.testimonialsIntro} />
      <BookACall intro={content.bookIntro} leadForm={content.leadForm} />
      <FAQ items={content.faq} intro={content.faqIntro} />
      <FinalCTA data={content.cta} />
      <Chatbot />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://peakhawks.com";
  return {
    title: "PeakHawks — Launch Your First Amazon Product | For New Sellers",
    description:
      "Starting your first Amazon product or not yet at $10k/month? PeakHawks walks new sellers from product research through launch, without the guesswork.",
    alternates: { canonical: `${site}/newseller` },
  };
}
