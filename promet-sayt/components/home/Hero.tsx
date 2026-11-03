"use client";
import { useState } from "react";
import Link from "next/link";
import RoofScene from "../RoofScene";
import { ROOF_COLORS } from "@/lib/utils";
import { Arrow, Drag } from "../Icons";

export default function Hero({
  location,
  title,
  text,
  facts,
}: {
  location: string;
  title: string;
  text: string;
  facts: { value: string; label: string }[];
}) {
  const [color, setColor] = useState(ROOF_COLORS[1]);
  // Sarlavhani nuqta bo'yicha qatorlarga bo'lamiz — har biri alohida ko'tariladi
  const lines = title.split(/(?<=\.)\s+/).filter(Boolean);

  return (
    <section className="hero blueprint">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          {location && <span className="script fade-in">{location}</span>}
          <h1 className="h-xl">
            {lines.map((l, i) => (
              <span className="line" key={i}><span>{l}</span></span>
            ))}
          </h1>
          <p className="hero-text fade-in">{text}</p>
          <div className="hero-actions fade-in on-dark">
            <Link href="/aloqa#forma" className="btn btn-green">Bepul o&apos;lchovga yozilish <Arrow size={18} /></Link>
            <Link href="/kalkulyator" className="btn btn-ghost">Narxni hisoblash</Link>
          </div>
          <div className="color-dock fade-in-2">
            <span className="color-dock-label">Tom rangini tanlang: <b>{color.name}, RAL {color.ral}</b></span>
            <div className="color-dots" role="group" aria-label="Tom rangi">
              {ROOF_COLORS.map((c) => (
                <button
                  key={c.ral}
                  type="button"
                  className="color-dot"
                  style={{ background: c.hex }}
                  aria-pressed={c.ral === color.ral}
                  aria-label={`${c.name}, RAL ${c.ral}`}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="hero-stage">
          <RoofScene color={color.hex} intro label={`Do'ppi tomli uyning 3D ko'rinishi, tom rangi ${color.name}. Aylantirish uchun suring.`} />
          <span className="drag-hint"><Drag size={18} /> Suring — uyni aylantiring</span>
        </div>
      </div>
      <div className="wrap" style={{ position: "relative", zIndex: 1, width: "100%" }}>
        <div className="hero-facts">
          {facts.map((f) => (
            <div key={f.label}><b>{f.value}</b><span>{f.label}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
