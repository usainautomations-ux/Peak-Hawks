import { sanityClient, sanityConfigured } from "./client";
import type {
  SanityPageContent,
  SanityBlogPost,
  SanityBlogListItem,
  SanityCaseStudy,
  SanityCaseStudyListItem,
  SanityFooterContent,
  SanityLeadForm,
} from "./types";

/** The lead form block. Pulled out of PAGE_PROJECTION so /api/leads can
 * fetch just this, without dragging a whole page document across the wire
 * on every form submission.
 *
 * `_key` is projected as `key`: it's the only identifier that survives
 * reordering and relabelling a question, so it's what the browser sends
 * back as the answer's key and what the server matches on. */
const LEAD_FORM_PROJECTION = `{
  nameLabel, namePlaceholder, emailLabel, emailPlaceholder,
  fields[] {
    "key": _key, label, type, options, placeholder, required, target, ghlField, halfWidth
  },
  submitLabel, submitLoadingLabel, successHeading, successBody,
  tags, source, opportunityName,
  revenueLabel, revenueOptions, productsLabel, productsOptions,
  budgetLabel, budgetOptions
}`;

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
    chips[] { value, label },
    partnerLogos[] {
      "name": @.name,
      "logo": logo.asset->url
    },
    partnerLogosLabel,
    partnerLogosStyle
  },
  statsIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, subhead },
  stats[] { value, prefix, suffix, label },
  brandsIntro { sectionLabel, eyebrow, heading, headingAccent, subhead },
  brandLogos[] {
    "name": @.name,
    "logo": logo.asset->url
  },
  categoriesIntro { sectionLabel, eyebrow, heading, headingAccent, subhead },
  categories[] {
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
  bookIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, body, steps, formEmbedUrl },
  leadForm ${LEAD_FORM_PROJECTION},
  faqIntro { sectionLabel, sectionNumber, eyebrow, heading, headingAccent, subhead },
  faq[] { q, a },
  cta { eyebrow, heading, headingAccent, sub, buttonLabel, buttonHref },
  contact { email }
}`;

/** The shared "Footer" singleton — one document for the whole site. */
const FOOTER_PROJECTION = `{
  "siteLogo": siteLogo.asset->url,
  siteLogoHideText,
  brandNameStart,
  brandNameAccent,
  "logo": logo.asset->url,
  logoHideText,
  tagline,
  columns[] { title, links[] { label, href } },
  wordmark,
  copyright,
  legalLabels { terms, privacy, disclaimer },
  mobileCtaLabel,
  chatWidgetId
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
 * What counts as a case study the public is allowed to see. Applied
 * identically by every case study query so the listing, the landing-page
 * teasers, the detail pages and the sitemap can never disagree:
 *
 *   - not a draft (belt-and-braces; the client already asks Sanity for the
 *     "published" perspective, but a token or perspective change shouldn't
 *     silently leak half-written case studies onto the live site)
 *   - not hidden (the "Hide from the website" switch on the case study)
 *   - has a slug and a title, so it can't render as a blank card
 *   - its publish date has actually arrived, so a future-dated case study
 *     stays off the site until the day it's meant to go live
 */
const VISIBLE_CASE_STUDY = `_type == "caseStudy"
  && !(_id in path("drafts.**"))
  && hidden != true
  && defined(slug.current)
  && defined(title)
  && (!defined(publishedAt) || publishedAt <= now())`;

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
      `*[${VISIBLE_CASE_STUDY} && $page in featuredOn] | order(publishedAt desc) {
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
      `*[${VISIBLE_CASE_STUDY}] | order(publishedAt desc) {
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
      `*[${VISIBLE_CASE_STUDY} && slug.current == $slug][0]{
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
      `*[${VISIBLE_CASE_STUDY}]{ "slug": slug.current }`,
    );
  } catch {
    return [];
  }
}

/**
 * Just the lead form block of a page document — what POST /api/leads
 * needs to resolve a submission: which questions exist, which GoHighLevel
 * field each answer belongs in, and which tags to apply.
 *
 * This is fetched server-side on every submission *on purpose*. The
 * browser sends answers, never tags or field keys: if it did, anyone
 * could POST arbitrary tags and drop themselves into a GHL workflow.
 */
export async function getLeadForm(
  page: "homepage" | "newSellerPage",
): Promise<SanityLeadForm | null> {
  if (!sanityConfigured || !sanityClient) return null;
  try {
    const res = await sanityClient.fetch<{ leadForm?: SanityLeadForm } | null>(
      `*[_type == "pageContent" && _id == $id][0]{ leadForm ${LEAD_FORM_PROJECTION} }`,
      { id: page },
      { cache: "no-store" },
    );
    return res?.leadForm ?? null;
  } catch (err) {
    console.warn(`[sanity] lead form fetch failed (${page})`, err);
    return null;
  }
}
