"use client";

import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

export function CursorRing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ref.current;
    if (!ring || prefersReducedMotion() || !matchMedia("(pointer:fine)").matches) {
      return;
    }

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    let tickerFn: (() => void) | undefined;
    let cleanup: (() => void) | undefined;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      ring.classList.add("on");
    };
    addEventListener("mousemove", onMove);

    const hoverables = document.querySelectorAll("a, button, .glow-card");
    const onEnter = () => ring.classList.add("hovering");
    const onLeave = () => ring.classList.remove("hovering");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    getGsap().then(({ gsap }) => {
      tickerFn = () => {
        pos.x += (mouse.x - pos.x) * 0.16;
        pos.y += (mouse.y - pos.y) * 0.16;
        ring.style.transform = `translate(${pos.x}px,${pos.y}px) translate(-50%,-50%)`;
      };
      gsap.ticker.add(tickerFn);
    });

    cleanup = () => {
      removeEventListener("mousemove", onMove);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };

    return () => {
      cleanup?.();
      if (tickerFn) getGsap().then(({ gsap }) => gsap.ticker.remove(tickerFn!));
    };
  }, []);

  return <div ref={ref} className="cursor-ring" aria-hidden="true" />;
}
