import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertContact, createOpportunity } from "@/lib/ghl/crm";
import { bookAppointment } from "@/lib/ghl/calendar";
import { rateLimited, getClientIp } from "@/lib/rateLimit";
import { describeGhlFailure } from "@/lib/ghl/errorMessage";

export const runtime = "nodejs";

const BookingSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  startTime: z.string().min(1), // ISO string from the slots endpoint
  timezone: z.string().max(64).optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * POST /api/booking
 * Creates (or matches) the contact, books the GHL appointment,
 * and opens a pipeline deal — all in one call.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (rateLimited("booking", ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, phone, startTime, timezone } = parsed.data;
  const [firstName, ...rest] = name.trim().split(/\s+/);

  try {
    const contact = await upsertContact({
      firstName,
      lastName: rest.join(" ") || undefined,
      email,
      phone,
      source: "Website — Calendar Booking",
      tags: ["website-lead", "call-booked"],
    });

    const appointment = await bookAppointment({
      contactId: contact.id,
      startTime,
      timezone,
      title: `Strategy Call — ${name}`,
    });

    try {
      await createOpportunity({
        contactId: contact.id,
        name: `${name} — Strategy Call Booked`,
      });
    } catch (err) {
      console.error("[booking] opportunity failed", err);
    }

    return NextResponse.json({ ok: true, appointment, contactId: contact.id });
  } catch (err) {
    console.error("[booking] failed", err);

    // A missing env var or an auth/scope problem is a configuration issue
    // the site owner can actually fix — surface exactly what's wrong
    // rather than a generic "please email us" for every failure.
    const isConfigOrAuthIssue =
      (err instanceof Error && /^Missing required env var:/.test(err.message)) ||
      (err && typeof err === "object" && "status" in err &&
        [401, 403].includes((err as { status: number }).status));

    if (isConfigOrAuthIssue) {
      const { message, status } = describeGhlFailure(err);
      return NextResponse.json({ ok: false, error: message }, { status });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "That slot may have just been taken. Please pick another time or email us.",
      },
      { status: 409 },
    );
  }
}
