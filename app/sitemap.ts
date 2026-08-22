import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/sanity/queries";
import { getAllMergedCaseStudySlugs } from "@/lib/content/caseStudyMerged";

/**
 * Generates /sitemap.xml — every static page plus every blog post and
 * case study (Sanity-backed and default/fallback ones alike, since the
 * defaults render real, working pages too).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://peakhawks.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/newseller`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site}/case-studies`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const [blogSlugs, caseStudySlugs] = await Promise.all([
    getAllBlogSlugs().catch(() => []),
    getAllMergedCaseStudySlugs().catch(() => []),
  ]);

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map(({ slug }) => ({
    url: `${site}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudySlugs.map(({ slug }) => ({
    url: `${site}/case-studies/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...caseStudyRoutes, ...blogRoutes];
}
