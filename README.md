# PeakHawks — Next.js + GoHighLevel

Marketing site with **Next.js as the frontend** and **GoHighLevel as the backend** —
CRM, pipeline, calendar bookings and editable site content all live in GHL.

## 0. Changelog — parity & tooling fixes

**Latest — critical Sanity crash fix + content model simplified:**
- `lib/sanity/client.ts` used to call `createClient()` at module load time,
  which throws synchronously if `projectId` is unset — crashing the entire
  page render, not just the Sanity fetch. Now guarded behind
  `sanityConfigured`; a missing env var degrades gracefully to defaults.
- Content model simplified from three-tier (Sanity > GHL > defaults) to
  two-tier (Sanity > defaults). GHL Custom Values are no longer read for
  page content — GHL's only job on this project is leads/booking.
  `lib/ghl/content.ts` is kept for reference but is unused.
- Fixed a React key-collision warning in `Testimonials` (and hardened the
  same class of bug across every other list — Problems, WhyUs, CaseStudies,
  Services, Process, Stats, FAQ) by switching from content-derived keys
  (which can collide once Sanity content includes duplicate titles/text)
  to index-based keys.
- Added `scripts/seed-sanity.ts` (`npm run seed:sanity`) — pre-populates
  both the Homepage and New Sellers Sanity documents with the current
  code defaults, so the Studio starts with real editable copy instead of
  blank forms. Safe to re-run; never overwrites existing documents.
- Renamed the New Sellers route from `/new-sellers` to `/newseller`, and
  wired it to its own Sanity singleton document ("New Sellers Page"),
  mirroring the homepage's Sanity-first content pattern exactly.
- Added failure-safety timeouts to `Preloader` and `Hero`'s entrance
  animation — if GSAP ever fails to load, the nav bar and page content
  can no longer get stuck permanently invisible.

This pass brought the Next.js port up to parity with the original animated
HTML mockup, and made sure GSAP and Framer Motion are actually wired in
(both were listed as dependencies but unused in the first port).

**New — GSAP:**
- `lib/gsap.ts` — single loader, registers ScrollTrigger once
- `components/Preloader.tsx` — feather-assembly → altitude counter → curtain
  lift, chains straight into the hero entrance via a custom event
- `components/Reveal.tsx` — generic scroll-in wrapper, used across every
  section (previously sections had no scroll-triggered animation at all)
- `components/Eyebrow.tsx` — text-scramble-into-place label
- `components/Magnetic.tsx` — cursor-pull effect on primary CTAs
- `components/CursorRing.tsx` — desktop cursor-follow glow
- `LogoMarquee` — GSAP infinite scroll + scroll-velocity skew
- `Process` — scroll-scrubbed line draw with step activation (was a plain
  scroll listener before, now genuinely GSAP/ScrollTrigger-driven)

**New — Framer Motion** (previously installed, never imported anywhere):
- Mobile nav menu (height/opacity reveal)
- Chatbot panel open/close (spring transition)
- Dropdown menu open/close
- FAQ and Services accordions (replaced CSS grid-row hacks)
- `LegalModal.tsx` — AnimatePresence-driven modal

**Bug fix:** the footer's Terms / Privacy / Disclaimer links pointed at
`/terms`, `/privacy`, `/disclaimer` routes that were never created — 404s
in production. Replaced with the `LegalModal` system, with real template
copy for all three, matching the original HTML mockup's approach.

**Tooling:** all dependency versions pinned exact (no `^`) to prevent any
silent major-version drift — most importantly Tailwind, since v4 changes
the PostCSS plugin entirely and would silently break every utility class.

**Note on `npm run build` in a sandboxed/offline environment:** if you see
`next/font` errors fetching Google Fonts, that's a network restriction, not
a project bug — it resolves on any machine with normal internet access or
on Vercel.

```
Visitor → Next.js (Vercel) → /api/* route → GHL API v2 → CRM + automations
                    ↑
            content pulled from GHL Custom Values (ISR, 5 min)
```

---

## 1. Install

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

---

## 2. GoHighLevel setup

### 2.1 Create a Private Integration token

`Settings → Integrations → Private Integrations → Create new`

> V1 API keys are end-of-life. Use a Private Integration Token (API v2).

Grant these scopes:

| Scope | Used for |
|---|---|
| `contacts.write`, `contacts.readonly` | lead capture, dedupe |
| `opportunities.write` | auto-create pipeline deals |
| `calendars.readonly` | fetch real free slots |
| `calendars/events.write` | book appointments |
| `locations.readonly` | read Custom Values (site content) |

Copy the token → `GHL_PRIVATE_TOKEN`.

### 2.2 Grab your IDs

| Env var | Where to find it |
|---|---|
| `GHL_LOCATION_ID` | Settings → Business Profile (sub-account ID) |
| `GHL_CALENDAR_ID` | Calendars → your strategy-call calendar → settings |
| `GHL_PIPELINE_ID` | Opportunities → Pipelines → copy pipeline ID |
| `GHL_PIPELINE_STAGE_ID` | the first stage of that pipeline |

Pipeline vars are optional — leave blank and leads still land as contacts,
just without an auto-created deal.

### 2.3 Custom fields (for the form dropdowns)

`Settings → Custom Fields` — create three **text** fields with these exact keys:

- `monthly_amazon_revenue`
- `products_planned_quarter`
- `launch_budget_per_product`

### 2.4 Custom Values = the CMS

`Settings → Custom Values` — this is where the client edits the site,
no code, no developer.

**Simple text values** (create as-is):

| Name | Example |
|---|---|
| `site_hero_badge` | Full-Service Amazon Growth Agency |
| `site_hero_headline` | Amazon Growth, Engineered From Product Data. |
| `site_hero_accent` | Engineered |
| `site_hero_subhead` | We research, position, launch and scale… |
| `site_hero_note` | PRODUCT-FIRST · TACOS-DRIVEN REPORTING |
| `site_hero_video_url` | https://…/vsl.mp4 |
| `site_cta_heading` | Ready to Reach Your Peak? |
| `site_contact_email` | hello@peakhawks.com |

**Repeatable content** — one value holding a JSON array:

`site_stats`
```json
[{"value":28,"suffix":"M+","label":"Revenue Generated"},
 {"value":40,"suffix":"+","label":"Brands Scaled"}]
```

`site_case_studies`
```json
[{"tag":"Wellness · Drops","title":"First-Mover Liquid Drops",
  "positioning":"Format nobody offered","angle":"Faster absorption",
  "competition":"Zero","result":"$1M+ run rate","image":"https://…"}]
```

`site_testimonials`
```json
[{"quote":"…","name":"Jane Doe","role":"Founder, Brand","initials":"JD"}]
```

Same pattern for `site_problems`, `site_why_us`, `site_services`,
`site_process`, `site_faq`, `site_brand_logos`.

> **Anything missing or malformed falls back** to `lib/content/defaults.ts`,
> so a bad paste can never take the site down. Check the server logs for
> `[content] Invalid JSON` warnings.

### 2.5 Webhook (instant content updates)

`Settings → Webhooks → New` → `https://yourdomain.com/api/webhooks/ghl`

Subscribe to `CustomValueUpdate` (and optionally `AppointmentCreate`,
`ContactCreate`). Set the shared secret as `GHL_WEBHOOK_SECRET`.

Without the webhook, content refreshes on the 5-minute ISR cycle.
With it, edits appear immediately.

---

## 3. What's wired

| Site element | Endpoint | GHL result |
|---|---|---|
| Strategy call form | `POST /api/leads` | contact upserted + tagged, deal created |
| Calendar availability | `GET /api/booking/slots` | real free slots from GHL calendar |
| Booking confirm | `POST /api/booking` | appointment booked + contact + deal |
| Chatbot email capture | `POST /api/chat` | contact + full transcript as a note |
| Content edits | `POST /api/webhooks/ghl` | cache busted, site updates live |

Contacts are **upserted**, so a repeat submitter updates their record instead
of creating a duplicate. Tags (`website-lead`, `call-booked`, `chatbot-capture`)
are what your GHL workflows should trigger off.

---

## 4. Automations to build in GHL

The site just delivers clean data — the follow-up lives in GHL Workflows:

1. **Trigger:** tag `strategy-call-request` → send confirmation email + notify Shah via SMS
2. **Trigger:** tag `call-booked` → send calendar invite + 24h reminder
3. **Trigger:** tag `chatbot-capture` → 3-email nurture sequence
4. **Trigger:** opportunity stage change → internal Slack notification

---

## 5. Deploy

```bash
vercel
```

Add every env var in Vercel → Settings → Environment Variables.
`GHL_PRIVATE_TOKEN` is server-only — it is never bundled into client JS
because it's read exclusively inside `/app/api/*` routes and server components.

---

## 6. Security notes

- Token lives server-side only; no `NEXT_PUBLIC_` prefix.
- Lead route has a honeypot field + in-memory per-IP rate limit
  (swap for Upstash Redis if you scale beyond one serverless region).
- Webhook signature is HMAC-verified against `GHL_WEBHOOK_SECRET`.
- Zod validates every inbound payload before it reaches GHL.

---

## 7. Known trade-off

GHL Custom Values are **flat key/value strings** — great for headlines and
stats, clunky for repeatable records (hence JSON-in-a-field for case studies).
If the client ends up editing case studies weekly and finds the JSON awkward,
move *just those* collections to Sanity or Payload and keep GHL for
leads/bookings/automations. The content layer in `lib/ghl/content.ts` is
isolated behind `getSiteContent()`, so swapping the source is a one-file change.
