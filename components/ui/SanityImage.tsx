"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

/**
 * Drop-in replacement for `next/image` for Sanity-hosted images.
 *
 * Next's built-in optimizer downloads every external image to the server,
 * re-encodes it, then serves it — and it gives up on that download after
 * 7 seconds. On a slow or high-latency connection to cdn.sanity.io that
 * limit is easy to hit, and the result is a 500 on /_next/image and a
 * blank space where the picture should be:
 *
 *   GET /_next/image?url=https%3A%2F%2Fcdn.sanity.io%2F… 500 in 7484ms
 *   [Error [TimeoutError]: The operation was aborted due to timeout]
 *
 * There is no way to raise that timeout. But the round trip is pointless
 * here anyway: Sanity's CDN already does exactly what the optimizer does,
 * on demand, via URL parameters — resize, re-encode to WebP/AVIF where
 * the browser supports it, and set a quality. So this hands Sanity the
 * transform instead and lets the browser fetch the result directly.
 *
 * Net effect: no server-side download, no 7-second ceiling, one fewer hop,
 * and identical `fill` / `sizes` / `priority` behaviour — the props are
 * passed straight through.
 *
 * Non-Sanity sources (GHL media, storage.googleapis.com) keep using the
 * normal optimizer, so nothing else changes.
 */

const SANITY_CDN = "cdn.sanity.io";

function sanityLoader({ src, width, quality }: ImageLoaderProps): string {
  try {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    // `auto=format` serves WebP/AVIF to browsers that accept them;
    // `fit=max` never upscales past the original.
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.toString();
  } catch {
    return src; // not a parseable URL — hand it back untouched
  }
}

export function SanityImage(props: Omit<ImageProps, "loader">) {
  const isSanity = typeof props.src === "string" && props.src.includes(SANITY_CDN);
  if (!isSanity) return <Image {...props} />;
  return <Image {...props} loader={sanityLoader} />;
}
