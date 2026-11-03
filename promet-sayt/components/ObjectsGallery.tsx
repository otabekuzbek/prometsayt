"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { RoofObject } from "@/lib/types";
import { OBJECT_TYPES, placeName, videoEmbed } from "@/lib/utils";
import RoofArt from "./RoofArt";
import { Arrow, Close, Play } from "./Icons";

export function ObjectCard({ o, i, onOpen }: { o: RoofObject; i: number; onOpen: () => void }) {
  return (
    <button type="button" className="obj-card" onClick={onOpen} aria-label={`${placeName(o.region, o.district)}: ${o.title}. Ko'rish`}>
      <div className="media">
        {o.images[0] ? (
          <Image src={o.images[0]} alt="" fill sizes="(max-width: 640px) 85vw, 400px" style={{ objectFit: "cover" }} draggable={false} />
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
        {o.videoUrl && <span className="tag" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Play size={12} /> Video</span>}
        <span className="open" aria-hidden="true"><Arrow /></span>
      </div>
    </button>
  );
}

export function ObjectsRail({ objects }: { objects: RoofObject[] }) {
  const [open, setOpen] = useState<RoofObject | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });

  const scrollBy = (d: number) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".obj-card");
    el.scrollBy({ left: d * ((card?.offsetWidth || 360) + 20), behavior: "smooth" });
  };

  return (
    <>
      <div className="rail-wrap">
        <div
          ref={rail}
          className="rail"
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse" || !rail.current) return;
            drag.current = { down: true, x: e.clientX, left: rail.current.scrollLeft, moved: false };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d.down || !rail.current) return;
            const dx = e.clientX - d.x;
            if (Math.abs(dx) > 5) {
              d.moved = true;
              rail.current.classList.add("dragging");
            }
            rail.current.scrollLeft = d.left - dx;
          }}
          onPointerUp={() => {
            drag.current.down = false;
            rail.current?.classList.remove("dragging");
          }}
          onPointerLeave={() => {
            drag.current.down = false;
            rail.current?.classList.remove("dragging");
          }}
          onClickCapture={(e) => {
            if (drag.current.moved) {
              e.stopPropagation();
              e.preventDefault();
              drag.current.moved = false;
            }
          }}
        >
          {objects.map((o, i) => (
            <ObjectCard key={o.id} o={o} i={i} onOpen={() => setOpen(o)} />
          ))}
        </div>
      </div>
      {objects.length > 2 && (
        <div className="rail-ctrl" style={{ marginTop: 8 }}>
          <button type="button" onClick={() => scrollBy(-1)} aria-label="Oldingi obyektlar"><Arrow left /></button>
          <button type="button" onClick={() => scrollBy(1)} aria-label="Keyingi obyektlar"><Arrow /></button>
        </div>
      )}
      {open && <Lightbox obj={open} onClose={() => setOpen(null)} />}
    </>
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
        <div style={{ display: "grid", gap: 12 }}>
          {regions.length > 1 && (
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
          )}
          {types.length > 1 && (
            <div className="chips" role="group" aria-label="Obyekt turi">
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
        <div className="empty" style={{ marginTop: 32 }}>Bu bo&apos;limda hozircha obyekt yo&apos;q.</div>
      ) : (
        <div className="obj-grid">
          {list.map((o, i) => (
            <ObjectCard key={o.id} o={o} i={i} onOpen={() => setOpen(o)} />
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
          <div className="script" style={{ color: "var(--green-hi)", fontSize: 24 }}>{placeName(obj.region, obj.district)}</div>
          <b style={{ fontSize: 18 }}>{obj.title}</b>
          <div style={{ fontSize: 14, opacity: 0.75 }}>
            {[obj.product, obj.area ? `${obj.area} m²` : "", String(obj.year), OBJECT_TYPES[obj.type]].filter(Boolean).join(", ")}
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
