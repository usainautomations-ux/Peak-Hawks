import type { PortableTextBlock } from "@portabletext/react";
import {
  getCaseStudy as getSanityCaseStudy,
  getCaseStudyList as getSanityCaseStudyList,
  getAllCaseStudySlugs,
} from "@/lib/sanity/queries";

/**
 * Unified shape both the listing page and the detail page render from.
 *
 * Sanity is the only source of case studies. There is deliberately no
 * built-in/demo fallback here: placeholder case studies can't be deleted
 * from the Studio (they don't exist as documents), so they used to sit on
 * /case-studies as undeletable, image-less cards. Now the site shows
 * exactly what's in Sanity — nothing more — and every case study can be
 * created, edited, hidden, unpublished or deleted by the client.
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

/**
 * Single case study by slug. Returns null — and so 404s — for anything
 * that isn't a published, non-hidden Sanity case study, including one
 * whose publish date is still in the future.
 */
export async function getMergedCaseStudy(slug: string): Promise<DisplayCaseStudy | null> {
  const sanity = await getSanityCaseStudy(slug);
  if (!sanity) return null;

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

/** Full listing for /case-studies — published, visible case studies only. */
export async function getMergedCaseStudyList(): Promise<DisplayCaseStudy[]> {
  const sanityList = await getSanityCaseStudyList();

  return sanityList.map((s) => ({
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
}

/** Every visible slug, for generateStaticParams and the sitemap. */
export async function getAllMergedCaseStudySlugs(): Promise<{ slug: string }[]> {
  const slugs = await getAllCaseStudySlugs();

  const seen = new Set<string>();
  return slugs.filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });
}
