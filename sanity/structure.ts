import type { StructureResolver } from "sanity/structure";

/**
 * Custom Studio sidebar. Without this, Sanity auto-generates a generic
 * list of every schema type — fine for developers, confusing for a client.
 * This gives them exactly four things to click:
 *
 *   🏠 Homepage           → the $10k+ seller page content
 *   🆕 New Sellers Page   → the pre-launch / new-seller page content
 *   📈 Case Studies       → full case study collection, each with its own
 *                           page at /case-studies/[slug]. A "Show on
 *                           landing page(s)" toggle right on the case
 *                           study controls whether it also appears in the
 *                           Homepage and/or New Sellers Page teaser —
 *                           no separate step on the page document needed.
 *   📝 Blog Posts         → the normal list of posts (create/edit/delete)
 *
 * Both page documents use the same "pageContent" schema — only the
 * document ID differs — so editing either feels identical.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("PeakHawks Content")
    .items([
      S.listItem()
        .title("Homepage")
        .icon(() => "🏠")
        .id("pageContent-home")
        .child(
          S.document()
            .schemaType("pageContent")
            .documentId("homepage")
            .title("Homepage"),
        ),
      S.listItem()
        .title("New Sellers Page")
        .icon(() => "🆕")
        .id("pageContent-newseller")
        .child(
          S.document()
            .schemaType("pageContent")
            .documentId("newSellerPage")
            .title("New Sellers Page"),
        ),
      S.listItem()
        .title("Footer")
        .icon(() => "\u2693")
        .id("siteFooter")
        .child(
          S.document()
            .schemaType("siteFooter")
            .documentId("siteFooter")
            .title("Footer"),
        ),
      S.divider(),
      S.listItem()
        .title("Case Studies")
        .icon(() => "📈")
        .child(
          S.documentTypeList("caseStudy")
            .title("Case Studies")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
        ),
      S.listItem()
        .title("Blog Posts")
        .icon(() => "📝")
        .child(
          S.documentTypeList("blogPost")
            .title("Blog Posts")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
        ),
    ]);
