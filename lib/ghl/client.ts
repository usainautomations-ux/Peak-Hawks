/**
 * GoHighLevel API v2 client.
 *
 * Auth: Private Integration Token (Settings → Integrations → Private Integrations).
 * V1 API keys are end-of-life — do not use them.
 *
 * Every request is server-side only. The token must never reach the browser.
 */

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

export class GHLError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "GHLError";
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function getLocationId(): string {
  return requireEnv("GHL_LOCATION_ID");
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** Retry on 429 / 5xx. Default 2. */
  retries?: number;
  /** Next.js fetch cache options — used for content reads. */
  next?: { revalidate?: number; tags?: string[] };
};

export async function ghlFetch<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, retries = 2, next } = opts;

  const url = new URL(path.startsWith("/") ? path : `/${path}`, GHL_BASE);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const token = requireEnv("GHL_PRIVATE_TOKEN");

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Version: GHL_VERSION,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        // content reads can be cached; writes never are
        ...(next && method === "GET" ? { next } : { cache: "no-store" as const }),
      });

      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries) {
          // exponential backoff: 400ms, 1200ms
          await new Promise((r) => setTimeout(r, 400 * Math.pow(3, attempt)));
          continue;
        }
      }

      const text = await res.text();
      const data = text ? safeJson(text) : null;

      if (!res.ok) {
        throw new GHLError(
          `GHL ${method} ${path} failed (${res.status})`,
          res.status,
          data,
        );
      }

      return data as T;
    } catch (err) {
      lastErr = err;
      if (err instanceof GHLError && err.status < 500 && err.status !== 429) {
        throw err; // client error — retrying won't help
      }
      if (attempt === retries) break;
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new GHLError("GHL request failed", 500, lastErr);
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
