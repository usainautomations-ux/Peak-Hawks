import { GHLError } from "./client";

/**
 * Turns whatever `getFreeSlots` / `bookAppointment` threw into a message
 * that actually says what's wrong, instead of the blanket "Could not
 * load availability" every failure used to collapse into.
 *
 * That blanket message was indistinguishable whether the cause was:
 *   - GHL_CALENDAR_ID / GHL_PRIVATE_TOKEN / GHL_LOCATION_ID never being
 *     set on the deployment (the #1 cause right after a fresh Vercel
 *     import — the env vars exist in .env.local on your machine but were
 *     never added to Vercel's Project Settings)
 *   - a private integration token that doesn't have the calendar scopes
 *   - a calendar ID that's wrong or belongs to a different sub-account
 *   - GHL's API itself being down or rate-limiting
 *
 * Only the FIRST case is fixable by the site owner without touching
 * code (add the env var in Vercel and redeploy), so it gets its own
 * specific, spelled-out message. The rest still get a real explanation,
 * not a generic string, since the exact GHL error is worth showing
 * rather than hiding behind "something went wrong" — nothing here is a
 * secret (no token value ever appears, only env var *names* and GHL's
 * own status/response).
 */
export function describeGhlFailure(err: unknown): { message: string; status: number } {
  if (err instanceof Error && /^Missing required env var: (\w+)/.test(err.message)) {
    const varName = err.message.replace("Missing required env var: ", "");
    return {
      message:
        `Booking isn't configured yet — ${varName} is missing from this deployment's ` +
        `environment variables. In Vercel: Project → Settings → Environment Variables, ` +
        `add ${varName}, then redeploy.`,
      status: 500,
    };
  }

  if (err instanceof GHLError) {
    if (err.status === 401 || err.status === 403) {
      return {
        message:
          "GHL rejected the request (unauthorized). The Private Integration token is " +
          "missing the calendar scopes, or has been revoked/rotated — check " +
          "GHL_PRIVATE_TOKEN and the token's scopes.",
        status: 502,
      };
    }
    if (err.status === 404) {
      return {
        message:
          "GHL couldn't find that calendar. Double-check GHL_CALENDAR_ID matches a " +
          "real calendar in the same sub-account as GHL_LOCATION_ID.",
        status: 502,
      };
    }
    return {
      message: `GHL returned an error (status ${err.status}). Check the server logs for details.`,
      status: 502,
    };
  }

  return { message: "Could not reach the booking service — please try again shortly.", status: 502 };
}
