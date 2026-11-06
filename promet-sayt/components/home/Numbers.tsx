"use client";
import { useEffect, useRef, useState } from "react";
import type { Stat } from "@/lib/types";

/** Raqam ko'rinishga kirganda 0 dan sanab chiqadi ("15 yil" → 0…15 yil). Raqamsiz qiymat o'zgarmaydi. */
function Count({ value }: { value: string }) {
  const m = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  const target = m ? parseFloat(m[2].replace(",", ".")) : 0;
  const [v, setV] = useState(m ? 0 : target);
  const el = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!m || !el.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setV(target);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 1600);
        setV(target * (1 - Math.pow(1 - k, 4)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el.current);
    return () => io.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  if (!m) return <b>{value}</b>;
  const dec = m[2].includes(".") || m[2].includes(",") ? 1 : 0;
  return <b ref={el}>{m[1]}{v.toFixed(dec)}{m[3]}</b>;
}

export default function Numbers({ stats }: { stats: Stat[] }) {
  return (
    <div className="numbers">
      {stats.map((s) => (
        <div key={s.label}>
          <Count value={s.value} />
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
