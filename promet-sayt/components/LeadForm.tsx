"use client";
import { useEffect, useState } from "react";
import { REGIONS } from "@/lib/utils";

declare global {
  interface Window {
    ym?: (...a: unknown[]) => void;
    gtag?: (...a: unknown[]) => void;
    fbq?: (...a: unknown[]) => void;
  }
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "gclid", "yclid", "fbclid"];

function readUtm(): string {
  try {
    const p = new URLSearchParams(window.location.search);
    const found = UTM_KEYS.filter((k) => p.get(k)).map((k) => `${k}=${p.get(k)}`).join("&");
    if (found) sessionStorage.setItem("promet_utm", found);
    return found || sessionStorage.getItem("promet_utm") || "";
  } catch {
    return "";
  }
}

export default function LeadForm({
  source,
  calc = "",
  compact = false,
  submitLabel = "Bepul o'lchovga yozilish",
}: {
  source: string;
  calc?: string;
  compact?: boolean;
  submitLabel?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [utm, setUtm] = useState("");
  useEffect(() => setUtm(readUtm()), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source, calc, utm, page: window.location.pathname }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
      setState("ok");
      try {
        const ymId = (window as unknown as { __ymId?: number }).__ymId;
        if (ymId) window.ym?.(ymId, "reachGoal", "lead");
        window.gtag?.("event", "generate_lead", { source });
        window.fbq?.("track", "Lead");
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="form-ok" role="status">
        <b style={{ display: "block", fontSize: 20, marginBottom: 6 }}>Rahmat! Murojaatingiz qabul qilindi.</b>
        Mutaxassisimiz tez orada qo&apos;ng&apos;iroq qilib, o&apos;lchov vaqtini kelishib oladi.
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      <div className="form-grid">
        <div className="field">
          <label htmlFor={`${source}-name`}>Ismingiz</label>
          <input id={`${source}-name`} name="name" className="input" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor={`${source}-phone`}>Telefon raqamingiz</label>
          <input id={`${source}-phone`} name="phone" className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="+998" required />
        </div>
      </div>
      {!compact && (
        <>
          <div className="form-grid">
            <div className="field">
              <label htmlFor={`${source}-region`}>Viloyat</label>
              <select id={`${source}-region`} name="region" className="select" defaultValue="">
                <option value="" disabled>Tanlang</option>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`${source}-role`}>Siz kimsiz?</label>
              <select id={`${source}-role`} name="role" className="select" defaultValue="">
                <option value="" disabled>Tanlang</option>
                <option>Uy egasi</option>
                <option>Usta / quruvchi</option>
                <option>Sotish uchun uy quruvchi</option>
                <option>Tashkilot</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor={`${source}-timeline`}>Qachon boshlamoqchisiz?</label>
            <select id={`${source}-timeline`} name="timeline" className="select" defaultValue="">
              <option value="" disabled>Tanlang</option>
              <option>Hoziroq</option>
              <option>1 oy ichida</option>
              <option>1–3 oy ichida</option>
              <option>Hozircha o&apos;rganyapman</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${source}-comment`}>Izoh (ixtiyoriy)</label>
            <textarea id={`${source}-comment`} name="comment" className="textarea" />
          </div>
        </>
      )}
      {error && <p className="form-err" role="alert">{error}. Iltimos, qayta urinib ko&apos;ring yoki qo&apos;ng&apos;iroq qiling.</p>}
      <button className="btn btn-green btn-block" disabled={state === "sending"}>
        {state === "sending" ? "Yuborilmoqda…" : submitLabel}
      </button>
      <p className="consent">Yuborish orqali mutaxassisimiz siz bilan bog&apos;lanishiga rozilik bildirasiz.</p>
    </form>
  );
}
