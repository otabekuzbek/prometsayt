"use client";
import { useEffect } from "react";

/** Silliq skroll (Lenis) — faqat sichqonchali qurilmalarda */
export default function Motion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // telefonda tabiiy skroll qoladi
    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let alive = true;
    import("lenis").then(({ default: Lenis }) => {
      if (!alive) return;
      lenis = new Lenis({ duration: 1.15, easing: (t: number) => 1 - Math.pow(1 - t, 3), anchors: { offset: -80 } } as never);
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
