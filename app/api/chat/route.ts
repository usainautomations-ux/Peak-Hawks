import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertContact, addContactNote } from "@/lib/ghl/crm";
import { rateLimited, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

const ChatLeadSchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional(),
  /** Full conversation so the team sees context in the CRM. */
  transcript: z
    .array(z.object({ role: z.enum(["bot", "user"]), text: z.string().max(2000) }))
    .max(60)
    .optional(),
});

/**
 * POST /api/chat
 * Captures a chatbot lead into GHL and drops the transcript on the
 * contact timeline, so the team opens the record and sees the whole thread.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (rateLimited("chat", ip)) {
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

  const parsed = ChatLeadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Valid email required" },
      { status: 400 },
    );
  }

  const { email, name, transcript } = parsed.data;
  const [firstName, ...rest] = (name ?? "").trim().split(/\s+/).filter(Boolean);

  try {
    const contact = await upsertContact({
      firstName: firstName || undefined,
      lastName: rest.join(" ") || undefined,
      email,
      source: "Website — Chatbot",
      tags: ["website-lead", "chatbot-capture"],
    });

    if (transcript?.length) {
      const body = transcript
        .map((m) => `${m.role === "bot" ? "Hawkeye" : "Visitor"}: ${m.text}`)
        .join("\n");
      try {
        await addContactNote(contact.id, `Chatbot transcript\n\n${body}`);
      } catch (err) {
        console.error("[chat] note failed", err);
      }
    }

    return NextResponse.json({ ok: true, contactId: contact.id });
  } catch (err) {
    console.error("[chat] capture failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not save that — please use the form instead." },
      { status: 502 },
    );
  }
}
