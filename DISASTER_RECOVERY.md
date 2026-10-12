# Durability & Disaster Recovery — PeakHawks

## First, the myth

**GitHub does not delete repositories after 60 or 90 days.** Repos stay until
someone deletes them, on every plan. What *does* expire after 90 days is
GitHub Actions **artifacts** and **build logs** (and Codespaces idle out after
30 days). That is where the 90-day number comes from. The code is not on a
timer.

## Where each piece of the site actually lives

| Thing | Lives in | Survives if GitHub disappears? |
|---|---|---|
| Next.js code, Sanity schemas | GitHub | Yes — every clone is a full copy |
| The live site (HTML/JS/CSS/images) | Vercel CDN, immutable per deployment | **Yes.** The site keeps serving. |
| Page copy, headlines, uploaded images | Sanity hosted dataset `production` | Yes — Sanity has never depended on GitHub |
| Env vars / API tokens | Vercel project settings + `.env.local` | Yes, but only in Vercel's dashboard |

So the loss of GitHub costs you the ability to **rebuild and deploy**, not the
site and not the content.

## The risk that is real

The Sanity dataset is the **single copy** of all site copy and images. Nothing
in this repo or on Vercel reproduces it. An accidental delete in `/studio`, a
lapsed plan, or a bad `dataset import --replace` loses it permanently. That is
the gap worth closing, not the GitHub one.

## 1. Back up Sanity content (do this)

Run it any time, locally:

```bash
./scripts/backup-sanity.sh          # writes backups/sanity-production-<timestamp>.tar.gz
```

The export contains every document **and** every uploaded asset, so it restores
the site's content standalone.

It also runs weekly in CI via `.github/workflows/sanity-backup.yml`. Set up
once:

1. Repo → Settings → Secrets and variables → Actions
2. **Secret** `SANITY_API_TOKEN` — a Viewer token from
   [sanity.io/manage](https://sanity.io/manage) → API → Tokens
3. **Variables** `NEXT_PUBLIC_SANITY_PROJECT_ID` = `v84q7t2g`,
   `NEXT_PUBLIC_SANITY_DATASET` = `production`

That alone gives you a downloadable export in the Actions tab. Because
artifacts are capped at 90 days, also add storage you own for the long-term
copy — any S3-compatible bucket (Cloudflare R2's free tier is plenty for this):

- **Secrets** `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and for
  R2/B2/Spaces also `S3_ENDPOINT` (e.g.
  `https://<account-id>.r2.cloudflarestorage.com`)

The upload step skips itself until `S3_BUCKET` exists, so nothing breaks before
you get to it.

### Restoring

```bash
SANITY_AUTH_TOKEN=<editor-token> npx sanity@4.22.0 dataset import \
  backups/sanity-production-<timestamp>.tar.gz production \
  --project v84q7t2g --replace
```

Import into a scratch dataset first (`--replace` into `production` overwrites
live content). Test a restore once, now, while nothing is on fire — an untested
backup is a guess.

## 2. Mirror the git repo

Removes GitHub as a single point of failure. Push to two remotes at once:

```bash
git remote set-url --add --push origin https://github.com/usainautomations-ux/Peak-Hawks
git remote set-url --add --push origin https://gitlab.com/<you>/peak-hawks.git
git push origin main    # now goes to both
```

A plain local clone on your own machine is already a complete backup of all
history — keep one and `git fetch` occasionally.

## 3. Keep a deploy path that doesn't need GitHub

Vercel can deploy straight from your machine, no git host involved:

```bash
npx vercel --prod
```

Worth running once so you know it works and are logged in. If GitHub is ever
unavailable, this is how you ship.

## 4. Record the env vars outside Vercel

They exist only in the Vercel dashboard and your local `.env.local`. Export a
copy and keep it in a password manager (1Password, Bitwarden — **not** in git):

```bash
npx vercel env pull .env.production.local
```

## 5. The site survives Sanity being down, too

Pages are statically generated at build time and served from Vercel's CDN, so a
Sanity outage doesn't take the site down — it just means edits don't appear
until Sanity is back. No action needed; worth knowing.

## Checklist

- [ ] `SANITY_API_TOKEN` secret + project/dataset variables added to the repo
- [ ] Backup workflow run once manually (Actions → Sanity content backup → Run workflow)
- [ ] S3/R2 bucket wired up for copies older than 90 days
- [ ] One restore tested into a scratch dataset
- [ ] Second git remote added, or a local clone kept current
- [ ] `npx vercel --prod` run once from your machine
- [ ] Env vars saved in a password manager
