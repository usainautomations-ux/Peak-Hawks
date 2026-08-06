import { ghlFetch, getLocationId } from "./client";

/* ------------------------------------------------------------------ */
/* Contacts                                                            */
/* ------------------------------------------------------------------ */

export type UpsertContactInput = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  source?: string;
  tags?: string[];
  /** GHL custom field values, keyed by the field's *key* or id. */
  customFields?: Array<{ key?: string; id?: string; field_value: string }>;
};

export type GHLContact = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  locationId: string;
};

/**
 * Upsert avoids duplicate contacts when someone submits twice —
 * GHL matches on email/phone within the location.
 */
export async function upsertContact(
  input: UpsertContactInput,
): Promise<GHLContact> {
  const res = await ghlFetch<{ contact: GHLContact }>("/contacts/upsert", {
    method: "POST",
    body: {
      locationId: getLocationId(),
      ...input,
    },
  });
  return res.contact;
}

export async function addContactTags(contactId: string, tags: string[]) {
  return ghlFetch(`/contacts/${contactId}/tags`, {
    method: "POST",
    body: { tags },
  });
}

/** Fire a note onto the contact timeline — useful for chatbot transcripts. */
export async function addContactNote(contactId: string, body: string) {
  return ghlFetch(`/contacts/${contactId}/notes`, {
    method: "POST",
    body: { body },
  });
}

/* ------------------------------------------------------------------ */
/* Opportunities (pipeline deals)                                      */
/* ------------------------------------------------------------------ */

export type CreateOpportunityInput = {
  contactId: string;
  name: string;
  /** Monetary value estimate, optional. */
  monetaryValue?: number;
  status?: "open" | "won" | "lost" | "abandoned";
};

export async function createOpportunity(input: CreateOpportunityInput) {
  const pipelineId = process.env.GHL_PIPELINE_ID;
  const stageId = process.env.GHL_PIPELINE_STAGE_ID;

  // Pipeline is optional — if not configured, we just skip deal creation
  // rather than failing the whole lead submission.
  if (!pipelineId || !stageId) return null;

  return ghlFetch("/opportunities/", {
    method: "POST",
    body: {
      locationId: getLocationId(),
      pipelineId,
      pipelineStageId: stageId,
      contactId: input.contactId,
      name: input.name,
      status: input.status ?? "open",
      monetaryValue: input.monetaryValue,
    },
  });
}
