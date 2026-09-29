import { NextResponse } from "next/server";
import { z } from "zod";
import {
  upsertContact,
  createOpportunity,
  addContactNote,
} from "@/lib/ghl/crm";
import { GHLError } from "@/lib/ghl/client";
import { getMergedLeadForm, type LeadFormPage } from "@/lib/content/merged";
import type { LeadFormContent } from "@/lib/content/defaults";
import { rateLimited, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * The browser sends the visitor's name, email and their answers keyed by
 * question — and nothing else. Which questions exist, where each answer
 * belongs in GoHighLevel, which tags to apply and what the pipeline deal
 * is called are all read from Sanity here, server-side.
 *
 * That split is deliberate. All of it is client-editable now, and if the
 * form posted its own tags or custom field keys, anyone could craft a
 * request that tags them into whatever GHL workflow they liked.
 */
const LeadSchema = z.object({
  page: z.enum(["homepage", "newSellerPage"]).default("homepage"),
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Valid email required"),
  /** Answers by question key — see LEAD_FORM_PROJECTION in lib/sanity/queries.ts. */
  answers: z.record(z.string().max(2000)).default({}),
  // Honeypot — bots fill it, humans never see it. Deliberately NOT
  // constrained to max(0): that made a filled honeypot fail schema
  // validation and return a 400, telling the bot it had been spotted and
  // leaving the "pretend success" branch below unreachable.
  website: z.string().max(200).optional(),
});

type Answer = { label: string; value: string };

/**
 * Matches the submitted answers against the questions the page actually
 * asks. Anything not asked for is dropped, and a dropdown answer that
 * isn't one of its configured choices is rejected rather than forwarded —
 * the alternative is letting a crafted request write arbitrary strings
 * into the CRM.
 */
function collectAnswers(config: LeadFormContent, submitted: Record<string, string>) {
  const answers: Answer[] = [];
  const customFields: Array<{ key: string; field_value: string }> = [];
  let phone: string | undefined;

  for (const field of config.fields) {
    const value = (submitted[field.key] ?? "").trim();

    if (!value) {
      if (field.required) {
        return { error: `${field.label} is required.` } as const;
      }
      continue;
    }

    if (field.type === "dropdown" && !field.options.includes(value)) {
      return { error: `Please pick one of the listed options for "${field.label}".` } as const;
    }

    answers.push({ label: field.label, value });

    if (field.target === "phone") {
      phone = value.slice(0, 40);
    } else if (field.target === "customField" && field.ghlField) {
      customFields.push({ key: field.ghlField, field_value: value });
    }
  }

  return { answers, customFields, phone } as const;
}

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

  const config = await getMergedLeadForm(data.page as LeadFormPage);

  const collected = collectAnswers(config, data.answers);
  if ("error" in collected) {
    return NextResponse.json({ ok: false, error: collected.error }, { status: 400 });
  }

  const [firstName, ...rest] = data.name.trim().split(/\s+/);

  try {
    const contact = await upsertContact({
      firstName,
      lastName: rest.join(" ") || undefined,
      email: data.email,
      phone: collected.phone,
      source: config.source,
      tags: config.tags,
      // These keys must exist in GHL: Settings → Custom Fields. They're set
      // per question in Sanity → Lead Form → Questions.
      customFields: collected.customFields,
    });

    // Everything below is best-effort: a misconfigured pipeline or a
    // rejected note should never lose us a lead we've already captured.

    // The note is the safety net for the whole thing — every answer lands
    // on the contact's timeline verbatim, so a custom field key that
    // doesn't match anything in GHL costs readability, not the answer.
    if (collected.answers.length) {
      try {
        await addContactNote(
          contact.id,
          [
            `Website form (${data.page === "newSellerPage" ? "New Sellers page" : "Homepage"})`,
            "",
            ...collected.answers.map((a) => `${a.label}: ${a.value}`),
          ].join("\n"),
        );
      } catch (err) {
        console.error("[leads] note creation failed", err);
      }
    }

    try {
      await createOpportunity({
        contactId: contact.id,
        name: config.opportunityName.replace(/\{\{\s*name\s*\}\}/g, data.name.trim()),
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
