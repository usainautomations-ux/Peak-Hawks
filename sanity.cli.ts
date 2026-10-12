import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./sanity/env";

/**
 * Config for the `sanity` CLI (dataset export/import, etc).
 *
 * Separate from sanity.config.ts, which configures the Studio itself. The CLI
 * refuses to run `dataset` commands without this file plus `sanity` installed
 * as a local dependency — hence `npm ci` before any export.
 */
export default defineCliConfig({
  api: { projectId, dataset },
});
