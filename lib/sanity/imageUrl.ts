/**
 * Appends Sanity's CDN transform parameters to an image URL.
 *
 * For the small images rendered with a plain `<img>` tag rather than
 * `next/image` — brand logos, testimonial avatars, custom section icons,
 * the footer logo — the raw asset URL serves the file at whatever size it
 * was uploaded. A 2000px logo dropped into a 36px-tall strip is a large
 * download for nothing, and on a slow connection it is a visible delay.
 *
 * Sanity's CDN resizes and re-encodes on demand from the query string, so
 * asking for the size actually being displayed costs nothing and is
 * served straight from their edge.
 *
 * Non-Sanity URLs (and anything unparseable) are returned untouched, so
 * this is always safe to wrap around a URL of unknown origin.
 */
export function sanityThumb(url: string | undefined, width: number): string | undefined {
  if (!url || !url.includes("cdn.sanity.io")) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.set("auto", "format"); // WebP/AVIF where supported
    parsed.searchParams.set("fit", "max"); // never upscale past the original
    return parsed.toString();
  } catch {
    return url;
  }
}
