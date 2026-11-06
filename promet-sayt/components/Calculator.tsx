"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Pricing, RoofColor } from "@/lib/types";
import { ROOF_COLORS, mln, som } from "@/lib/utils";

import LeadForm from "./LeadForm";
import RoofScene, { type RoofShape } from "./RoofScene";
import { Arrow } from "./Icons";

const SHAPES: { id: RoofShape; label: string; hint: string; path: string }[] = [
  { id: "doppi", label: "Do'ppi tom", hint: "Markazi ko'tarilgan", path: "M6 46 L34 28 L46 28 L60 10 L74 28 L86 28 L114 46 Z" },
  { id: "tort", label: "To'rt qiyalik", hint: "Konvert shaklida", path: "M6 46 L38 20 L82 20 L114 46 Z" },
  { id: "ikki", label: "Ikki qiyalik", hint: "Klassik uchburchak", path: "M10 46 L60 12 L110 46 Z" },
  { id: "bir", label: "Bir qiyalik", hint: "Ayvon, ombor", path: "M10 46 L110 18 L110 46 Z" },
];

const STEPS = ["Shakl", "Material", "O'lcham", "Natija"];

/** Sonni silliq o'zgartirib ko'rsatadi */
function useTween(value: number, ms = 600) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const cur = a + (value - a) * e;
      setV(cur);
      from.current = cur;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return v;
}

function Slider({ id, label, value, min, max, step, unit, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (n: number) => void }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider">
      <div className="slider-head">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{value % 1 ? value.toFixed(1) : value} {unit}</output>
      </div>
      <input id={id} type="range" className="range" min={min} max={max} step={step} value={value} style={{ ["--p" as string]: `${p}%` }} onChange={(e) => onChange(+e.target.value)} />
    </div>
  );
}

export default function Calculator({ pricing, colors: palette, withForm = true }: { pricing: Pricing; colors?: RoofColor[]; withForm?: boolean }) {
  const COLORS = palette && palette.length ? palette : ROOF_COLORS;
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState(0);
  const [shape, setShape] = useState<RoofShape>("doppi");
  const [material, setMaterial] = useState<"cherepitsa" | "profnastil">("cherepitsa");
  const [color, setColor] = useState(COLORS[0]);
  const [length, setLength] = useState(14);
  const [width, setWidth] = useState(11);
  const [angle, setAngle] = useState(28);
  const [overhang, setOverhang] = useState(0.6);

  // Bosh sahifadagi konfiguratordan kelgan rang: /kalkulyator?rang=%2345494E
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("rang");
    const hit = q && COLORS.find((c) => c.hex.toLowerCase() === q.toLowerCase());
    if (hit) setColor(hit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (n: number) => {
    setStep(n);
    setVisited((v) => Math.max(v, n));
  };

  const r = useMemo(() => {
    const Lp = Math.max(length, width) + 2 * overhang;
    const Wp = Math.min(length, width) + 2 * overhang;
    const rad = (angle * Math.PI) / 180;
    const factor = shape === "doppi" ? 1.12 : 1;
    const area = ((Lp * Wp) / Math.cos(rad)) * factor;
    const complex = shape === "tort" || shape === "doppi";
    const waste = material === "cherepitsa" ? (complex ? 1.15 : 1.1) : complex ? 1.1 : 1.06;
    const sheetArea = area * waste;
    const h = (Wp / 2) * Math.tan(rad);
    const hip = Math.sqrt((Wp / 2) ** 2 * 2 + h * h);
    const ridge = shape === "bir" ? 0 : shape === "ikki" ? Lp : shape === "tort" ? Lp - Wp + 4 * hip : (Lp - Wp + 4 * hip) * 1.3;
    const eaves = shape === "bir" ? Lp : shape === "ikki" ? 2 * Lp : 2 * (Lp + Wp);
    const pipes = Math.max(shape === "bir" ? 1 : 2, Math.ceil(eaves / 10));
    const screws = Math.ceil((sheetArea * 8) / 250) * 250;
    const membrane = Math.ceil((area * 1.15) / 75);
    const min = material === "cherepitsa" ? pricing.cherepitsaMin : pricing.profnastilMin;
    const max = material === "cherepitsa" ? pricing.cherepitsaMax : pricing.profnastilMax;
    const round = (n: number) => Math.round(n / 100000) * 100000;
    return {
      area, sheetArea, ridge, eaves, pipes, screws, membrane,
      matMin: round(sheetArea * min), matMax: round(sheetArea * max),
      keyMin: round(area * pricing.turnkeyMin), keyMax: round(area * pricing.turnkeyMax),
    };
  }, [length, width, overhang, angle, shape, material, pricing]);

  const keyMinT = useTween(r.keyMin);
  const keyMaxT = useTween(r.keyMax);
  const areaT = useTween(r.area);

  const shapeLabel = SHAPES.find((s) => s.id === shape)!.label;
  const matLabel = material === "cherepitsa" ? "Metallocherepitsa" : "Profnastil";
  const summary = [
    `${shapeLabel}, ${matLabel}, ${color.name}${color.ral ? ` (RAL ${color.ral})` : ""}`,
    `Uy: ${length} × ${width} m, qiyalik ${angle}°, svess ${overhang} m`,
    `Tom maydoni ≈ ${r.area.toFixed(0)} m², list ≈ ${r.sheetArea.toFixed(0)} m²`,
    `Material: ${som(r.matMin)} – ${som(r.matMax)}`,
    `Montaj bilan: ${som(r.keyMin)} – ${som(r.keyMax)}`,
  ].join("\n");

  return (
    <div className="calc">
      <div className="calc-stage">
        <RoofScene color={color.hex} shape={shape} material={material} time="golden" view="orbit" label={`${shapeLabel}, ${matLabel}, rang ${color.name}. 3D ko'rinish.`} />
        <div className="calc-total" aria-live="polite">
          <div className="print-only">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Promet Tom Markazi" style={{ height: 36, width: "auto", marginBottom: 10 }} />
            <p>Taxminiy smeta, {new Date().toLocaleDateString("ru-RU")}</p>
            <p style={{ whiteSpace: "pre-line", margin: "10px 0" }}>{summary}</p>
          </div>
          <span>Montaj bilan taxminiy narx, tom ≈ {areaT.toFixed(0)} m²</span>
          <b>{mln(keyMinT)} – {mln(keyMaxT)} so&apos;m</b>
          <small>Aniq narx bepul o&apos;lchovdan keyin yozma smetada qat&apos;iylashadi.</small>
        </div>
      </div>

      <div className="calc-panel">
        <nav className="wiz-steps" aria-label="Kalkulyator bosqichlari">
          {STEPS.map((s, i) => (
            <button key={s} type="button" aria-current={i === step ? "step" : undefined} className={i < step || i <= visited ? "done" : ""} onClick={() => go(i)}>
              {i + 1}. {s}
            </button>
          ))}
        </nav>

        {step === 0 && (
          <div className="wiz-pane" key="s0">
            <h3>Tomingiz qanday shaklda?</h3>
            <div className="opt-grid">
              {SHAPES.map((s) => (
                <button key={s.id} type="button" className="opt" aria-pressed={shape === s.id} onClick={() => setShape(s.id)}>
                  <svg viewBox="0 0 120 52" aria-hidden="true"><path d={s.path} fill="currentColor" opacity=".9" /><rect x="22" y="46" width="76" height="6" fill="currentColor" opacity=".35" /></svg>
                  <span>{s.label}<br /><small>{s.hint}</small></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="wiz-pane" key="s1">
            <h3>Material va rang</h3>
            <div className="seg" role="group" aria-label="Material">
              <button type="button" aria-pressed={material === "cherepitsa"} onClick={() => setMaterial("cherepitsa")}>Metallocherepitsa</button>
              <button type="button" aria-pressed={material === "profnastil"} onClick={() => setMaterial("profnastil")}>Profnastil</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <span className="note">Rang: <b style={{ color: "var(--tx)" }}>{color.name}{color.ral ? `, RAL ${color.ral}` : ""}</b></span>
              <div className="swatches" style={{ justifyContent: "flex-start" }} role="group" aria-label="Tom rangi">
                {COLORS.map((c) => (
                  <button key={c.hex + c.name} type="button" className="swatch-btn" style={{ background: c.hex }} aria-pressed={c.hex === color.hex && c.name === color.name} aria-label={`${c.name}${c.ral ? `, RAL ${c.ral}` : ""}`} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wiz-pane" key="s2">
            <h3>Uy o&apos;lchamlari</h3>
            <Slider id="c-len" label="Uzunligi" value={length} min={4} max={40} step={0.5} unit="m" onChange={setLength} />
            <Slider id="c-wid" label="Eni" value={width} min={4} max={30} step={0.5} unit="m" onChange={setWidth} />
            <Slider id="c-ang" label="Qiyalik burchagi" value={angle} min={12} max={45} step={1} unit="°" onChange={setAngle} />
            <Slider id="c-ov" label="Svess (devordan chiqishi)" value={overhang} min={0.3} max={1.2} step={0.1} unit="m" onChange={setOverhang} />
            <p className="note">Devorning tashqi o&apos;lchamini kiriting. Aniq o&apos;lchovni usta bepul oladi.</p>
          </div>
        )}

        {step === 3 && (
          <div className="wiz-pane" key="s3">
            <h3>Hisob natijasi</h3>
            <div className="res-grid">
              <div className="res-box"><span>Tom maydoni</span><b>≈ {r.area.toFixed(0)} m²</b></div>
              <div className="res-box"><span>List (zaxira bilan)</span><b>{r.sheetArea.toFixed(0)} m²</b></div>
              <div className="res-box"><span>Faqat material</span><b>{mln(r.matMin)} – {mln(r.matMax)} so&apos;m</b></div>
              <div className="res-box accent"><span>Montaj bilan</span><b>{mln(r.keyMin)} – {mln(r.keyMax)} so&apos;m</b></div>
            </div>
            <table className="items-table">
              <tbody>
                {r.ridge > 0 && <tr><td>Konyok va qirra plankasi</td><td>{r.ridge.toFixed(1)} m</td></tr>}
                <tr><td>Karniz plankasi va vodostok novi</td><td>{r.eaves.toFixed(1)} m</td></tr>
                <tr><td>Vodostok trubasi</td><td>{r.pipes} ta</td></tr>
                <tr><td>Qor ushlagich</td><td>{r.eaves.toFixed(1)} m</td></tr>
                <tr><td>Gidroizolyatsiya plyonkasi, 75 m² rulon</td><td>{r.membrane} ta</td></tr>
                <tr><td>Germetik vint</td><td>{r.screws} dona</td></tr>
              </tbody>
            </table>
            <button type="button" className="btn btn-ghost btn-sm no-print" onClick={() => window.print()} style={{ justifySelf: "start" }}>Smetani PDF qilib saqlash</button>
            {withForm && (
              <div id="calc-lead" style={{ display: "grid", gap: 14, paddingTop: 12, borderTop: "1px solid var(--hair)" }} className="no-print">
                <b style={{ fontFamily: "var(--f-serif)", fontSize: 30, color: "var(--tx)", fontWeight: 500, lineHeight: 1.1 }}>Aniq smetani oling</b>
                <p className="note">Hisobingiz murojaatga avtomatik qo&apos;shiladi — qayta tushuntirish shart emas.</p>
                <LeadForm source="kalkulyator" calc={summary} compact submitLabel="Aniq smetani olish" />
              </div>
            )}
          </div>
        )}

        <div className="wiz-nav no-print">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(step - 1)}>Orqaga</button>
          ) : <span />}
          {step < 3 && (
            <button type="button" className="btn btn-navy btn-sm" onClick={() => go(step + 1)}>
              {step === 2 ? "Natijani ko'rish" : "Keyingisi"} <Arrow size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
