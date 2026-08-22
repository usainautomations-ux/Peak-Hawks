# Sanity Setup — PeakHawks (Embedded Studio)

Good news: **you don't need a separate project or folder.** Sanity Studio
now lives directly inside this Next.js app at `/studio` — one codebase,
one deploy, and the dashboard has been simplified into clean tabs instead
of one long scrolling form.

---

## 1. Create a free Sanity project (2 minutes, no CLI needed)

1. Go to **[sanity.io/manage](https://sanity.io/manage)** and log in / sign up
2. Click **Create project**
3. Name it "PeakHawks" (or anything)
4. When asked about a dataset, choose **production**
5. You do **not** need to scaffold a Studio here — skip any "create Studio"
   prompt. We already built it into this repo.

Copy two things from the project's **Settings** page:
- **Project ID** (looks like `abc123xy`)
- Dataset name (should just be `production`)

---

## 2. Add environment variables

In `peakhawks-next/.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_read_token
SANITY_WEBHOOK_SECRET=any_random_string
```

For `SANITY_API_TOKEN`: in your Sanity project → **API** → **Tokens** →
**Add API token** → give it **Viewer** (read-only) permissions. This is
only used by the public website to *read* content — it has nothing to do
with who can log into `/studio` (that's controlled by Sanity accounts,
see step 4).

---

## 3. Run it

```bash
npm install
npm run dev
```

Visit **`http://localhost:3000/studio`** — that's the dashboard. It'll ask
you to log into Sanity (same account you used in step 1).

---

## 3.5. Pre-fill the Studio with real content (recommended)

By default, both page documents ("Homepage" and "New Sellers Page") don't
exist in Sanity until you create them — so the Studio starts blank. Run
this once to seed both with the current default copy, so you're editing
real content instead of starting from nothing:

Get a write-capable token first: sanity.io/manage → your project → API →
Tokens → Add API token → "Editor" permissions. Add it to `.env.local`:

```
SANITY_SEED_TOKEN=sk_your_editor_token
```

Then run:

```bash
npm run seed:sanity
```

Both scripts read `.env.local` themselves (see `scripts/loadEnv.ts`), so
there is no need to prefix the command with environment variables — which
matters on Windows, where PowerShell does not support the
`VAR=value command` syntax at all.

This is safe to re-run — it uses `createIfNotExists`, so it will **never**
overwrite a document that already exists (won't clobber edits you've made).
You can delete that Editor token afterward; the site only ever needs a
read-only "Viewer" token at runtime.

## 3.6. Migrating documents seeded before the Brand Logos change

If the Studio shows **"Invalid list values — Some items in this list are
not objects"** on the **Brand Logos** list, the document was seeded when
that field was still a list of plain text names. It is now a list of
objects, so each brand can have a name, an uploaded logo image, or both.

The website itself is fine either way (both shapes are handled), but the
Studio refuses to render a mixed list. One command fixes it:

Put an Editor token in `.env.local` (`SANITY_SEED_TOKEN=sk_...`), then:

```bash
npm run migrate:sanity
```

Safe to re-run: entries that are already objects are left untouched, and
documents with nothing to fix are skipped without being written to.
Unpublished drafts are migrated too, so there's no need to publish or
discard your in-progress edits first.

---

## ⚠️ Why didn't my Sanity edit show up on the site?

**There's only one real cause now:** Sanity Studio has separate Save and
Publish steps. Editing a field auto-saves it as a *draft* — the live site
only ever reads *published* content (on purpose, so half-finished edits
never go live by accident). If you edited a field but the site still shows
the old value, check the top-right of the Studio for a **Publish** button
and click it.

There's no caching to wait out — every page load fetches directly from
Sanity, so a publish is live on the very next request. If it still looks
wrong after publishing, it's almost always a browser cache: hard-refresh
(Ctrl+Shift+R / Cmd+Shift+R).

---

## 4. Give the client access

In `sanity.io/manage` → your project → **Members** → **Invite** → enter
the client's email. They'll get an email, create/log into a free Sanity
account, and can then go to `yoursite.com/studio` and log in with that
account. No password to manage on your side, no separate app to install.

---

## 5. The dashboard, simplified

Instead of Sanity's default "list every content type" sidebar, this ships
with a **custom structure** (`sanity/structure.ts`) so the client sees
exactly two things:

```
🏠 Homepage      ← opens straight into the editor, no extra clicks
📝 Blog Posts    ← normal list: create, edit, delete
```

**Inside Homepage**, instead of one giant scrolling form with every field
from every section, the fields are grouped into **tabs across the top**:

```
Hero | Stats & Logos | Problems | Why Us |
Services | Process | Testimonials | FAQ | CTA & Contact
```

(Case studies aren't edited here — see the next section for how that works.)

Client clicks a tab, edits just that section, hits **Publish** (top
right). The live site reflects it on the very next page load — no
waiting, no caching to invalidate.

---

## 6. Case studies — one toggle, no separate step

Each case study has its own page at `/case-studies/[slug]` automatically.
To also feature it in the teaser section near the top of a landing page,
there's a single field right on the case study itself:

**"Show on landing page(s)"** — check **Homepage ($10k+ Sellers)** and/or
**New Sellers Page**, then Publish. That's it — no need to also go edit
the Homepage document to reference it. Leave both unchecked and the case
study still gets its own page, just isn't featured in a teaser.

Featured case studies appear newest-first automatically.

---

## 7. Webhook — optional, not required for correctness

Content fetches always hit Sanity fresh (`cache: 'no-store'`), so
publishing already updates the live site immediately without any webhook.
The webhook endpoint (`app/api/webhooks/sanity/route.ts`) still exists in
the codebase but is currently a no-op — it's only useful if a future
traffic-scale need re-introduces response caching, at which point it would
handle invalidation. Nothing to configure for now.

---

## 8. Everything the client can now edit themselves

| Section | Editable |
|---|---|
| **Hero** | Headline (3 lines), accent word, subhead, badge text, note, **video URL** (YouTube/Vimeo/MP4) or a plain **image** if there's no video, separate **desktop and mobile image uploads**, and the proof pills under the image (value + label) |
| **Stats** | All 4 numbers, suffixes, labels |
| **Brand logos** | Add/remove any number of brand names |
| **Problems** | Section heading + orange accent phrase + subheading; the score dial (label, score, out-of, status line, icon); every diagnosis card — number, category, title, body, warning pill, **icon picker** or **custom icon upload**; and the dark summary bar blocks |
| **Why Us** | Section heading + orange accent word, then every row — eyebrow, heading, body, bullet points, outcome label, outcome statement, outcome icon, **image upload** |
| **Case Studies** | Its own collection (not a page field) — add/edit/remove any number, each with its own `/case-studies/[slug]` page, **cover image upload**, and a toggle to feature it on the Homepage and/or New Sellers Page |
| **Services** | Add/edit/remove/reorder |
| **Process** | 4 timeline steps — label, title, body |
| **Testimonials** | Add/edit/remove — quote, name, role, **photo upload** |
| **FAQ** | Add/edit/remove/drag-to-reorder any number of questions |
| **CTA** | Final heading + subtext |
| **Blog** | Full rich-text posts — headings, bold/italic, links, inline images, callout boxes, category, cover image, SEO title/description, draft/publish toggle |

Nothing here requires touching code. **GHL and Sanity have completely
separate jobs, with no overlap:** GHL only ever handles leads, the booking
calendar, and CRM automations (the strategy-call form and calendar widget
post directly to GHL's API regardless of what page they're on). Sanity is
the *only* source for everything you see on the page — headlines, images,
testimonials, FAQ, and so on. Editing GHL Custom Values has no effect on
site content anymore; if you're trying to change what the page says or
shows, that's always done in `/studio`.
booking calendar, and CRM automations exactly as before — Sanity only
controls what the page *shows*.

---

## Notes on the route structure

- The public site (`/`, `/blog`, `/blog/[slug]`) lives under
  `app/(marketing)/` — this group's layout carries the Nav, Footer,
  preloader, cursor ring, altimeter, and legal modals.
- `/studio` sits **outside** that group, so it renders on a clean shell
  with none of the marketing site's UI wrapped around it.
- `app/layout.tsx` (the true root) only sets up `<html>/<body>` and fonts
  — shared by both the marketing site and Studio, nothing else.
