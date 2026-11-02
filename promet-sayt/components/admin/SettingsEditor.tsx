"use client";
import { useState, useTransition } from "react";
import { PRICING_FIELDS, SETTINGS_FIELDS } from "@/lib/admin-schema";
import { saveSettings } from "@/app/admin/actions";
import FieldInput from "./FieldInput";

type Obj = Record<string, unknown>;

export default function SettingsEditor({ settings, pricing }: { settings: Obj; pricing: Obj }) {
  const [s, setS] = useState(settings);
  const [p, setP] = useState(pricing);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      const r = await saveSettings(s, p);
      setMsg(r.ok ? { ok: true, text: "Saqlandi — saytda yangilandi" } : { ok: false, text: r.error || "Xatolik" });
    });

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <h1>Sozlamalar</h1>
        <button className="adm-btn adm-primary" onClick={save} disabled={pending}>{pending ? "Saqlanmoqda…" : "Saqlash"}</button>
      </div>
      {msg && <div className={msg.ok ? "adm-ok" : "adm-error"} role="status">{msg.text}</div>}
      {SETTINGS_FIELDS.map((g) => (
        <section key={g.group} className="adm-card">
          <h2>{g.group}</h2>
          <div className="adm-form adm-grid">
            {g.fields.map((f) => (
              <FieldInput key={f.key} field={f} value={s[f.key]} onChange={(v) => { setS({ ...s, [f.key]: v }); setMsg(null); }} />
            ))}
          </div>
        </section>
      ))}
      <section className="adm-card">
        <h2>Kalkulyator narxlari</h2>
        <p className="adm-help">Kalkulyator shu narxlar oralig&apos;ida taxminiy smeta chiqaradi. Narx o&apos;zgarganda shu yerda yangilang.</p>
        <div className="adm-form adm-grid">
          {PRICING_FIELDS.map((f) => (
            <FieldInput key={f.key} field={f} value={p[f.key]} onChange={(v) => { setP({ ...p, [f.key]: v }); setMsg(null); }} />
          ))}
        </div>
      </section>
      <button className="adm-btn adm-primary" onClick={save} disabled={pending} style={{ justifySelf: "start" }}>{pending ? "Saqlanmoqda…" : "Saqlash"}</button>
    </div>
  );
}
