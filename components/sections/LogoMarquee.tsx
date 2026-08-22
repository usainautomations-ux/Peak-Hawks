"use client";

import { useEffect, useRef } from "react";
import type { BrandLogo, SectionIntro } from "@/lib/content/defaults";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { sanityThumb } from "@/lib/sanity/imageUrl";

/**
 * The "Brands We've Launched And Scaled" strip.
 *
 * Both the heading and the brands themselves are editable in Sanity
 * (Homepage / New Sellers Page → "Brand Logos"). Each brand can be a
 * text name, an uploaded logo image, or both — an uploaded image wins and
 * the name becomes its alt text. Text and image brands can be mixed
 * freely in the same strip; images are greyed back and light up on hover
 * exactly like the text names, so a half-and-half strip still looks
 * deliberate.
 *
 * The track is duplicated and scrolled by -50%, so the loop stays
 * seamless at any number of brands.
 */
export function LogoMarquee({
  logos,
  intro,
}: {
  logos: BrandLogo[];
  intro?: SectionIntro;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Belt and braces: React throws "Objects are not valid as a React child"
  // if anything but a string reaches {brand.name}, which is exactly what a
  // half-migrated document can produce. Coerce here as well as in
  // lib/content/merged.ts so a bad row renders as nothing rather than
  // taking the whole page down with a 500.
  const safe = logos
    .map((b) => ({
      name: typeof b?.name === "string" ? b.name : "",
      logo: typeof b?.logo === "string" ? b.logo : undefined,
    }))
    .filter((b) => b.name.trim() !== "" || Boolean(b.logo));

  const doubled = [...safe, ...safe];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;

    let tween: { kill: () => void } | undefined;
    let scrollTrigger: { kill: () => void } | undefined;

    getGsap().then(({ gsap, ScrollTrigger }) => {
      tween = gsap.to(track, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });

      // velocity-based skew on scroll — subtle life without being distracting
      scrollTrigger = ScrollTrigger.create({
        onUpdate: (self) => {
          const skew = gsap.utils.clamp(-6, 6, self.getVelocity() / -180);
          if (Math.abs(skew) > 0.5) {
            gsap.to(track, {
              skewX: skew,
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto",
              onComplete: () => { gsap.to(track, { skewX: 0, duration: 0.55, ease: "power2.out" }); },
            });
          }
        },
      });
    });

    return () => {
      tween?.kill();
      scrollTrigger?.kill();
    };
  }, []);

  if (!safe.length) return null;

  return (
    <section className="border-y border-line bg-ink/[.015] py-10 sm:py-14">
      {intro?.heading ? (
        <p className="mb-6 px-5 text-center font-mono text-[.6rem] uppercase tracking-[.2em] text-grey sm:mb-7 sm:text-[.68rem] sm:tracking-[.24em]">
          {intro.heading}
        </p>
      ) : null}
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div
          ref={trackRef}
          className="flex w-max items-center gap-10 will-change-transform sm:gap-14 lg:gap-[70px]"
        >
          {doubled.map((brand, i) =>
            brand.logo ? (
              /* Every logo gets an identical box and is contained inside
                 it, so a wide wordmark and a square badge occupy exactly
                 the same footprint. `object-contain` on a fixed box keeps
                 the aspect ratio — nothing is stretched, cropped or
                 tiled, it is just centred in its slot. */
              <span
                key={i}
                className="flex h-9 w-[124px] flex-none items-center justify-center sm:h-10 sm:w-[150px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sanityThumb(brand.logo, 380)}
                  alt={brand.name || "Client brand"}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full object-contain opacity-30 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                />
              </span>
            ) : (
              /* Text brands sit in a slot of the same height so the strip
                 keeps one baseline whether a row is images, text, or a
                 mix of both. */
              <span
                key={i}
                className="flex h-9 flex-none items-center whitespace-nowrap font-display text-[1.1rem] font-extrabold text-silver/25 transition duration-300 hover:text-silver sm:h-10 sm:text-[1.35rem]"
              >
                {brand.name}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
