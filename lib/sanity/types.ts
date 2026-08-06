import type { PortableTextBlock } from "@portabletext/react";

/** The shared heading block every section uses. */
export type SanitySectionIntro = {
  sectionLabel?: string;
  sectionNumber?: number;
  eyebrow?: string;
  heading?: string;
  headingAccent?: string;
  subhead?: string;
  subheadAccent?: string;
};

export type SanityPageContent = {
  topBanner?: { text?: string; linkLabel?: string; linkHref?: string };
  hero?: {
    badge?: string;
    headlineLines?: string;  // "Amazon Growth,\nEngineered From\nProduct Data."
    headlineAccent?: string;
    subhead?: string;
    note?: string;
    videoUrl?: string;
    posterImage?: string;
    posterImageMobile?: string;
    chips?: Array<{ value: string; label: string }>;
  };
  statsIntro?: SanitySectionIntro;
  stats?: Array<{ value: number; prefix?: string; suffix: string; label: string }>;
  brandsIntro?: SanitySectionIntro;
  /** Legacy shape (plain strings) is still accepted and normalised in
   * lib/content/merged.ts, so old documents keep working. */
  brandLogos?: Array<string | { name?: string; logo?: string }>;
  problemsIntro?: {
    sectionLabel?: string;
    sectionNumber?: number;
    eyebrow?: string;
    eyebrowIcon?: string;
    heading?: string;
    headingSub?: string;
    headingAccent?: string;
    subhead?: string;
    subheadAccent?: string;
  };
  problems?: Array<{
    number?: string;
    category?: string;
    title: string;
    body: string;
    badge?: string;
    icon?: string;
    iconImage?: string;
  }>;
  problemsGauge?: {
    label?: string;
    score?: number;
    scoreMax?: number;
    status?: string;
    statusAccent?: string;
    icon?: string;
    iconImage?: string;
  };
  problemsBanner?: Array<{
    icon?: string;
    iconImage?: string;
    value?: string;
    text: string;
    textAccent?: string;
  }>;
  whyUsIntro?: {
    sectionLabel?: string;
    sectionNumber?: number;
    eyebrow?: string;
    heading?: string;
    headingAccent?: string;
    subhead?: string;
  };
  whyUs?: Array<{
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
    outcomeLabel?: string;
    outcome?: string;
    outcomeIcon?: "growth" | "target" | "check" | "spark";
    image?: string;
  }>;
  caseStudiesIntro?: SanitySectionIntro & { linkLabel?: string; linkHref?: string };
  servicesIntro?: SanitySectionIntro;
  services?: Array<{ title: string; body: string }>;
  processIntro?: SanitySectionIntro;
  process?: Array<{ tag: string; title: string; body: string }>;
  testimonialsIntro?: SanitySectionIntro;
  testimonials?: Array<{
    quote: string;
    name: string;
    role: string;
    initials: string;
    avatar?: string;
    rating?: number;
  }>;
  bookIntro?: {
    sectionLabel?: string;
    sectionNumber?: number;
    eyebrow?: string;
    heading?: string;
    headingAccent?: string;
    body?: string;
    steps?: string[];
  };
  faqIntro?: SanitySectionIntro;
  faq?: Array<{ q: string; a: string }>;
  cta?: {
    eyebrow?: string;
    heading?: string;
    headingAccent?: string;
    sub?: string;
    buttonLabel?: string;
    buttonHref?: string;
  };
  contact?: { email: string };
};

/** The "Footer" singleton document — shared by every page. */
export type SanityFooterContent = {
  brandNameStart?: string;
  brandNameAccent?: string;
  logo?: string;
  tagline?: string;
  columns?: Array<{
    title?: string;
    links?: Array<{ label?: string; href?: string }>;
  }>;
  wordmark?: string;
  copyright?: string;
  legalLabels?: { terms?: string; privacy?: string; disclaimer?: string };
};

export type SanityCaseStudyListItem = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  tag: string;
  excerpt: string;
  result: string;
  coverImage?: string;
};

export type SanityCaseStudy = SanityCaseStudyListItem & {
  positioning: string;
  angle: string;
  competition: string;
  body?: PortableTextBlock[];
  seo?: { title?: string; description?: string };
};

export type SanityBlogListItem = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt: string;
  category: string;
  readTime: number;
  coverImage?: string;
};

export type SanityBlogPost = SanityBlogListItem & {
  body: PortableTextBlock[];
  seo?: { title?: string; description?: string };
};
