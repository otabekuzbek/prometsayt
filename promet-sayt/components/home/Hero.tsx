"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RoofScene from "../RoofScene";
import type { Home } from "@/lib/types";
import { RENDERS } from "@/lib/renders";
import { Arrow, Check, Drag, Phone } from "../Icons";

export default function Hero({ home, phone, tel }: { home: Home; phone: string; tel: string }) {
  const colors = home.roofColors.length ? home.roofColors : [{ name: "Grafit", ral: "7024", hex: "#45494E" }];
  const [color, setColor] = useState(colors[0]);
  const [recolorable, setRecolorable] = useState(true);
  const mode = home.heroMode === "model" && !home.heroModel ? "3d" : home.heroMode;
  const media = mode === "image" || mode === "video";
  const words = home.heroTitle.split(/\s+/).filter(Boolean);
  const is3d = mode === "3d" || mode === "model";
  // Tayyor render faqat standart uy va grafit rangi uchun mos; boshqa holatda — to'q fon
  const poster = mode === "3d" && (home.heroTime || "dusk") === "dusk" ? RENDERS.heroDesktop : undefined;

  return (
    <section className="hero" aria-label="Birinchi ekran">
      {media ? (
        <div className="hero-media" aria-hidden="true">
          {mode === "video" && home.heroVideo ? (
            <video src={home.heroVideo} poster={home.heroImage || undefined} autoPlay muted loop playsInline preload="metadata" />
          ) : home.heroImage ? (
            <Image src={home.heroImage} alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={RENDERS.heroDesktop} alt="" />
          )}
        </div>
      ) : (
        <div className="hero-stage">
          <RoofScene
            color={color.hex}
            time={home.heroTime || "dusk"}
            view="hero"
            shift={0.24}
            intro={mode === "3d"}
            poster={poster}
            posterMobile={poster ? RENDERS.heroMobile : undefined}
            modelUrl={mode === "model" ? home.heroModel : ""}
            roofNames={home.heroModelRoof}
            onRecolorable={setRecolorable}
            onStatic={() => setRecolorable(false)}
            label={`Uyning 3D ko'rinishi, tom rangi ${color.name}. Aylantirish uchun suring.`}
          />
        </div>
      )}

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
            <Link href="/aloqa#forma" className="btn btn-green"><span className="pulse" aria-hidden="true" />{home.heroCta || "Bepul o'lchovga yozilish"} <Arrow size={18} /></Link>
            <a href={tel} className="btn btn-ghost"><Phone size={18} /> {phone}</a>
          </div>
          {home.heroTrust?.length > 0 && (
            <ul className="trust fade" style={{ animationDelay: ".9s" }}>
              {home.heroTrust.slice(0, 4).map((t) => (
                <li key={t}><Check size={18} /> {t}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="hero-foot fade" style={{ animationDelay: "1.1s" }}>
          {home.stats.length > 0 && (
            <div className="hero-stats">
              {home.stats.slice(0, 3).map((s) => (
                <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>
              ))}
            </div>
          )}
          {is3d && recolorable && colors.length > 1 && (
            <div className="configurator">
              <span className="configurator-label">
                <span>Tom rangini tanlang</span>
                <b>{color.name}{color.ral ? ` · RAL ${color.ral}` : ""}</b>
              </span>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span className="drag-hint"><Drag size={16} /> Suring — aylantiring</span>
                <Link href={`/kalkulyator?rang=${encodeURIComponent(color.hex)}`} className="link-arrow">Shu rangda narx <Arrow size={16} /></Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <span className="scroll-cue" aria-hidden="true" />
    </section>
  );
}
