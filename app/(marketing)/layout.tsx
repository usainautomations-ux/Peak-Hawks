import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getMergedFooter } from "@/lib/content/merged";
import { Preloader } from "@/components/Preloader";
import { CursorRing } from "@/components/CursorRing";
import { Altimeter } from "@/components/Altimeter";
import { LegalModalProvider } from "@/components/LegalModal";
import { SmoothHashScroll } from "@/components/SmoothHashScroll";
import { MobileBookCTA } from "@/components/MobileBookCTA";

/**
 * Layout for the public marketing site only. /studio intentionally sits
 * OUTSIDE this route group so it never gets the Nav, Footer, preloader,
 * cursor ring, or legal-modal chrome wrapped around the Studio UI.
 */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Footer content lives in its own Sanity document because it is shared
  // by every page in this route group, not just the two landing pages.
  const footer = await getMergedFooter();

  return (
    <LegalModalProvider>
      <Preloader logo={footer.siteLogo} />
      <CursorRing />
      <Altimeter />
      <SmoothHashScroll />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-0 focus:z-[1001] focus:rounded-b-[10px] focus:bg-ember focus:px-5 focus:py-3 focus:font-bold focus:text-bg"
      >
        Skip to content
      </a>
      <Nav logo={footer.siteLogo} hideText={footer.siteLogoHideText} />
      <main id="main-content">{children}</main>
      <Footer data={footer} />
      <MobileBookCTA label={footer.mobileCtaLabel} />
    </LegalModalProvider>
  );
}
