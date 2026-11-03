"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RoofScene from "../RoofScene";
import type { Home } from "@/lib/types";
import { Arrow, Drag } from "../Icons";

export default function Hero({ home }: { home: Home }) {
  const colors = home.roofColors.length ? home.roofColors : [{ name: "Grafit", ral: "7024", hex: "#45494E" }];
  const [color, setColor] = useState(colors[0]);
  const [recolorable, setRecolorable] = useState(true);
  const mode = home.heroMode === "model" && !home.heroModel ? "3d" : home.heroMode;
  const media = mode === "image" || mode === "video";
  const words = home.heroTitle.split(/\s+/).filter(Boolean);
  const is3d = mode === "3d" || mode === "model";

  return (
    <section className={`hero ${media ? "hero-dark on-dark" : "hero-studio"}`} aria-label="Birinchi ekran">
      {media ? (
        <div className="hero-media" aria-hidden="true">
          {mode === "video" && home.heroVideo ? (
            <video src={home.heroVideo} poster={home.heroImage || undefined} autoPlay muted loop playsInline preload="metadata" />
          ) : home.heroImage ? (
            <Image src={home.heroImage} alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
          ) : null}
        </div>
      ) : null}

      <div className="wrap hero-inner">
        <div className="hero-copy">
          {home.heroLocation && <span className="script fade" style={{ animationDelay: ".1s" }}>{home.heroLocation}</span>}
          <h1>
            {words.map((w, i) => (
              <span key={i}>
                <span className="w" style={{ animationDelay: `${0.15 + i * 0.08}s` }}>{w}</span>{" "}
              </span>
            ))}
          </h1>
          {home.heroText && <p className="hero-text fade" style={{ animationDelay: ".6s" }}>{home.heroText}</p>}
          <div className="hero-actions fade" style={{ animationDelay: ".75s" }}>
            <Link href="/aloqa#forma" className="btn btn-green">{home.heroCta || "Bepul o'lchovga yozilish"} <Arrow size={18} /></Link>
            <Link href="/kalkulyator" className="btn btn-ghost">Narxni hisoblash</Link>
          </div>
        </div>

        {!media && (
        <div className="hero-stage">
            <RoofScene
              color={color.hex}
              intro={mode === "3d"}
              modelUrl={mode === "model" ? home.heroModel : ""}
              roofNames={home.heroModelRoof}
              onRecolorable={setRecolorable}
              label={`Uyning 3D ko'rinishi, tom rangi ${color.name}. Aylantirish uchun suring.`}
            />
          </div>
        )}

        <div className="hero-foot fade" style={{ animationDelay: "1s" }}>
          {home.stats.length > 0 && (
            <div className="hero-stats">
              {home.stats.slice(0, 4).map((s) => (
                <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>
              ))}
            </div>
          )}
          {is3d && (
            <div className="configurator">
              {recolorable && colors.length > 1 ? (
                <>
                  <span className="configurator-label">Tom rangi: <b>{color.name}{color.ral ? `, RAL ${color.ral}` : ""}</b></span>
                  <div className="swatches" role="group" aria-label="Tom rangini tanlash">
                    {colors.map((c) => (
                      <button
                        key={c.hex + c.name}
                        type="button"
                        className="swatch-btn"
                        style={{ background: c.hex }}
                        aria-pressed={c.hex === color.hex && c.name === color.name}
                        aria-label={`${c.name}${c.ral ? `, RAL ${c.ral}` : ""}`}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </>
              ) : null}
              <span className="drag-hint"><Drag size={16} /> Suring — uyni aylantiring</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
