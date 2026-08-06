import { NextResponse } from "next/server";
import { getFreeSlots } from "@/lib/ghl/calendar";

export const runtime = "nodejs";

/**
 * GET /api/booking/slots?start=2026-08-01&end=2026-08-31&tz=America/New_York
 * Returns real availability from the GHL calendar.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const tz = searchParams.get("tz") ?? undefined;

  const start = startParam ? new Date(startParam) : new Date();
  const end = endParam
    ? new Date(endParam)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json(
      { ok: false, error: "Invalid date range" },
      { status: 400 },
    );
  }

  // cap the window so nobody can request a year of slots
  const maxMs = 62 * 24 * 60 * 60 * 1000;
  if (end.getTime() - start.getTime() > maxMs) {
    return NextResponse.json(
      { ok: false, error: "Date range too large (max 62 days)" },
      { status: 400 },
    );
  }

  try {
    const days = await getFreeSlots(start, end, tz);
    return NextResponse.json({ ok: true, days });
  } catch (err) {
    console.error("[booking/slots] failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not load availability" },
      { status: 502 },
    );
  }
}
