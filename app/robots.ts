import type { MetadataRoute } from "next";

/**
 * Generates /robots.txt. Most importantly: keeps /studio (the Sanity
 * admin CMS) out of search results — it's an internal tool, not
 * user-facing content, and has no reason to be crawled or indexed.
 */
export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://peakhawks.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/api/"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
