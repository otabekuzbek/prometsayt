"use client";
import { useState } from "react";
import { Slider } from "../Icons";

/** "Oldin / keyin" surgichi: sichqoncha, barmoq va klaviatura bilan ishlaydi */
export default function BeforeAfter({ before, after, label = "Oldin va keyin" }: { before: string; after: string; label?: string }) {
  const [x, setX] = useState(50);
  return (
    <div className="ba" style={{ ["--x" as string]: `${x}%` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt="Yangi tom" loading="lazy" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ba-before" src={before} alt="Eski tom" loading="lazy" />
      <span className="ba-label l">Oldin</span>
      <span className="ba-label r">Promet'dan keyin</span>
      <span className="ba-handle" aria-hidden="true"><span className="ba-knob"><Slider size={22} /></span></span>
      <input type="range" min={0} max={100} step={0.5} value={x} onChange={(e) => setX(+e.target.value)} aria-label={label} />
    </div>
  );
}
