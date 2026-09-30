/**
 * Checks that every GoHighLevel custom field the lead forms write to
 * actually exists in GoHighLevel.
 *
 *   npm run check:ghl-fields
 *
 * A question can point at any custom field key you like (Sanity → Lead
 * Form → Questions → "GoHighLevel custom field key"). If that key doesn't
 * match a real field, nothing breaks loudly: the lead is still captured
 * and the answer still lands on the contact's timeline note — it just
 * never fills a field, and you find out weeks later when you try to build
 * a smart list. Deleting or renaming a field in GoHighLevel causes exactly
 * that, silently.
 *
 * This turns that into one command. It reads the questions the same way
 * the site does (Sanity first, code defaults for anything unset — see
 * getMergedLeadForm), asks GoHighLevel which fields exist, and prints
 * what's missing.
 *
 * Needs the same credentials the site runs on, from .env.local or .env:
 *   GHL_PRIVATE_TOKEN, GHL_LOCATION_ID
 *
 * Exits 1 when a key is missing, so it can gate a deploy if you ever want
 * it to.
 */

// Must come first — populates process.env before anything reads it.
import "./loadEnv";

import { getMergedLeadForm, type LeadFormPage } from "@/lib/content/merged";
import { getLeadForm } from "@/lib/sanity/queries";
import type { LeadFormContent } from "@/lib/content/defaults";
import { ghlFetch, getLocationId, GHLError } from "@/lib/ghl/client";
// Shared with the live submit path so the two can never disagree about
// what counts as a match.
import { bareFieldKey as bareKey } from "@/lib/ghl/customFields";
import type { LeadFormField } from "@/lib/content/defaults";

const PAGES: { id: LeadFormPage; label: string }[] = [
  { id: "homepage", label: "Homepage" },
  { id: "newSellerPage", label: "New Sellers Page" },
];

type GHLCustomField = {
  id?: string;
  name?: string;
  fieldKey?: string;
  dataType?: string;
};

async function fetchGhlFields(): Promise<GHLCustomField[]> {
  const locationId = getLocationId();
  const res = await ghlFetch<{ customFields?: GHLCustomField[] }>(
    `/locations/${locationId}/customFields`,
  );
  // Never assume the shape: an unexpected body should read as "couldn't
  // check", not as "every field is missing".
  if (!res || !Array.isArray(res.customFields)) {
    throw new Error(
      "GoHighLevel returned an unexpected response for custom fields. " +
        "Check that GHL_PRIVATE_TOKEN has the locations.readonly scope.",
    );
  }
  return res.customFields;
}

/** The questions on one page that are meant to fill a custom field. */
function mappedFields(fields: LeadFormField[]): LeadFormField[] {
  return fields.filter((f) => f.target === "customField" && f.ghlField?.trim());
}

/**
 * Loads one page's questions and reports where they came from.
 *
 * This matters more than it looks. If Sanity is unreachable the site
 * falls back to the code defaults, and so does this check — which would
 * quietly produce a confident-looking report about questions that are not
 * the ones your live form asks. So the source is established explicitly
 * and printed, rather than left to be assumed.
 *
 * Sanity's own failure logging is a multi-line stack trace per call,
 * which buries the actual report, so it is captured and condensed here.
 */
async function loadConfig(
  page: LeadFormPage,
): Promise<{ config: LeadFormContent; fromSanity: boolean; warning?: string }> {
  const warnings: string[] = [];
  const realWarn = console.warn;
  console.warn = (...args: unknown[]) => { warnings.push(String(args[0])); };

  try {
    const sanity = await getLeadForm(page).catch(() => null);
    const config = await getMergedLeadForm(page);
    return {
      config,
      fromSanity: sanity !== null,
      warning: warnings.length ? warnings[0] : undefined,
    };
  } finally {
    console.warn = realWarn;
  }
}

async function main() {
  console.log("Checking GoHighLevel custom fields against the lead forms…\n");

  const ghlFields = await fetchGhlFields();
  const existing = new Map(
    ghlFields
      .filter((f) => typeof f.fieldKey === "string")
      .map((f) => [bareKey(f.fieldKey!), f]),
  );

  console.log(`GoHighLevel has ${existing.size} custom field(s).\n`);

  let missing = 0;
  const used = new Set<string>();

  let anyFallback = false;

  for (const page of PAGES) {
    const { config, fromSanity, warning } = await loadConfig(page.id);
    const mapped = mappedFields(config.fields);

    console.log(`${page.label}`);
    if (fromSanity) {
      console.log("  (questions read from Sanity)");
    } else {
      anyFallback = true;
      console.log(
        "  \u26a0 Could not read this page from Sanity — checked the CODE DEFAULTS",
      );
      console.log(
        "    instead, which may not match what the live form actually asks.",
      );
      if (warning) console.log(`    ${warning.replace(/\s+/g, " ").slice(0, 140)}`);
    }

    if (!mapped.length) {
      console.log("  (no questions write to a custom field)\n");
      continue;
    }

    for (const field of mapped) {
      const key = bareKey(field.ghlField!);
      used.add(key);
      const hit = existing.get(key);

      if (hit) {
        console.log(`  ✓ ${field.ghlField}  → "${hit.name ?? "(unnamed)"}"`);
      } else {
        missing++;
        console.log(`  ✗ ${field.ghlField}  — NOT FOUND in GoHighLevel`);
        console.log(`      asked as: "${field.label}"`);
      }
    }
    console.log("");
  }

  // Informational only — an unused field is usually just a field used
  // elsewhere in GoHighLevel, not a mistake. Worth surfacing because a
  // near-miss here (a typo, or a key that changed when a field was
  // recreated) is normally the explanation for a missing one above.
  const unused = [...existing.entries()].filter(([key]) => !used.has(key));
  if (unused.length) {
    console.log(`Custom fields in GoHighLevel that no question writes to (${unused.length}):`);
    for (const [key, f] of unused) {
      console.log(`  · ${key}${f.name ? `  — "${f.name}"` : ""}`);
    }
    console.log("");
  }

  if (anyFallback) {
    console.log(
      "\u26a0 At least one page fell back to the code defaults, so treat the result\n" +
        "  above as indicative rather than authoritative. Check that the Sanity\n" +
        "  env vars are set (NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET, and\n" +
        "  SANITY_API_TOKEN if the dataset is private) and that this machine can\n" +
        "  reach the Sanity API.\n",
    );
  }

  if (missing) {
    console.log(
      `${missing} field(s) missing. Answers to those questions still reach the\n` +
        `contact's timeline note, so no lead is lost — they just won't fill a\n` +
        `field you can filter or segment on.\n`,
    );
    console.log("To fix each one:");
    console.log("  1. GoHighLevel → Settings → Custom Fields → Add Field, type Text");
    console.log("  2. Save it, reopen it, and COPY its key — recreating a deleted");
    console.log("     field can produce a different key than it had before");
    console.log("  3. Paste that key into Sanity → that page → Lead Form → Questions");
    console.log("  4. Publish, then re-run this command\n");
    process.exit(1);
  }

  console.log("All good — every question's field exists in GoHighLevel.");
}

main().catch((err) => {
  const message = String(err?.message ?? err);
  console.error("\n✗ Check failed:", message);

  if (err instanceof GHLError && (err.status === 401 || err.status === 403)) {
    console.error(
      [
        "",
        "GoHighLevel rejected the token. Two usual causes:",
        "",
        "  · GHL_PRIVATE_TOKEN is wrong, expired, or is a V1 API key",
        "    (V1 keys are end-of-life — this needs a Private Integration",
        "    Token from Settings → Integrations → Private Integrations)",
        "  · the token exists but lacks the locations.readonly scope, which",
        "    is what permits reading the custom field list",
        "",
      ].join("\n"),
    );
  } else if (/Missing required env var/.test(message)) {
    console.error(
      [
        "",
        "This reads the same credentials the site runs on. Put them in",
        ".env.local (or .env):",
        "",
        "  GHL_PRIVATE_TOKEN=pit-...",
        "  GHL_LOCATION_ID=...",
        "",
      ].join("\n"),
    );
  }
  process.exit(1);
});
