"use client";
import { useEffect, useState, useTransition } from "react";
import { SECTIONS } from "@/lib/admin-schema";
import { saveSection } from "@/app/admin/actions";
import FieldInput from "./FieldInput";

type Item = Record<string, unknown>;

export default function CollectionEditor({ sectionKey, initial }: { sectionKey: string; initial: Item[] }) {
  const schema = SECTIONS.find((s) => s.key === sectionKey)!;
  const [items, setItems] = useState<Item[]>(initial);
  const [editing, setEditing] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (next: Item[]) => {
    setItems(next);
    setDirty(true);
    setMsg(null);
  };

  function save(next = items) {
    start(async () => {
      const r = await saveSection(sectionKey, next);
      if (r.ok) {
        setDirty(false);
        setMsg({ ok: true, text: "Saqlandi — saytda yangilandi" });
      } else setMsg({ ok: false, text: r.error || "Xatolik" });
    });
  }

  function add() {
    const n = [{ ...schema.blank(), id: "" }, ...items];
    update(n);
    setEditing(0);
  }

  function remove(i: number) {
    const t = String(items[i][schema.titleField] || schema.singular);
    if (!confirm(`«${t}» o'chirilsinmi?`)) return;
    update(items.filter((_, k) => k !== i));
    setEditing(null);
  }

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    update(n);
  }

  const cover = (it: Item) => {
    if (!schema.imageField) return "";
    const v = it[schema.imageField];
    return Array.isArray(v) ? String(v[0] || "") : String(v || "");
  };

  const visible = items
    .map((it, i) => ({ it, i }))
    .filter(({ it }) => !q || JSON.stringify(it).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <div>
          <h1>{schema.title}</h1>
          <span className="adm-help">{items.length} ta yozuv</span>
        </div>
        <div className="adm-toolbar-right">
          {items.length > 6 && <input className="adm-input" placeholder="Qidirish…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 220 }} />}
          <button className="adm-btn" onClick={add}>+ Yangi {schema.singular}</button>
          <button className="adm-btn adm-primary" onClick={() => save()} disabled={pending || !dirty}>
            {pending ? "Saqlanmoqda…" : dirty ? "Saqlash" : "Saqlangan"}
          </button>
        </div>
      </div>
      {msg && <div className={msg.ok ? "adm-ok" : "adm-error"} role="status">{msg.text}</div>}
      {dirty && !msg && <div className="adm-warn">O&apos;zgarishlar hali saqlanmagan</div>}

      {items.length === 0 && <div className="adm-empty">Hozircha {schema.singular} yo&apos;q. «+ Yangi {schema.singular}» tugmasini bosing.</div>}

      <ul className="adm-list">
        {visible.map(({ it, i }) => (
          <li key={String(it.id) || `new-${i}`} className={editing === i ? "open" : ""}>
            <div className="adm-row">
              {schema.imageField && (
                <span className="adm-row-img">
                  {cover(it) ? (
                    cover(it).toLowerCase().endsWith(".pdf") ? <span className="adm-pdf">PDF</span> : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover(it)} alt="" />
                    )
                  ) : <span className="adm-noimg">Rasm yo&apos;q</span>}
                </span>
              )}
              <button className="adm-row-main" onClick={() => setEditing(editing === i ? null : i)}>
                <b>{String(it[schema.titleField] || `Yangi ${schema.singular}`)}</b>
                {schema.subtitle && <span>{schema.subtitle(it)}</span>}
              </button>
              <div className="adm-row-actions">
                <button onClick={() => move(i, -1)} aria-label="Yuqoriga" title="Yuqoriga">↑</button>
                <button onClick={() => move(i, 1)} aria-label="Pastga" title="Pastga">↓</button>
                <button onClick={() => setEditing(editing === i ? null : i)}>{editing === i ? "Yopish" : "Tahrirlash"}</button>
              </div>
            </div>
            {editing === i && (
              <div className="adm-form">
                {schema.fields.map((f) => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    value={it[f.key]}
                    onChange={(v) => update(items.map((x, k) => (k === i ? { ...x, [f.key]: v } : x)))}
                  />
                ))}
                <div className="adm-form-actions">
                  <button className="adm-btn adm-primary" onClick={() => save()} disabled={pending}>{pending ? "Saqlanmoqda…" : "Saqlash"}</button>
                  <button className="adm-btn adm-danger" onClick={() => remove(i)}>O&apos;chirish</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
