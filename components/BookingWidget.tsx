"use client";

import { useEffect, useMemo, useState } from "react";

type DaySlots = { date: string; slots: string[] };
type Step = "picking" | "details" | "booking" | "done";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOWS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function BookingWidget() {
  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  const [view, setView] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [days, setDays] = useState<DaySlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("picking");
  const [details, setDetails] = useState({ name: "", email: "" });
  const [bookError, setBookError] = useState("");

  /* ---- load real availability from GHL ---- */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    const start = new Date(view.getFullYear(), view.getMonth(), 1);
    const end = new Date(view.getFullYear(), view.getMonth() + 1, 0, 23, 59);
    const now = new Date();
    const effectiveStart = start < now ? now : start;

    fetch(
      `/api/booking/slots?start=${effectiveStart.toISOString()}&end=${end.toISOString()}&tz=${encodeURIComponent(tz)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok) setDays(data.days ?? []);
        else setLoadError("Could not load availability.");
      })
      .catch(() => !cancelled && setLoadError("Could not load availability."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [view, tz]);

  const slotsByDate = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const d of days) m.set(d.date, d.slots);
    return m;
  }, [days]);

  async function confirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setStep("booking");
    setBookError("");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, startTime: selectedSlot, timezone: tz }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBookError(data.error ?? "Could not book that slot.");
        setStep("details");
        return;
      }
      setStep("done");
    } catch {
      setBookError("Network error — please try again.");
      setStep("details");
    }
  }

  /* ---- calendar grid ---- */
  const grid = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const cells: (string | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= total; d++) {
      const iso = `${view.getFullYear()}-${String(view.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push(iso);
    }
    return cells;
  }, [view]);

  const canGoBack =
    view > new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  if (step === "done") {
    return (
      <div className="cal-panel flex flex-col items-center justify-center gap-3 p-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-ember/40 bg-ember/10 text-2xl text-ember">
          ✓
        </div>
        <p className="font-display text-lg font-bold">You&apos;re booked!</p>
        <p className="font-mono text-xs uppercase tracking-wider text-grey">
          {selectedSlot &&
            new Date(selectedSlot).toLocaleString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
        </p>
        <p className="text-sm text-grey">
          A calendar invite is on its way to {details.email}.
        </p>
      </div>
    );
  }

  return (
    <div className="cal-panel grid overflow-hidden rounded-3xl border border-line-strong bg-surface lg:grid-cols-[1fr_1.35fr_1fr]">
      {/* meta */}
      <div className="flex flex-col border-b border-line p-9 lg:border-b-0 lg:border-r">
        <div className="mb-4 font-mono text-[.64rem] uppercase tracking-[.2em] text-grey">
          PeakHawks / Bookings
        </div>
        <h3 className="mb-2 font-display text-xl font-bold">Strategy Call</h3>
        <p className="text-sm text-grey">
          A focused session with the launch team to map your next product
          opportunity.
        </p>
        <ul className="mt-6 flex flex-col gap-3 font-mono text-[.68rem] uppercase tracking-wider text-silver">
          <li>◷ 30 minutes</li>
          <li>▣ Google Meet</li>
          <li>◍ {tz}</li>
        </ul>
      </div>

      {/* calendar */}
      <div className="border-b border-line p-9 lg:border-b-0 lg:border-r">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() =>
              setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
            }
            disabled={!canGoBack}
            aria-label="Previous month"
            className="h-9 w-9 rounded-[9px] border border-line-strong text-grey transition hover:border-ember hover:text-ember disabled:opacity-30"
          >
            ‹
          </button>
          <span className="font-display font-bold">
            {MONTHS[view.getMonth()]} {view.getFullYear()}
          </span>
          <button
            onClick={() =>
              setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
            }
            aria-label="Next month"
            className="h-9 w-9 rounded-[9px] border border-line-strong text-grey transition hover:border-ember hover:text-ember"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {DOWS.map((d) => (
            <div
              key={d}
              className="py-2 font-mono text-[.58rem] uppercase tracking-wider text-grey"
            >
              {d}
            </div>
          ))}
          {grid.map((iso, i) => {
            if (!iso) return <div key={`e${i}`} />;
            const has = (slotsByDate.get(iso)?.length ?? 0) > 0;
            const isSel = selectedDate === iso;
            return (
              <button
                key={iso}
                disabled={!has}
                onClick={() => {
                  setSelectedDate(iso);
                  setSelectedSlot(null);
                  setStep("picking");
                }}
                className={[
                  "aspect-square rounded-[10px] border text-[.84rem] transition",
                  isSel
                    ? "border-transparent bg-ember font-bold text-bg shadow-[0_2px_0_#A64500]"
                    : has
                      ? "border-line bg-ink/[.02] text-silver hover:border-ember hover:text-ember"
                      : "cursor-default border-transparent text-silver/20",
                ].join(" ")}
              >
                {Number(iso.slice(-2))}
              </button>
            );
          })}
        </div>
        {loading && (
          <p className="mt-4 text-center font-mono text-[.65rem] uppercase tracking-wider text-grey">
            Loading availability…
          </p>
        )}
        {loadError && (
          <p className="mt-4 text-center font-mono text-[.65rem] text-ember">
            {loadError}
          </p>
        )}
      </div>

      {/* slots / details */}
      <div className="flex flex-col gap-2.5 p-9">
        {step === "details" ? (
          <form onSubmit={confirmBooking} className="flex flex-col gap-3">
            <div className="font-mono text-[.64rem] uppercase tracking-[.16em] text-grey">
              Your details
            </div>
            <input
              required
              placeholder="Your name"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              className="rounded-[10px] border border-line-strong bg-ink/[.03] px-4 py-3 text-sm focus:border-ember focus:outline-none"
            />
            <input
              required
              type="email"
              placeholder="you@brand.com"
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              className="rounded-[10px] border border-line-strong bg-ink/[.03] px-4 py-3 text-sm focus:border-ember focus:outline-none"
            />
            <button type="submit" className="btn-primary mt-1 w-full justify-center">
              Confirm Booking
            </button>
            <button
              type="button"
              onClick={() => setStep("picking")}
              className="font-mono text-[.65rem] uppercase tracking-wider text-grey hover:text-ember"
            >
              ← Back to times
            </button>
            {bookError && (
              <p role="alert" className="font-mono text-[.65rem] text-ember">
                {bookError}
              </p>
            )}
          </form>
        ) : step === "booking" ? (
          <p className="my-auto text-center font-mono text-[.7rem] uppercase tracking-wider text-grey">
            Booking your call…
          </p>
        ) : (
          <>
            <div className="font-mono text-[.64rem] uppercase tracking-[.16em] text-grey">
              {selectedDate
                ? new Date(selectedDate + "T00:00").toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })
                : "Available times"}
            </div>
            {!selectedDate ? (
              <p className="my-auto text-center text-sm text-grey">
                Select a date to see
                <br />
                available time slots
              </p>
            ) : (
              /* scrollable so many slots never stretch the panel taller than the calendar */
              <div className="flex max-h-[336px] flex-col gap-2.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {(slotsByDate.get(selectedDate) ?? []).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setStep("details");
                    }}
                    className="flex-none rounded-[10px] border border-line-strong py-3 text-center font-mono text-[.8rem] text-silver transition hover:border-ember hover:text-ember"
                  >
                    {new Date(slot).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
