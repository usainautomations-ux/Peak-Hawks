/**
 * Loads .env.local (then .env) into process.env.
 *
 * Next.js does this automatically, but these scripts run as plain Node
 * processes via tsx — nothing loads .env.local for them, so without this
 * the scripts exit with "NEXT_PUBLIC_SANITY_PROJECT_ID is not set" even
 * though the variable is sitting right there in the file.
 *
 * Deliberately hand-rolled rather than pulling in `dotenv`: it's twenty
 * lines, it means one less dependency, and it keeps the scripts runnable
 * on a fresh clone.
 *
 * Real environment variables always win — if you set a value in your
 * shell it is never overwritten by the file, which is what you want when
 * temporarily passing a different token.
 *
 * Import this FIRST, before anything that reads process.env.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadFile(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim().replace(/^export\s+/, "");
    if (!key || process.env[key] !== undefined) continue; // shell wins

    let value = line.slice(eq + 1).trim();
    // strip matching surrounding quotes, if any
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

// .env.local first so it takes precedence over .env, matching Next.js.
loadFile(".env.local");
loadFile(".env");
