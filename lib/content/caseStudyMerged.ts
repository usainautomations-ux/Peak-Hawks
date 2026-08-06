import type { PortableTextBlock } from "@portabletext/react";
import {
  getCaseStudy as getSanityCaseStudy,
  getCaseStudyList as getSanityCaseStudyList,
  getAllCaseStudySlugs,
} from "@/lib/sanity/queries";
import { defaultCaseStudies, getDefaultCaseStudyBySlug } from "@/lib/content/caseStudyDefaults";
import type { CaseStudy } from "@/lib/content/defaults";

/**
 * Unified shape both the listing page and the detail page render from,
 * regardless of whether the data came from Sanity or the code defaults.
 */
export type DisplayCaseStudy = {
  slug: string;
  title: string;
  tag: string;
  excerpt: string;
  result: string;
  coverImage?: string;
  positioning: string;
  angle: string;
  competition: string;
  body?: PortableTextBlock[];
  seo?: { title?: string; description?: string };
};

function fromDefault(cs: CaseStudy): DisplayCaseStudy {
  return {
    slug: cs.slug!,
    title: cs.title,
    tag: cs.tag,
    excerpt: cs.positioning,
    result: cs.result,
    coverImage: cs.image,
    positioning: cs.positioning,
    angle: cs.angle,
    competition: cs.competition,
  };
}

/**
 * Single case study by slug. Checks Sanity first (a real, client-created
 * case study always wins); falls back to the built-in default content so
 * the site has working case study pages even before Sanity is set up.
 */
export async function getMergedCaseStudy(slug: string): Promise<DisplayCaseStudy | null> {
  const sanity = await getSanityCaseStudy(slug);
  if (sanity) {
    return {
      slug: sanity.slug,
      title: sanity.title,
      tag: sanity.tag,
      excerpt: sanity.excerpt,
      result: sanity.result,
      coverImage: sanity.coverImage,
      positioning: sanity.positioning,
      angle: sanity.angle,
      competition: sanity.competition,
      body: sanity.body,
      seo: sanity.seo,
    };
  }
  const def = getDefaultCaseStudyBySlug(slug);
  return def ? fromDefault(def) : null;
}

/**
 * Full listing for /case-studies. Real Sanity case studies are always
 * shown; any default case study whose slug isn't already covered by a
 * real Sanity document is included too, so the listing is never empty
 * before the client has published anything.
 */
export async function getMergedCaseStudyList(): Promise<DisplayCaseStudy[]> {
  const sanityList = await getSanityCaseStudyList();
  const sanitySlugs = new Set(sanityList.map((s) => s.slug));

  const sanityItems: DisplayCaseStudy[] = sanityList.map((s) => ({
    slug: s.slug,
    title: s.title,
    tag: s.tag,
    excerpt: s.excerpt,
    result: s.result,
    coverImage: s.coverImage,
    positioning: "",
    angle: "",
    competition: "",
  }));

  const defaultItems: DisplayCaseStudy[] = defaultCaseStudies
    .filter((cs): cs is CaseStudy & { slug: string } => Boolean(cs.slug) && !sanitySlugs.has(cs.slug!))
    .map(fromDefault);

  return [...sanityItems, ...defaultItems];
}

/** Every known slug (Sanity + defaults) for generateStaticParams. */
export async function getAllMergedCaseStudySlugs(): Promise<{ slug: string }[]> {
  const sanitySlugs = await getAllCaseStudySlugs();
  const defaultSlugs = defaultCaseStudies
    .filter((cs): cs is CaseStudy & { slug: string } => Boolean(cs.slug))
    .map((cs) => ({ slug: cs.slug }));

  const seen = new Set<string>();
  return [...sanitySlugs, ...defaultSlugs].filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });
}
