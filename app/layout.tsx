import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Root layout — deliberately minimal. It only owns <html>/<body> and fonts.
 * All marketing-site chrome (Nav, Footer, Preloader, CursorRing, Altimeter,
 * legal modals) lives in app/(marketing)/layout.tsx instead, so that
 * /studio — which sits outside the (marketing) route group — renders with
 * a clean shell and none of the site's UI wrapped around the CMS.
 */

const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PeakHawks — Full-Service Amazon Growth Agency",
  description:
    "Product research, listing optimization, A+ Content and Amazon PPC management.",
  other: { "color-scheme": "light only" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${bodyFont.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
