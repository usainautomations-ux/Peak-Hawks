export const caseStudy = {
  name: "caseStudy",
  title: "Case Studies",
  type: "document",
  fields: [
    // ── CORE ───────────────────────────────────────────────────────────
    {
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "First-Mover Liquid Drops"',
      validation: (R: any) => R.required(),
    },
    {
      name: "slug",
      title: "URL slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R: any) => R.required(),
      description: "The page will live at /case-studies/this-slug",
    },
    {
      name: "publishedAt",
      title: "Publish date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      description:
        "Newest first is the order case studies are listed in. A date in the future keeps the case study off the site until that moment arrives \u2014 handy for lining one up in advance.",
    },
    {
      name: "featuredOn",
      title: "Show on landing page(s)",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Homepage ($10k+ Sellers)", value: "homepage" },
          { title: "New Sellers Page", value: "newSellerPage" },
        ],
        layout: "grid",
      },
      description:
        "Every case study always has its own page at /case-studies/[slug] regardless of this setting. Toggle these on to also feature it in the case-studies teaser near the top of a landing page. Leave both off to keep it listed only on /case-studies.",
    },
    {
      name: "hidden",
      title: "Hide from the website",
      type: "boolean",
      initialValue: false,
      description:
        "Turn this on to take the case study off the site immediately \u2014 it disappears from /case-studies, from both landing-page teasers and from its own page, but nothing is lost and you can switch it back on at any time. " +
        "To remove a case study permanently instead, open it and use the \u22ee menu at the bottom of the form \u2192 Delete.",
    },
    {
      name: "tag",
      title: "Category tag",
      type: "string",
      description: 'e.g. "Wellness · Drops Format"',
    },
    {
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 2,
      description: "Short summary shown on the case studies listing page and in SEO.",
    },

    // ── SUMMARY CARD FIELDS (used on homepage/newseller teaser + listing) ──
    {
      name: "coverImage",
      title: "Cover / product image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "positioning",
      title: "Positioning insight",
      type: "text",
      rows: 2,
    },
    {
      name: "angle",
      title: "Differentiation angle",
      type: "text",
      rows: 2,
    },
    {
      name: "competition",
      title: "Competition level",
      type: "string",
    },
    {
      name: "result",
      title: "Result (shown in orange)",
      type: "string",
      description: 'e.g. "$1M+ annual run rate in year one"',
    },

    // ── FULL WRITE-UP ──────────────────────────────────────────────────
    {
      name: "body",
      title: "Full case study write-up",
      type: "array",
      description: "The detailed story shown on the case study's own page.",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              { name: "link", type: "object", title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }] },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", type: "string", title: "Alt text" },
            { name: "caption", type: "string", title: "Caption" },
          ],
        },
        {
          type: "object",
          name: "stat",
          title: "Highlighted stat",
          fields: [
            { name: "value", type: "string", title: "Value", description: 'e.g. "$1M+"' },
            { name: "label", type: "string", title: "Label", description: 'e.g. "Year one revenue"' },
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    },

    // ── SEO ────────────────────────────────────────────────────────────
    {
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "title", title: "Meta title", type: "string" },
        { name: "description", title: "Meta description", type: "text", rows: 2 },
      ],
    },
  ],

  preview: {
    select: { title: "title", tag: "tag", media: "coverImage", hidden: "hidden" },
    prepare({ title, tag, media, hidden }: { title?: string; tag?: string; media?: any; hidden?: boolean }) {
      return {
        title: title || "Untitled case study",
        // Without this, a hidden case study looks identical to a live one
        // in the list — the only clue would be opening it.
        subtitle: hidden ? `\u26D4 Hidden from the website${tag ? ` \u00B7 ${tag}` : ""}` : tag,
        media,
      };
    },
  },
};
