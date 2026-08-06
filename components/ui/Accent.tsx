/**
 * Renders `text` with `accent` (if it appears in it) in orange.
 *
 * Every section heading on both pages uses this, so the client only ever
 * has to learn one rule: type the heading normally, then copy the exact
 * words that should be orange into the "Orange part of the heading" field
 * next to it. If the accent isn't found the heading still renders — just
 * without the highlight — so a typo can never blank out a heading.
 */
export function Accent({
  text,
  accent,
  className = "text-ember",
}: {
  text?: string;
  accent?: string;
  className?: string;
}) {
  const body = text ?? "";
  const a = accent?.trim();
  if (!a) return <>{body}</>;
  const i = body.indexOf(a);
  if (i === -1) return <>{body}</>;
  return (
    <>
      {body.slice(0, i)}
      <span className={className}>{a}</span>
      {body.slice(i + a.length)}
    </>
  );
}
