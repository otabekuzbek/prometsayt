"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { RoofObject } from "@/lib/types";
import { OBJECT_TYPES, placeName, videoEmbed } from "@/lib/utils";
import RoofArt from "./RoofArt";
import Reveal from "./Reveal";
import { Close } from "./Icons";

function GalleryItem({ o, i, onOpen }: { o: RoofObject; i: number; onOpen: () => void }) {
  const meta = [o.product, o.area > 0 ? `${o.area} m²` : ""].filter(Boolean).join(", ");
  return (
    <button type="button" className="g-item" onClick={onOpen} aria-label={`${placeName(o.region, o.district)}: ${o.title}. Rasmlarni ochish`}>
      <Reveal kind="img" className="g-media">
        <div className="zoom">
          {o.images[0] ? (
            <Image src={o.images[0]} alt="" fill sizes="(max-width: 960px) 100vw, 60vw" style={{ objectFit: "cover" }} />
          ) : (
            <RoofArt variant={i} label={o.title} />
          )}
        </div>
        <span className="g-view" aria-hidden="true">{o.videoUrl ? "Video" : "Ko'rish"}</span>
      </Reveal>
      <div className="g-cap">
        <span className="script">{placeName(o.region, o.district)}</span>
        <h3>{o.title}</h3>
        {meta && <span className="meta">{meta}</span>}
      </div>
    </button>
  );
}

export default function ObjectsGallery({ objects, filters = true, limit }: { objects: RoofObject[]; filters?: boolean; limit?: number }) {
  const [region, setRegion] = useState("Barchasi");
  const [type, setType] = useState("Barchasi");
  const [open, setOpen] = useState<RoofObject | null>(null);

  const regions = useMemo(() => {
    const m = new Map<string, number>();
    objects.forEach((o) => m.set(o.region, (m.get(o.region) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [objects]);
  const types = useMemo(() => [...new Set(objects.map((o) => o.type))], [objects]);

  const list = objects
    .filter((o) => (region === "Barchasi" || o.region === region) && (type === "Barchasi" || o.type === type))
    .slice(0, limit);

  return (
    <>
      {filters && (regions.length > 1 || types.length > 1) && (
        <div style={{ display: "grid", gap: 12, marginBottom: 48 }}>
          {regions.length > 1 && (
            <div className="chips" role="group" aria-label="Viloyat bo'yicha saralash">
              <button className="chip" aria-pressed={region === "Barchasi"} onClick={() => setRegion("Barchasi")}>
                Barcha viloyatlar <small>{objects.length}</small>
              </button>
              {regions.map(([r, n]) => (
                <button key={r} className="chip" aria-pressed={region === r} onClick={() => setRegion(r)}>
                  {r} <small>{n}</small>
                </button>
              ))}
            </div>
          )}
          {types.length > 1 && (
            <div className="chips" role="group" aria-label="Obyekt turi bo'yicha saralash">
              {["Barchasi", ...types].map((t) => (
                <button key={t} className="chip" aria-pressed={type === t} onClick={() => setType(t)}>
                  {t === "Barchasi" ? "Barcha turlar" : OBJECT_TYPES[t]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {list.length === 0 ? (
        <div className="empty">Bu bo&apos;limda hozircha obyekt yo&apos;q.</div>
      ) : (
        <div className="gallery" key={`${region}-${type}`}>
          {list.map((o, i) => (
            <GalleryItem key={o.id} o={o} i={i} onOpen={() => setOpen(o)} />
          ))}
        </div>
      )}
      {open && <Lightbox obj={open} onClose={() => setOpen(null)} />}
    </>
  );
}

export function Lightbox({ obj, onClose }: { obj: RoofObject; onClose: () => void }) {
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
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  });

  const s = slides[i];
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={obj.title}>
      <div className="lightbox-top">
        <div style={{ display: "grid", gap: 6 }}>
          <span className="script" style={{ color: "var(--green-hi)", fontSize: 24 }}>{placeName(obj.region, obj.district)}</span>
          <h3>{obj.title}</h3>
          <span style={{ fontSize: 14, opacity: 0.7 }}>
            {[obj.product, obj.area ? `${obj.area} m²` : "", String(obj.year), OBJECT_TYPES[obj.type]].filter(Boolean).join(", ")}
          </span>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Yopish" autoFocus><Close /></button>
      </div>
      <div className="lightbox-stage">
        {s.kind === "img" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s.src} src={s.src} alt={`${obj.title}, ${i + 1}-rasm`} />
        )}
        {s.kind === "video" && <iframe src={s.src} title={obj.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />}
        {s.kind === "art" && (
          <div style={{ width: "min(900px,100%)", aspectRatio: "4/3", overflow: "hidden" }}>
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
                <span style={{ display: "grid", placeItems: "center", height: "100%", background: "#222", color: "#fff", fontSize: 12 }}>Video</span>
              )}
            </button>
          ))}
      </div>
    </div>
  );
}
