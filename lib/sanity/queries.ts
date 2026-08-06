import { sanityClient, sanityConfigured } from "./client";
import type {
  SanityPageContent,
  SanityBlogPost,
  SanityBlogListItem,
  SanityCaseStudy,
  SanityCaseStudyListItem,
  SanityFooterContent,
} from "./types";

/** Shared projection — both the homepage and the New Sellers page use the
 * same "pageContent" schema shape, just different document IDs. */
const PAGE_PROJECTION = `{
  topBanner { text, linkLabel, linkHref },
  hero {
    badge,
    headlineLines,
    headlineAccent,
    subhead,
    note,
    videoUrl,
    "posterImage": posterImage.asset->url,
    "posterImageMobile": posterImageMobile.asset->url,
    chips[] { value, label }
  },
  statsIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, subhead },
  stats[] { value, prefix, suffix, label },
  brandsIntro { sectionLabel, eyebrow, heading, headingAccent, subhead },
  brandLogos[] {
    "name": @.name,
    "logo": logo.asset->url
  },
  problemsIntro {
    sectionLabel, sectionNumber, eyebrow, eyebrowIcon, heading, headingSub, headingAccent, subhead, subheadAccent
  },
  problems[] {
    number, category, title, body, badge, icon,
    "iconImage": iconImage.asset->url
  },
  problemsGauge {
    label, score, scoreMax, status, statusAccent, icon,
    "iconImage": iconImage.asset->url
  },
  problemsBanner[] {
    icon, "iconImage": iconImage.asset->url, value, text, textAccent, textSize
  },
  whyUsIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, subhead },
  whyUs[] {
    eyebrow, title, body,
    points,
    outcomeLabel, outcome, outcomeIcon,
    "image": image.asset->url
  },
  caseStudiesIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, subhead, linkLabel, linkHref, positioningLabel, angleLabel, competitionLabel },
  servicesIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, subhead },
  services[] { title, body },
  processIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, subhead },
  process[] { tag, title, body },
  testimonialsIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, subhead },
  testimonials[] { quote, name, role, initials, rating, "avatar": avatar.asset->url },
  bookIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, body, steps },
  faqIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, subhead },
  faq[] { q, a },
  cta { eyebrow, heading, headingAccent, sub, buttonLabel, buttonHref },
  contact { email }
}`;

/** The shared "Footer" singleton — one document for the whole site. */
const FOOTER_PROJECTION = `{
  brandNameStart,
  brandNameAccent,
  "logo": logo.asset->url,
  tagline,
  columns[] { title, links[] { label, href } },
  wordmark,
  copyright,
  legalLabels { terms, privacy, disclaimer },
  mobileCtaLabel
}`;

/**
 * Fetch the singleton "Homepage" content document ($10k+ sellers).
 * Falls back gracefully to null if Sanity isn't configured or the
 * request fails — the content layer falls back to code defaults either way.
 */
export async function getPageContent(): Promise<SanityPageContent | null> {
  if (!sanityConfigured || !sanityClient) return null;
  try {
    return await sanityClient.fetch<SanityPageContent>(
      `*[_type == "pageContent" && _id == "homepage"][0] ${PAGE_PROJECTION}`,
      {},
      { cache: 'no-store' },
    );
  } catch (err) {
    console.warn("[sanity] homepage content fetch failed — using code defaults", err);
    return null;
  }
}

/**
 * Fetch the singleton "New Sellers" page content document.
 * Same schema as the homepage, different document, different audience.
 */
export async function getNewSellerPageContent(): Promise<SanityPageContent | null> {
  if (!sanityConfigured || !sanityClient) return null;
  try {
    return await sanityClient.fetch<SanityPageContent>(
      `*[_type == "pageContent" && _id == "newSellerPage"][0] ${PAGE_PROJECTION}`,
      {},
      { cache: 'no-store' },
    );
  } catch (err) {
    console.warn("[sanity] new-seller page content fetch failed — using defaults", err);
    return null;
  }
}

/**
 * Fetch the singleton "Footer" document. The footer is shared by every
 * page, so it lives in its own document rather than on either landing
 * page — edited in Studio → "Footer".
 */
export async function getFooterContent(): Promise<SanityFooterContent | null> {
  if (!sanityConfigured || !sanityClient) return null;
  try {
    return await sanityClient.fetch<SanityFooterContent>(
      `*[_type == "siteFooter" && _id == "siteFooter"][0] ${FOOTER_PROJECTION}`,
      {},
      { cache: "no-store" },
    );
  } catch (err) {
    console.warn("[sanity] footer fetch failed \u2014 using code defaults", err);
    return null;
  }
}

/** All published blog posts, newest first */
export async function getBlogList(): Promise<SanityBlogListItem[]> {
  if (!sanityConfigured || !sanityClient) return [];
  try {
    return await sanityClient.fetch<SanityBlogListItem[]>(
      `*[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) {
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        excerpt,
        category,
        readTime,
        "coverImage": coverImage.asset->url
      }`,
      {},
      { cache: 'no-store' },
    );
  } catch (err) {
    console.warn("[sanity] blog list fetch failed", err);
    return [];
  }
}

/** Single blog post by slug */
export async function getBlogPost(slug: string): Promise<SanityBlogPost | null> {
  if (!sanityConfigured || !sanityClient) return null;
  try {
    return await sanityClient.fetch<SanityBlogPost>(
      `*[_type == "blogPost" && slug.current == $slug][0]{
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        excerpt,
        category,
        readTime,
        "coverImage": coverImage.asset->url,
        body,
        seo { title, description }
      }`,
      { slug },
      { cache: 'no-store' },
    );
  } catch (err) {
    console.warn("[sanity] blog post fetch failed:", slug, err);
    return null;
  }
}

/** All blog slugs for generateStaticParams */
export async function getAllBlogSlugs(): Promise<{ slug: string }[]> {
  if (!sanityConfigured || !sanityClient) return [];
  try {
    return await sanityClient.fetch<{ slug: string }[]>(
      `*[_type == "blogPost" && defined(slug.current)]{ "slug": slug.current }`,
    );
  } catch {
    return [];
  }
}

/**
 * Case studies with "Homepage" or "New Sellers Page" toggled on
 * (the `featuredOn` field on the case study itself) — this is what
 * powers the case-studies teaser section on each landing page. No
 * separate reference-picking step needed; the toggle lives on the case
 * study, and it appears on whichever page(s) it's turned on for.
 */
export type FeaturedCaseStudy = {
  slug: string;
  tag: string;
  title: string;
  positioning: string;
  angle: string;
  competition: string;
  result: string;
  image?: string;
};

export async function getFeaturedCaseStudies(
  page: "homepage" | "newSellerPage",
): Promise<FeaturedCaseStudy[]> {
  if (!sanityConfigured || !sanityClient) return [];
  try {
    return await sanityClient.fetch<FeaturedCaseStudy[]>(
      `*[_type == "caseStudy" && $page in featuredOn] | order(publishedAt desc) {
        "slug": slug.current,
        tag, title, positioning, angle, competition, result,
        "image": coverImage.asset->url
      }`,
      { page },
      { cache: 'no-store' },
    );
  } catch (err) {
    console.warn(`[sanity] featured case studies fetch failed (${page})`, err);
    return [];
  }
}

/** All case studies, newest first — for the /case-studies listing page */
export async function getCaseStudyList(): Promise<SanityCaseStudyListItem[]> {
  if (!sanityConfigured || !sanityClient) return [];
  try {
    return await sanityClient.fetch<SanityCaseStudyListItem[]>(
      `*[_type == "caseStudy" && defined(slug.current)] | order(publishedAt desc) {
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        tag,
        excerpt,
        result,
        "coverImage": coverImage.asset->url
      }`,
      {},
      { cache: 'no-store' },
    );
  } catch (err) {
    console.warn("[sanity] case study list fetch failed", err);
    return [];
  }
}

/** Single case study by slug — for /case-studies/[slug] */
export async function getCaseStudy(slug: string): Promise<SanityCaseStudy | null> {
  if (!sanityConfigured || !sanityClient) return null;
  try {
    return await sanityClient.fetch<SanityCaseStudy>(
      `*[_type == "caseStudy" && slug.current == $slug][0]{
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        tag,
        excerpt,
        result,
        positioning,
        angle,
        competition,
        "coverImage": coverImage.asset->url,
        body,
        seo { title, description }
      }`,
      { slug },
      { cache: 'no-store' },
    );
  } catch (err) {
    console.warn("[sanity] case study fetch failed:", slug, err);
    return null;
  }
}

/** All case study slugs for generateStaticParams */
export async function getAllCaseStudySlugs(): Promise<{ slug: string }[]> {
  if (!sanityConfigured || !sanityClient) return [];
  try {
    return await sanityClient.fetch<{ slug: string }[]>(
      `*[_type == "caseStudy" && defined(slug.current)]{ "slug": slug.current }`,
    );
  } catch {
    return [];
  }
}
