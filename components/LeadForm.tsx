"use client";

import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";

const REVENUE = [
  "Haven't launched yet",
  "$0 – $50k",
  "$50k – $250k",
  "$250k – $500k",
  "$500k – $1M+",
];
const PRODUCTS = ["1 product", "2 – 5 products", "5 – 10 products", "10+ products"];
const BUDGET = ["Less than $10k", "$10k – $30k", "$30k – $50k", "$50k+"];

type Status = "idle" | "submitting" | "success" | "error";

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    revenue: REVENUE[0],
    products: PRODUCTS[0],
    budget: BUDGET[0],
    website: "", // honeypot
  });

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Network error. Please check your connection and retry.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-ember/40 bg-ember/10 text-2xl text-ember">
          ✓
        </div>
        <p className="font-display text-lg font-bold">You&apos;re in.</p>
        <p className="max-w-xs text-sm text-grey">
          We&apos;ve got your details — the launch team will reach out within
          one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Your name"
            className={inputCls}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="you@brand.com"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Monthly Revenue on Amazon">
        <Dropdown options={REVENUE} value={form.revenue} onChange={set("revenue")} />
      </Field>
      <Field label="Products Planned This Quarter">
        <Dropdown options={PRODUCTS} value={form.products} onChange={set("products")} />
      </Field>
      <Field label="Est. Launch Budget per Product">
        <Dropdown options={BUDGET} value={form.budget} onChange={set("budget")} />
      </Field>

      {/* honeypot — visually hidden, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={(e) => set("website")(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-primary mt-2 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Book My Strategy Call"}
        {status !== "submitting" && <span className="arrow">→</span>}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-center font-mono text-xs text-ember">
          {error}
        </p>
      )}
    </form>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-line-strong bg-ink/[.03] px-4 py-3.5 text-[.92rem] text-ink transition focus:border-ember focus:outline-none focus:ring-[3px] focus:ring-ember/15";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-2 block font-mono text-[.64rem] uppercase tracking-[.14em] text-grey">
        {label}
      </label>
      {children}
    </div>
  );
}
