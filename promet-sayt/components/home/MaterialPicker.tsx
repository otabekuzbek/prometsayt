"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, RoofColor } from "@/lib/types";
import { som } from "@/lib/utils";
import { closeRender, RENDERS } from "@/lib/renders";
import { Arrow } from "../Icons";

export default function MaterialPicker({ products, colors }: { products: Product[]; colors: RoofColor[] }) {
  const [i, setI] = useState(0);
  const [c, setC] = useState(colors[0]);
  const p = products[i];
  if (!p) return null;
  const specs = p.specs.map((sp) => sp.split(":")).filter((x) => x.length > 1).slice(0, 3);
  // Mahsulot rasmi yuklangan bo'lsa — o'sha, aks holda realistik yaqin plan
  const own = p.images[0];
  const viz = p.slug.includes("profnastil") ? RENDERS.profnastil : closeRender(c?.hex || "#45494E");
  const showSwatches = !own && !p.slug.includes("profnastil") && colors.length > 1;

  return (
    <div>
      <div className="mat-tabs" role="tablist" aria-label="Materiallar">
        {products.map((x, k) => (
          <button key={x.id} role="tab" id={`mat-tab-${k}`} aria-controls="mat-panel" aria-selected={k === i} className="mat-tab" onClick={() => setI(k)}>
            {x.name}
          </button>
        ))}
      </div>
      <div className="mat-body" role="tabpanel" id="mat-panel" aria-labelledby={`mat-tab-${i}`}>
        <div className="mat-visual">
          {own ? (
            <Image key={own} src={own} alt={p.name} fill sizes="(max-width: 960px) 100vw, 58vw" style={{ objectFit: "cover" }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={viz} src={viz} alt={`${p.name}, ${c?.name || ""} rangida — vizualizatsiya`} loading="lazy" />
          )}
          {showSwatches && (
            <div className="swatches" role="group" aria-label="Rangni tanlash">
              {colors.map((x) => (
                <button key={x.hex + x.name} type="button" className="swatch-btn" style={{ background: x.hex }} aria-pressed={x === c} aria-label={x.name} onClick={() => setC(x)} />
              ))}
            </div>
          )}
          {showSwatches && c && <span className="tagline">{c.name}{c.ral ? ` · RAL ${c.ral}` : ""}</span>}
        </div>
        <div className="mat-info" key={p.id}>
          <div style={{ display: "grid", gap: 10 }}>
            <span className="cat">{p.category}</span>
            <p style={{ fontSize: 19, color: "var(--tx)", lineHeight: 1.55 }}>{p.short}</p>
          </div>
          <table className="spec-table">
            <tbody>
              <tr><td>Qalinlik</td><td>{p.thicknesses}</td></tr>
              <tr><td>Ranglar</td><td>{p.colors}</td></tr>
              {specs.map(([k, ...v]) => (
                <tr key={k}><td>{k}</td><td>{v.join(":").trim()}</td></tr>
              ))}
              <tr><td>Kafolat</td><td>{p.warrantyYears} yil</td></tr>
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
            <span className="mat-price">
              {p.priceFrom ? `${som(p.priceFrom)} dan` : "Narxi o'lchovdan keyin"}
              <small>{p.priceFrom ? `1 ${p.unit} uchun, faqat material` : "Tom maydoni va murakkabligiga qarab"}</small>
            </span>
            <Link href={`/mahsulotlar/${p.slug}`} className="link-arrow">Batafsil <Arrow size={18} /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
