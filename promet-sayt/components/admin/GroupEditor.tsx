"use client";
import { useEffect, useState, useTransition } from "react";
import type { Group } from "@/lib/admin-schema";
import FieldInput from "./FieldInput";

type Obj = Record<string, unknown>;

/** Sozlamalar, bosh sahifa, narxlar va integratsiyalar uchun umumiy tahrirlovchi */
export default function GroupEditor({
  title,
  intro,
  groups,
  initial,
  onSave,
  extra,
  viewHref,
}: {
  title: string;
  intro?: string;
  groups: Group[];
  initial: Obj;
  onSave: (data: Obj) => Promise<{ ok: boolean; error?: string }>;
  extra?: React.ReactNode;
  viewHref?: string;
}) {
  const [data, setData] = useState<Obj>(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (k: string, v: unknown) => {
    setData((d) => ({ ...d, [k]: v }));
    setDirty(true);
    setMsg(null);
  };

  const save = () =>
    start(async () => {
      const r = await onSave(data);
      if (r.ok) {
        setDirty(false);
        setMsg({ ok: true, text: "Saqlandi. Saytda yangilandi" });
      } else setMsg({ ok: false, text: r.error || "Xatolik" });
    });

  const saveBtn = (
    <button className="adm-btn adm-primary" onClick={save} disabled={pending || !dirty}>
      {pending ? "Saqlanmoqda…" : dirty ? "Saqlash" : "Saqlangan"}
    </button>
  );

  return (
    <div className="adm-stack">
      <div className="adm-toolbar adm-sticky">
        <div>
          <h1>{title}</h1>
          {intro && <span className="adm-help">{intro}</span>}
        </div>
        <div className="adm-toolbar-right">
          {viewHref && <a className="adm-btn" href={viewHref} target="_blank" rel="noopener">Saytda ko&apos;rish ↗</a>}
          {saveBtn}
        </div>
      </div>
      {msg && <div className={msg.ok ? "adm-ok" : "adm-error"} role="status">{msg.text}</div>}
      {groups.map((g) => (
        <section key={g.group} className="adm-card">
          <h2>{g.group}</h2>
          {g.help && <p className="adm-help" style={{ marginBottom: 8 }}>{g.help}</p>}
          <div className="adm-form adm-grid">
            {g.fields
              .filter((f) => !f.showIf || f.showIf.equals.includes(String(data[f.showIf.key])))
              .map((f) => (
                <FieldInput key={f.key} field={f} value={data[f.key]} onChange={(v) => set(f.key, v)} />
              ))}
          </div>
        </section>
      ))}
      {extra}
      <div>{saveBtn}</div>
    </div>
  );
}
