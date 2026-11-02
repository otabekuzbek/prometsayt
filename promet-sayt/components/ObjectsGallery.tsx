"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { RoofObject } from "@/lib/types";
import { OBJECT_TYPES, placeName, videoEmbed } from "@/lib/utils";
import RoofArt from "./RoofArt";
import { Close, Play } from "./Icons";

export default function ObjectsGallery({ objects, filters = true, limit }: { objects: RoofObject[]; filters?: boolean; limit?: number }) {
  const [region, setRegion] = useState("Barchasi");
  const [type, setType] = useState("Barchasi");
  const [open, setOpen] = useState<RoofObject | null>(null);

  const regions = useMemo(() => {
    const m = new Map<string, number>();
    objects.forEach((o) => m.set(o.region, (m.get(o.region) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [objects]);

  const list = objects
    .filter((o) => (region === "Barchasi" || o.region === region) && (type === "Barchasi" || o.type === type))
    .slice(0, limit);

  return (
    <>
      {filters && (
        <div style={{ display: "grid", gap: 12 }}>
          <div className="chips" role="group" aria-label="Viloyat bo'yicha">
            <button className="chip" aria-pressed={region === "Barchasi"} onClick={() => setRegion("Barchasi")}>
              Barcha viloyatlar <small>{objects.length}</small>
            </button>
            {regions.map(([r, n]) => (
              <button key={r} className="chip" aria-pressed={region === r} onClick={() => setRegion(r)}>
                {r} <small>{n}</small>
              </button>
            ))}
          </div>
          <div className="chips" role="group" aria-label="Obyekt turi">
            {["Barchasi", ...Object.keys(OBJECT_TYPES)].map((t) => (
              <button key={t} className="chip" aria-pressed={type === t} onClick={() => setType(t)}>
                {t === "Barchasi" ? "Barcha turlar" : OBJECT_TYPES[t]}
              </button>
            ))}
          </div>
        </div>
      )}
      {list.length === 0 ? (
        <div className="empty" style={{ marginTop: 32 }}>Bu bo&apos;limda hozircha obyekt yo&apos;q.</div>
      ) : (
        <div className="obj-grid">
          {list.map((o, i) => (
            <button
              key={o.id}
              type="button"
              className={`obj-card${i % 5 === 0 && list.length > 2 ? " wide" : ""}`}
              onClick={() => setOpen(o)}
              style={{ border: 0, padding: 0, textAlign: "left", cursor: "pointer", font: "inherit" }}
              aria-label={`${o.region}, ${o.district}: ${o.title}`}
            >
              <div className="media">
                {o.images[0] ? (
                  <Image src={o.images[0]} alt={o.title} fill sizes="(max-width: 860px) 100vw, 66vw" style={{ objectFit: "cover" }} />
                ) : (
                  <RoofArt variant={i} label={o.title} />
                )}
              </div>
              <div className="cap">
                <span className="script">{placeName(o.region, o.district)}</span>
                <h3>{o.title}</h3>
              </div>
              <div className="meta">
                <span className="tag">{o.product}</span>
                {o.area > 0 && <span className="tag">{o.area} m²</span>}
                {o.images.length > 1 && <span className="tag">{o.images.length} ta rasm</span>}
                {o.videoUrl && <span className="tag" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Play size={12} /> Video</span>}
              </div>
            </button>
          ))}
        </div>
      )}
      {open && <Lightbox obj={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function Lightbox({ obj, onClose }: { obj: RoofObject; onClose: () => void }) {
  const video = videoEmbed(obj.videoUrl);
  const slides: ({ kind: "img"; src: string } | { kind: "video"; src: string } | { kind: "art" })[] = [
    ...(video ? [{ kind: "video" as const, src: video }] : []),
    ...obj.images.map((src) => ({ kind: "img" as const, src })),
  ];
  if (!slides.length) slides.push({ kind: "art" });
  const [i, setI] = useState(0);
  const go = (d: number) => setI((x) => (x + d + slides.length) % slides.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  });

  const s = slides[i];
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={obj.title}>
      <div className="lightbox-top">
        <div>
          <div className="script" style={{ color: "var(--insta-green)", fontSize: 24 }}>{placeName(obj.region, obj.district)}</div>
          <b style={{ fontSize: 18 }}>{obj.title}</b>
          <div style={{ fontSize: 14, opacity: 0.75 }}>
            {obj.product}{obj.area ? ` · ${obj.area} m²` : ""} · {obj.year} · {OBJECT_TYPES[obj.type]}
          </div>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Yopish"><Close /></button>
      </div>
      <div className="lightbox-stage">
        {s.kind === "img" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.src} alt={obj.title} />
        )}
        {s.kind === "video" && <iframe src={s.src} title={obj.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />}
        {s.kind === "art" && (
          <div style={{ width: "min(900px,100%)", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden" }}>
            <RoofArt label={obj.title} />
          </div>
        )}
        {slides.length > 1 && (
          <>
            <button className="lb-nav lb-prev" onClick={() => go(-1)} aria-label="Oldingi">‹</button>
            <button className="lb-nav lb-next" onClick={() => go(1)} aria-label="Keyingi">›</button>
          </>
        )}
      </div>
      <div className="lightbox-thumbs">
        {slides.length > 1 &&
          slides.map((x, k) => (
            <button key={k} aria-current={k === i} onClick={() => setI(k)} aria-label={`${k + 1}-slayd`}>
              {x.kind === "img" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={x.src} alt="" />
              ) : (
                <span style={{ display: "grid", placeItems: "center", height: "100%", background: "#222", color: "#fff" }}><Play /></span>
              )}
            </button>
          ))}
      </div>
    </div>
  );
}
