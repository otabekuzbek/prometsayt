"use client";
import { useEffect, useRef } from "react";

const STEPS = [
  { t: "Murojaat", d: "Sayt, telefon yoki Telegram orqali yozasiz. Qulay vaqtni kelishib olamiz." },
  { t: "Bepul o'lchov", d: "Usta joyga kelib tomni o'lchaydi, material va rang namunalarini ko'rsatadi." },
  { t: "Smeta va 3D dizayn", d: "Yozma smeta va tomingizning 3D ko'rinishini tayyorlaymiz. Narx shu yerda qat'iylashadi." },
  { t: "Yetkazish va montaj", d: "List va butlovchi qismlar bir vaqtda keladi, o'z jamoamiz tomni yopadi." },
  { t: "Kafolat hujjati", d: "Ish tugagach raqamli kafolat beramiz va uni reestrga kiritamiz." },
];

/** Desktopda: bo'lim mahkamlanadi, qadamlar skroll bilan gorizontal suriladi. Mobilda — oddiy ro'yxat. */
export default function ProcessScroll() {
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const p = pin.current;
    const t = track.current;
    if (!p || !t) return;
    const mq = window.matchMedia("(min-width: 961px) and (prefers-reduced-motion: no-preference)");
    let raf = 0;
    const layout = () => {
      if (!mq.matches) {
        p.style.height = "";
        t.style.transform = "";
        return;
      }
      const extra = t.scrollWidth - window.innerWidth;
      p.style.height = `${window.innerHeight + Math.max(0, extra)}px`;
      update();
    };
    const update = () => {
      if (!mq.matches) return;
      const r = p.getBoundingClientRect();
      const total = p.offsetHeight - window.innerHeight;
      const prog = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      const extra = t.scrollWidth - window.innerWidth;
      t.style.transform = `translate3d(${-prog * Math.max(0, extra)}px,0,0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${prog})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    layout();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout);
    mq.addEventListener("change", layout);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
      mq.removeEventListener("change", layout);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="dark process-pin" ref={pin} aria-labelledby="process-title">
      <div className="process-sticky section">
        <div className="wrap sec-head" style={{ width: "100%" }}>
          <div>
            <span className="eyebrow">Ish tartibi</span>
            <h2 className="h-lg" id="process-title">Murojaatdan tayyor tomgacha besh qadam</h2>
          </div>
        </div>
        <ol className="process-track" ref={track} style={{ listStyle: "none", margin: 0 }}>
          {STEPS.map((s, i) => (
            <li key={s.t} className={`step-card${i === STEPS.length - 1 ? " final" : ""}`}>
              <span className="num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
          <li aria-hidden="true" style={{ flex: "none", width: "max(1px, calc((100vw - var(--wrap)) / 2))" }} />
        </ol>
        <div className="process-progress" aria-hidden="true" style={{ marginInline: "max(var(--gutter), calc((100vw - var(--wrap)) / 2 + var(--gutter)))" }}><i ref={bar} /></div>
      </div>
    </section>
  );
}
