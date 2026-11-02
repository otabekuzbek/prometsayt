"use client";
import { useMemo, useState } from "react";
import type { Pricing } from "@/lib/types";
import { ROOF_COLORS, som } from "@/lib/utils";
import LeadForm from "./LeadForm";
import RoofArt from "./RoofArt";

type RoofType = "bir" | "ikki" | "tort" | "doppi";

const TYPES: { id: RoofType; label: string; path: string }[] = [
  { id: "bir", label: "Bir qiyalik", path: "M6 30 L50 12 L50 30 Z" },
  { id: "ikki", label: "Ikki qiyalik", path: "M4 30 L28 8 L52 30 Z" },
  { id: "tort", label: "To'rt qiyalik", path: "M2 30 L16 12 L40 12 L54 30 Z" },
  { id: "doppi", label: "Do'ppi tom", path: "M2 30 L14 16 L20 16 L28 4 L36 16 L42 16 L54 30 Z" },
];

export default function Calculator({ pricing, withForm = true }: { pricing: Pricing; withForm?: boolean }) {
  const [type, setType] = useState<RoofType>("doppi");
  const [material, setMaterial] = useState<"cherepitsa" | "profnastil">("cherepitsa");
  const [color, setColor] = useState(ROOF_COLORS[1]);
  const [length, setLength] = useState("14");
  const [width, setWidth] = useState("12");
  const [angle, setAngle] = useState(30);
  const [overhang, setOverhang] = useState("0.6");

  const r = useMemo(() => {
    const L = Math.max(0, parseFloat(length.replace(",", ".")) || 0);
    const W = Math.max(0, parseFloat(width.replace(",", ".")) || 0);
    const o = Math.max(0, parseFloat(overhang.replace(",", ".")) || 0);
    if (!L || !W) return null;
    const Lp = Math.max(L, W) + 2 * o;
    const Wp = Math.min(L, W) + 2 * o;
    const rad = (angle * Math.PI) / 180;
    const plan = Lp * Wp;
    const factor = type === "doppi" ? 1.12 : 1;
    const area = (plan / Math.cos(rad)) * factor;
    const waste = material === "cherepitsa" ? (type === "tort" || type === "doppi" ? 1.15 : 1.1) : type === "tort" || type === "doppi" ? 1.1 : 1.06;
    const sheetArea = area * waste;
    const h = (Wp / 2) * Math.tan(rad);
    const hip = Math.sqrt((Wp / 2) ** 2 * 2 + h * h);
    const ridge =
      type === "bir" ? 0 : type === "ikki" ? Lp : type === "tort" ? Lp - Wp + 4 * hip : (Lp - Wp + 4 * hip) * 1.3;
    const eaves = type === "bir" ? Lp : type === "ikki" ? 2 * Lp : 2 * (Lp + Wp);
    const pipes = type === "bir" ? Math.max(1, Math.ceil(eaves / 10)) : Math.max(2, Math.ceil(eaves / 10));
    const screws = Math.ceil((sheetArea * 8) / 250) * 250;
    const membrane = Math.ceil((area * 1.15) / 75);
    const min = material === "cherepitsa" ? pricing.cherepitsaMin : pricing.profnastilMin;
    const max = material === "cherepitsa" ? pricing.cherepitsaMax : pricing.profnastilMax;
    return {
      plan: L * W,
      area,
      sheetArea,
      ridge,
      eaves,
      pipes,
      screws,
      membrane,
      matMin: sheetArea * min,
      matMax: sheetArea * max,
      keyMin: area * pricing.turnkeyMin,
      keyMax: area * pricing.turnkeyMax,
    };
  }, [length, width, overhang, angle, type, material, pricing]);

  const round = (n: number) => Math.round(n / 100000) * 100000;
  const typeLabel = TYPES.find((t) => t.id === type)!.label;
  const matLabel = material === "cherepitsa" ? "Metallocherepitsa" : "Profnastil";
  const summary = r
    ? [
        `${typeLabel}, ${matLabel}, RAL ${color.ral} ${color.name}`,
        `Uy: ${length}×${width} m, qiyalik ${angle}°, chiqiq ${overhang} m`,
        `Tom maydoni ≈ ${r.area.toFixed(0)} m², list ≈ ${r.sheetArea.toFixed(0)} m²`,
        `Material: ${som(round(r.matMin))} – ${som(round(r.matMax))}`,
        `Kalit topshirish: ${som(round(r.keyMin))} – ${som(round(r.keyMax))}`,
      ].join("\n")
    : "";

  return (
    <div className="calc">
      <div className="calc-panel no-print">
        <div>
          <div className="step-title"><span>1</span>Tom shakli</div>
          <div className="opt-grid">
            {TYPES.map((t) => (
              <button key={t.id} type="button" className="opt" aria-pressed={type === t.id} onClick={() => setType(t.id)}>
                <svg viewBox="0 0 56 34" aria-hidden="true"><path d={t.path} fill="currentColor" opacity=".85" /><rect x="8" y="30" width="40" height="4" fill="currentColor" opacity=".35" /></svg>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="step-title"><span>2</span>Material va rang</div>
          <div className="seg" role="group" aria-label="Material">
            <button type="button" aria-pressed={material === "cherepitsa"} onClick={() => setMaterial("cherepitsa")}>Metallocherepitsa</button>
            <button type="button" aria-pressed={material === "profnastil"} onClick={() => setMaterial("profnastil")}>Profnastil</button>
          </div>
          <div className="swatches" style={{ marginBottom: 0 }}>
            {ROOF_COLORS.map((c) => (
              <button key={c.ral} type="button" className="swatch" aria-pressed={color.ral === c.ral} onClick={() => setColor(c)}>
                <i style={{ background: c.hex }} />
                <span>{c.name}<small>RAL {c.ral}</small></span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="step-title"><span>3</span>Uy o&apos;lchamlari</div>
          <div className="fields">
            <div className="field">
              <label htmlFor="c-len">Uzunligi, m</label>
              <input id="c-len" className="input" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="c-wid">Eni, m</label>
              <input id="c-wid" className="input" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="c-ov">Chiqiq (svess), m</label>
              <input id="c-ov" className="input" inputMode="decimal" value={overhang} onChange={(e) => setOverhang(e.target.value)} />
            </div>
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="c-ang">Qiyalik burchagi: {angle}°</label>
            <input id="c-ang" type="range" className="range" min={12} max={45} value={angle} onChange={(e) => setAngle(+e.target.value)} />
          </div>
          <p className="note" style={{ marginTop: 10 }}>Devorning tashqi o&apos;lchamini kiriting. Aniq o&apos;lchovni ustamiz bepul oladi.</p>
        </div>
      </div>

      <div className="calc-result">
        <div className="print-only">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Promet Tom Markazi" style={{ height: 40, width: "auto", marginBottom: 12 }} />
          <p>Taxminiy smeta · {new Date().toLocaleDateString("ru-RU")}</p>
        </div>
        <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "16 / 8", position: "relative" }} className="no-print">
          <RoofArt roof={color.hex} label={`${typeLabel}, RAL ${color.ral}`} />
        </div>
        <h3 className="h-md">Sizning smetangiz</h3>
        {r ? (
          <>
            <div>
              <div className="res-row"><span>Tom shakli</span><b>{typeLabel}</b></div>
              <div className="res-row"><span>Material</span><b>{matLabel} · RAL {color.ral}</b></div>
              <div className="res-row"><span>Uy maydoni</span><b>{r.plan.toFixed(0)} m²</b></div>
              <div className="res-row"><span>Tom maydoni</span><b>≈ {r.area.toFixed(0)} m²</b></div>
            </div>
            <table className="items-table">
              <tbody>
                <tr><td>Tom listi (zaxira bilan)</td><td>{r.sheetArea.toFixed(0)} m²</td></tr>
                {r.ridge > 0 && <tr><td>Konyok va qirra plankasi</td><td>{r.ridge.toFixed(1)} m</td></tr>}
                <tr><td>Karniz plankasi / vodostok novi</td><td>{r.eaves.toFixed(1)} m</td></tr>
                <tr><td>Vodostok trubasi</td><td>{r.pipes} ta</td></tr>
                <tr><td>Qor ushlagich</td><td>{r.eaves.toFixed(1)} m</td></tr>
                <tr><td>Gidroizolyatsiya plyonkasi (75 m²)</td><td>{r.membrane} rulon</td></tr>
                <tr><td>Germetik vint</td><td>{r.screws} dona</td></tr>
              </tbody>
            </table>
            <div className="res-total">
              <span>Material (taxminan)</span>
              <b>{som(round(r.matMin))} – {som(round(r.matMax))}</b>
            </div>
            <div className="res-total">
              <span>Kalit topshirish, montaj bilan (taxminan)</span>
              <b>{som(round(r.keyMin))} – {som(round(r.keyMax))}</b>
            </div>
            <p className="note">Hisob taxminiy. Yakuniy narx bepul o&apos;lchovdan so&apos;ng yozma smetada beriladi — qo&apos;shimcha to&apos;lovlarsiz.</p>
            <button type="button" className="btn btn-ghost btn-sm no-print" style={{ color: "#fff" }} onClick={() => window.print()}>
              Smetani PDF qilib saqlash
            </button>
          </>
        ) : (
          <p>Uy uzunligi va enini kiriting.</p>
        )}
      </div>

      {withForm && r && (
        <div className="calc-panel no-print" style={{ gridColumn: "1 / -1" }} id="calc-lead">
          <div>
            <h3 className="h-md">Aniq smeta oling</h3>
            <p className="muted" style={{ marginTop: 6 }}>Hisobingiz murojaatga avtomatik qo&apos;shiladi — qayta tushuntirish shart emas.</p>
          </div>
          <LeadForm source="kalkulyator" calc={summary} submitLabel="Aniq smeta olish" />
        </div>
      )}
    </div>
  );
}
