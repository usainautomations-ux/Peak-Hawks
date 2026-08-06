import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "node:crypto";

export const runtime = "nodejs";

/**
 * POST /api/webhooks/ghl
 *
 * Inbound events from GoHighLevel. GHL no longer sources any site content
 * (that's Sanity's job — see lib/content/merged.ts), so the
 * CustomValueUpdate/revalidateTag("ghl-content") case below is inert —
 * nothing tags a fetch with "ghl-content" anymore. Left in place as a
 * harmless no-op rather than removed, since GHL may still fire that event
 * type and this shouldn't error if it does.
 *
 * The real reason this route exists now: a hook point for reacting to
 * GHL events (AppointmentCreate, ContactCreate, OpportunityStatusUpdate)
 * — e.g. a future Slack notification or analytics ping.
 *
 * Configure in GHL: Settings → Webhooks → point at
 *   https://yourdomain.com/api/webhooks/ghl
 * and set GHL_WEBHOOK_SECRET to the shared secret you configure there.
 */

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.GHL_WEBHOOK_SECRET;
  // If no secret is configured, accept (dev). In production, always set one.
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature =
    req.headers.get("x-ghl-signature") ?? req.headers.get("x-wh-signature");

  if (!verifySignature(raw, signature)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let event: { type?: string; [k: string]: unknown };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  switch (event.type) {
    // Client edited site content in GHL — refresh immediately
    case "CustomValueUpdate":
    case "CustomValueCreate":
    case "CustomValueDelete":
      revalidateTag("ghl-content");
      break;

    case "AppointmentCreate":
      // e.g. notify Slack, trigger onboarding email, log analytics
      console.log("[webhook] appointment created", event);
      break;

    case "ContactCreate":
      console.log("[webhook] contact created", event);
      break;

    default:
      console.log("[webhook] unhandled event", event.type);
  }

  // Always 200 quickly — GHL retries on non-2xx
  return NextResponse.json({ ok: true });
}
