import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createHmac } from "node:crypto";

export const runtime = "nodejs";

/**
 * POST /api/webhooks/sanity
 *
 * NOTE: no longer required for content to update. Every Sanity content
 * fetch now uses `cache: 'no-store'` (see lib/sanity/queries.ts), so the
 * site always reads the current published state directly — no caching
 * layer to invalidate. This endpoint is kept as a no-op for now (the
 * revalidateTag calls below don't do anything since nothing tags fetches
 * anymore) in case a future traffic-scale need re-introduces caching, at
 * which point this webhook would matter again.
 *
 * Configure in Sanity (optional, currently has no effect):
 *   sanity.io/manage → your project → API → Webhooks → Add webhook
 *   URL: https://yourdomain.com/api/webhooks/sanity
 *   Secret: set SANITY_WEBHOOK_SECRET in Vercel env vars to the same value
 *   Filter: _type == "pageContent" || _type == "blogPost"
 *   Projections: { _type, slug }
 */

function verify(body: string, sig: string | null, secret: string): boolean {
  if (!sig) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && createHmac("sha256", "const").update(a).digest().equals(
    createHmac("sha256", "const").update(b).digest()
  );
}

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("sanity-webhook-signature");
  const secret = process.env.SANITY_WEBHOOK_SECRET;

  if (secret && !verify(raw, sig, secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: { _type?: string; slug?: { current?: string } };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body._type === "pageContent") {
    revalidateTag("sanity-page");
  } else if (body._type === "blogPost") {
    revalidateTag("sanity-blog");
    if (body.slug?.current) {
      revalidateTag(`blog-${body.slug.current}`);
    }
  }

  return NextResponse.json({ ok: true, revalidated: body._type });
}
