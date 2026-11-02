"use client";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

type Result =
  | { found: false }
  | { found: true; number: string; client: string; region: string; product: string; area: number; installedAt: string; validUntil: string; active: boolean };

export default function WarrantyCheck() {
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

  return (
    <form className="check-box" onSubmit={check} id="tekshirish">
      <b style={{ color: "#fff", fontSize: 20 }}>Kafolatni tekshirish</b>
      <p style={{ color: "#aebbd0" }}>Kafolat hujjatidagi raqamni kiriting — masalan, PRM-2026-0001.</p>
      <div className="check-row">
        <label htmlFor="w-num" className="sr-only">Kafolat raqami</label>
        <input id="w-num" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="PRM-0000-0000" autoComplete="off" />
        <button className="btn btn-green" disabled={loading}>{loading ? "Tekshirilmoqda…" : "Tekshirish"}</button>
      </div>
      {res && !res.found && (
        <div className="check-result bad" role="status">Bunday raqamli kafolat topilmadi. Raqamni tekshirib qayta kiriting yoki bizga qo&apos;ng&apos;iroq qiling.</div>
      )}
      {res && res.found && (
        <div className="check-result" role="status">
          <span className="badge-ok">{res.active ? "✓ Kafolat amalda" : "Kafolat muddati tugagan"}</span>
          <div><b>{res.number}</b> · {res.client}</div>
          <div>{res.product}{res.area ? `, ${res.area} m²` : ""} · {res.region}</div>
          <div className="muted">O&apos;rnatilgan: {formatDate(res.installedAt)} · Amal qiladi: {formatDate(res.validUntil)} gacha</div>
        </div>
      )}
    </form>
  );
}
