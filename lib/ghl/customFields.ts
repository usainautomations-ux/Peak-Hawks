import { ghlFetch, getLocationId } from "./client";

/**
 * Resolving a custom field's key to its GoHighLevel id.
 *
 * A contact upsert can name a custom field by `key` or by `id`. Naming it
 * by key alone is the fragile option: GoHighLevel matches on the field's
 * id, and a key that doesn't resolve is dropped from the write silently —
 * the contact is still created, the tags still apply, and the field is
 * simply left empty. Nothing in the response says so, which makes it a
 * horrible bug to find from the outside.
 *
 * So the key is resolved to an id here first, and both are sent. If the
 * lookup can't be done (no scope, network trouble) the write still goes
 * out by key, because a lead captured without one field beats no lead.
 */

type GHLCustomFieldDef = {
  id?: string;
  name?: string;
  fieldKey?: string;
  dataType?: string;
};

/**
 * GoHighLevel reports keys as `contact.monthly_amazon_revenue`; Sanity
 * stores the bare `monthly_amazon_revenue`. Compare on the bare form so
 * both spellings work, and so pasting the prefixed version into the
 * Studio isn't a silent misconfiguration.
 */
export function bareFieldKey(key: string): string {
  return key.trim().replace(/^contact\./, "").toLowerCase();
}

/** The field list changes rarely and a lead submission shouldn't wait on
 * it every time — but it must not go stale for long either, or a field
 * created to fix a mapping looks like it didn't work. */
const TTL_MS = 5 * 60 * 1000;

let cache: { at: number; byKey: Map<string, string> } | null = null;

/** key (bare, lowercased) → GoHighLevel custom field id. */
export async function getCustomFieldIds(): Promise<Map<string, string>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.byKey;

  const res = await ghlFetch<{ customFields?: GHLCustomFieldDef[] }>(
    `/locations/${getLocationId()}/customFields`,
  );

  const byKey = new Map<string, string>();
  for (const field of res?.customFields ?? []) {
    if (field.fieldKey && field.id) byKey.set(bareFieldKey(field.fieldKey), field.id);
  }

  cache = { at: Date.now(), byKey };
  return byKey;
}

/** Drops the cache — used by tests, and after anything that would change
 * the field list. */
export function clearCustomFieldCache() {
  cache = null;
}

export type ResolvedCustomField = {
  id?: string;
  key: string;
  field_value: string;
};

/**
 * Turns `{ key, value }` answers into what the upsert should send.
 *
 * Whatever happens, every answer stays in the returned list: an
 * unresolved key is still sent by key (it may yet match) and is named in
 * `unresolved` so the caller can log it. The answers also reach the
 * contact's timeline note separately, so nothing is lost either way.
 */
export async function resolveCustomFields(
  fields: Array<{ key: string; field_value: string }>,
): Promise<{ resolved: ResolvedCustomField[]; unresolved: string[]; lookupFailed: boolean }> {
  if (!fields.length) return { resolved: [], unresolved: [], lookupFailed: false };

  let byKey: Map<string, string> | null = null;
  let lookupFailed = false;

  try {
    byKey = await getCustomFieldIds();
  } catch (err) {
    lookupFailed = true;
    console.warn(
      "[ghl] could not read the custom field list — sending by key alone. " +
        "The token may be missing the locations.readonly scope.",
      err,
    );
  }

  const unresolved: string[] = [];
  const resolved = fields.map((f) => {
    const id = byKey?.get(bareFieldKey(f.key));
    if (!id && byKey) unresolved.push(f.key);
    return id ? { id, key: f.key, field_value: f.field_value } : { key: f.key, field_value: f.field_value };
  });

  return { resolved, unresolved, lookupFailed };
}
