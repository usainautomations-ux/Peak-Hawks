"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Browsers apply `scroll-behavior: smooth` to same-page anchor clicks, but
 * NOT to the initial jump when a page loads with a #hash already in the
 * URL (e.g. clicking "Book a Call" on /blog, which links to /#book-a-call).
 * Without this, that case snaps instantly instead of scrolling smoothly.
 *
 * Those cross-page links use next/link, which does a SOFT client-side
 * transition — this component lives in the shared marketing layout and
 * does not remount on route changes, so a plain mount-only effect would
 * only ever fire once per full page load and silently miss every
 * subsequent Link-based navigation. Watching `usePathname()` makes the
 * effect re-run on every route change instead.
 *
 * The Preloader sets `overflow:hidden` on <body> and only lifts it once
 * its own animation finishes (dispatching `peakhawks:preloader-done` —
 * same event Hero.tsx listens for). Scrolling is physically blocked until
 * then, so on the very first load this waits for that event rather than
 * firing immediately and silently doing nothing.
 *
 * Mounted once in the marketing layout; renders nothing.
 */
export function SmoothHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.location.hash) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = decodeURIComponent(window.location.hash.slice(1));
    const scroll = () => {
      // A frame after unlock so layout has settled before measuring position.
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    if (!document.body.classList.contains("loading")) {
      scroll();
      return;
    }
    document.body.addEventListener("peakhawks:preloader-done", scroll, { once: true });
    return () => document.body.removeEventListener("peakhawks:preloader-done", scroll);
  }, [pathname]);

  return null;
}
