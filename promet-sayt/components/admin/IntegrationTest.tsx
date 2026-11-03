"use client";
import { useState, useTransition } from "react";
import { testIntegrations } from "@/app/admin/actions";

export default function IntegrationTest() {
  const [pending, start] = useTransition();
  const [res, setRes] = useState<{ ok: boolean; error?: string; results?: { target: string; ok: boolean; message: string }[] } | null>(null);
  return (
    <section className="adm-card">
      <h2>Sinov</h2>
      <p className="adm-help" style={{ marginBottom: 12 }}>Avval o&apos;zgarishlarni saqlang, keyin sinov murojaatini yuboring. U ulangan har bir tizimga «Test murojaat» nomi bilan tushadi.</p>
      <button className="adm-btn" disabled={pending} onClick={() => start(async () => setRes(await testIntegrations()))}>
        {pending ? "Yuborilmoqda…" : "Sinov murojaatini yuborish"}
      </button>
      {res?.error && <div className="adm-error" style={{ marginTop: 12 }}>{res.error}</div>}
      {res?.results && (
        <ul className="adm-results">
          {res.results.map((r) => (
            <li key={r.target} className={r.ok ? "ok" : "bad"}><b>{r.target}</b> — {r.message}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
