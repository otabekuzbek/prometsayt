"use client";
import { useEffect, useRef } from "react";
import type { Step } from "@/lib/types";

/** Vertikal ish tartibi: chiziq skroll bilan to'ladi, raqamlar navbat bilan yonadi */
export default function Process({ title, steps }: { title: string; steps: Step[] }) {
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / Math.max(1, r.height)));
      if (line.current) line.current.style.transform = `scaleY(${prog})`;
      el.querySelectorAll<HTMLElement>(".process-step").forEach((s) => {
        s.classList.toggle("in", s.getBoundingClientRect().top < vh * 0.62);
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="section dark" aria-labelledby="process-title">
      <div className="wrap process">
        <div className="process-head">
          <span className="eyebrow">Ish tartibi</span>
          <h2 className="h-lg" id="process-title">{title}</h2>
        </div>
        <ol className="process-list" ref={list}>
          <span className="process-line" ref={line} aria-hidden="true" />
          {steps.map((s, i) => (
            <li key={i} className="process-step">
              <span className="n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
