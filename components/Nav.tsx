"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/** Section ids that exist on BOTH the homepage and the New Sellers page
 * (they share the exact same section components). Everywhere else
 * (blog, case studies, studio) has none of these — clicking one there
 * should navigate to the homepage's version, not silently append a
 * hash to whatever page you're currently on. */
const SECTION_IDS = ["why-us", "results", "services", "faq", "book-a-call"];
const PAGES_WITH_SECTIONS = ["/", "/newseller"];

const NAV_ITEMS: [string, string][] = [
  ["why-us", "Why Us"],
  ["results", "Results"],
  ["case-studies", "Case Studies"], // special-cased below — always the real listing page
  ["services", "Services"],
  ["faq", "FAQ"],
  ["blog", "Blog"], // special-cased below — always its own page
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onSectionPage = PAGES_WITH_SECTIONS.includes(pathname);

  /** Resolves a nav item to the right href for wherever the visitor
   * currently is — same-page anchor when the section exists here,
   * otherwise a link to the homepage's version. */
  function resolveHref(id: string): string {
    if (id === "case-studies") return "/case-studies"; // always the real listing page
    if (id === "blog") return "/blog";
    return SECTION_IDS.includes(id) && onSectionPage ? `#${id}` : `/#${id}`;
  }
  const bookHref = onSectionPage ? "#book-a-call" : "/#book-a-call";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={[
        "hero-nav-fade fixed inset-x-0 top-0 z-[200] border-b transition-colors",
        scrolled ? "border-line bg-bg/85 backdrop-blur-[14px]" : "border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2.5 font-display text-xl font-extrabold">
          <HawkMark />
          <span>
            Peak<b className="text-ember">Hawks</b>
          </span>
        </a>

        {/* desktop links */}
        <div className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map(([id, label]) => (
            <a
              key={id}
              href={resolveHref(id)}
              className="group relative text-[.9rem] font-medium text-grey transition hover:text-ink"
            >
              {label}
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 rounded bg-ember shadow-[0_0_12px_rgba(234,92,0,.8)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a href={bookHref} className="btn-primary px-6 py-3 text-[.85rem] !text-bg">
            Book a Call <span className="arrow">→</span>
          </a>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
          className="flex flex-col gap-1.5 p-1.5 lg:hidden"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={
                open
                  ? i === 0
                    ? { y: 8, rotate: 45 }
                    : i === 1
                      ? { opacity: 0 }
                      : { y: -8, rotate: -45 }
                  : { y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ duration: 0.25 }}
              className="h-0.5 w-6 rounded bg-ink"
            />
          ))}
        </button>
      </div>

      {/* mobile menu — Framer Motion height/opacity reveal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden border-b border-line bg-bg/97 backdrop-blur-lg lg:hidden"
          >
            <div className="flex flex-col items-start gap-6 p-8">
              {NAV_ITEMS.map(([id, label]) => (
                <a
                  key={id}
                  href={resolveHref(id)}
                  onClick={() => setOpen(false)}
                  className="text-[.95rem] font-medium text-grey transition hover:text-ink"
                >
                  {label}
                </a>
              ))}
              <a
                href={bookHref}
                onClick={() => setOpen(false)}
                className="btn-primary px-6 py-3 text-[.85rem] !text-bg"
              >
                Book a Call <span className="arrow">→</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function HawkMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M6 8 L22 14 L27 19 L14 17 Z" fill="#5F5F5F" />
      <path d="M8 22 L24 21 L27 24 L13 27 Z" fill="#7A7A7E" />
      <path d="M13 32 L26 27 L28 30 L18 37 Z" fill="#8B8B90" />
      <path d="M22 39 L28 32 L30 34 L26 42 Z" fill="#A9A9AD" />
      <path d="M31 33 L30 27 L33 28 L34 34 Z" fill="#C6C6C9" />
      <path d="M36 30 L33 25 L37 25 L39 29 Z" fill="#DBDBDD" />
      <path d="M27 14 L34 12 L38 15 L33 19 L28 18 Z" fill="#F97316" />
      <path d="M34 12 L41 14 L37 16 Z" fill="#EA5C00" />
    </svg>
  );
}
