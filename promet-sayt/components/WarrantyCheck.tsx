"use client";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

type Found = { found: true; number: string; client: string; region: string; product: string; area: number; installedAt: string; validUntil: string; active: boolean };
type Result = { found: false } | Found;

function Seal({ stamp, years }: { stamp: boolean; years: number }) {
  return (
    <svg className={`seal${stamp ? " stamp" : ""}`} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <path id="seal-c" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text fontSize="11" fontWeight="800" fill="currentColor" letterSpacing="2.4" fontFamily="var(--f-ui)">
        <textPath href="#seal-c">PROMET TOM MARKAZI • KAFOLAT •</textPath>
      </text>
      <text x="60" y="58" textAnchor="middle" fontSize="26" fontWeight="700" fill="currentColor" fontFamily="var(--f-serif)">{years}</text>
      <text x="60" y="76" textAnchor="middle" fontSize="11" fontWeight="800" fill="currentColor" fontFamily="var(--f-ui)">YIL</text>
    </svg>
  );
}

/** Kafolat hujjati ko'rinishi + raqam bo'yicha onlayn tekshiruv */
export default function WarrantyCheck({ years = 15, showDoc = true, title, text }: { years?: number; showDoc?: boolean; title?: string; text?: string }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Result | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/warranty?raqam=${encodeURIComponent(q.trim())}`);
      setRes(await r.json());
    } catch {
      setRes({ found: false });
    } finally {
      setLoading(false);
    }
  }

  const f = res && res.found ? res : null;

  const form = (
    <form className="check-box" onSubmit={check} id="tekshirish">
      <label htmlFor="w-num" className="field" style={{ gap: 4 }}>
        <span style={{ fontWeight: 600, fontSize: 17, color: "var(--tx)" }}>Kafolat raqamini tekshiring</span>
        <span className="muted" style={{ fontSize: 15 }}>Raqam kafolat hujjatining yuqori qismida yozilgan.</span>
      </label>
      <div className="check-row">
        <input id="w-num" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Masalan, PRM-2026-0001" autoComplete="off" />
        <button className="btn btn-green" disabled={loading}>{loading ? "Tekshirilmoqda…" : "Tekshirish"}</button>
      </div>
      {res && !res.found && (
        <div className="check-result bad" role="status">Bu raqam reestrda topilmadi. Raqamni hujjatdagi bilan solishtiring yoki bizga qo&apos;ng&apos;iroq qiling.</div>
      )}
      {f && (
        <div className="check-result" role="status">
          <span className="badge-ok">{f.active ? "✓ Kafolat amalda" : "Kafolat muddati tugagan"}</span>
          <div><b>{f.number}</b>, {f.client}</div>
          <div className="muted">Amal qilish muddati: {formatDate(f.validUntil)} gacha</div>
        </div>
      )}
    </form>
  );

  if (!showDoc) return form;

  return (
    <div className="warranty">
      <div style={{ display: "grid", gap: 22 }}>
        <span className="eyebrow">Kafolat</span>
        <h2 className="h-lg">{title || "Kafolat reestrda yozilgan"}</h2>
        <p className="lead">{text || "Har bir yopilgan tomga raqamli hujjat beramiz. Raqamni shu yerda istalgan vaqt tekshirasiz."}</p>
        {form}
      </div>
      <article className="cert-doc" aria-label={f ? "Topilgan kafolat hujjati" : "Kafolat hujjati namunasi"}>
        <header>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Promet Tom Markazi" width={158} height={34} />
          <span>{f ? f.number : "Namuna"}</span>
        </header>
        <h3>Kafolat hujjati</h3>
        <dl>
          <dt>Mijoz</dt><dd>{f ? f.client : "—"}</dd>
          <dt>Hudud</dt><dd>{f ? f.region : "—"}</dd>
          <dt>Material</dt><dd>{f ? f.product : "—"}</dd>
          <dt>Maydon</dt><dd>{f && f.area ? `${f.area} m²` : "—"}</dd>
          <dt>O&apos;rnatilgan</dt><dd>{f ? formatDate(f.installedAt) : "—"}</dd>
          <dt>Muddat</dt><dd>{years} yil</dd>
        </dl>
        <Seal stamp={!!f} years={years} key={f ? f.number : "x"} />
      </article>
    </div>
  );
}
