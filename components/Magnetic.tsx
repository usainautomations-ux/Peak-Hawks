"use client";

import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Wraps a button/anchor so it pulls toward the cursor and snaps back with
 * an elastic bounce on leave. Desktop + fine-pointer only.
 */
export function Magnetic({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = ref.current;
    const el = wrap?.firstElementChild as HTMLElement | null;
    if (!el || prefersReducedMotion() || !matchMedia("(pointer:fine)").matches) {
      return;
    }

    let xTo: (v: number) => void;
    let yTo: (v: number) => void;
    let cleanup: (() => void) | undefined;

    getGsap().then(({ gsap }) => {
      xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      };
      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,.4)" });
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanup = () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => cleanup?.();
  }, []);

  return <div ref={ref} className="contents">{children}</div>;
}
