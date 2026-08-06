import { ghlFetch, getLocationId } from "./client";
import { defaultContent, type SiteContent } from "@/lib/content/defaults";

/**
 * ⚠️ DEPRECATED — not used by any page. Kept only for reference.
 *
 * GHL's role on this project is strictly leads and booking (see
 * lib/ghl/crm.ts, lib/ghl/calendar.ts, and the /api/leads, /api/booking
 * routes). Site CONTENT is now sourced exclusively from Sanity
 * (lib/content/merged.ts) — this GHL Custom Values approach predates
 * the Sanity integration and has been fully superseded. It's left here
 * only in case a future project wants the "no separate CMS" pattern.
 *
 * ---- original doc below ----
 *
 * CONTENT SOURCE — GoHighLevel Custom Values
 *
 * GHL Custom Values (Settings → Custom Values) are account-level key/value
 * pairs the client can edit in the GHL UI with zero code. We use them as the
 * CMS for the marketing site.
 *
 * Naming convention: prefix every site value with `site_`.
 *   site_hero_headline          -> "Amazon Growth, Engineered From Product Data."
 *   site_stat_revenue           -> "28"
 *   site_case_studies           -> JSON array (see below)
 *
 * Flat text/number values map 1:1. Repeatable structured content
 * (case studies, testimonials) is stored as a JSON string in a single value.
 * See README for the exact keys and a paste-ready starter set.
 *
 * Anything missing or malformed falls back to `defaultContent`, so the site
 * can never render blank because someone deleted a value.
 */

type CustomValue = { id: string; name: string; value: string };

async function fetchCustomValues(): Promise<Map<string, string>> {
  const res = await ghlFetch<{ customValues: CustomValue[] }>(
    `/locations/${getLocationId()}/customValues`,
    {
      method: "GET",
      // content changes rarely — revalidate every 5 min, or instantly via webhook
      next: { revalidate: 300, tags: ["ghl-content"] },
    },
  );

  const map = new Map<string, string>();
  for (const cv of res.customValues ?? []) {
    // GHL shows values as {{ custom_values.my_name }} — normalise the key
    const key = cv.name.trim().toLowerCase().replace(/\s+/g, "_");
    map.set(key, cv.value);
  }
  return map;
}

function str(map: Map<string, string>, key: string, fallback: string): string {
  const v = map.get(key);
  return v && v.trim() ? v.trim() : fallback;
}

function num(map: Map<string, string>, key: string, fallback: number): number {
  const v = Number(map.get(key));
  return Number.isFinite(v) ? v : fallback;
}

function json<T>(map: Map<string, string>, key: string, fallback: T): T {
  const raw = map.get(key);
  if (!raw?.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length === 0 ? fallback : (parsed as T);
  } catch {
    // malformed JSON in the CMS shouldn't take the site down
    console.warn(`[content] Invalid JSON in custom value "${key}" — using default`);
    return fallback;
  }
}

/**
 * Assembles the full site content object.
 * Called from the server component in app/page.tsx.
 */
export async function getSiteContent(): Promise<SiteContent> {
  let map: Map<string, string>;
  try {
    map = await fetchCustomValues();
  } catch (err) {
    // Serve defaults and log one concise line — not a stack trace on every render.
    const status =
      err && typeof err === "object" && "status" in err
        ? (err as { status: number }).status
        : "?";
    const body =
      err && typeof err === "object" && "body" in err
        ? JSON.stringify((err as { body: unknown }).body)
        : "";
    console.warn(
      `[content] GHL customValues unavailable (${status}) — serving defaults.` +
        (status === 403 || status === 401
          ? ` Check the Private Integration has the "View Custom Values" scope; scopes are baked into the token, so re-save/rotate the token after changing them. ${body}`
          : ` ${body}`),
    );
    return defaultContent;
  }

  const d = defaultContent;

  return {
    // Spread the defaults first so this deprecated mapper keeps compiling
    // as the content model grows. Sections that never had a GHL custom
    // value (the per-section heading blocks added for the Sanity build,
    // the top banner, and so on) simply come through as their defaults,
    // and only the keys explicitly overridden below read from GHL.
    ...d,
    hero: {
      badge: str(map, "site_hero_badge", d.hero.badge),
      headline: str(map, "site_hero_headline", d.hero.headline),
      headlineAccent: str(map, "site_hero_accent", d.hero.headlineAccent),
      subhead: str(map, "site_hero_subhead", d.hero.subhead),
      note: str(map, "site_hero_note", d.hero.note),
      videoUrl: str(map, "site_hero_video_url", d.hero.videoUrl),
      posterImage: str(map, "site_hero_poster_image", d.hero.posterImage ?? ""),
      posterImageMobile: str(
        map,
        "site_hero_poster_image_mobile",
        d.hero.posterImageMobile ?? "",
      ),
      chips: json(map, "site_hero_chips", d.hero.chips),
    },
    stats: json(map, "site_stats", d.stats),
    brandLogos: json(map, "site_brand_logos", d.brandLogos),
    problemsIntro: json(map, "site_problems_intro", d.problemsIntro),
    problems: json(map, "site_problems", d.problems),
    problemsGauge: json(map, "site_problems_gauge", d.problemsGauge),
    problemsBanner: json(map, "site_problems_banner", d.problemsBanner),
    whyUsIntro: json(map, "site_why_us_intro", d.whyUsIntro),
    whyUs: json(map, "site_why_us", d.whyUs),
    caseStudies: json(map, "site_case_studies", d.caseStudies),
    services: json(map, "site_services", d.services),
    process: json(map, "site_process", d.process),
    testimonials: json(map, "site_testimonials", d.testimonials),
    faq: json(map, "site_faq", d.faq),
    cta: {
      ...d.cta,
      heading: str(map, "site_cta_heading", d.cta.heading),
      sub: str(map, "site_cta_sub", d.cta.sub),
    },
    contact: {
      email: str(map, "site_contact_email", d.contact.email),
    },
  };
}
