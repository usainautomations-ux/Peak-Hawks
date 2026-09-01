"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/content/defaults";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { Magnetic } from "@/components/Magnetic";
import { sanityThumb } from "@/lib/sanity/imageUrl";

/** Parses a hero video URL into an embeddable form — YouTube/Vimeo need
 * an iframe, direct files (.mp4 etc.) use a native <video> tag. A raw
 * <video src="youtube.com/..."> silently fails and renders nothing. */
function parseVideo(url: string): { kind: "youtube" | "vimeo" | "file"; embedSrc?: string } {
  const yt = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  if (yt) {
    return {
      kind: "youtube",
      embedSrc: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return { kind: "vimeo", embedSrc: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
  }
  return { kind: "file" };
}

/** Is this URL actually a plain image (photo/graphic), not a video?
 * Catches the common case where the client has a picture, not a VSL —
 * in that case we just show the image, no play button, no video UI. */
function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i.test(url);
}

/**
 * Renders the hero graphic, swapping in the client's mobile crop below
 * 768px when one has been uploaded in the Studio. Both images are
 * optional and either can stand in for the other, so a client who only
 * uploads one still gets it on every screen size.
 */
function HeroPicture({
  desktop,
  mobile,
  alt,
}: {
  desktop?: string;
  mobile?: string;
  alt: string;
}) {
  const fallback = desktop || mobile;
  if (!fallback) return null;

  return (
    <picture className="block h-full w-full">
      {mobile && mobile !== fallback ? (
        <source media="(max-width: 767px)" srcSet={mobile} />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fallback} alt={alt} className="h-full w-full object-contain" />
    </picture>
  );
}

export function Hero({ data }: { data: SiteContent["hero"] }) {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      root.style.opacity = "1";
      return;
    }

    let ctx: { revert: () => void } | undefined;
    let started = false;
    let rescued = false;

    // Safety net: the nav bar and hero content start at opacity:0 and are
    // only revealed by the GSAP timeline below. If anything upstream fails
    // (a network hiccup loading GSAP, an unrelated JS error elsewhere on
    // the page interrupting the promise chain, etc.) those elements must
    // never stay permanently invisible — critical UI like the nav bar
    // can't depend on an animation succeeding. This fires well after the
    // ~4s entrance animation would naturally finish, so it never interferes
    // with normal playback — it only rescues visibility on failure.
    const rescueTimer = window.setTimeout(() => {
      rescued = true;
      document
        .querySelectorAll(
          ".hero-nav-fade, .hero-badge, .hero-sub, .hero-cta, .hero-note, .hero-media, .hero-chip",
        )
        .forEach((el) => {
          const style = (el as HTMLElement).style;
          style.opacity = "1";
          style.transform = "none";
        });
    }, 5000);

    const run = () => {
      if (started) return;
      started = true;
      getGsap()
        .then(({ gsap }) => {
          if (rescued) return; // already force-shown by the safety net — don't fight it
          ctx = gsap.context(() => {
            const chars = h1Ref.current?.querySelectorAll("[data-char]");
            const caret = h1Ref.current?.querySelector(".type-caret");

            gsap.set(".hero-nav-fade", { opacity: 0, y: -20 });
            gsap.set(".hero-badge", { opacity: 0, y: 16 });
            if (chars?.length) gsap.set(chars, { opacity: 0 });
            gsap.set(".hero-sub, .hero-cta, .hero-note", { opacity: 0, y: 22 });
            gsap.set(".hero-media", { opacity: 0, y: 36, scale: 0.96 });
            gsap.set(".hero-chip", { opacity: 0, y: 12 });

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.to(".hero-nav-fade", { opacity: 1, y: 0, duration: 0.6 })
              .to(".hero-badge", { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
              .addLabel("type");

            if (chars?.length) {
              tl.to(chars, { opacity: 1, duration: 0.001, stagger: 0.032 }, "type");
            }
            tl.to(".hero-media", { opacity: 1, y: 0, scale: 1, duration: 0.9 }, "type+=0.4")
              .to(".hero-sub", { opacity: 1, y: 0, duration: 0.6 }, "type+=0.95")
              .to(".hero-chip", { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, "type+=1.05")
              .to(".hero-cta", { opacity: 1, y: 0, duration: 0.55 }, "type+=1.15")
              .to(".hero-note", { opacity: 1, y: 0, duration: 0.5 }, "type+=1.3");

            if (caret) {
              tl.to(caret, { opacity: 0, duration: 0.3 }, "type+=2.6");
            }

            // ambient feather drift + scroll parallax
            root.querySelectorAll("[data-feather]").forEach((f, i) => {
              gsap.to(f, {
                y: "+=26",
                x: i % 2 ? "-=18" : "+=18",
                rotation: i % 2 ? -7 : 7,
                duration: 5 + i * 1.4,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
              });
            });
          }, root);
        })
        .catch(() => {
          // GSAP failed to load entirely — the rescue timer above will
          // still fire and reveal everything; nothing else to do here.
        });
    };

    // If the preloader already finished before this mounted, run immediately;
    // otherwise wait for its completion event.
    if (!document.body.classList.contains("loading")) {
      run();
    } else {
      document.body.addEventListener("peakhawks:preloader-done", run, { once: true });
    }

    return () => {
      window.clearTimeout(rescueTimer);
      ctx?.revert();
      document.body.removeEventListener("peakhawks:preloader-done", run);
    };
  }, []);

  // headline supports "\n" (or "|") as explicit line breaks, matching the HTML mockup
  const lines = data.headline.split(/\n|\|/).map((l) => l.trim()).filter(Boolean);

  return (
    <header
      ref={rootRef}
      id="top"
      className="relative flex items-center overflow-hidden py-14 lg:min-h-[calc(100svh_-_118px)] lg:py-20"
    >
      {/* background: contour lines + drifting feather polygons */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[180px] left-1/2 h-[380px] w-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(234,92,0,.12),transparent_72%)] blur-2xl" />
        <svg className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <g fill="none" stroke="rgba(21,23,26,.07)" strokeWidth="1">
            <path d="M-50 720 Q 300 640 620 700 T 1490 660" />
            <path d="M-50 780 Q 340 690 660 760 T 1490 720" />
            <path d="M-50 840 Q 380 750 700 820 T 1490 780" />
            <path d="M-50 660 Q 260 590 580 640 T 1490 600" />
          </g>
          <g fill="none" stroke="rgba(234,92,0,.10)" strokeWidth="1">
            <path d="M-50 600 Q 220 520 540 580 T 1490 540" />
          </g>
        </svg>
        <svg data-feather className="absolute right-[8%] top-[16%] w-[130px]" viewBox="0 0 60 60">
          <path d="M4 10 L48 24 L54 32 L18 28 Z" fill="rgba(234,92,0,.10)" />
        </svg>
        <svg data-feather className="absolute left-[4%] top-[58%] w-[100px]" viewBox="0 0 60 60">
          <path d="M6 14 L50 20 L56 30 L16 32 Z" fill="rgba(21,23,26,.05)" />
        </svg>
        <svg data-feather className="absolute left-[42%] top-[30%] w-[70px]" viewBox="0 0 60 60">
          <path d="M8 18 L46 16 L54 26 L20 34 Z" fill="rgba(21,23,26,.04)" />
        </svg>
      </div>
      <div className="mx-auto grid w-full max-w-[1320px] items-center gap-10 px-6 sm:gap-14 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-12 xl:gap-16">
        <div className="max-w-[600px]">
          <div className="hero-badge mb-6 inline-flex items-center gap-2.5 rounded-full border border-ember/35 bg-ember/10 px-4 py-2 font-mono text-[.7rem] uppercase tracking-[.2em] text-ember">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
            {data.badge}
          </div>

          <h1 ref={h1Ref} className="tracking-tight">
            {lines.map((line, li) => (
              <span key={li} className="block">
                {line.split(/\s+/).map((w, wi, arr) => (
                  <span key={wi}>
                    <span className="inline-block whitespace-nowrap">
                      {w.split("").map((c, ci) => (
                        <span
                          key={ci}
                          data-char
                          className={
                            w.replace(/[^\w]/g, "") === data.headlineAccent
                              ? "text-ember"
                              : ""
                          }
                        >
                          {c}
                        </span>
                      ))}
                    </span>
                    {wi < arr.length - 1 && " "}
                  </span>
                ))}
                {li === lines.length - 1 && (
                  <span className="type-caret ml-2 inline-block h-[.82em] w-[.5ch] translate-y-[.1em] animate-[caretBlink_.75s_steps(1)_infinite] rounded-sm bg-ember shadow-[0_0_20px_rgba(234,92,0,.8)]" />
                )}
              </span>
            ))}
          </h1>

          <p className="hero-sub my-7 max-w-[520px] text-[1.12rem]">{data.subhead}</p>

          <div className="hero-cta flex flex-wrap gap-4">
            <Magnetic>
              <a href="#book-a-call" className="btn-primary">
                Book a Strategy Call <span className="arrow">→</span>
              </a>
            </Magnetic>
            <a href="#case-studies" className="btn-ghost">
              See the Case Studies
            </a>
          </div>

          {data.note ? (
            <p className="hero-note mt-5 font-mono text-[.72rem] tracking-wider text-grey">
              // {data.note}
            </p>
          ) : null}

          {data.partnerLogos?.length ? (
            // Full-color logos, larger, no container box. Optional label
            // only appears if the client types one (blank by default).
            // Wraps cleanly, so adding more logos just fills the row.
            <div className="hero-note mt-6">
              {data.partnerLogosLabel ? (
                <p className="mb-3 font-mono text-[.62rem] font-semibold uppercase tracking-[.2em] text-grey">
                  {data.partnerLogosLabel}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {data.partnerLogos.map((p, i) =>
                p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`partner-${i}`}
                    src={sanityThumb(p.logo, 320)}
                    alt={p.name || ""}
                    className="h-10 w-auto max-w-[180px] object-contain transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.06] sm:h-12"
                  />
                ) : (
                  <span
                    key={`partner-${i}`}
                    className="font-mono text-[.8rem] font-semibold uppercase tracking-wider text-silver transition-all duration-300 hover:-translate-y-1 hover:text-ink"
                  >
                    {p.name}
                  </span>
                ),
              )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="hero-media relative">
          <div
            className={[
              "relative overflow-hidden rounded-[20px] border border-line-strong bg-[linear-gradient(160deg,#FFFFFF,#ECECEF)] shadow-[0_38px_90px_rgba(21,23,26,.18)]",
              // A dedicated mobile crop is usually taller, so give it a
              // squarer frame on phones instead of letterboxing it.
              data.posterImageMobile
                ? "aspect-[4/3] md:aspect-[16/10.5]"
                : "aspect-[16/10.5]",
            ].join(" ")}
          >
            {(() => {
              const mediaUrl =
                data.videoUrl || data.posterImage || data.posterImageMobile || "";

              // Nothing set at all — placeholder
              if (!mediaUrl) {
                return (
                  <>
                    <span className="absolute left-3.5 top-3.5 rounded-md border border-dashed border-ember/40 bg-ember/[.06] px-2.5 py-1 font-mono text-[.62rem] uppercase tracking-wider text-ember">
                      Client photo or video goes here
                    </span>
                    <button
                      aria-label="Play video"
                      disabled
                      className="absolute inset-0 m-auto flex h-[78px] w-[78px] cursor-not-allowed items-center justify-center rounded-full bg-ember/50 shadow-[0_3px_0_#A64500]"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#F4F4F6" className="ml-1">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </>
                );
              }

              // A plain image (photo/graphic) — just show it. No play button,
              // no video treatment, because there's nothing to play.
              if (!data.videoUrl && isImageUrl(mediaUrl)) {
                return (
                  <HeroPicture
                    desktop={data.posterImage}
                    mobile={data.posterImageMobile}
                    alt="PeakHawks"
                  />
                );
              }

              // A real video is set and the visitor clicked play — embed it.
              if (data.videoUrl && playing) {
                const parsed = parseVideo(data.videoUrl);
                return parsed.kind === "file" ? (
                  <video
                    src={data.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <iframe
                    src={parsed.embedSrc}
                    title="PeakHawks intro video"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="h-full w-full"
                  />
                );
              }

              // A real video is set, not yet playing — poster + play button.
              return (
                <>
                  {data.posterImage || data.posterImageMobile ? (
                    <HeroPicture
                      desktop={data.posterImage}
                      mobile={data.posterImageMobile}
                      alt="Video preview"
                    />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(160deg,#FFFFFF,#ECECEF)]" />
                  )}
                  <button
                    onClick={() => setPlaying(true)}
                    aria-label="Play video"
                    className="absolute inset-0 m-auto flex h-[78px] w-[78px] items-center justify-center rounded-full bg-ember shadow-[0_3px_0_#A64500] transition hover:scale-105 hover:bg-orange"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#F4F4F6" className="ml-1">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </>
              );
            })()}
          </div>

          {data.chips?.length ? (
            <div className="mt-5 flex flex-wrap gap-2.5 sm:grid sm:grid-cols-3 sm:gap-3">
              {data.chips.map((chip, i) => (
                <span
                  key={`hero-chip-${i}`}
                  className="hero-chip flex items-center justify-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-center font-mono text-[.64rem] uppercase leading-tight tracking-wide text-silver sm:px-3 sm:text-[.68rem]"
                >
                  <b className="text-ember">{chip.value}</b> {chip.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
