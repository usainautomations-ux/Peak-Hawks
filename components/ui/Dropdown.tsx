"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Themed dropdown. Native <select> popups are rendered by the OS and
 * cannot be styled — this replaces them while keeping keyboard a11y.
 * Flips upward when it would overflow its containing card.
 */
export function Dropdown({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  function toggle() {
    if (!open && triggerRef.current) {
      const card = triggerRef.current.closest("[data-dropdown-boundary]");
      const tr = triggerRef.current.getBoundingClientRect();
      const listH = Math.min(options.length * 42 + 14, 240);
      const boundaryBottom = card
        ? card.getBoundingClientRect().bottom
        : window.innerHeight;
      const roomBelow = boundaryBottom - tr.bottom - 10;
      const roomAbove = tr.top - (card?.getBoundingClientRect().top ?? 0) - 10;
      setUp(roomBelow < listH && roomAbove > roomBelow);
    }
    setOpen((o) => !o);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) toggle();
      setFocusIdx((i) => {
        const next = e.key === "ArrowDown" ? i + 1 : i - 1;
        return Math.max(0, Math.min(options.length - 1, next));
      });
    }
    if (e.key === "Enter" && open && focusIdx >= 0) {
      e.preventDefault();
      onChange(options[focusIdx]);
      setOpen(false);
    }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={[
          "relative w-full rounded-[10px] border bg-ink/[.03] py-3.5 pl-4 pr-11 text-left text-[.92rem] transition",
          open ? "border-ember ring-[3px] ring-ember/15" : "border-line-strong",
        ].join(" ")}
      >
        {value}
        <span
          className={[
            "absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-2/3 rotate-45 border-b-[1.8px] border-r-[1.8px] border-grey transition-transform",
            open ? "-translate-y-1/4 -rotate-[135deg]" : "",
          ].join(" ")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: up ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: up ? 6 : -6 }}
            transition={{ duration: 0.18 }}
            className={[
              "absolute left-0 right-0 z-[60] max-h-[236px] overflow-y-auto rounded-xl border border-line-strong bg-white p-1.5 shadow-[0_20px_50px_rgba(21,23,26,.18)]",
              up ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
            ].join(" ")}
          >
            {options.map((opt, i) => (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={opt === value}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={[
                  "block w-full rounded-lg px-3.5 py-2.5 text-left text-[.88rem] transition",
                  opt === value
                    ? "font-semibold text-ember"
                    : i === focusIdx
                      ? "bg-ember/10 text-ember"
                      : "text-silver hover:bg-ember/10 hover:text-ember",
                ].join(" ")}
              >
                {opt === value ? "✓ " : ""}
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
