/**
 * Migrates existing Sanity documents to the current schema shape.
 *
 * Right now it does one thing: the "Brand Logos" strip used to be a list
 * of plain text names (an array of strings). It is now a list of objects
 * so each brand can carry a name, an uploaded logo image, or both. Sanity
 * Studio refuses to render a mixed list, so any document seeded before
 * that change shows:
 *
 *   "Invalid list values — Some items in this list are not objects."
 *
 * The website itself is unaffected either way (lib/content/merged.ts
 * normalises both shapes), so this is purely so the Studio form works.
 *
 * Safe to run as many times as you like: entries that are already objects
 * are left exactly as they are, and a document with nothing to fix is
 * skipped without being written to at all.
 *
 * Needs a WRITE-capable token, same as the seed script — the read-only
 * "Viewer" token in .env.local won't do. Get one at sanity.io/manage →
 * your project → API → Tokens → Add API token → "Editor", then:
 *
 *   SANITY_SEED_TOKEN=sk_your_editor_token npm run migrate:sanity
 */

// Must come first — populates process.env from .env.local before it is read.
import "./loadEnv";

import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

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

/** Which variable the token came from, so a Viewer token picked up from
 * SANITY_API_TOKEN by accident is obvious rather than mysterious. */
const tokenSource = process.env.SANITY_SEED_TOKEN
  ? "SANITY_SEED_TOKEN"
  : "SANITY_API_TOKEN";

type LegacyBrand = string | { _key?: string; _type?: string; name?: string; logo?: unknown };

/** Converts one entry to the object shape, leaving existing objects
 * untouched apart from filling in a missing `_key` or `_type`. */
function toBrandObject(entry: LegacyBrand) {
  if (typeof entry === "string") {
    return { _key: randomUUID(), _type: "brandLogo", name: entry };
  }
  return {
    ...entry,
    _key: entry._key ?? randomUUID(),
    _type: entry._type ?? "brandLogo",
  };
}

async function migrate() {
  console.log(`Migrating project ${projectId} (dataset: ${dataset})…`);
  console.log(
    `Using ${tokenSource} (…${token!.slice(-6)}) — this must be an Editor token.\n`,
  );

  const docs = await client.fetch<{ _id: string; brandLogos?: LegacyBrand[] }[]>(
    `*[_type == "pageContent"]{ _id, brandLogos }`,
  );

  if (!docs.length) {
    console.log("No pageContent documents found — nothing to migrate.");
    return;
  }

  let changed = 0;

  for (const doc of docs) {
    const logos = doc.brandLogos;
    if (!logos?.length) {
      console.log(`· ${doc._id}: no brand logos, skipped`);
      continue;
    }

    const needsFix = logos.some(
      (entry) => typeof entry === "string" || !entry._key || !entry._type,
    );
    if (!needsFix) {
      console.log(`· ${doc._id}: already up to date, skipped`);
      continue;
    }

    const migrated = logos.map(toBrandObject);
    await client.patch(doc._id).set({ brandLogos: migrated }).commit();
    changed++;
    console.log(`✓ ${doc._id}: converted ${migrated.length} brand entries`);
  }

  console.log(
    changed
      ? `\nDone — ${changed} document(s) updated. Reload /studio and the Brand Logos list will render normally.`
      : "\nDone — everything was already in the current shape.",
  );
  console.log(
    "Drafts are included in the query above, so any unpublished edits open in\n" +
      "the Studio are fixed too — no need to publish or discard first.",
  );
}

migrate().catch((err) => {
  const message = String(err?.message ?? err);
  console.error("✗ Migration failed:", message);

  // By far the most common failure: the token in .env.local is the
  // read-only "Viewer" token the site uses at runtime. Sanity's own error
  // does not say that, so spell it out rather than leaving you guessing.
  if (/permission|insufficient|unauthorized|not allowed/i.test(message)) {
    console.error(
      [
        "",
        `The token in ${tokenSource} can read your content but cannot write to it.`,
        'That is what a "Viewer" token does — and it is almost certainly the same',
        "read-only token the website itself uses at runtime.",
        "",
        "A token's permissions cannot be changed after it is created, so make a",
        "new one:",
        "",
        `  1. Open https://sanity.io/manage/project/${projectId}/api`,
        '  2. Scroll to "Tokens" → "Add API token"',
        '  3. Name it anything (e.g. "migration"), set permissions to "Editor"',
        "  4. Copy the token — it is only shown once",
        "  5. Put it in .env.local as:  SANITY_SEED_TOKEN=sk_...",
        "  6. Re-run this command",
        "",
        "You can delete that Editor token afterwards — the site only ever needs",
        "the read-only Viewer token to run.",
      ].join("\n"),
    );
  }
  process.exit(1);
});
