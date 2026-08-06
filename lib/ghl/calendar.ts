import { ghlFetch, getLocationId } from "./client";

/**
 * GHL returns free slots grouped by date:
 * { "2026-08-03": { slots: ["2026-08-03T09:00:00-04:00", ...] }, traceId: "..." }
 */
type FreeSlotsResponse = Record<string, { slots?: string[] } | unknown> & {
  traceId?: string;
};

export type DaySlots = { date: string; slots: string[] };

function calendarId(): string {
  const id = process.env.GHL_CALENDAR_ID;
  if (!id) throw new Error("Missing GHL_CALENDAR_ID");
  return id;
}

/**
 * Free slots between two dates. GHL wants epoch milliseconds.
 * timezone is an IANA name, e.g. "America/New_York".
 */
export async function getFreeSlots(
  startDate: Date,
  endDate: Date,
  timezone?: string,
): Promise<DaySlots[]> {
  const raw = await ghlFetch<FreeSlotsResponse>(
    `/calendars/${calendarId()}/free-slots`,
    {
      method: "GET",
      query: {
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        timezone,
      },
      // slots move constantly — cache only briefly
      next: { revalidate: 60 },
    },
  );

  const days: DaySlots[] = [];
  for (const [key, value] of Object.entries(raw)) {
    if (key === "traceId" || !value || typeof value !== "object") continue;
    const slots = (value as { slots?: string[] }).slots;
    if (Array.isArray(slots) && slots.length) days.push({ date: key, slots });
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

export type BookAppointmentInput = {
  contactId: string;
  /** ISO datetime string from the free-slots response. */
  startTime: string;
  endTime?: string;
  title?: string;
  timezone?: string;
};

export async function bookAppointment(input: BookAppointmentInput) {
  return ghlFetch("/calendars/events/appointments", {
    method: "POST",
    body: {
      locationId: getLocationId(),
      calendarId: calendarId(),
      contactId: input.contactId,
      startTime: input.startTime,
      ...(input.endTime ? { endTime: input.endTime } : {}),
      title: input.title ?? "Strategy Call — PeakHawks",
      appointmentStatus: "confirmed",
      ignoreFreeSlotValidation: false,
      ...(input.timezone ? { toNotify: true } : {}),
    },
  });
}
