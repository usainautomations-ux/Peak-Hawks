import type { SiteContent } from "@/lib/content/defaults";

/**
 * Static fallback content for the New Sellers page (pre-launch / sub-$10k
 * monthly revenue audience) — used whenever the "New Sellers Page" document
 * in Sanity Studio is empty or a specific field hasn't been filled in yet.
 * Once the client edits that document in the Studio, Sanity content
 * overrides these defaults field-by-field (see lib/content/merged.ts).
 */

export const newSellerDefaults: SiteContent = {
  topBanner: {
    text: "Already doing $10k+/month on Amazon?",
    linkLabel: "See our Growth program \u2192",
    linkHref: "/",
  },
  hero: {
    badge: "For New & Aspiring Amazon Sellers",
    headline: "Launch Your First\nAmazon Product\nThe Right Way.",
    headlineAccent: "First",
    subhead:
      "Most first launches fail before they start — the wrong product, an underestimated budget, or PPC set up with no plan. We walk you through product research, sourcing math and a real launch plan so your first product has an actual shot.",
    note: "BEGINNER-FRIENDLY · NO JARGON · REAL LAUNCH ROADMAP",
    videoUrl: "",
    posterImage: "",
    posterImageMobile: "",
    chips: [
      { value: "40+", label: "First Launches" },
      { value: "90d", label: "To First Sale" },
      { value: "100%", label: "Data-Checked" },
    ],
    partnerLogos: [
      { name: "Amazon Ads Verified Partner" },
      { name: "Amazon SPN" },
    ],
    partnerLogosLabel: "",
    partnerLogosStyle: "full",
  },
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
    { name: "Pet Care" },
    { name: "Supplements" },
    { name: "Baby & Kids" },
  ],
  problemsIntro: {
    sectionLabel: "Diagnosis",
    sectionNumber: 1,
    eyebrow: "Diagnosis",
    eyebrowIcon: "activity",
    heading: "Most First Launches Don't Fail By Accident.",
    headingSub: "They Repeat the Same Four Costly Mistakes.",
    headingAccent: "Four Costly Mistakes.",
    subhead: "The same four mistakes show up in nearly every first launch we review.",
    subheadAccent: "nearly every",
  },
  problems: [
    {
      number: "01",
      category: "Product",
      title: "Picking the Wrong Product",
      body: "Chosen because it looked exciting. Not because the data agreed.",
      badge: "Needs Attention",
      icon: "search",
    },
    {
      number: "02",
      category: "Budget",
      title: "Underestimating Total Cost",
      body: "Unit cost is the easy part. Freight, fees and returns aren't.",
      badge: "Margin Risk",
      icon: "dollar",
    },
    {
      number: "03",
      category: "Advertising",
      title: "Guessing at PPC",
      body: "Campaigns switched on. No keyword or bid plan behind them.",
      badge: "Wasted Spend",
      icon: "chart",
    },
    {
      number: "04",
      category: "Listing",
      title: "A Listing Built to Exist",
      body: "The product goes live. Nothing about it is built to convert.",
      badge: "Revenue Leak",
      icon: "cart",
    },
  ],
  problemsGauge: {
    label: "First Launch Readiness Score",
    score: 38,
    scoreMax: 100,
    status: "Launch Risk Detected",
    statusAccent: "Launch Risk",
    icon: "activity",
  },
  problemsBanner: [
    {
      icon: "users",
      value: "70%",
      text: "Of First Launches Stall Before Profit",
      textAccent: "Stall Before Profit",
    },
    {
      icon: "target",
      text: "Launches Fail In Planning. Not Products.",
      textAccent: "Not Products.",
    },
  ],
  whyUsIntro: {
    sectionLabel: "Capability",
    sectionNumber: 2,
    eyebrow: "Beginner-Friendly, Data-Led",
    heading: "One Agency. Your Whole First Launch.",
    headingAccent: "First Launch.",
    subhead: "",
  },
  whyUs: [
    {
      eyebrow: "01 / Research",
      title: "We Validate Before You Spend a Dollar on Inventory",
      body: "Search volume, competition level, review count and realistic margin — every product idea gets checked against real data before you commit any capital.",
      points: [
        "Demand and competition analysis for each product idea",
        "Realistic landed-cost and margin modeling",
        "A clear go / no-go before you order samples",
      ],
      outcomeLabel: "Outcome",
      outcome: "Know your idea works before you order a single unit.",
      outcomeIcon: "target",
    },
    {
      eyebrow: "02 / Setup",
      title: "A Listing That's Ready to Convert on Day One",
      body: "Title, bullets, images and A+ Content built around what buyers in your category actually search for and respond to — not a generic template.",
      points: [
        "Keyword-mapped listing copy from the start",
        "Compliance checked before you go live",
        "No guessing on what photos or claims you need",
      ],
      outcomeLabel: "Outcome",
      outcome: "Go live with a listing built to sell, not just to exist.",
      outcomeIcon: "check",
    },
    {
      eyebrow: "03 / Launch",
      title: "A PPC Plan You Understand Before You Spend",
      body: "A simple, structured launch budget and campaign plan — so you know exactly what you're spending, why, and what to expect before the first click.",
      points: [
        "A launch budget you set and approve up front",
        "Campaigns structured for your specific product",
        "Plain-English reporting, no jargon dashboards",
      ],
      outcomeLabel: "Outcome",
      outcome: "Spend with a plan — and know what every dollar bought.",
      outcomeIcon: "growth",
    },
  ],
  statsIntro: {
    sectionLabel: "Proof",
    sectionNumber: 3,
    eyebrow: "",
    heading: "",
    headingAccent: "",
  },
  stats: [
    { value: 40, suffix: "+", label: "First-Time Sellers Launched" },
    { value: 60, suffix: "%", label: "Avg. Launch Cost Reduction vs DIY" },
    { value: 90, suffix: "d", label: "Typical Time to First Sale" },
    { value: 100, suffix: "%", label: "Data-Checked Before Inventory" },
  ],
  caseStudiesIntro: {
    sectionLabel: "Launches",
    sectionNumber: 4,
    eyebrow: "Proof of Work",
    heading: "First Launch Case Studies",
    headingAccent: "Case Studies",
    subhead:
      "Real first products \u2014 what the research said, what we changed, and where they landed.",
    linkLabel: "View All Case Studies \u2192",
    linkHref: "/case-studies",
    positioningLabel: "Positioning",
    angleLabel: "Angle",
    competitionLabel: "Competition",
  },
  // Case studies are Sanity-only — there is deliberately no built-in list
  // here. A hardcoded case study can't be deleted or edited from the
  // Studio, so it would sit on the site forever as an image-less card.
  // Create them in Sanity → Case Studies instead; tick "Show on landing
  // page(s)" on a case study to have it appear in this page's teaser.
  caseStudies: [],
  servicesIntro: {
    sectionLabel: "Services",
    sectionNumber: 5,
    eyebrow: "What's Included",
    heading: "Everything a First Launch Needs, Under One Roof",
    headingAccent: "Under One Roof",
  },
  services: [
    {
      title: "Product & Niche Validation",
      body: "We check your product ideas against real search and competition data before you spend on inventory — so you find out if an idea works before it's too late to change course.",
    },
    {
      title: "Sourcing & Cost Modeling",
      body: "A clear picture of true landed cost, margin and break-even — freight, fees and all — so there are no surprises once inventory is on the water.",
    },
    {
      title: "Beginner-Friendly Listing Build",
      body: "Keyword-mapped titles, bullets and A+ Content, explained in plain language so you understand why each decision was made, not just handed a finished listing.",
    },
    {
      title: "First-Launch PPC Setup",
      body: "A structured, budget-matched campaign plan for your launch window — built so you understand exactly what you're spending and why.",
    },
    {
      title: "30/60/90 Day Roadmap",
      body: "A simple plan for your first three months live — what to watch, when to adjust, and what \"on track\" actually looks like for a first launch.",
    },
  ],
  processIntro: {
    sectionLabel: "Flight Path",
    sectionNumber: 6,
    eyebrow: "Your First Launch, Step By Step",
    heading: "How a First Launch Takes Off",
    headingAccent: "Takes Off",
  },
  process: [
    {
      tag: "Week 1",
      title: "Validate",
      body: "We test your product ideas against real demand and competition data before any money goes into inventory.",
    },
    {
      tag: "Week 2–4",
      title: "Build",
      body: "Sourcing, cost modeling and a keyword-mapped listing built while your inventory is in production.",
    },
    {
      tag: "Launch Week",
      title: "Go Live",
      body: "A structured PPC plan matched to your budget — no guessing, no wasted spend on day one.",
    },
    {
      tag: "Days 30–90",
      title: "Learn & Adjust",
      body: "Real performance data starts coming in — we help you read it and make the right calls for product #2.",
    },
  ],
  testimonialsIntro: {
    sectionLabel: "Clients",
    sectionNumber: 7,
    eyebrow: "Real Voices, Real Results",
    heading: "What First-Time Sellers Say",
    headingAccent: "Sellers Say",
  },
  testimonials: [
    {
      quote:
        "Client testimonial goes here — a first-time seller talking about how the validation step saved them from a bad product choice.",
      name: "Client Name",
      role: "First-time seller",
      initials: "NS",
    },
    {
      quote:
        "Client testimonial goes here — ideally about understanding their PPC spend for the first time instead of just watching money disappear.",
      name: "Client Name",
      role: "New Amazon brand owner",
      initials: "AK",
    },
    {
      quote:
        "Client testimonial goes here — ideally about hitting their first sale or profitability milestone and what surprised them about the process.",
      name: "Client Name",
      role: "First-time seller",
      initials: "RT",
    },
  ],
  bookIntro: {
    sectionLabel: "Contact",
    sectionNumber: 8,
    eyebrow: "Simple, Fast Onboarding",
    heading: "One Call. No Endless Forms.",
    headingAccent: "",
    body: "We get clear on your idea, your budget and your timeline \u2014 and tell you honestly whether it's worth launching.",
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
    fields: [
      {
        // This page's opening qualifier, and the counterpart to the
        // homepage's "Product Currently Advertised" — someone who hasn't
        // launched has nothing advertised, so asking that here would draw a
        // blank. Deliberately its own GHL field rather than sharing the
        // homepage's: a field holding product names for one audience and
        // stage labels for the other can't be filtered or reported on.
        key: "amazonStage",
        label: "Where Are You in Your Amazon Journey?",
        type: "dropdown",
        options: [
          "Just researching",
          "Product picked, not ordered",
          "Stock ordered, not launched",
          "Launched, under $10k/month",
        ],
        required: true,
        target: "customField",
        ghlField: "amazon_stage",
      },
      {
        key: "revenue",
        label: "Monthly Revenue on Amazon",
        type: "dropdown",
        options: [
          "Haven't launched yet",
          "$0 \u2013 $50k",
          "$50k \u2013 $250k",
          "$250k \u2013 $500k",
          "$500k \u2013 $1M+",
        ],
        required: true,
        target: "customField",
        ghlField: "monthly_amazon_revenue",
      },
      {
        key: "products",
        label: "Products Planned This Quarter",
        type: "dropdown",
        options: ["1 product", "2 \u2013 5 products", "5 \u2013 10 products", "10+ products"],
        required: true,
        target: "customField",
        ghlField: "products_planned_quarter",
      },
      {
        key: "budget",
        label: "Est. Launch Budget per Product",
        type: "dropdown",
        options: ["Less than $10k", "$10k \u2013 $30k", "$30k \u2013 $50k", "$50k+"],
        required: true,
        target: "customField",
        ghlField: "launch_budget_per_product",
      },
    ],
    submitLabel: "Book My Strategy Call",
    submitLoadingLabel: "Sending\u2026",
    successHeading: "You're in.",
    successBody:
      "We've got your details \u2014 the launch team will reach out within one business day.",
    // The first two are unchanged, so existing GHL workflows keep firing.
    // "new-seller" is what tells this audience apart from the homepage's.
    tags: ["website-lead", "strategy-call-request", "new-seller"],
    // Left as-is on purpose: tags are additive, so adding "new-seller"
    // can't break an existing workflow, but source is a single value —
    // changing it would stop any workflow filtering on the old string from
    // matching. Change it in the Studio once you've checked nothing does.
    source: "Website \u2014 Strategy Call Form",
    opportunityName: "{{name}} \u2014 Strategy Call",
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
      q: "I don't have a huge budget — can you still help me?",
      a: "Yes. This program exists specifically for sellers who aren't yet at $10k/month or haven't launched at all. We match the plan and PPC budget to what you actually have to invest, and we're upfront if a product idea needs more capital than you've got.",
    },
    {
      q: "How much capital do I realistically need to start?",
      a: "It varies by category, but most first launches need inventory cost plus a separate PPC and buffer budget. We'll model the real number for your specific product idea during validation, before you commit to anything.",
    },
    {
      q: "Do I need an LLC or business registration first?",
      a: "Not to get started with research and validation. You'll want an LLC or equivalent in place before you actually launch and take payments, and we can point you toward that process when the time comes.",
    },
    {
      q: "How is this different from a course or YouTube tutorials?",
      a: "Courses teach you the general framework. We do the actual validation, sourcing math and listing work on your specific product with you — so you're not guessing whether you applied the lesson correctly.",
    },
    {
      q: "How long until I see my first sale?",
      a: "It depends on manufacturing and shipping timelines, but most first launches go live within 4-8 weeks of starting, with a first sale typically following within days once the listing is live and PPC is running.",
    },
    {
      q: "What if I'm still deciding on a product idea?",
      a: "That's the most common starting point. Product validation is the first step of the process, not something you need to have already figured out before reaching out.",
    },
  ],
  cta: {
    eyebrow: "Your Peak, Our Passion",
    heading: "Ready to Launch Your First Product?",
    headingAccent: "",
    sub: "One call tells you whether your product idea actually holds up — before you spend a dollar on inventory.",
    buttonLabel: "Book a Strategy Call",
    buttonHref: "#book-a-call",
  },
  contact: { email: "hello@peakhawks.com" },
};
