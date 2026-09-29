"use client";

import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import type { LeadFormContent, LeadFormField } from "@/lib/content/defaults";

type Status = "idle" | "submitting" | "success" | "error";

/** Which page's form this is. The server re-reads that page's Sanity
 * config to decide what a submission does in GoHighLevel, so this is the
 * only thing about the form's behaviour the browser gets to choose — and
 * it's a closed set of two. */
export type LeadFormPage = "homepage" | "newSellerPage";

/** A dropdown starts on its first choice, everything else starts empty. */
function initialAnswers(fields: LeadFormField[]): Record<string, string> {
  return Object.fromEntries(
    fields.map((f) => [f.key, f.type === "dropdown" ? (f.options[0] ?? "") : ""]),
  );
}

export function LeadForm({
  content,
  page = "homepage",
}: {
  content: LeadFormContent;
  page?: LeadFormPage;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    initialAnswers(content.fields),
  );

  const setAnswer = (key: string) => (v: string) =>
    setAnswers((a) => ({ ...a, [key]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, name, email, answers, website }),
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={content.namePlaceholder}
            className={inputCls}
          />
        </Field>
        <Field label={content.emailLabel}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={content.emailPlaceholder}
            className={inputCls}
          />
        </Field>
      </div>

      {/* Everything below Name and Email is configured in Sanity →
          Lead Form → Questions, per page. Half-width questions flow into
          the same two-column grid Name and Email use. */}
      <div className="grid gap-x-4 sm:grid-cols-2">
        {content.fields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            optional={!field.required}
            className={field.halfWidth ? "sm:col-span-1" : "sm:col-span-2"}
          >
            {field.type === "dropdown" ? (
              <Dropdown
                options={field.options}
                value={answers[field.key] ?? field.options[0] ?? ""}
                onChange={setAnswer(field.key)}
              />
            ) : field.type === "textarea" ? (
              <textarea
                rows={3}
                required={field.required}
                value={answers[field.key] ?? ""}
                onChange={(e) => setAnswer(field.key)(e.target.value)}
                placeholder={field.placeholder}
                className={`${inputCls} resize-y`}
              />
            ) : (
              <input
                type={field.type === "phone" ? "tel" : "text"}
                required={field.required}
                value={answers[field.key] ?? ""}
                onChange={(e) => setAnswer(field.key)(e.target.value)}
                placeholder={field.placeholder}
                className={inputCls}
              />
            )}
          </Field>
        ))}
      </div>

      {/* honeypot — visually hidden, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
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
  optional = false,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
  className?: string;
}) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="mb-2 block font-mono text-[.64rem] uppercase tracking-[.14em] text-grey">
        {label}
        {optional && <span className="ml-1.5 normal-case tracking-normal opacity-60">(optional)</span>}
      </label>
      {children}
    </div>
  );
}
