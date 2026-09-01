/**
 * The site footer — shared by every page (it lives in the marketing
 * layout, not on an individual page), so it's edited in its own Sanity
 * document: Studio → "Footer".
 *
 * Everything below is a fallback. Any field the client fills in inside
 * the Studio wins; anything left blank falls through to these values,
 * exactly like the page content does (see lib/content/merged.ts).
 */

export type FooterLink = { label: string; href: string };

export type FooterColumn = {
  /** Column heading, e.g. "Company" */
  title: string;
  links: FooterLink[];
};

export type FooterContent = {
  /** The site-wide logo used in the top navigation bar AND the loading
   * animation shown when the site first opens (components/Preloader.tsx)
   * — both sit on a light background. Optional: falls back to the
   * built-in hawk mark + "PeakHawks" wordmark when not set. This is
   * separate from `logo` below, which is the footer's own logo on its
   * dark background — the two can be different images, or the same one,
   * depending on what the client uploads. */
  siteLogo?: string;
  /** When a siteLogo is uploaded, this decides whether the "PeakHawks"
   * wordmark still shows next to it. Default false = keep the text (the
   * upload just replaces the hawk-mark icon). Set true only if your
   * uploaded logo already includes the brand name baked into the image. */
  siteLogoHideText?: boolean;
  /** The wordmark next to the hawk mark. Split so "Hawks" can stay orange. */
  brandNameStart: string;
  brandNameAccent: string;
  /** Optional uploaded logo — replaces the hawk mark + wordmark entirely,
   * in the FOOTER only (dark background). See `siteLogo` above for the
   * nav bar + loading screen. */
  logo?: string;
  /** The paragraph under the logo. */
  tagline: string;
  /** The link columns. Add, remove or reorder freely in the Studio. */
  columns: FooterColumn[];
  /** The oversized watermark word across the footer. Blank = hidden. */
  wordmark: string;
  /** Bottom line. Use {year} anywhere and it becomes the current year. */
  copyright: string;
  /** The TERMS / PRIVACY / DISCLAIMER triggers. */
  legalLabels: { terms: string; privacy: string; disclaimer: string };
  /** Text on the floating "Book a Call" bar shown on mobile/tablet across
   * every page (Homepage, New Sellers, Blog, Case Studies) — see
   * components/MobileBookCTA.tsx. One shared value since the bar itself
   * is one shared, site-wide element, not per-page content. */
  mobileCtaLabel: string;
};

/**
 * The build credit. Deliberately NOT part of FooterContent and not exposed
 * in Sanity Studio — it is rendered from this constant in
 * components/Footer.tsx, so the client cannot edit or remove it from the
 * CMS. Changing it requires a code change and a redeploy.
 */
export const FOOTER_CREDIT = {
  text: "MADE & MANAGED BY",
  label: "NORTHFOUNDRY.CO",
  href: "https://northfoundry.co",
} as const;

export const footerDefaults: FooterContent = {
  brandNameStart: "Peak",
  brandNameAccent: "Hawks",
  tagline:
    "Your peak, our passion. A full-service Amazon growth agency — product research, listing optimization and PPC management.",
  columns: [
    {
      title: "Company",
      links: [
        { label: "Why Us", href: "/#why-us" },
        { label: "Results", href: "/#results" },
        { label: "Case Studies", href: "/#case-studies" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Amazon Product Research", href: "/#services" },
        { label: "Listing Optimization", href: "/#services" },
        { label: "Amazon PPC Management", href: "/#services" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "hello@peakhawks.com", href: "mailto:hello@peakhawks.com" },
        { label: "Book a Call", href: "/#book-a-call" },
      ],
    },
  ],
  wordmark: "PEAKHAWKS",
  copyright: "© {year} PEAKHAWKS. ALL RIGHTS RESERVED.",
  legalLabels: { terms: "TERMS", privacy: "PRIVACY", disclaimer: "DISCLAIMER" },
  mobileCtaLabel: "Book a Strategy Call",
};
