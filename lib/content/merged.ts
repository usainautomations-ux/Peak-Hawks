import {
  getPageContent as getSanityHomepage,
  getNewSellerPageContent as getSanityNewSeller,
  getFeaturedCaseStudies,
} from "@/lib/sanity/queries";
import { getFooterContent as getSanityFooter } from "@/lib/sanity/queries";
import type { SanityPageContent, SanitySectionIntro } from "@/lib/sanity/types";
import type { BrandLogo, SectionIntro, SiteContent } from "@/lib/content/defaults";
import { defaultContent } from "@/lib/content/defaults";
import { newSellerDefaults } from "@/lib/content/newSellerDefaults";
import type { FooterContent } from "@/lib/content/footerDefaults";
import { footerDefaults } from "@/lib/content/footerDefaults";

/** Field-by-field overlay for the shared section-heading block. Empty
 * strings in the Studio count as "not set" so the client can never
 * accidentally wipe a heading by clearing a field. */
function overlayIntro<T extends SectionIntro>(base: T, s?: SanitySectionIntro): T {
  if (!s) return base;
  const pick = (v: string | undefined, fallback: string | undefined) =>
    v != null && v.trim() !== "" ? v : fallback;
  return {
    ...base,
    sectionLabel: pick(s.sectionLabel, base.sectionLabel) ?? "",
    sectionNumber: s.sectionNumber ?? base.sectionNumber,
    eyebrow: pick(s.eyebrow, base.eyebrow) ?? "",
    heading: pick(s.heading, base.heading) ?? "",
    headingAccent: s.headingAccent ?? base.headingAccent,
    subhead: pick(s.subhead, base.subhead),
    subheadAccent: s.subheadAccent ?? base.subheadAccent,
  };
}

/** Brand strip entries accept either a plain text name, an uploaded logo
 * image, or both. Documents created before the image option existed stored
 * plain strings, so those are normalised here rather than migrated. */
function normaliseBrandLogos(
  raw: SanityPageContent["brandLogos"],
  base: BrandLogo[],
): BrandLogo[] {
  if (!raw?.length) return base;

  // Never trust the shape here. A brand can legitimately have a logo and
  // no name, an older document can still hold a plain string, and a
  // half-filled row in the Studio can hold neither — so coerce rather
  // than assume, and drop only the genuinely empty rows.
  const asText = (value: unknown): string =>
    typeof value === "string" ? value : "";

  const out = raw
    .map((entry): BrandLogo => {
      if (typeof entry === "string") return { name: entry };
      return {
        name: asText(entry?.name),
        logo: typeof entry?.logo === "string" ? entry.logo : undefined,
      };
    })
    // an entry with neither a name nor an uploaded logo would render as a gap
    .filter((b) => b.name.trim() !== "" || Boolean(b.logo));

  return out.length ? out : base;
}

/**
 * Content model: Sanity is the ONLY source of editable site content.
 * GHL Custom Values are NOT used here — GHL's role on this project is
 * strictly leads and booking (see lib/ghl/crm.ts, lib/ghl/calendar.ts,
 * and the /api/leads, /api/booking routes), never page content. That split
 * used to be blurred by a legacy three-tier merge (Sanity > GHL > code
 * defaults); it's now two-tier and unambiguous:
 *
 *   1. Sanity document (client edits in /studio — this is what "publishing"
 *      in the Studio actually changes)
 *   2. Code defaults (lib/content/defaults.ts, lib/content/newSellerDefaults.ts)
 *      — used for any field the client hasn't filled in yet, and as the
 *      seed content the Studio documents start from (see scripts/seed-sanity.ts).
 *
 * Case studies are the one exception to "Sanity document overlays base
 * page-by-page": which case studies appear on a landing page is controlled
 * by a toggle ("Show on Homepage" / "Show on New Sellers Page") on the
 * case study itself, not by a field on the page document. So they're
 * fetched separately here (getFeaturedCaseStudies) and merged in after
 * the rest of the page content.
 */

/**
 * Overlays a Sanity document onto a base SiteContent object, field by
 * field. Anything set in Sanity wins; anything left empty in Sanity falls
 * through to the base. Shared by both the homepage and the New Sellers
 * page since they use the identical "pageContent" schema shape.
 *
 * Note: caseStudies is handled separately by the caller (see below) since
 * it no longer lives on the page document — see the comment above.
 */
function overlaySanity(base: SiteContent, sanity: SanityPageContent | null): SiteContent {
  if (!sanity) return base;

  return {
    topBanner: {
      text: sanity.topBanner?.text ?? base.topBanner.text,
      linkLabel: sanity.topBanner?.linkLabel ?? base.topBanner.linkLabel,
      linkHref: sanity.topBanner?.linkHref ?? base.topBanner.linkHref,
    },
    hero: {
      badge: sanity.hero?.badge ?? base.hero.badge,
      headline: sanity.hero?.headlineLines ?? base.hero.headline,
      headlineAccent: sanity.hero?.headlineAccent ?? base.hero.headlineAccent,
      subhead: sanity.hero?.subhead ?? base.hero.subhead,
      note: sanity.hero?.note ?? base.hero.note,
      videoUrl: sanity.hero?.videoUrl ?? base.hero.videoUrl,
      posterImage: sanity.hero?.posterImage ?? base.hero.posterImage,
      posterImageMobile:
        sanity.hero?.posterImageMobile ?? base.hero.posterImageMobile,
      chips: sanity.hero?.chips?.length ? sanity.hero.chips : base.hero.chips,
    },
    statsIntro: overlayIntro(base.statsIntro, sanity.statsIntro),
    stats: sanity.stats?.length ? sanity.stats : base.stats,
    brandsIntro: overlayIntro(base.brandsIntro, sanity.brandsIntro),
    brandLogos: normaliseBrandLogos(sanity.brandLogos, base.brandLogos),
    categoriesIntro: overlayIntro(base.categoriesIntro, sanity.categoriesIntro),
    categories: normaliseBrandLogos(sanity.categories, base.categories),
    problemsIntro: {
      sectionLabel:
        sanity.problemsIntro?.sectionLabel ?? base.problemsIntro.sectionLabel,
      sectionNumber:
        sanity.problemsIntro?.sectionNumber ?? base.problemsIntro.sectionNumber,
      eyebrow: sanity.problemsIntro?.eyebrow ?? base.problemsIntro.eyebrow,
      eyebrowIcon:
        sanity.problemsIntro?.eyebrowIcon ?? base.problemsIntro.eyebrowIcon,
      heading: sanity.problemsIntro?.heading ?? base.problemsIntro.heading,
      headingSub:
        sanity.problemsIntro?.headingSub ?? base.problemsIntro.headingSub,
      headingAccent:
        sanity.problemsIntro?.headingAccent ?? base.problemsIntro.headingAccent,
      subhead: sanity.problemsIntro?.subhead ?? base.problemsIntro.subhead,
      subheadAccent:
        sanity.problemsIntro?.subheadAccent ?? base.problemsIntro.subheadAccent,
    },
    problems: sanity.problems?.length ? sanity.problems : base.problems,
    problemsGauge: {
      label: sanity.problemsGauge?.label ?? base.problemsGauge.label,
      score: sanity.problemsGauge?.score ?? base.problemsGauge.score,
      scoreMax: sanity.problemsGauge?.scoreMax ?? base.problemsGauge.scoreMax,
      status: sanity.problemsGauge?.status ?? base.problemsGauge.status,
      statusAccent:
        sanity.problemsGauge?.statusAccent ?? base.problemsGauge.statusAccent,
      icon: sanity.problemsGauge?.icon ?? base.problemsGauge.icon,
      iconImage: sanity.problemsGauge?.iconImage ?? base.problemsGauge.iconImage,
    },
    problemsBanner: sanity.problemsBanner?.length
      ? sanity.problemsBanner
      : base.problemsBanner,
    whyUsIntro: {
      sectionLabel:
        sanity.whyUsIntro?.sectionLabel ?? base.whyUsIntro.sectionLabel,
      sectionNumber:
        sanity.whyUsIntro?.sectionNumber ?? base.whyUsIntro.sectionNumber,
      eyebrow: sanity.whyUsIntro?.eyebrow ?? base.whyUsIntro.eyebrow,
      heading: sanity.whyUsIntro?.heading ?? base.whyUsIntro.heading,
      headingAccent:
        sanity.whyUsIntro?.headingAccent ?? base.whyUsIntro.headingAccent,
      subhead: sanity.whyUsIntro?.subhead ?? base.whyUsIntro.subhead,
    },
    whyUs: sanity.whyUs?.length
      ? sanity.whyUs.map((r) => ({
          eyebrow: r.eyebrow,
          title: r.title,
          body: r.body,
          points: r.points ?? [],
          outcomeLabel: r.outcomeLabel,
          outcome: r.outcome,
          outcomeIcon: r.outcomeIcon,
          image: r.image,
        }))
      : base.whyUs,
    caseStudiesIntro: {
      ...overlayIntro(base.caseStudiesIntro, sanity.caseStudiesIntro),
      linkLabel: sanity.caseStudiesIntro?.linkLabel ?? base.caseStudiesIntro.linkLabel,
      linkHref: sanity.caseStudiesIntro?.linkHref ?? base.caseStudiesIntro.linkHref,
      positioningLabel:
        sanity.caseStudiesIntro?.positioningLabel?.trim() ||
        base.caseStudiesIntro.positioningLabel,
      angleLabel:
        sanity.caseStudiesIntro?.angleLabel?.trim() || base.caseStudiesIntro.angleLabel,
      competitionLabel:
        sanity.caseStudiesIntro?.competitionLabel?.trim() ||
        base.caseStudiesIntro.competitionLabel,
    },
    caseStudies: base.caseStudies, // placeholder — overwritten by the caller with featured case studies
    servicesIntro: overlayIntro(base.servicesIntro, sanity.servicesIntro),
    services: sanity.services?.length ? sanity.services : base.services,
    processIntro: overlayIntro(base.processIntro, sanity.processIntro),
    process: sanity.process?.length ? sanity.process : base.process,
    testimonialsIntro: overlayIntro(base.testimonialsIntro, sanity.testimonialsIntro),
    testimonials: sanity.testimonials?.length
      ? sanity.testimonials.map((t) => ({
          quote: t.quote,
          name: t.name,
          role: t.role,
          initials: t.initials,
          avatar: t.avatar,
          rating: t.rating,
        }))
      : base.testimonials,
    bookIntro: {
      sectionLabel: sanity.bookIntro?.sectionLabel ?? base.bookIntro.sectionLabel,
      sectionNumber: sanity.bookIntro?.sectionNumber ?? base.bookIntro.sectionNumber,
      eyebrow: sanity.bookIntro?.eyebrow ?? base.bookIntro.eyebrow,
      heading: sanity.bookIntro?.heading ?? base.bookIntro.heading,
      headingAccent: sanity.bookIntro?.headingAccent ?? base.bookIntro.headingAccent,
      body: sanity.bookIntro?.body ?? base.bookIntro.body,
      steps: sanity.bookIntro?.steps?.length ? sanity.bookIntro.steps : base.bookIntro.steps,
    },
    leadForm: {
      nameLabel: sanity.leadForm?.nameLabel?.trim() || base.leadForm.nameLabel,
      namePlaceholder:
        sanity.leadForm?.namePlaceholder?.trim() || base.leadForm.namePlaceholder,
      emailLabel: sanity.leadForm?.emailLabel?.trim() || base.leadForm.emailLabel,
      emailPlaceholder:
        sanity.leadForm?.emailPlaceholder?.trim() || base.leadForm.emailPlaceholder,
      revenueLabel: sanity.leadForm?.revenueLabel?.trim() || base.leadForm.revenueLabel,
      revenueOptions: sanity.leadForm?.revenueOptions?.length
        ? sanity.leadForm.revenueOptions
        : base.leadForm.revenueOptions,
      productsLabel: sanity.leadForm?.productsLabel?.trim() || base.leadForm.productsLabel,
      productsOptions: sanity.leadForm?.productsOptions?.length
        ? sanity.leadForm.productsOptions
        : base.leadForm.productsOptions,
      budgetLabel: sanity.leadForm?.budgetLabel?.trim() || base.leadForm.budgetLabel,
      budgetOptions: sanity.leadForm?.budgetOptions?.length
        ? sanity.leadForm.budgetOptions
        : base.leadForm.budgetOptions,
      submitLabel: sanity.leadForm?.submitLabel?.trim() || base.leadForm.submitLabel,
      submitLoadingLabel:
        sanity.leadForm?.submitLoadingLabel?.trim() || base.leadForm.submitLoadingLabel,
      successHeading:
        sanity.leadForm?.successHeading?.trim() || base.leadForm.successHeading,
      successBody: sanity.leadForm?.successBody?.trim() || base.leadForm.successBody,
    },
    faqIntro: overlayIntro(base.faqIntro, sanity.faqIntro),
    faq: sanity.faq?.length ? sanity.faq : base.faq,
    cta: {
      eyebrow: sanity.cta?.eyebrow ?? base.cta.eyebrow,
      heading: sanity.cta?.heading ?? base.cta.heading,
      headingAccent: sanity.cta?.headingAccent ?? base.cta.headingAccent,
      sub: sanity.cta?.sub ?? base.cta.sub,
      buttonLabel: sanity.cta?.buttonLabel ?? base.cta.buttonLabel,
      buttonHref: sanity.cta?.buttonHref ?? base.cta.buttonHref,
    },
    contact: { email: sanity.contact?.email ?? base.contact.email },
  };
}

/**
 * Homepage content ($10k+ sellers). Priority order:
 *   1. Sanity "Homepage" document (client edits here)
 *   2. Code defaults (lib/content/defaults.ts)
 *
 * Case studies: any case study with "Homepage" toggled on, newest first.
 * Falls back to the built-in defaults if none are toggled on yet.
 */
export async function getMergedContent(): Promise<SiteContent> {
  const [sanity, featured] = await Promise.all([
    getSanityHomepage().catch(() => null),
    getFeaturedCaseStudies("homepage").catch(() => []),
  ]);
  const merged = overlaySanity(defaultContent, sanity);
  if (featured.length) merged.caseStudies = featured;
  return merged;
}

/**
 * New Sellers page content (pre-launch / sub-$10k sellers). Priority order:
 *   1. Sanity "New Sellers Page" document (client edits here)
 *   2. Static defaults tailored to this audience (lib/content/newSellerDefaults.ts)
 *
 * Case studies: any case study with "New Sellers Page" toggled on.
 */
export async function getMergedNewSellerContent(): Promise<SiteContent> {
  const [sanity, featured] = await Promise.all([
    getSanityNewSeller().catch(() => null),
    getFeaturedCaseStudies("newSellerPage").catch(() => []),
  ]);
  const merged = overlaySanity(newSellerDefaults, sanity);
  if (featured.length) merged.caseStudies = featured;
  return merged;
}

/**
 * Footer content, shared by every page. Sanity "Footer" document first,
 * lib/content/footerDefaults.ts for anything the client hasn't filled in.
 */
export async function getMergedFooter(): Promise<FooterContent> {
  const f = await getSanityFooter().catch(() => null);
  if (!f) return footerDefaults;

  const columns = f.columns?.length
    ? f.columns.map((c) => ({
        title: c.title ?? "",
        links: (c.links ?? [])
          .filter((l) => (l.label ?? "").trim() !== "")
          .map((l) => ({ label: l.label ?? "", href: l.href ?? "#" })),
      }))
    : footerDefaults.columns;

  return {
    siteLogo: f.siteLogo,
    brandNameStart: f.brandNameStart ?? footerDefaults.brandNameStart,
    brandNameAccent: f.brandNameAccent ?? footerDefaults.brandNameAccent,
    logo: f.logo,
    tagline: f.tagline ?? footerDefaults.tagline,
    columns,
    wordmark: f.wordmark ?? footerDefaults.wordmark,
    copyright: f.copyright ?? footerDefaults.copyright,
    legalLabels: {
      terms: f.legalLabels?.terms ?? footerDefaults.legalLabels.terms,
      privacy: f.legalLabels?.privacy ?? footerDefaults.legalLabels.privacy,
      disclaimer:
        f.legalLabels?.disclaimer ?? footerDefaults.legalLabels.disclaimer,
    },
    mobileCtaLabel: f.mobileCtaLabel?.trim()
      ? f.mobileCtaLabel
      : footerDefaults.mobileCtaLabel,
  };
}
