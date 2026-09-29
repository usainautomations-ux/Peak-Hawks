/**
 * Seeds Sanity with the current default content, so opening the Studio
 * shows real, editable copy instead of blank forms.
 *
 * Page text only — case studies and blog posts are not seeded, since
 * placeholder ones would land on the live site as blank cards.
 *
 * Safe to run more than once — uses `createIfNotExists`, so it will NEVER
 * overwrite a document that already exists (i.e. it won't clobber any
 * edits you've already made in the Studio).
 *
 * Requires a WRITE-capable token (the SANITY_API_TOKEN in .env.local is
 * usually read-only "Viewer" — that won't work here). Get a temporary
 * one: sanity.io/manage → your project → API → Tokens → Add API token →
 * "Editor" permissions → copy it → run:
 *
 *   SANITY_SEED_TOKEN=sk_your_editor_token npm run seed:sanity
 *
 * (You can delete that token again afterward — it's only needed once.)
 */

// Must come first — populates process.env from .env.local before it is read.
import "./loadEnv";

import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";
import { defaultContent, type SiteContent } from "../lib/content/defaults";
import { newSellerDefaults } from "../lib/content/newSellerDefaults";
import { footerDefaults } from "../lib/content/footerDefaults";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_SEED_TOKEN ?? process.env.SANITY_API_TOKEN;

if (!projectId) {
  console.error("✗ NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Add it to .env.local first.");
  process.exit(1);
}
if (!token) {
  console.error(
    "✗ No write token found. Set SANITY_SEED_TOKEN=your_editor_token and re-run.\n" +
      "  Get one at sanity.io/manage → your project → API → Tokens → Add API token → Editor permissions.",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

/** Every array item in Sanity needs a stable `_key` for the Studio to
 * render drag-handles and track identity correctly. */
function withKeys<T extends object>(items: T[]): (T & { _key: string })[] {
  return items.map((item) => ({ ...item, _key: randomUUID() }));
}

/** Converts our SiteContent shape into the Sanity "pageContent" document
 * shape. Image/video-asset fields (posterImage, whyUs[].image,
 * testimonials[].avatar) are intentionally omitted — they're Sanity asset
 * references, not plain strings, so they can't be seeded without actually
 * uploading files. They'll show as empty upload slots in the Studio,
 * exactly as they do today. */
function toSanityDoc(id: string, content: SiteContent) {
  return {
    _id: id,
    _type: "pageContent",
    topBanner: content.topBanner,
    hero: {
      badge: content.hero.badge,
      headlineLines: content.hero.headline,
      headlineAccent: content.hero.headlineAccent,
      subhead: content.hero.subhead,
      note: content.hero.note,
      videoUrl: content.hero.videoUrl || undefined,
      chips: withKeys(content.hero.chips),
      // Same reasoning as brandLogos below — images are asset references,
      // so only text names are seeded.
      partnerLogos: withKeys(
        content.hero.partnerLogos.map(({ name }) => ({ _type: "partnerLogo", name })),
      ),
      partnerLogosLabel: content.hero.partnerLogosLabel,
      partnerLogosStyle: content.hero.partnerLogosStyle,
    },
    statsIntro: content.statsIntro,
    stats: withKeys(content.stats),
    brandsIntro: content.brandsIntro,
    // Logo images are Sanity asset references, so only the text names are
    // seeded — the client uploads images per brand in the Studio.
    brandLogos: withKeys(
      content.brandLogos.map(({ name }) => ({ _type: "brandLogo", name })),
    ),
    problemsIntro: content.problemsIntro,
    problems: withKeys(
      content.problems.map(({ iconImage: _iconImage, ...rest }) => rest),
    ),
    problemsGauge: (() => {
      const { iconImage: _iconImage, ...rest } = content.problemsGauge;
      return rest;
    })(),
    problemsBanner: withKeys(
      content.problemsBanner.map(({ iconImage: _iconImage, ...rest }) => rest),
    ),
    whyUsIntro: content.whyUsIntro,
    whyUs: withKeys(
      content.whyUs.map((r) => ({
        eyebrow: r.eyebrow,
        title: r.title,
        body: r.body,
        points: r.points,
        outcomeLabel: r.outcomeLabel,
        outcome: r.outcome,
        outcomeIcon: r.outcomeIcon,
      })),
    ),
    caseStudiesIntro: content.caseStudiesIntro,
    categoriesIntro: content.categoriesIntro,
    // Same reasoning as brandLogos above — images are asset references,
    // so only text names are seeded.
    categories: withKeys(
      content.categories.map(({ name }) => ({ _type: "categoryItem", name })),
    ),
    servicesIntro: content.servicesIntro,
    services: withKeys(content.services),
    processIntro: content.processIntro,
    process: withKeys(content.process),
    testimonialsIntro: content.testimonialsIntro,
    testimonials: withKeys(
      content.testimonials.map((t) => ({
        quote: t.quote,
        name: t.name,
        role: t.role,
        initials: t.initials,
        rating: t.rating ?? 5,
      })),
    ),
    bookIntro: content.bookIntro,
    leadForm: {
      ...content.leadForm,
      // Array items need a _key or the Studio can't render drag handles;
      // _type has to match the schema's `name` for the question editor.
      fields: withKeys(
        content.leadForm.fields.map((f) => ({ _type: "leadFormField", ...f })),
      ),
    },
    faqIntro: content.faqIntro,
    faq: withKeys(content.faq),
    cta: content.cta,
    contact: content.contact,
  };
}

/** The shared "Footer" document. Its logo field is an asset reference, so
 * it is left empty for the client to upload; everything else is seeded. */
function toFooterDoc() {
  return {
    _id: "siteFooter",
    _type: "siteFooter",
    brandNameStart: footerDefaults.brandNameStart,
    brandNameAccent: footerDefaults.brandNameAccent,
    tagline: footerDefaults.tagline,
    columns: withKeys(
      footerDefaults.columns.map((c) => ({
        _type: "footerColumn",
        title: c.title,
        links: withKeys(c.links.map((l) => ({ _type: "footerLink", ...l }))),
      })),
    ),
    wordmark: footerDefaults.wordmark,
    copyright: footerDefaults.copyright,
    legalLabels: footerDefaults.legalLabels,
    mobileCtaLabel: footerDefaults.mobileCtaLabel,
    chatWidgetId: footerDefaults.chatWidgetId,
  };
}

async function seed() {
  console.log(`Seeding project ${projectId} (dataset: ${dataset})…\n`);

  const homepage = toSanityDoc("homepage", defaultContent);
  const newSellerPage = toSanityDoc("newSellerPage", newSellerDefaults);

  // Case studies are deliberately NOT seeded. This script used to create
  // six placeholder ones from the code defaults; they had no cover image
  // and no write-up, so they showed on /case-studies as blank cards, and
  // anyone who ran the seed twice on a fresh dataset got them back. Real
  // case studies belong to the client — they create them in the Studio.
  const [homeResult, newSellerResult, footerResult] = await Promise.all([
    client.createIfNotExists(homepage),
    client.createIfNotExists(newSellerPage),
    client.createIfNotExists(toFooterDoc()),
  ]);

  console.log(`✓ Homepage:          ${homeResult._id}`);
  console.log(`✓ New Sellers Page:  ${newSellerResult._id}`);
  console.log(`✓ Footer:            ${footerResult._id}`);
  console.log(
    "\nDone. Anything that already existed was left untouched (createIfNotExists never overwrites).",
  );
  console.log("Open /studio to see the pre-filled content — edit and hit Publish.");
}

seed().catch((err) => {
  console.error("✗ Seed failed:", err.message ?? err);
  process.exit(1);
});
