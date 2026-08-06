/** Flight-data strip above each section: SEC.0x // LABEL — ALT x,xxx FT ——— */
export function SecMeta({
  num,
  label,
  dark = false,
}: {
  num: number;
  label: string;
  dark?: boolean;
}) {
  const alt = (num * 3200).toLocaleString();
  return (
    <div
      className={[
        "mb-12 flex items-center gap-3.5 font-mono text-[.6rem] uppercase tracking-[.22em]",
        dark ? "text-[#8E8E95]" : "text-grey",
      ].join(" ")}
    >
      SEC.{String(num).padStart(2, "0")}
      <span className={dark ? "text-[#6A6A70]" : "text-grey/60"}>//</span>
      <b className="font-medium text-ember">{label}</b>
      <span>ALT {alt} FT</span>
      <span className={["h-px flex-1", dark ? "bg-white/10" : "bg-line"].join(" ")} />
    </div>
  );
}
