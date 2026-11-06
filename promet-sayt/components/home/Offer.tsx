"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Arrow, Gift } from "../Icons";

/** Taklif lentasi. Muddat berilsa — teskari sanoq; muddat o'tgach lenta yashirinadi. */
export default function Offer({ title, text, deadline }: { title: string; text: string; deadline: string }) {
  const end = deadline ? new Date(`${deadline}T23:59:59+05:00`).getTime() : 0;
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!end) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [end]);
  if (end && now !== null && now > end) return null;
  const left = end && now !== null ? Math.max(0, end - now) : 0;
  const parts = [
    [Math.floor(left / 86400000), "kun"],
    [Math.floor(left / 3600000) % 24, "soat"],
    [Math.floor(left / 60000) % 60, "daqiqa"],
    [Math.floor(left / 1000) % 60, "soniya"],
  ] as const;

  return (
    <section className="offer" aria-label="Taklif">
      <div className="wrap">
        <div className="offer-card">
          <span className="offer-badge" aria-hidden="true"><Gift size={26} /></span>
          <div>
            <h2>{title}</h2>
            {text && <p>{text}</p>}
          </div>
          <div className="offer-side">
            {end > 0 && now !== null && (
              <div className="countdown" role="timer" aria-label="Taklif tugashiga qolgan vaqt">
                {parts.map(([v, l]) => (
                  <div key={l}><b>{String(v).padStart(2, "0")}</b><span>{l}</span></div>
                ))}
              </div>
            )}
            <Link href="/aloqa#forma" className="btn btn-green">Usta chaqirish <Arrow size={18} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
