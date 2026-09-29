import { ICON_OPTIONS } from "../../lib/icons";

// sanity/schemas/pageContent.ts
//
// One document per landing page ("Homepage" and "New Sellers Page"), both
// using this schema. Every group below is named after the section as it
// appears on the page, in page order, so finding a field is just a matter
// of scrolling the live page and clicking the tab with the same name:
//
//   Top Banner → Hero → Brand Logos → Diagnosis → Why Us → Stats →
//   Case Studies → Services → Process → Testimonials → Book A Call →
//   FAQ → Final CTA
//
// The footer is NOT here — it is shared by every page, so it lives in its
// own "Footer" document (sanity/schemas/siteFooter.ts).
//
// Every section carries the same four heading fields, always named the
// same thing, so the client learns them once:
//   Section label   → the small "SEC.01 // DIAGNOSIS" flight strip
//   Eyebrow         → the small orange label
//   Heading         → the big heading
//   Orange part of the heading → the exact words inside Heading to colour

/** The shared heading block. `include` lets a section drop the parts it
 * doesn't render (e.g. the logo strip has no eyebrow). */
/* eslint-disable @typescript-eslint/no-explicit-any */
function sectionIntro(opts: {
  name: string;
  title: string;
  group: string;
  description?: string;
  include?: ("sectionLabel" | "eyebrow" | "heading" | "subhead")[];
  extraFields?: any[];
}): any {
  // `any` deliberately: Sanity's SchemaTypeDefinition is a discriminated
  // union keyed on a literal `type`, and a value built up in a helper
  // widens `type` to `string`, which the union then rejects. The rest of
  // this file (and blogPost/caseStudy) already declare their schemas as
  // plain objects for the same reason.
  const include = opts.include ?? ["sectionLabel", "eyebrow", "heading", "subhead"];
  const fields: any[] = [];

  if (include.includes("sectionLabel")) {
    fields.push({
      name: "sectionLabel",
      title: "Section label",
      type: "string",
      description:
        'The small flight strip above the section, e.g. "SEC.01 // DIAGNOSIS" \u2014 you type just the word, e.g. "Diagnosis".',
    });
    fields.push({
      name: "sectionNumber",
      title: "Section number (the \"SEC.0X\" part)",
      type: "number",
      description:
        'The number in that same flight strip \u2014 "SEC.01", "SEC.02" and so on. ' +
        "Also sets the \u201cALT ... FT\u201d reading next to it (altitude = this number \u00d7 " +
        "3,200 ft \u2014 purely decorative, not something to configure separately). " +
        "Leave blank to keep this section's usual number.",
      validation: (R: any) => R.integer().positive(),
    });
  }

  if (include.includes("eyebrow"))
    fields.push({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: 'The small orange label above the heading, e.g. "Proof of Work". Leave blank to hide it.',
    });

  if (include.includes("heading")) {
    fields.push({
      name: "heading",
      title: "Heading",
      type: "text",
      rows: 2,
      description: "The big heading for this section.",
    });
    fields.push({
      name: "headingAccent",
      title: "Orange part of the heading",
      type: "string",
      description:
        'Copy the exact words from the heading above that should be orange, e.g. "Are Saying". Leave blank for an all-black heading.',
    });
  }

  if (include.includes("subhead")) {
    fields.push({
      name: "subhead",
      title: "Subheading",
      type: "text",
      rows: 2,
      description: "The paragraph under the heading. Leave blank to hide it.",
    });
    fields.push({
      name: "subheadAccent",
      title: "Orange part of the subheading",
      type: "string",
      description: "Optional \u2014 copy the exact words that should be orange.",
    });
  }

  return {
    name: opts.name,
    title: opts.title,
    type: "object",
    group: opts.group,
    options: { collapsible: false },
    description: opts.description,
    fields: [...fields, ...(opts.extraFields ?? [])],
  };
}

export const pageContent = {
  name: "pageContent",
  title: "Page Content",
  type: "document",
  __experimental_actions: ["update", "publish"], // singleton — no create/delete

  groups: [
    { name: "topBanner", title: "Top Banner" },
    { name: "hero", title: "Hero", default: true },
    { name: "brandLogos", title: "Brand Logos" },
    { name: "diagnosis", title: "Diagnosis" },
    { name: "whyUs", title: "Why Us" },
    { name: "stats", title: "Stats" },
    { name: "caseStudies", title: "Case Studies" },
    { name: "categories", title: "Categories Bar" },
    { name: "services", title: "Services" },
    { name: "process", title: "Process" },
    { name: "testimonials", title: "Testimonials" },
    { name: "bookACall", title: "Book A Call" },
    { name: "leadForm", title: "Lead Form" },
    { name: "faq", title: "FAQ" },
    { name: "finalCta", title: "Final CTA" },
  ],

  fields: [
    // ── TOP BANNER ─────────────────────────────────────────────────────
    {
      name: "topBanner",
      title: "Top Banner",
      type: "object",
      group: "topBanner",
      options: { collapsible: false },
      description:
        "The thin strip pinned above the hero that sends the wrong-audience visitor to the other page.",
      fields: [
        { name: "text", title: "Text", type: "string",
          description: 'e.g. "New to Amazon or not yet at $10k/month?"' },
        { name: "linkLabel", title: "Link text", type: "string",
          description: 'The orange link, e.g. "See our New Seller program \u2192"' },
        { name: "linkHref", title: "Link destination", type: "string",
          description: 'Where the link goes, e.g. "/newseller" or "/"' },
      ],
    },

    // ── HERO ───────────────────────────────────────────────────────────
    {
      name: "hero",
      title: "Hero",
      type: "object",
      group: "hero",
      options: { collapsible: false },
      fields: [
        { name: "badge", title: "Badge text", type: "string",
          description: 'e.g. "Full-Service Amazon Growth Agency"' },
        { name: "headlineLines", title: "Headline", type: "text", rows: 3,
          description: "Use a new line for each headline line — exactly as it should appear on the page." },
        { name: "headlineAccent", title: "Orange part of the headline", type: "string",
          description: 'Which single word in the headline should be orange? e.g. "Engineered"' },
        { name: "subhead", title: "Subheading", type: "text", rows: 3 },
        { name: "note", title: "Small note below buttons", type: "string",
          description: 'e.g. "PRODUCT-FIRST · TACOS-DRIVEN REPORTING". Leave blank to hide this line \u2014 useful if you\'d rather only show the partner logos below.' },
        {
          name: "partnerLogos",
          title: "Partner logos below the buttons",
          type: "array",
          description:
            "Small badges under the \u201cBook a Strategy Call\u201d / \u201cSee the Case Studies\u201d " +
            "buttons and the note line above \u2014 e.g. an Amazon Ads partner mark, an " +
            "Amazon SPN badge. For each one you can type a name, upload a small logo " +
            "image, or do both (the image is used, the name becomes its alt text). " +
            "Add, remove, or reorder freely; leave the list empty to hide this row entirely.",
          of: [{
            type: "object",
            name: "partnerLogo",
            fields: [
              { name: "name", title: "Name (text)", type: "string",
                description: "Shown as text when no image is uploaded. Also used as the image's alt text." },
              { name: "logo", title: "Logo image (optional)", type: "image",
                options: { hotspot: true },
                description: "Upload a small logo/badge image. A transparent PNG or SVG works best." },
            ],
            preview: { select: { title: "name", media: "logo" } },
          }],
        },
        { name: "partnerLogosLabel", title: "Partner logos \u2014 small label above them", type: "string",
          description: 'Optional tiny heading above the logos, e.g. "Trusted & Certified". Leave blank (default) to hide it \u2014 the logos then sit on their own with no label.' },
        { name: "videoUrl", title: "Hero media — video URL (optional)", type: "url",
          description: "Only fill this in if you have an actual video (YouTube, Vimeo, or a direct .mp4 link). If you just have a photo or graphic, leave this blank and use \"Hero image\" below instead." },
        { name: "posterImage", title: "Hero image (desktop)", type: "image",
          options: { hotspot: true },
          description: "If you don't have a video, upload your photo/graphic here — it will display directly, full-size, no play button. If you DO have a video above, this becomes the preview image shown before someone clicks play." },
        { name: "posterImageMobile", title: "Hero image (mobile)", type: "image",
          options: { hotspot: true },
          description: "Optional. A taller/squarer crop of the same graphic, used on phones. Leave blank to use the desktop image on every screen." },
        {
          name: "chips",
          title: "Proof pills under the hero image",
          type: "array",
          description: "The small pills below the hero image, e.g. \"$28M+ GENERATED\". Any number works — they wrap onto extra lines automatically.",
          of: [{
            type: "object",
            fields: [
              { name: "value", title: "Highlighted value (orange)", type: "string",
                description: 'e.g. "$28M+", "40+", "92%"' },
              { name: "label", title: "Label", type: "string",
                description: 'e.g. "Generated", "Brands Scaled" — displayed in caps automatically.' },
            ],
            preview: { select: { title: "value", subtitle: "label" } },
          }],
        },
      ],
    },

    // ── BRAND LOGOS ────────────────────────────────────────────────────
    sectionIntro({
      name: "brandsIntro",
      title: "Brand Logos — heading",
      group: "brandLogos",
      include: ["heading"],
      description: 'The line above the scrolling strip, e.g. "Brands We\'ve Launched And Scaled".',
    }),
    {
      name: "brandLogos",
      title: "Brand Logos",
      type: "array",
      group: "brandLogos",
      description:
        "The brands that scroll across the strip. For each one you can type a name, upload a logo image, or do both (the image is used, the name becomes its alt text). Add as many as you like — the strip loops seamlessly at any length.",
      of: [{
        type: "object",
        name: "brandLogo",
        fields: [
          { name: "name", title: "Brand name (text)", type: "string",
            description: "Shown as text when no logo image is uploaded. Also used as the image's alt text." },
          { name: "logo", title: "Logo image (optional)", type: "image",
            options: { hotspot: true },
            description: "Upload a logo to show instead of the text. A transparent PNG or SVG works best — it is greyed out and lights up on hover, matching the text brands." },
        ],
        preview: { select: { title: "name", media: "logo" } },
      }],
    },

    // ── DIAGNOSIS (PROBLEMS) ───────────────────────────────────────────
    sectionIntro({
      name: "problemsIntro",
      title: "Diagnosis — heading",
      group: "diagnosis",
      extraFields: [
        { name: "eyebrowIcon", title: "Eyebrow icon", type: "string",
          options: { list: ICON_OPTIONS },
          initialValue: "activity",
          description: "The small icon next to the eyebrow label." },
        { name: "headingSub", title: "Heading — second line (optional)", type: "string",
          description: 'Rendered slightly smaller under the heading, e.g. "They Repeat the Same Four Costly Mistakes."' },
      ],
    }),
    {
      name: "problems",
      title: "Diagnosis Cards",
      type: "array",
      group: "diagnosis",
      description:
        "The cards arranged around the score dial. Four works best — they split evenly, two down each side. Any number works: extras stack down the same columns and the dashed connector lines redraw themselves to match.",
      of: [{
        type: "object",
        fields: [
          { name: "number", title: "Number", type: "string", description: 'e.g. "01"' },
          { name: "category", title: "Category label", type: "string", description: 'e.g. "Research"' },
          { name: "title", title: "Card heading", type: "string" },
          { name: "body", title: "Card body", type: "text", rows: 2,
            description: "Short — two punchy lines read best at this size." },
          { name: "badge", title: "Warning pill", type: "string",
            description: 'The small orange pill at the foot of the card, e.g. "Needs Attention". Leave blank to hide it.' },
          { name: "icon", title: "Icon", type: "string",
            options: { list: ICON_OPTIONS },
            initialValue: "activity",
            description: "Pick from the built-in set, or upload your own below to override it." },
          { name: "iconImage", title: "Custom icon (optional)", type: "image",
            description: "Upload your own icon to replace the one picked above. A transparent PNG or SVG works best." },
        ],
        preview: { select: { title: "title", subtitle: "category", media: "iconImage" } },
      }],
    },
    {
      name: "problemsGauge",
      title: "Diagnosis Score Dial",
      type: "object",
      group: "diagnosis",
      options: { collapsible: false },
      description: "The dark circular dial in the middle of the section. The orange arc is a simple range — it fills from the start of the arc to wherever the score sits between 0 and the maximum below.",
      fields: [
        { name: "label", title: "Dial label", type: "string",
          description: 'e.g. "Amazon Growth Health Score"' },
        { name: "score", title: "Score", type: "number",
          description: "The big orange number. The orange arc fills to match." },
        { name: "scoreMax", title: "Out of", type: "number", initialValue: 100 },
        { name: "status", title: "Status line", type: "string",
          description: 'e.g. "Growth Bottleneck Detected"' },
        { name: "statusAccent", title: "Orange part of the status line", type: "string",
          description: 'e.g. "Growth Bottleneck"' },
        { name: "icon", title: "Dial icon", type: "string",
          options: { list: ICON_OPTIONS },
          initialValue: "activity",
          description: "Pick from the built-in set, or upload your own below." },
        { name: "iconImage", title: "Custom dial icon (optional)", type: "image" },
      ],
    },
    {
      name: "problemsBanner",
      title: "Diagnosis Summary Bar",
      type: "array",
      group: "diagnosis",
      description:
        "The dark strip below the cards. Two blocks work best, but any number works — they lay out evenly across the bar. Leave the list empty to hide the bar entirely.",
      of: [{
        type: "object",
        fields: [
          { name: "icon", title: "Icon", type: "string",
            options: { list: ICON_OPTIONS },
            initialValue: "target",
            description: "Choose one of the built-in icons, or upload your own below to override it." },
          { name: "iconImage", title: "Custom icon (optional)", type: "image",
            description: "Upload your own icon instead of using the dropdown above. A transparent PNG or SVG works best." },
          { name: "value", title: "Big figure (optional)", type: "string",
            description: 'e.g. "84%" — leave blank for a statement-only block.' },
          { name: "text", title: "Text", type: "text", rows: 2,
            description: "Press Enter for a manual line break exactly where you want it \u2014 the site will render it. Otherwise the text just wraps naturally to fit the space." },
          { name: "textAccent", title: "Orange part of the text", type: "string" },
          { name: "textSize", title: "Text size", type: "string",
            options: {
              list: [
                { title: "Small", value: "sm" },
                { title: "Medium (default)", value: "md" },
                { title: "Large", value: "lg" },
              ],
              layout: "radio",
            },
            description: "Scales the big figure and its text together. Leave unset for the default size." },
        ],
        preview: { select: { title: "text", subtitle: "value" } },
      }],
    },

    // ── WHY US ─────────────────────────────────────────────────────────
    sectionIntro({ name: "whyUsIntro", title: "Why Us — heading", group: "whyUs" }),
    {
      name: "whyUs",
      title: "Why Us Rows",
      type: "array",
      group: "whyUs",
      description:
        "Each row is one step of the growth loop: text on one side, your image on the other. Rows alternate sides automatically, so you can add or remove as many as you like.",
      of: [{
        type: "object",
        fields: [
          { name: "eyebrow", title: "Eyebrow", type: "string", description: 'e.g. "01 / Diagnose"' },
          { name: "title", title: "Row heading", type: "string" },
          { name: "body", title: "Body paragraph", type: "text", rows: 3 },
          { name: "points", title: "Bullet points (optional)", type: "array", of: [{ type: "string" }],
            description: "Leave empty to show just the paragraph and the outcome below." },
          { name: "outcomeLabel", title: "Outcome label", type: "string",
            description: 'The small orange word above the outcome line. Defaults to "Outcome" if left blank.' },
          { name: "outcome", title: "Outcome statement", type: "text", rows: 2,
            description: 'The bold pay-off line, e.g. "Build every decision on data — not assumptions." Leave blank to hide the box entirely.' },
          { name: "outcomeIcon", title: "Outcome icon", type: "string",
            options: {
              list: [
                { title: "Growth chart \u2197", value: "growth" },
                { title: "Target \ud83c\udfaf", value: "target" },
                { title: "Checkmark \u2713", value: "check" },
                { title: "Spark \u2726", value: "spark" },
              ],
              layout: "radio",
            },
            initialValue: "growth",
            description: "Which icon sits in the orange circle next to the outcome." },
          { name: "image", title: "Image", type: "image", options: { hotspot: true },
            description:
              "The visual for this row — dashboard screenshot, mockup, client photo. Shown large; use a wide image (roughly 1600×1000) for the sharpest result." },
        ],
        preview: { select: { title: "title", subtitle: "eyebrow", media: "image" } },
      }],
    },

    // ── STATS ──────────────────────────────────────────────────────────
    sectionIntro({
      name: "statsIntro",
      title: "Stats — heading",
      group: "stats",
      description:
        "Optional. Fill in a heading to show one above the numbers; leave the heading blank and only the section label strip shows, as it does today.",
    }),
    {
      name: "stats",
      title: "Stats",
      type: "array",
      group: "stats",
      description:
        "The big proof numbers. Four fills the row neatly, but any number works — the row re-splits itself to fit.",
      of: [{
        type: "object",
        fields: [
          { name: "value", title: "Number", type: "number" },
          { name: "prefix", title: "Prefix", type: "string", description: 'Shown before the number, e.g. "$"' },
          { name: "suffix", title: "Suffix", type: "string", description: 'e.g. "M+", "+", "%"' },
          { name: "label", title: "Label", type: "string", description: 'e.g. "Revenue Generated"' },
        ],
        preview: { select: { title: "label", subtitle: "value" } },
      }],
    },

    // ── CASE STUDIES ───────────────────────────────────────────────────
    sectionIntro({
      name: "caseStudiesIntro",
      title: "Case Studies — heading",
      group: "caseStudies",
      description:
        'Which case studies appear here is set on each case study itself ("Show on landing page(s)"). This tab controls the wording around them.',
      extraFields: [
        { name: "linkLabel", title: "\"View all\" link text", type: "string",
          description: 'e.g. "View All Case Studies \u2192". Leave blank to hide the link.' },
        { name: "linkHref", title: "\"View all\" link destination", type: "string",
          description: 'Defaults to "/case-studies".' },
        { name: "positioningLabel", title: "Summary strip — \"Positioning\" label", type: "string",
          description:
            'The first of the three column headers shown on every individual case ' +
            'study\'s own page \u2014 the box that reads "Positioning" above the ' +
            'positioning insight text. Applies to every case study; leave blank to ' +
            'keep "Positioning".' },
        { name: "angleLabel", title: "Summary strip — \"Angle\" label", type: "string",
          description: 'The second column header. Leave blank to keep "Angle".' },
        { name: "competitionLabel", title: "Summary strip — \"Competition\" label", type: "string",
          description: 'The third column header. Leave blank to keep "Competition".' },
      ],
    }),

    // ── CATEGORIES BAR ───────────────────────────────────────────────────
    // Same scrolling-strip component as Brand Logos above, reused with its
    // own content — it sits right after Case Studies on the live page.
    sectionIntro({
      name: "categoriesIntro",
      title: "Categories Bar — heading",
      group: "categories",
      include: ["heading"],
      description: 'The line above the scrolling strip, e.g. "Categories We\'ve Served".',
    }),
    {
      name: "categories",
      title: "Categories",
      type: "array",
      group: "categories",
      description:
        "The categories that scroll across the strip, right after Case Studies. For each one you can type a name, upload a small icon/image, or do both (the image is used, the name becomes its alt text). Add as many as you like — the strip loops seamlessly at any length.",
      of: [{
        type: "object",
        name: "categoryItem",
        fields: [
          { name: "name", title: "Category name (text)", type: "string",
            description: "Shown as text when no image is uploaded. Also used as the image's alt text." },
          { name: "logo", title: "Icon / image (optional)", type: "image",
            options: { hotspot: true },
            description: "Upload an icon or image to show instead of the text. A transparent PNG or SVG works best — it is greyed out and lights up on hover, matching the text categories." },
        ],
        preview: { select: { title: "name", media: "logo" } },
      }],
    },

    // ── SERVICES ───────────────────────────────────────────────────────
    sectionIntro({ name: "servicesIntro", title: "Services — heading", group: "services" }),
    {
      name: "services",
      title: "Services",
      type: "array",
      group: "services",
      description: "The accordion list. Add, remove and drag to reorder — the numbering renumbers itself.",
      of: [{
        type: "object",
        fields: [
          { name: "title", title: "Service name", type: "string" },
          { name: "body", title: "Description", type: "text", rows: 3 },
        ],
        preview: { select: { title: "title" } },
      }],
    },

    // ── PROCESS ────────────────────────────────────────────────────────
    sectionIntro({ name: "processIntro", title: "Process — heading", group: "process" }),
    {
      name: "process",
      title: "Process Steps",
      type: "array",
      group: "process",
      description:
        "The timeline. Four steps fills the row neatly, but any number works — the row and the orange progress line re-fit themselves.",
      of: [{
        type: "object",
        fields: [
          { name: "tag", title: "Timeline label", type: "string", description: 'e.g. "Week 1"' },
          { name: "title", title: "Step name", type: "string" },
          { name: "body", title: "Step description", type: "text", rows: 2 },
        ],
        preview: { select: { title: "title", subtitle: "tag" } },
      }],
    },

    // ── TESTIMONIALS ───────────────────────────────────────────────────
    sectionIntro({ name: "testimonialsIntro", title: "Testimonials — heading", group: "testimonials" }),
    {
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      group: "testimonials",
      description:
        "Add as many as you like — three per row on desktop, and the grid rewraps for any number.",
      of: [{
        type: "object",
        fields: [
          { name: "quote", title: "Quote", type: "text", rows: 3 },
          { name: "name", title: "Client name", type: "string" },
          { name: "role", title: "Role / brand", type: "string", description: 'e.g. "Founder, Brand Name"' },
          { name: "rating", title: "Star rating", type: "number",
            options: { list: [1, 2, 3, 4, 5] },
            initialValue: 5,
            description: "How many of the five stars are filled. Defaults to 5." },
          { name: "initials", title: "Initials (avatar fallback)", type: "string",
            description: "2 letters, e.g. JD — shown in the circle when no photo is uploaded." },
          { name: "avatar", title: "Client photo (optional)", type: "image", options: { hotspot: true },
            description: "Upload a photo to replace the initials circle." },
        ],
        preview: { select: { title: "name", subtitle: "role", media: "avatar" } },
      }],
    },

    // ── BOOK A CALL ────────────────────────────────────────────────────
    sectionIntro({
      name: "bookIntro",
      title: "Book A Call — heading",
      group: "bookACall",
      include: ["sectionLabel", "eyebrow", "heading"],
      extraFields: [
        { name: "body", title: "Paragraph", type: "text", rows: 3 },
        { name: "steps", title: "Numbered checklist", type: "array", of: [{ type: "string" }],
          description: "The 01 / 02 / 03 list under the paragraph. Numbering is automatic — add or remove freely." },
        { name: "formEmbedUrl", title: "Use my own GHL form (optional)", type: "url",
          description:
            "Paste a GoHighLevel form EMBED URL to show your own GHL form here instead " +
            "of the built-in form \u2014 so submissions run through that form\u2019s automations. " +
            "In GHL: Sites \u2192 Forms \u2192 your form \u2192 Integrate/Embed, and copy the URL inside " +
            "the iframe\u2019s src (looks like https://api.leadconnectorhq.com/widget/form/XXXX " +
            "or https://link.\u2026/widget/form/XXXX). Leave blank to keep the built-in form." },
      ],
    }),

    // ── LEAD FORM ──────────────────────────────────────────────────────
    // Every visible string on the form itself, next to the Book A Call
    // text above — field labels, placeholders, each dropdown's choices,
    // the submit button (both states), and the after-submit confirmation.
    {
      name: "leadForm",
      title: "Lead Form",
      type: "object",
      group: "leadForm",
      options: { collapsible: false },
      fields: [
        { name: "nameLabel", title: "\"Name\" field label", type: "string" },
        { name: "namePlaceholder", title: "\"Name\" field placeholder", type: "string" },
        { name: "emailLabel", title: "\"Email\" field label", type: "string" },
        { name: "emailPlaceholder", title: "\"Email\" field placeholder", type: "string" },

        // ── THE QUESTIONS ──────────────────────────────────────────────
        {
          name: "fields",
          title: "Questions",
          type: "array",
          description:
            "Everything the form asks below Name and Email. Add, remove and drag to reorder freely — each page has its own list, so the New Sellers page can ask completely different questions from the homepage. " +
            "Leave this empty to fall back to the three built-in dropdowns (revenue, products, budget).",
          of: [{
            type: "object",
            name: "leadFormField",
            fields: [
              { name: "label", title: "Question", type: "string",
                description: 'The label above the field, e.g. "Monthly Revenue on Amazon"',
                validation: (R: any) => R.required() },
              {
                name: "type",
                title: "Answer type",
                type: "string",
                initialValue: "dropdown",
                options: {
                  list: [
                    { title: "Dropdown — pick one of your choices", value: "dropdown" },
                    { title: "Short text — one line they type", value: "text" },
                    { title: "Long text — a paragraph they type", value: "textarea" },
                    { title: "Phone number", value: "phone" },
                  ],
                  layout: "radio",
                },
                validation: (R: any) => R.required(),
              },
              { name: "options", title: "Dropdown choices", type: "array",
                of: [{ type: "string" }],
                hidden: ({ parent }: any) => parent?.type !== "dropdown",
                description: "The first one is what's selected by default. Add, remove, or reorder freely.",
                validation: (R: any) =>
                  R.custom((options: string[] | undefined, ctx: any) =>
                    ctx.parent?.type === "dropdown" && !options?.length
                      ? "A dropdown needs at least one choice."
                      : true,
                  ) },
              { name: "placeholder", title: "Placeholder (grey hint text)", type: "string",
                hidden: ({ parent }: any) => parent?.type === "dropdown",
                description: 'Optional, e.g. "+1 555 0100". Dropdowns don\'t use this.' },
              { name: "required", title: "Required?", type: "boolean", initialValue: true,
                description: "On: the form won't submit until this is answered." },
              {
                name: "target",
                title: "Where does the answer go in GoHighLevel?",
                type: "string",
                initialValue: "customField",
                options: {
                  list: [
                    { title: "Into a custom field", value: "customField" },
                    { title: "Into the contact's phone number", value: "phone" },
                    { title: "Nowhere — just include it in the contact's note", value: "none" },
                  ],
                  layout: "radio",
                },
                description:
                  "Every answer is written onto the contact's timeline as a note no matter what you pick here — so nothing is ever lost, even on \"Nowhere\".",
              },
              { name: "ghlField", title: "GoHighLevel custom field key", type: "string",
                hidden: ({ parent }: any) => parent?.target !== "customField",
                description:
                  'The field\'s key in GoHighLevel → Settings → Custom Fields, e.g. "monthly_amazon_revenue". The field must already exist there, and the key has to match exactly — if it doesn\'t, the answer still reaches the contact\'s note, it just won\'t fill the field.',
                validation: (R: any) =>
                  R.custom((key: string | undefined, ctx: any) =>
                    ctx.parent?.target === "customField" && !key?.trim()
                      ? "Enter the custom field's key, or change where the answer goes."
                      : true,
                  ) },
              { name: "halfWidth", title: "Half width", type: "boolean", initialValue: false,
                description: "On: this sits side by side with the next half-width question, like Name and Email do." },
            ],
            preview: {
              select: { title: "label", type: "type", required: "required" },
              prepare({ title, type, required }: { title?: string; type?: string; required?: boolean }) {
                const kind = { dropdown: "Dropdown", text: "Short text", textarea: "Long text", phone: "Phone" }[
                  type ?? "dropdown"
                ] ?? type;
                return {
                  title: title || "Untitled question",
                  subtitle: `${kind}${required ? "" : " · optional"}`,
                };
              },
            },
          }],
        },

        // ── LEGACY (pre-"Questions") ───────────────────────────────────
        // Kept so documents written before the question builder existed
        // keep working: lib/content/merged.ts rebuilds the three dropdowns
        // from these when "Questions" above is empty. Hidden rather than
        // deleted, because deleting them would drop the data on the next
        // Studio publish. `npm run migrate:sanity` copies them into
        // "Questions", after which these are dead weight.
        { name: "revenueLabel", title: "Revenue dropdown — label (legacy)", type: "string", hidden: true },
        { name: "revenueOptions", title: "Revenue dropdown — choices (legacy)", type: "array",
          of: [{ type: "string" }], hidden: true },
        { name: "productsLabel", title: "Products dropdown — label (legacy)", type: "string", hidden: true },
        { name: "productsOptions", title: "Products dropdown — choices (legacy)", type: "array",
          of: [{ type: "string" }], hidden: true },
        { name: "budgetLabel", title: "Budget dropdown — label (legacy)", type: "string", hidden: true },
        { name: "budgetOptions", title: "Budget dropdown — choices (legacy)", type: "array",
          of: [{ type: "string" }], hidden: true },

        { name: "submitLabel", title: "Submit button text", type: "string",
          description: 'e.g. "Book My Strategy Call"' },
        { name: "submitLoadingLabel", title: "Submit button text while sending", type: "string",
          description: 'Shown briefly right after someone clicks submit, e.g. "Sending\u2026"' },

        { name: "successHeading", title: "Confirmation — heading", type: "string",
          description: 'Shown after a successful submit, replacing the form, e.g. "You\'re in."' },
        { name: "successBody", title: "Confirmation — message", type: "text", rows: 2 },

        // ── WHAT HAPPENS IN GOHIGHLEVEL ────────────────────────────────
        { name: "tags", title: "Tags added in GoHighLevel", type: "array",
          of: [{ type: "string" }],
          description:
            "Applied to the contact on every submission from this page — this is what your GoHighLevel workflows should trigger off. " +
            "Each page has its own list, so you can tag homepage leads and New Sellers leads differently. " +
            "Leave empty to use the built-in tags (\"website-lead\", \"strategy-call-request\")." },
        { name: "source", title: "Lead source recorded in GoHighLevel", type: "string",
          description: 'Shows on the contact as its source, e.g. "Website — New Sellers Page". Leave blank for the built-in default.' },
        { name: "opportunityName", title: "Pipeline deal name", type: "string",
          description: 'The name of the deal created in your pipeline. Write {{name}} where the person\'s name should go, e.g. "{{name}} — New Seller Call".' },
      ],
    },

    // ── FAQ ────────────────────────────────────────────────────────────
    sectionIntro({ name: "faqIntro", title: "FAQ — heading", group: "faq" }),
    {
      name: "faq",
      title: "FAQ",
      type: "array",
      group: "faq",
      of: [{
        type: "object",
        fields: [
          { name: "q", title: "Question", type: "string" },
          { name: "a", title: "Answer", type: "text", rows: 3 },
        ],
        preview: { select: { title: "q" } },
      }],
      description: "Drag to reorder. Add or remove questions freely.",
    },

    // ── FINAL CTA ──────────────────────────────────────────────────────
    {
      name: "cta",
      title: "Final CTA",
      type: "object",
      group: "finalCta",
      options: { collapsible: false },
      description: "The dark band at the very bottom of the page, above the footer.",
      fields: [
        { name: "eyebrow", title: "Eyebrow", type: "string",
          description: 'The small orange label, e.g. "Your Peak, Our Passion"' },
        { name: "heading", title: "Heading", type: "text", rows: 2 },
        { name: "headingAccent", title: "Orange part of the heading", type: "string" },
        { name: "sub", title: "Subheading", type: "text", rows: 2 },
        { name: "buttonLabel", title: "Button text", type: "string",
          description: 'e.g. "Book a Strategy Call"' },
        { name: "buttonHref", title: "Button destination", type: "string",
          description: 'Defaults to "#book-a-call" (scrolls to the form on this page).' },
      ],
    },
    {
      name: "contact",
      title: "Contact email",
      type: "object",
      group: "finalCta",
      description: "Used by the form and structured data on this page. The footer's contact links are edited in the separate \"Footer\" document.",
      fields: [
        { name: "email", title: "Contact email", type: "string" },
      ],
    },
  ],

  // Both landing pages share this schema, so the preview reads the
  // document id to show which page you actually have open rather than a
  // generic "Page Content" for both.
  preview: {
    select: { id: "_id" },
    prepare: ({ id }: { id?: string }) => ({
      title: id?.includes("newSellerPage") ? "New Sellers Page" : "Homepage",
    }),
  },
};
