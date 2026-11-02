"use client";
import { useState } from "react";
import Link from "next/link";
import { ROOF_COLORS } from "@/lib/utils";
import RoofArt from "./RoofArt";

export default function RoofVisualizer() {
  const [color, setColor] = useState(ROOF_COLORS[0]);
  const [ribs, setRibs] = useState(false);
  return (
    <div className="viz">
      <div className="viz-stage">
        <RoofArt roof={color.hex} ribs={ribs} sky={false} label={`Uy tomi: RAL ${color.ral} ${color.name}`} />
      </div>
      <div>
        <span className="eyebrow">Rang tanlash</span>
        <h2 className="h-lg" style={{ margin: "14px 0" }}>Tomingizni oldindan ko&apos;ring</h2>
        <p className="muted">Rang va materialni almashtirib, uyingizga qaysi biri yarashishini ko&apos;ring. Buyurtmada esa aynan sizning uyingiz uchun individual 3D dizayn tayyorlaymiz.</p>
        <div className="seg" role="group" aria-label="Material" style={{ marginTop: 24 }}>
          <button type="button" aria-pressed={!ribs} onClick={() => setRibs(false)}>Metallocherepitsa</button>
          <button type="button" aria-pressed={ribs} onClick={() => setRibs(true)}>Profnastil</button>
        </div>
        <div className="swatches">
          {ROOF_COLORS.map((c) => (
            <button key={c.ral} type="button" className="swatch" aria-pressed={c.ral === color.ral} onClick={() => setColor(c)}>
              <i style={{ background: c.hex }} />
              <span>{c.name}<small>RAL {c.ral}</small></span>
            </button>
          ))}
        </div>
        <Link href="/kalkulyator" className="btn btn-navy">Shu rangda narxni hisoblash</Link>
      </div>
    </div>
  );
}
