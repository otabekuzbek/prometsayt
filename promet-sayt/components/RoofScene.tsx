"use client";
import { useEffect, useRef, useState } from "react";
import type { HouseApi, RoofMaterial, RoofShape, SceneTime, SceneView } from "@/lib/house3d";

export type { RoofShape, RoofMaterial, SceneTime };

/**
 * Realistik 3D uy. three.js faqat brauzerda, sahifa chizilgandan keyin yuklanadi.
 * `poster` — tayyor render: 3D yuklanguncha ko'rinadi, kuchsiz qurilmalarda esa 3D o'rniga qoladi.
 */
export default function RoofScene({
  color,
  shape = "doppi",
  material = "cherepitsa",
  time = "day",
  view = "orbit",
  shift = 0,
  intro = false,
  interactive = true,
  poster,
  posterMobile,
  className,
  label = "Uyning 3D ko'rinishi. Aylantirish uchun suring.",
  modelUrl = "",
  roofNames = "",
  onRecolorable,
  onStatic,
}: {
  color: string;
  shape?: RoofShape;
  material?: RoofMaterial;
  time?: SceneTime;
  view?: SceneView;
  shift?: number;
  intro?: boolean;
  interactive?: boolean;
  poster?: string;
  /** Tik ekran uchun alohida render */
  posterMobile?: string;
  className?: string;
  label?: string;
  modelUrl?: string;
  roofNames?: string;
  onRecolorable?: (ok: boolean) => void;
  /** 3D ishga tushmasa (kuchsiz qurilma, WebGL yo'q) — chaqiriladi */
  onStatic?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<HouseApi | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const first = useRef({ color, shape, material });
  const cb = useRef({ onRecolorable, onStatic });
  cb.current = { onRecolorable, onStatic };

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    if (!el) return;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const weak = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 3 || !!nav.connection?.saveData;
    const hasGL = (() => {
      try {
        return !!document.createElement("canvas").getContext("webgl2");
      } catch {
        return false;
      }
    })();
    // Rasm bor bo'lsa va qurilma kuchsiz bo'lsa — 3D yuklamaymiz, tayyor render qoladi
    if (!hasGL || (weak && poster && !modelUrl)) {
      setFailed(true);
      cb.current.onStatic?.();
      return;
    }
    const start = async () => {
      try {
        const { createHouse } = await import("@/lib/house3d");
        if (cancelled) return;
        const a = await createHouse(el, {
          ...first.current,
          time,
          view,
          shift,
          intro,
          interactive,
          modelUrl,
          roofNames,
          onRecolorable: (ok) => cb.current.onRecolorable?.(ok),
        });
        if (cancelled) return a.dispose();
        api.current = a;
        setReady(true);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setFailed(true);
          cb.current.onStatic?.();
        }
      }
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => void start(), { timeout: 1200 });
    else setTimeout(() => void start(), 250);
    return () => {
      cancelled = true;
      api.current?.dispose();
      api.current = null;
    };
  }, [time, view, shift, intro, interactive, modelUrl, roofNames, poster]);

  useEffect(() => {
    api.current?.setColor(color);
  }, [color, ready]);
  useEffect(() => {
    api.current?.setShape(shape);
  }, [shape, ready]);
  useEffect(() => {
    api.current?.setMaterial(material);
  }, [material, ready]);

  return (
    <div ref={host} className={`roof-scene ${ready ? "is-ready" : ""} ${failed ? "is-static" : ""} ${className || ""}`} role="img" aria-label={label}>
      {poster ? (
        <picture>
          {posterMobile && <source media="(max-aspect-ratio: 4/5)" srcSet={posterMobile} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="roof-scene-poster" src={poster} alt="" aria-hidden="true" decoding="async" fetchPriority="high" />
        </picture>
      ) : (
        !ready && <span className="roof-scene-loading" aria-hidden="true" />
      )}
    </div>
  );
}
