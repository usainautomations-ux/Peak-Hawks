// sanity/schemas/siteFooter.ts
//
// The footer is shared by every page on the site (it lives in the layout,
// not on the Homepage or New Sellers Page), so it gets its own document
// rather than being duplicated on both pages. Edit it once in
// Studio → "Footer" and both pages update together.

export const siteFooter = {
  name: "siteFooter",
  title: "Footer",
  type: "document",
  __experimental_actions: ["update", "publish"], // singleton — no create/delete

  groups: [
    { name: "brand", title: "Logo & Tagline", default: true },
    { name: "columns", title: "Link Columns" },
    { name: "bottom", title: "Bottom Bar" },
    { name: "mobileCta", title: "Mobile Book Bar" },
  ],

  fields: [
    // ── LOGO & TAGLINE ─────────────────────────────────────────────────
    {
      name: "logo",
      title: "Logo image (optional)",
      type: "image",
      group: "brand",
      description:
        "Upload a logo to replace the hawk mark and the PeakHawks wordmark. Because the footer background is black, use a white or light transparent PNG/SVG. Leave blank to keep the built-in mark and wordmark below.",
    },
    {
      name: "brandNameStart",
      title: "Wordmark — first part (white)",
      type: "string",
      group: "brand",
      description: 'e.g. "Peak"',
    },
    {
      name: "brandNameAccent",
      title: "Wordmark — second part (orange)",
      type: "string",
      group: "brand",
      description: 'e.g. "Hawks"',
    },
    {
      name: "tagline",
      title: "Tagline paragraph",
      type: "text",
      rows: 3,
      group: "brand",
      description: "The short paragraph under the logo.",
    },

    // ── LINK COLUMNS ───────────────────────────────────────────────────
    {
      name: "columns",
      title: "Link Columns",
      type: "array",
      group: "columns",
      description:
        "The link columns across the footer. Three fits the row neatly, but add or remove as many as you like — the row re-splits itself to fit.",
      of: [{
        type: "object",
        name: "footerColumn",
        fields: [
          { name: "title", title: "Column heading", type: "string",
            description: 'e.g. "Company", "Services", "Contact"' },
          {
            name: "links",
            title: "Links",
            type: "array",
            of: [{
              type: "object",
              name: "footerLink",
              fields: [
                { name: "label", title: "Link text", type: "string" },
                { name: "href", title: "Link destination", type: "string",
                  description:
                    'A page path ("/blog"), an anchor on the homepage ("/#services"), an email ("mailto:hello@peakhawks.com") or a full URL.' },
              ],
              preview: { select: { title: "label", subtitle: "href" } },
            }],
          },
        ],
        preview: {
          select: { title: "title", links: "links" },
          prepare: ({ title, links }: { title?: string; links?: unknown[] }) => ({
            title: title ?? "Untitled column",
            subtitle: `${links?.length ?? 0} link${links?.length === 1 ? "" : "s"}`,
          }),
        },
      }],
    },

    // ── BOTTOM BAR ─────────────────────────────────────────────────────
    {
      name: "wordmark",
      title: "Large watermark word",
      type: "string",
      group: "bottom",
      description:
        'The oversized word stretched across the footer, e.g. "PEAKHAWKS". Leave blank to hide it.',
    },
    {
      name: "copyright",
      title: "Copyright line",
      type: "string",
      group: "bottom",
      description:
        'Type {year} anywhere and it is replaced with the current year automatically, e.g. "\u00a9 {year} PEAKHAWKS. ALL RIGHTS RESERVED."',
    },
    {
      name: "legalLabels",
      title: "Legal link labels",
      type: "object",
      group: "bottom",
      options: { collapsible: false },
      description:
        "The wording of the three legal links. They open the built-in Terms, Privacy and Disclaimer pop-ups.",
      fields: [
        { name: "terms", title: "Terms link text", type: "string" },
        { name: "privacy", title: "Privacy link text", type: "string" },
        { name: "disclaimer", title: "Disclaimer link text", type: "string" },
      ],
    },
    // ── MOBILE BOOK BAR ──────────────────────────────────────────────
    {
      name: "mobileCtaLabel",
      title: "Button text",
      type: "string",
      group: "mobileCta",
      description:
        "Text on the floating \u201cBook a Call\u201d bar that sticks to the bottom " +
        "of the screen on phones and tablets, across every page (Homepage, New " +
        "Sellers, Blog, Case Studies). One shared value \u2014 it's the same bar " +
        "everywhere, not per-page content.",
    },
  ],

  preview: { prepare: () => ({ title: "Footer" }) },
};
