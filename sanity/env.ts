/**
 * Sanity project constants.
 *
 * Project ID and dataset are NOT secrets (they're visible in every API
 * request URL) so they're safe as NEXT_PUBLIC_ vars — this lets the same
 * values power both:
 *   1. Server-side data fetching (lib/sanity/client.ts)
 *   2. The embedded Studio at /studio (runs in the browser)
 *
 * Only SANITY_API_TOKEN (server-only, used for reading data) stays secret.
 */

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID ?? "v84q7t2g";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.SANITY_DATASET ?? "production";
export const apiVersion = "2024-01-01";
