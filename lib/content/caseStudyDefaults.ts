import { defaultContent, type CaseStudy } from "@/lib/content/defaults";
import { newSellerDefaults } from "@/lib/content/newSellerDefaults";

/**
 * All fallback case studies from both pages (Homepage + New Sellers),
 * combined into one lookup by slug. This is what makes case study cards
 * clickable and their /case-studies/[slug] pages actually render *before*
 * any real Sanity case study exists — the site should work out of the box,
 * not require Sanity setup first just to have working links.
 *
 * Once a real Sanity case study exists (matching slug or not), Sanity
 * always wins — see lib/content/caseStudyMerged.ts.
 */
export const defaultCaseStudies: CaseStudy[] = [
  ...defaultContent.caseStudies,
  ...newSellerDefaults.caseStudies,
];

export function getDefaultCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return defaultCaseStudies.find((cs) => cs.slug === slug);
}
