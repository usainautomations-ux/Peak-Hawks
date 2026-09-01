"use client";

import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import type { LeadFormContent } from "@/lib/content/defaults";

type Status = "idle" | "submitting" | "success" | "error";

export function LeadForm({ content }: { content: LeadFormContent }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    revenue: content.revenueOptions[0] ?? "",
    products: content.productsOptions[0] ?? "",
    budget: content.budgetOptions[0] ?? "",
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
        <p className="font-display text-lg font-bold">{content.successHeading}</p>
        <p className="max-w-xs text-sm text-grey">{content.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={content.nameLabel}>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder={content.namePlaceholder}
            className={inputCls}
          />
        </Field>
        <Field label={content.emailLabel}>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder={content.emailPlaceholder}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label={content.revenueLabel}>
        <Dropdown options={content.revenueOptions} value={form.revenue} onChange={set("revenue")} />
      </Field>
      <Field label={content.productsLabel}>
        <Dropdown options={content.productsOptions} value={form.products} onChange={set("products")} />
      </Field>
      <Field label={content.budgetLabel}>
        <Dropdown options={content.budgetOptions} value={form.budget} onChange={set("budget")} />
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
        {status === "submitting" ? content.submitLoadingLabel : content.submitLabel}
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
