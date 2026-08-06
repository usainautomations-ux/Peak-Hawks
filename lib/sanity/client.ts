import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { projectId, dataset, apiVersion } from "@/sanity/env";

/**
 * Sanity client — server-only. Never import this in client components.
 *
 * Env vars (add to .env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID — from sanity.io/manage, not secret
 *   NEXT_PUBLIC_SANITY_DATASET    — usually "production", not secret
 *   SANITY_API_TOKEN              — a read-only token, SERVER-ONLY secret
 *
 * Optional (for instant cache busting via webhook):
 *   SANITY_WEBHOOK_SECRET — any random string, set the same in Sanity
 *
 * IMPORTANT: `createClient()` throws SYNCHRONOUSLY if projectId is empty.
 * Since this module is imported (transitively) by server components,
 * an unconfigured Sanity project used to crash the ENTIRE page render —
 * not just the content fetch — which could cascade into broken client
 * hydration (e.g. GSAP-driven fade-ins like the nav bar getting stuck
 * invisible). `sanityConfigured` guards every call site so a missing
 * env var degrades to "use GHL/defaults" instead of taking the app down.
 */

export const sanityConfigured = Boolean(projectId);

export const sanityClient: SanityClient | null = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false, // ISR handles caching — always fresh from Sanity's API
      token: process.env.SANITY_API_TOKEN,
      perspective: "published",
    })
  : null;

if (!sanityConfigured && typeof window === "undefined") {
  console.warn(
    "[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set — the site will run on GHL/default content until it's configured.",
  );
}

// Image URL builder — safe to construct even when unconfigured; it just
// won't be called (imageUrl() below short-circuits first).
const builder = sanityConfigured ? imageUrlBuilder({ projectId, dataset }) : null;

export function sanityImage(source: SanityImageSource) {
  if (!builder) return null;
  return builder.image(source);
}

/** Typed helper for image URLs with sensible defaults */
export function imageUrl(
  source: SanityImageSource | null | undefined,
  opts: { w?: number; h?: number; q?: number } = {},
): string | null {
  if (!source || !builder) return null;
  let b = builder.image(source).auto("format");
  if (opts.w) b = b.width(opts.w);
  if (opts.h) b = b.height(opts.h);
  if (opts.q) b = b.quality(opts.q);
  return b.url();
}
