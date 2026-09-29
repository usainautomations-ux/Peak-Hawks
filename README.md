# PeakHawks — Next.js + GoHighLevel

Marketing site with **Next.js as the frontend** and **GoHighLevel as the backend** —
CRM, pipeline, calendar bookings and editable site content all live in GHL.

## 0. Changelog — parity & tooling fixes

**Latest — case studies are Sanity-only, lead form is client-built:**

*Case studies*
- `/case-studies` used to list six hardcoded demo case studies alongside
  the real ones. They had no cover image or write-up, so they rendered as
  blank placeholder cards — and because they lived in code, not Sanity,
  there was no way to delete them from the Studio. They're gone: the site
  now shows exactly what's in Sanity, on the listing page, on both
  landing-page teasers and in the sitemap. A page with no case studies
  shows an empty state, and the landing-page teaser hides itself.
- `scripts/seed-sanity.ts` no longer creates those six as real documents
  either — running the seed on a fresh dataset used to put them back.
- Every case study query now shares one visibility filter: published (not
  a draft), not hidden, has a title and slug, and its publish date has
  arrived. A future-dated case study stays off the site until then.
- New **"Hide from the website"** switch on each case study — an instant,
  reversible way to pull one down without deleting it. Permanent delete is
  where it always was: open the case study → ⋮ menu at the foot of the
  form → Delete. Hidden case studies are marked in the Studio's list.

*Lead form*
- The form's questions are now **built in Sanity, per page** (→ Lead Form
  → Questions). Add, remove and reorder freely; each question can be a
  dropdown, short text, long text or a phone number, be required or
  optional, sit full or half width, and write to whichever GoHighLevel
  custom field you name. Name and Email stay built in (GHL needs them to
  identify the contact), with their labels editable as before.
- **GHL tags, lead source and the pipeline deal name are editable per
  page too** — so homepage leads and New Sellers leads can land in
  different workflows. The deal name takes `{{name}}`.
- Tags and field keys are resolved **server-side from Sanity** on every
  submission (`getMergedLeadForm`). The browser only ever sends answers —
  otherwise a crafted request could tag itself into any GHL workflow.
  Dropdown answers are checked against their configured choices for the
  same reason.
- Every answer is also written to the contact's timeline as a note, so a
  custom field key that doesn't match anything in GHL costs readability,
  not the answer.
- Defaults are unchanged on both pages (same three dropdowns, same tags,
  same source), so nothing in GoHighLevel changes until you edit it in
  the Studio.
- Bug fix: a filled honeypot returned a 400 instead of a silent fake
  success — `website: z.string().max(0)` rejected the request at schema
  validation, making the "pretend success" branch unreachable and telling
  bots they'd been spotted.
- Existing Studio content is carried over by `npm run migrate:sanity`,
  which copies the old fixed dropdowns into the new Questions list. The
  site renders the old shape correctly either way — the migration is so
  the Studio's Questions list isn't empty.

**Previously — critical Sanity crash fix + content model simplified:**
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

## 0.5 Icons / favicon — read before changing them

The three icon files live in `app/` and **only** in `app/`:

| File | What it is |
|---|---|
| `app/favicon.ico` | multi-resolution ICO (16–256px), legacy tabs and bookmarks |
| `app/icon.svg` | the same mark as SVG — what modern browsers actually use |
| `app/apple-icon.png` | 180×180, iOS home screen |

All three are the `HawkMark` from `components/Nav.tsx` — the logo the site
shows — on the brand's dark rounded square, so the mark stays legible
against a white browser tab.

Two traps that have already cost one round of "we updated it and nothing
happened":

1. **`favicon.ico` is only honoured at the root of `app/`.** Next.js
   ignores it anywhere else, including inside a route group like
   `app/(marketing)/`. A copy sitting there does nothing, and a copy in
   the repository root does nothing either (there is no `public/`).
2. **It has to actually be an ICO.** Renaming a `.jpg` to `.ico` produces
   a file browsers refuse. Check with `file app/favicon.ico` — it should
   say "MS Windows icon resource", not "JPEG image data".

To regenerate all three from the logo, rasterise `HawkMark`'s paths at
16/32/48/64/128/256 and pack them into an ICO. And when testing, remember
browsers cache `/favicon.ico` very aggressively — use a hard reload or a
private window before concluding it didn't work.

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

### 2.3 Custom fields (for the form's questions)

`Settings → Custom Fields` — create a **text** field for each question the
form asks beyond name and email. Out of the box that's three:

| Key | Asked on |
|---|---|
| `monthly_amazon_revenue` | both pages |
| `products_planned_quarter` | both pages |
| `launch_budget_per_product` | both pages |
| `product_currently_advertised` | homepage only |
| `amazon_stage` | New Sellers page only |

The last two are deliberately **separate fields, not one shared field**.
A visitor who hasn't launched has nothing currently advertised, so the
New Sellers page asks where they are in their journey instead. Pointing
both at one key would leave a column holding product names for one
audience and stage labels for the other — impossible to filter or report
on. Tags (`established-seller` / `new-seller`) are what tell the two
audiences apart.

Which questions exist, and which custom field key each one writes to, is
set per page in the Studio (`/studio` → Homepage or New Sellers Page →
Lead Form → Questions). Add a question there, create a matching field
here, and paste the key in — they have to match exactly. If a key doesn't
match anything in GHL the lead is still captured and the answer still
lands on the contact's timeline note; it just won't fill a field.

The same tab sets the **tags** a submission applies, the **lead source**
recorded on the contact, and the **pipeline deal name** — separately for
each page, so homepage and New Sellers leads can trigger different
workflows.

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
