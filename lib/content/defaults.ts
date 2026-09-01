/**
 * Typed shape of everything editable on the site, plus the fallback values.
 * If GHL is unreachable or a value is missing, these render instead.
 */

export type Stat = {
  value: number;
  /** Shown before the number, e.g. "$". */
  prefix?: string;
  suffix: string;
  label: string;
};

/** A brand in the "Brands We've Launched And Scaled" strip. The client can
 * supply a text name, an uploaded logo image, or both (the image wins,
 * the name stays as the alt text). */
export type BrandLogo = { name: string; logo?: string };

/**
 * The standard editable heading block that sits above a section. Every
 * section on both pages uses this same shape, so the Studio fields are
 * named identically everywhere and the client always knows what they're
 * editing:
 *   sectionLabel  → the small "SEC.01 // DIAGNOSIS" flight strip
 *   eyebrow       → the orange mono label
 *   heading       → the big H2
 *   headingAccent → the exact words inside `heading` shown in orange
 *   subhead       → the paragraph under the heading
 */
export type SectionIntro = {
  sectionLabel: string;
  eyebrow: string;
  heading: string;
  headingAccent?: string;
  subhead?: string;
  subheadAccent?: string;
  /** The number shown as "SEC.0X" above the section, and used to
   * calculate the "ALT ... FT" reading next to it (altitude = this
   * number × 3,200 ft — see components/SecMeta.tsx). Optional: falls
   * back to whichever number that section has always used. */
  sectionNumber?: number;
};

/** The thin cross-link strip pinned above the hero. */
export type TopBanner = { text: string; linkLabel: string; linkHref: string };

/** Case Studies heading — a SectionIntro plus the "View all" link, plus the
 * three summary-strip labels ("Positioning" / "Angle" / "Competition")
 * shown on every individual case study's own page. One shared set of
 * labels rather than per-case-study, since they're column headers that
 * should read the same across every launch. */
export type CaseStudiesIntro = SectionIntro & {
  linkLabel?: string;
  linkHref?: string;
  positioningLabel?: string;
  angleLabel?: string;
  competitionLabel?: string;
};

/** Book A Call heading block, including the numbered checklist. */
export type BookIntro = {
  sectionLabel: string;
  eyebrow: string;
  heading: string;
  headingAccent?: string;
  body: string;
  steps: string[];
  /** See SectionIntro.sectionNumber above — same field, same purpose. */
  sectionNumber?: number;
};

/** Every visible string on the lead-capture form itself (components/LeadForm.tsx)
 * — the fields to its right of "Book A Call"'s heading/steps. Field labels,
 * placeholders, each dropdown's option list, the submit button (both its
 * resting and "Sending…" states), and the confirmation shown after a
 * successful submit. */
export type LeadFormContent = {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  revenueLabel: string;
  revenueOptions: string[];
  productsLabel: string;
  productsOptions: string[];
  budgetLabel: string;
  budgetOptions: string[];
  submitLabel: string;
  submitLoadingLabel: string;
  successHeading: string;
  successBody: string;
};

/** The final dark call-to-action band above the footer. */
export type FinalCta = {
  eyebrow: string;
  heading: string;
  headingAccent?: string;
  sub: string;
  buttonLabel: string;
  buttonHref: string;
};


/** One of the diagnosis cards arranged around the health-score gauge. */
export type Problem = {
  title: string;
  body: string;
  /** Small ordinal shown before the category, e.g. "01". */
  number?: string;
  /** Category label next to the number, e.g. "Research". */
  category?: string;
  /** Warning pill at the foot of the card, e.g. "Needs Attention". */
  badge?: string;
  /** Key from the built-in icon set (components/ui/Icon.tsx). */
  icon?: string;
  /** Client-uploaded icon — wins over `icon` when set. */
  iconImage?: string;
};

/** Centred heading block above the diagnosis cards. */
export type ProblemsIntro = {
  /** The small "SEC.01 // DIAGNOSIS" flight strip above the section. */
  sectionLabel?: string;
  /** See SectionIntro.sectionNumber — same field, same purpose. */
  sectionNumber?: number;
  eyebrow: string;
  eyebrowIcon?: string;
  heading: string;
  /** Optional second heading line, rendered slightly smaller. */
  headingSub?: string;
  /** Part of heading/headingSub rendered in orange. */
  headingAccent: string;
  subhead: string;
  /** Part of the subhead rendered in orange. */
  subheadAccent?: string;
};

/** The dark circular score dial at the centre of the section. */
export type ProblemsGauge = {
  label: string;
  score: number;
  scoreMax: number;
  status: string;
  /** Part of the status rendered in orange. */
  statusAccent?: string;
  icon?: string;
  iconImage?: string;
};

/** A block in the dark summary bar under the cards. */
export type ProblemsBannerItem = {
  icon?: string;
  iconImage?: string;
  /** Big orange figure, e.g. "84%". Optional — omit for a text-only block. */
  value?: string;
  text: string;
  /** Part of `text` rendered in orange. */
  textAccent?: string;
  /** Overall text size for this block — the big value and its text scale
   * together. Defaults to "md" (today's size) when not set. */
  textSize?: "sm" | "md" | "lg";
};
/** Which icon renders inside the orange circle of the "Outcome" callout
 * at the bottom of a Why Us row. Kept as a small fixed set so the Studio
 * can offer a dropdown instead of asking the client for an SVG. */
export type OutcomeIcon = "growth" | "target" | "check" | "spark";

export type WhyUsRow = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  image?: string;
  /** Small orange label above the outcome line — defaults to "Outcome". */
  outcomeLabel?: string;
  /** The bold pay-off statement in the callout. If empty, the whole
   * outcome block is omitted for that row. */
  outcome?: string;
  outcomeIcon?: OutcomeIcon;
};

/** Section heading above the Why Us rows ("One Agency. The Whole Growth Loop.") */
export type WhyUsIntro = {
  /** The small "SEC.02 // CAPABILITY" flight strip above the section. */
  sectionLabel?: string;
  /** See SectionIntro.sectionNumber — same field, same purpose. */
  sectionNumber?: number;
  eyebrow: string;
  heading: string;
  /** Optional paragraph under the heading. */
  subhead?: string;
  /** The part of `heading` rendered in orange, e.g. "Growth Loop." */
  headingAccent: string;
};
export type CaseStudy = {
  tag: string;
  title: string;
  positioning: string;
  angle: string;
  competition: string;
  result: string;
  image?: string;
  /** Present only for case studies backed by a real Sanity document —
   * used to link the card to /case-studies/[slug]. Fallback/demo case
   * studies (no matching Sanity document exists) omit this, and the
   * card renders as a plain non-linked article instead. */
  slug?: string;
};
export type Service = { title: string; body: string };
export type ProcessStep = { tag: string; title: string; body: string };
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  /** Optional uploaded client photo — replaces the initials circle. */
  avatar?: string;
  /** Star rating out of 5. Defaults to 5 when not set. */
  rating?: number;
};
export type FAQ = { q: string; a: string };
/** The three small proof pills under the hero media. */
export type HeroChip = { value: string; label: string };

export type SiteContent = {
  topBanner: TopBanner;
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    subhead: string;
    note: string;
    videoUrl: string;
    posterImage?: string;
    /** Optional portrait/square crop shown instead of `posterImage` on
     * phones. Falls back to the desktop image when not set. */
    posterImageMobile?: string;
    chips: HeroChip[];
    /** Small partner/certification marks under the CTA buttons — e.g.
     * "Amazon Ads Verified Partner", "Amazon SPN". Same {name, logo?}
     * shape as the Brand Logos strip, reused here for a couple of fixed
     * badges rather than a scrolling marquee. */
    partnerLogos: BrandLogo[];
    /** Optional label shown above the partner logos, e.g.
     * "Trusted & certified". Blank hides it. */
    partnerLogosLabel?: string;
    /** How the logo images are tinted at rest: "muted" (greyed, the
     * default), "mono" (fully black/ink), or "full" (original colors).
     * They always brighten to full color on hover. */
    partnerLogosStyle?: "muted" | "mono" | "full";
  };
  brandsIntro: SectionIntro;
  brandLogos: BrandLogo[];
  /** The "Categories We've Served" strip after the Case Studies section —
   * same scrolling-marquee component and same {name, logo?} shape as the
   * Brand Logos strip above, reused for a second bar rather than building
   * a near-identical one from scratch. */
  categoriesIntro: SectionIntro;
  categories: BrandLogo[];
  problemsIntro: ProblemsIntro;
  problems: Problem[];
  problemsGauge: ProblemsGauge;
  problemsBanner: ProblemsBannerItem[];
  whyUsIntro: WhyUsIntro;
  whyUs: WhyUsRow[];
  statsIntro: SectionIntro;
  stats: Stat[];
  caseStudiesIntro: CaseStudiesIntro;
  caseStudies: CaseStudy[];
  servicesIntro: SectionIntro;
  services: Service[];
  processIntro: SectionIntro;
  process: ProcessStep[];
  testimonialsIntro: SectionIntro;
  testimonials: Testimonial[];
  bookIntro: BookIntro;
  leadForm: LeadFormContent;
  faqIntro: SectionIntro;
  faq: FAQ[];
  cta: FinalCta;
  contact: { email: string };
};

export const defaultContent: SiteContent = {
  topBanner: {
    text: "New to Amazon or not yet at $10k/month?",
    linkLabel: "See our New Seller program \u2192",
    linkHref: "/newseller",
  },
  hero: {
    badge: "Full-Service Amazon Growth Agency",
    headline: "Amazon Growth,\nEngineered From\nProduct Data.",
    headlineAccent: "Engineered",
    subhead:
      "We research, position, launch and scale Amazon products — connecting listing optimization, external traffic and PPC management so organic rank and profit climb together, not against each other.",
    note: "PRODUCT-FIRST · TACOS-DRIVEN REPORTING · 2-HR RESPONSE TIME",
    videoUrl: "",
    posterImage: "",
    posterImageMobile: "",
    chips: [
      { value: "$28M+", label: "Generated" },
      { value: "40+", label: "Brands Scaled" },
      { value: "92%", label: "Launch Success" },
    ],
    partnerLogos: [
      { name: "Amazon Ads Verified Partner" },
      { name: "Amazon SPN" },
    ],
    partnerLogosLabel: "",
    partnerLogosStyle: "full",
  },
  statsIntro: {
    sectionLabel: "Proof",
    sectionNumber: 3,
    eyebrow: "",
    heading: "",
    headingAccent: "",
  },
  stats: [
    { value: 28, prefix: "$", suffix: "M+", label: "Revenue Generated" },
    { value: 40, suffix: "+", label: "Brands Scaled" },
    { value: 92, suffix: "%", label: "Launch Success Rate" },
    { value: 120, suffix: "M+", label: "Views Generated" },
  ],
  brandsIntro: {
    sectionLabel: "Clients",
    eyebrow: "",
    heading: "Brands We've Launched And Scaled",
    headingAccent: "",
  },
  brandLogos: [
    { name: "VITALCORE" },
    { name: "Nutriva°" },
    { name: "HERB&CO" },
    { name: "pure/form" },
    { name: "ELEVATE+" },
    { name: "Lumen Labs" },
    { name: "NORDIQ" },
    { name: "Zen Basics" },
  ],
  categoriesIntro: {
    sectionLabel: "",
    eyebrow: "",
    heading: "Categories We've Served",
    headingAccent: "",
  },
  categories: [
    { name: "Health & Wellness" },
    { name: "Beauty & Personal Care" },
    { name: "Home & Kitchen" },
    { name: "Sports & Outdoors" },
    { name: "Pet Care" },
    { name: "Supplements" },
    { name: "Baby & Kids" },
    { name: "Electronics Accessories" },
  ],
  problemsIntro: {
    sectionLabel: "Diagnosis",
    sectionNumber: 1,
    eyebrow: "Diagnosis",
    eyebrowIcon: "activity",
    heading: "Most Amazon Brands Don't Plateau By Accident.",
    headingSub: "They Repeat the Same Four Costly Mistakes.",
    headingAccent: "Four Costly Mistakes.",
    subhead: "The same four bottlenecks appear in nearly every Amazon brand we audit.",
    subheadAccent: "nearly every",
  },
  problems: [
    {
      number: "01",
      category: "Research",
      title: "Weak Product Validation",
      body: "You launched a product. Not a market opportunity.",
      badge: "Needs Attention",
      icon: "search",
    },
    {
      number: "02",
      category: "Advertising",
      title: "PPC Chasing ACOS",
      body: "Sales grow. Profits don't.",
      badge: "Limiting Organic Growth",
      icon: "dollar",
    },
    {
      number: "03",
      category: "Conversion",
      title: "Low Conversion Offer",
      body: "Traffic arrives. Customers don't.",
      badge: "Revenue Leak",
      icon: "cart",
    },
    {
      number: "04",
      category: "Strategy",
      title: "Fragmented Growth",
      body: "Every channel improves. Nothing compounds.",
      badge: "Growth Bottleneck",
      icon: "blocks",
    },
  ],
  problemsGauge: {
    label: "Amazon Growth Health Score",
    score: 42,
    scoreMax: 100,
    status: "Growth Bottleneck Detected",
    statusAccent: "Growth Bottleneck",
    icon: "activity",
  },
  problemsBanner: [
    {
      icon: "users",
      value: "84%",
      text: "Brands Audited Have 3+ Bottlenecks",
      textAccent: "3+ Bottlenecks",
    },
    {
      icon: "target",
      text: "Growth Fails In Systems. Not Channels.",
      textAccent: "Not Channels.",
    },
  ],
  whyUsIntro: {
    sectionLabel: "Capability",
    sectionNumber: 2,
    eyebrow: "Full-Service, Product-First",
    heading: "One Agency. The Whole Growth Loop.",
    headingAccent: "Growth Loop.",
    subhead: "",
  },
  whyUs: [
    {
      eyebrow: "01 / Diagnose",
      title: "Know Exactly What's Holding Your Brand Back",
      body: "We uncover your biggest growth opportunities through a complete brand audit, product-market fit analysis, competitive positioning, and profitability assessment.",
      points: [
        "Keyword and search demand validation per opportunity",
        "Review mining to surface unmet customer needs",
        "Launch economics modeled before you commit capital",
      ],
      outcomeLabel: "Outcome",
      outcome: "Build every decision on data — not assumptions.",
      outcomeIcon: "target",
    },
    {
      eyebrow: "02 / Optimize",
      title: "Increase Conversion Before Increasing Spend",
      body: "Before scaling traffic, we optimize your pricing, positioning, listings, creatives, A+ Content, and offer to maximize conversion and profitability.",
      points: [
        "Title, bullet and backend keyword optimization",
        "A+ Content and hero image conversion testing",
        "Category compliance review before anything goes live",
      ],
      outcomeLabel: "Outcome",
      outcome:
        "Turn more visitors into customers while making every advertising dollar work harder.",
      outcomeIcon: "growth",
    },
    {
      eyebrow: "03 / Scale",
      title: "Turn Advertising Into A Growth Engine",
      body: "Our campaign structures are built to increase organic rankings, grow profitable orders, and create sustainable long-term growth—not just higher ad spend.",
      points: [
        "Sponsored Products, Brands and Display campaign structure",
        "TACoS-based reporting on real profitability",
        "2-hour response times from a dedicated specialist",
      ],
      outcomeLabel: "Outcome",
      outcome: "Scale revenue, protect profitability, and compound organic growth.",
      outcomeIcon: "growth",
    },
  ],
  caseStudiesIntro: {
    sectionLabel: "Launches",
    sectionNumber: 4,
    eyebrow: "Proof of Work",
    heading: "Amazon Product Launch Case Studies",
    headingAccent: "Case Studies",
    subhead:
      "How research-led positioning decisions turned into rank and revenue \u2014 swap in your client's real launches here.",
    linkLabel: "View All Case Studies \u2192",
    linkHref: "/case-studies",
    positioningLabel: "Positioning",
    angleLabel: "Angle",
    competitionLabel: "Competition",
  },
  caseStudies: [
    {
      slug: "first-mover-liquid-drops",
      tag: "Wellness · Drops Format",
      title: "First-Mover Liquid Drops",
      positioning: "Format nobody offered while search demand climbed",
      angle: "Easier to take, faster absorption vs. capsules",
      competition: "Zero — first drops format in the niche",
      result: "$1M+ annual run rate in year one",
    },
    {
      slug: "differentiated-sleep-stack",
      tag: "Sleep · Gummies",
      title: "Differentiated Sleep Stack",
      positioning: "Massive demand, but every listing looked identical",
      angle: "Added a trending functional ingredient stack",
      competition: "Low — emerging sub-niche, early entry",
      result: "$2.8M/yr, two years post-launch",
    },
    {
      slug: "focus-angle-nobody-claimed",
      tag: "Energy · Powder",
      title: 'The "Focus" Angle Nobody Claimed',
      positioning: "20k+ monthly searches for a benefit no packaging owned",
      angle: "Bold benefit-led packaging and copy",
      competition: "High, but no one led with the core benefit",
      result: "$1.5M/yr within 10 months",
    },
  ],
  servicesIntro: {
    sectionLabel: "Services",
    sectionNumber: 5,
    eyebrow: "Amazon Agency Services",
    heading: "Everything a Launch Needs, Under One Roof",
    headingAccent: "Under One Roof",
  },
  services: [
    {
      title: "Amazon Product Research & Validation",
      body: "Search volume analysis, review mining and competitor gap mapping to surface validated product opportunities — matched to your catalog and modeled for launch economics before you commit.",
    },
    {
      title: "Brand Positioning & Differentiation",
      body: "Positioning angles pulled from real customer language and unclaimed benefit territory — so your listing has a reason to win beyond a lower price.",
    },
    {
      title: "Amazon Listing Optimization & A+ Content",
      body: "Amazon SEO across titles, bullets and backend keywords, plus A+ Content and hero image testing — with category compliance review so nothing gets suppressed mid-launch.",
    },
    {
      title: "External Traffic & Creator Marketing",
      body: "Creator content and off-Amazon demand built before launch day, feeding Amazon's algorithm the external signals that make organic rank stick.",
    },
    {
      title: "Amazon PPC Management & Launch Campaigns",
      body: "Structured Sponsored Products, Brands and Display campaigns built to capture rank fast — then optimized to profitable steady-state spend, reported against TACoS.",
    },
  ],
  processIntro: {
    sectionLabel: "Flight Path",
    sectionNumber: 6,
    eyebrow: "Our Amazon Launch Process",
    heading: "How a Launch Takes Off",
    headingAccent: "Takes Off",
  },
  process: [
    {
      tag: "Week 1",
      title: "Scout",
      body: "Market scan, demand validation and opportunity scoring across your category.",
    },
    {
      tag: "Week 2–3",
      title: "Differentiate",
      body: "Positioning, formulation and packaging locked against unclaimed angles.",
    },
    {
      tag: "Launch Window",
      title: "Strike",
      body: "External traffic primed, PPC structured, listing live with momentum on day one.",
    },
    {
      tag: "Ongoing",
      title: "Soar",
      body: "Rank defended, spend optimized, next product queued into the pipeline.",
    },
  ],
  testimonialsIntro: {
    sectionLabel: "Clients",
    sectionNumber: 7,
    eyebrow: "Real Voices, Real Results",
    heading: "What Our Clients Are Saying",
    headingAccent: "Are Saying",
  },
  testimonials: [
    {
      quote:
        "Client testimonial goes here — 2–3 sentences about the launch outcome, the process and the results.",
      name: "Client Name",
      role: "Founder, Brand Name",
      initials: "JD",
    },
    {
      quote:
        "Client testimonial goes here — ideally referencing a specific product launch and the revenue outcome.",
      name: "Client Name",
      role: "CEO, Brand Name",
      initials: "SK",
    },
    {
      quote:
        "Client testimonial goes here — a short quote about responsiveness, the team, and why they'd recommend PeakHawks.",
      name: "Client Name",
      role: "Owner, Brand Name",
      initials: "MR",
    },
  ],
  bookIntro: {
    sectionLabel: "Contact",
    sectionNumber: 8,
    eyebrow: "Simple, Fast Onboarding",
    heading: "One Call. No Endless Forms.",
    headingAccent: "",
    body: "We get clear on your business and goals \u2014 and if we're the right fit, you're onboarded immediately.",
    steps: [
      "Fill the form \u2014 takes under a minute",
      "Strategy call with the launch team",
      "If it's a fit, we start scouting the same week",
    ],
  },
  leadForm: {
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@brand.com",
    revenueLabel: "Monthly Revenue on Amazon",
    revenueOptions: [
      "Haven't launched yet",
      "$0 \u2013 $50k",
      "$50k \u2013 $250k",
      "$250k \u2013 $500k",
      "$500k \u2013 $1M+",
    ],
    productsLabel: "Products Planned This Quarter",
    productsOptions: ["1 product", "2 \u2013 5 products", "5 \u2013 10 products", "10+ products"],
    budgetLabel: "Est. Launch Budget per Product",
    budgetOptions: ["Less than $10k", "$10k \u2013 $30k", "$30k \u2013 $50k", "$50k+"],
    submitLabel: "Book My Strategy Call",
    submitLoadingLabel: "Sending\u2026",
    successHeading: "You're in.",
    successBody:
      "We've got your details \u2014 the launch team will reach out within one business day.",
  },

  faqIntro: {
    sectionLabel: "Questions",
    sectionNumber: 9,
    eyebrow: "Have Questions?",
    heading: "Frequently Asked Questions",
    headingAccent: "Questions",
  },
  faq: [
    {
      q: "What does an Amazon growth agency do?",
      a: "A growth agency connects the whole loop — product research, listing optimization, A+ Content, external traffic and PPC management — so advertising, Amazon SEO and catalog decisions all push rank and profit in the same direction instead of competing for budget.",
    },
    {
      q: "How is this different from an Amazon PPC agency?",
      a: "A PPC agency optimizes campaigns on whatever product and listing it's handed. We work one layer earlier: validating the product, locking the positioning and engineering the listing first — because no bid strategy fixes a product nobody searched for.",
    },
    {
      q: "How long does it take to rank a new product on Amazon?",
      a: "Research and validation runs one to three weeks. Once live, most launches with validated demand, an optimized listing and a structured PPC launch show meaningful rank and sales traction within 60–90 days.",
    },
    {
      q: "Do you measure success on ACoS or TACoS?",
      a: "TACoS. Ad efficiency alone can look great while organic share quietly shrinks. Measuring total ad cost against total revenue shows whether the brand is actually gaining organic ground.",
    },
    {
      q: "Do you work with new sellers or established brands?",
      a: "Both — established brands expanding their catalog with validated products, and new brands with a real launch budget ready to move fast. Every research engagement is exclusive to your category.",
    },
    {
      q: "What happens if a launch underperforms?",
      a: "Validation is designed to kill weak ideas before inventory is ordered. If a live launch still underperforms, we diagnose the conversion and traffic data, reposition, and feed the learnings into the next product.",
    },
  ],
  cta: {
    eyebrow: "Your Peak, Our Passion",
    heading: "Ready to Reach Your Peak?",
    headingAccent: "",
    sub: "One call is all it takes to find out what your next bestseller looks like.",
    buttonLabel: "Book a Strategy Call",
    buttonHref: "#book-a-call",
  },
  contact: { email: "hello@peakhawks.com" },
};
