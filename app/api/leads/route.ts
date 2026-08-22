import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertContact, createOpportunity, addContactTags } from "@/lib/ghl/crm";
import { GHLError } from "@/lib/ghl/client";
import { rateLimited, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

const LeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Valid email required"),
  phone: z.string().max(40).optional(),
  revenue: z.string().max(80).optional(),
  products: z.string().max(80).optional(),
  budget: z.string().max(80).optional(),
  // honeypot — bots fill it, humans never see it
  website: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (rateLimited("leads", ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = LeadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Honeypot tripped — pretend success so the bot doesn't retry.
  if (data.website) return NextResponse.json({ ok: true });

  const [firstName, ...rest] = data.name.trim().split(/\s+/);

  try {
    const contact = await upsertContact({
      firstName,
      lastName: rest.join(" ") || undefined,
      email: data.email,
      phone: data.phone,
      source: "Website — Strategy Call Form",
      tags: ["website-lead", "strategy-call-request"],
      customFields: [
        // These keys must exist in GHL: Settings → Custom Fields
        ...(data.revenue
          ? [{ key: "monthly_amazon_revenue", field_value: data.revenue }]
          : []),
        ...(data.products
          ? [{ key: "products_planned_quarter", field_value: data.products }]
          : []),
        ...(data.budget
          ? [{ key: "launch_budget_per_product", field_value: data.budget }]
          : []),
      ],
    });

    // Deal creation is best-effort — a pipeline misconfiguration
    // should never lose us the lead.
    try {
      await createOpportunity({
        contactId: contact.id,
        name: `${data.name} — Strategy Call`,
      });
    } catch (err) {
      console.error("[leads] opportunity creation failed", err);
    }

    return NextResponse.json({ ok: true, contactId: contact.id });
  } catch (err) {
    const status = err instanceof GHLError ? err.status : 500;
    console.error("[leads] GHL upsert failed", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We couldn't submit that just now. Please email us directly and we'll pick it up.",
      },
      { status: status >= 500 ? 502 : 400 },
    );
  }
}
