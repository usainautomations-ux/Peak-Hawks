/**
 * Re-exports both schemas. sanity.config.ts (project root) imports directly
 * from ./pageContent and ./blogPost — this index file is just a convenience
 * for importing both at once elsewhere if needed.
 */

export { pageContent } from "./pageContent";
export { blogPost } from "./blogPost";
export { caseStudy } from "./caseStudy";
export { siteFooter } from "./siteFooter";
