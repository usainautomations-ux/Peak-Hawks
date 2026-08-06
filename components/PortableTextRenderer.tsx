import { SanityImage as Image } from "@/components/ui/SanityImage";
import type { PortableTextComponents } from "@portabletext/react";
import { imageUrl } from "@/lib/sanity/client";

/**
 * Base Portable Text component overrides — maps Sanity's rich-text block
 * types to styled JSX. Shared by the Blog post page and the Case Study
 * page so both render body copy identically. Case Study bodies add one
 * extra block type ("stat") on top of this via `caseStudyPortableTextComponents`.
 */
export const basePortableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-5 leading-[1.78] text-grey">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-12 font-display text-2xl font-bold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 font-display text-xl font-bold">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-4 border-ember pl-6 text-[1.05rem] italic text-grey">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    code: ({ children }) => (
      <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[.88em] text-ember">
        {children}
      </code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="border-b border-ember/40 text-ember transition hover:border-ember"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-5 ml-5 list-disc space-y-2 text-grey">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-5 ml-5 list-decimal space-y-2 text-grey">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  types: {
    // Inline image in body
    image: ({ value }) => {
      const src = imageUrl(value, { w: 1200, q: 85 });
      if (!src) return null;
      return (
        <figure className="my-10 overflow-hidden rounded-[14px] bg-surface-2">
          <Image
            src={src}
            alt={value.alt ?? ""}
            width={1200}
            height={675}
            className="w-full object-contain"
          />
          {value.caption && (
            <figcaption className="mt-3 text-center font-mono text-[.68rem] uppercase tracking-wider text-grey">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    // Callout box
    callout: ({ value }) => {
      const styles: Record<string, string> = {
        tip: "border-emerald-400 bg-emerald-50 text-emerald-800",
        warning: "border-amber-400 bg-amber-50 text-amber-800",
        note: "border-ember/40 bg-orange-50 text-ember",
      };
      const labels: Record<string, string> = {
        tip: "✓ Tip",
        warning: "⚠ Warning",
        note: "◎ Note",
      };
      const cls = styles[value.type] ?? styles.note;
      return (
        <div className={`my-8 rounded-[12px] border-l-4 p-5 ${cls}`}>
          <div className="mb-1 font-mono text-[.7rem] font-bold uppercase tracking-wider">
            {labels[value.type] ?? "Note"}
          </div>
          <p className="m-0 text-[.95rem] leading-relaxed">{value.text}</p>
        </div>
      );
    },
  },
};

/** Blog posts use the base config as-is. */
export const blogPortableTextComponents: PortableTextComponents = basePortableTextComponents;

/** Case studies add one extra block type: a highlighted stat callout
 * (e.g. "$1M+ — Year one revenue"), used to punctuate the narrative
 * with proof numbers mid-story. */
export const caseStudyPortableTextComponents: PortableTextComponents = {
  ...basePortableTextComponents,
  types: {
    ...basePortableTextComponents.types,
    stat: ({ value }) => (
      <div className="my-10 rounded-[16px] border border-line-strong bg-[radial-gradient(500px_180px_at_50%_-10%,rgba(234,92,0,.10),transparent_70%),#FFFFFF] p-8 text-center">
        <div className="font-mono text-[clamp(2rem,4vw,2.8rem)] font-bold text-ember">
          {value.value}
        </div>
        <div className="mt-1.5 font-mono text-[.7rem] uppercase tracking-wider text-grey">
          {value.label}
        </div>
      </div>
    ),
  },
};
