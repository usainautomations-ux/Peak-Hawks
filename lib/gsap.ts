"use client";

/**
 * GSAP is loaded dynamically (never in a server component) and ScrollTrigger
 * is registered exactly once per page load. Every animated component should
 * call `getGsap()` instead of importing "gsap" directly.
 */

let cached: Promise<{
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
}> | null = null;

export function getGsap() {
  if (!cached) {
    cached = Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([gsapMod, stMod]) => {
      gsapMod.gsap.registerPlugin(stMod.ScrollTrigger);
      return { gsap: gsapMod.gsap, ScrollTrigger: stMod.ScrollTrigger };
    });
  }
  return cached;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
