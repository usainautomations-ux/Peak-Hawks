"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Same section/page logic as Nav.tsx — kept in sync so the button links
 * to the right place regardless of which page it's shown on. Case Studies
 * has its own Testimonials + Book A Call section at the bottom (with the
 * live calendar) even though it doesn't have the homepage's other
 * sections, so it gets the anchor treatment too. */
const PAGES_WITH_SECTIONS = ["/", "/newseller", "/case-studies"];

/**
 * A floating "Book a Call" button, mobile only, that stays pinned to the
 * bottom of the screen while the visitor scrolls the page.
 *
 * Two things keep it from being annoying rather than helpful:
 *  - It only appears after the visitor has scrolled past the hero, so it
 *    never covers the hero's own "Book a Call" button on first paint.
 *  - On the two pages that actually contain the real Book A Call section
 *    (Homepage, New Sellers), it fades out while that section is on
 *    screen — no point floating a shortcut to the thing already in view —
 *    then reappears once they scroll past it.
 */
export function MobileBookCTA({ label }: { label: string }) {
  const pathname = usePathname();
  const onSectionPage = PAGES_WITH_SECTIONS.includes(pathname);
  const href = onSectionPage ? "#book-a-call" : "/#book-a-call";

  const [pastHero, setPastHero] = useState(false);
  const [overRealSection, setOverRealSection] = useState(false);
  const [overFooter, setOverFooter] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onSectionPage) {
      setOverRealSection(false);
      return;
    }
    const target = document.getElementById("book-a-call");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOverRealSection(entry.isIntersecting),
      { rootMargin: "-10% 0px -10% 0px" }, // a little breathing room either side
    );
    observer.observe(target);
    return () => observer.disconnect();
    // re-run once the page (and therefore the section) has actually mounted
  }, [onSectionPage, pathname]);

  // Also step aside for the site footer — without this the bar sits on
  // top of the legal links and the NorthFoundry credit for the entire
  // time someone reads the bottom of the page.
  useEffect(() => {
    const target = document.querySelector("footer");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOverFooter(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  const visible = pastHero && !overRealSection && !overFooter;

  return (
    <div
      aria-hidden={!visible}
      className={[
        "fixed inset-x-0 bottom-0 z-[150] px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3 lg:hidden",
        "bg-gradient-to-t from-bg via-bg/95 to-transparent",
        "transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      ].join(" ")}
    >
      <a
        href={href}
        className="btn-primary flex w-full items-center justify-center py-3.5 text-[.92rem] !text-bg shadow-[0_10px_30px_rgba(234,92,0,.35)]"
      >
        {label}
      </a>
    </div>
  );
}
