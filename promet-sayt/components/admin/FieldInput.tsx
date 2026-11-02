"use client";
import { useRef, useState } from "react";
import type { Field } from "@/lib/admin-schema";

/** Rasmni brauzerda kichraytiradi (max 2000px, WEBP) — yuklash tez, sayt yengil */
async function compress(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const max = 2000;
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * k);
    const h = Math.round(bmp.height * k);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/webp", 0.82));
    if (!blob || blob.size > file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function uploadOne(file: File): Promise<string> {
  const f = await compress(file);
  const fd = new FormData();
  fd.append("file", f);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(json.error || "Yuklashda xatolik");
  return json.url as string;
}

function Thumb({ src }: { src: string }) {
  if (src.toLowerCase().endsWith(".pdf")) return <span className="adm-pdf">PDF</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" />;
}

function Uploader({ multiple, onDone }: { multiple: boolean; onDone: (urls: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setErr("");
    const urls: string[] = [];
    const list = Array.from(files);
    for (let i = 0; i < list.length; i++) {
      setBusy(`Yuklanmoqda ${i + 1}/${list.length}…`);
      try {
        urls.push(await uploadOne(list[i]));
      } catch (e) {
        setErr(`${list[i].name}: ${e instanceof Error ? e.message : "xato"}`);
      }
    }
    setBusy("");
    if (ref.current) ref.current.value = "";
    if (urls.length) onDone(urls);
  }
  return (
    <div
      className="adm-drop"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        pick(e.dataTransfer.files);
      }}
    >
      <input ref={ref} type="file" accept="image/*,application/pdf" multiple={multiple} hidden onChange={(e) => pick(e.target.files)} />
      <button type="button" className="adm-btn" onClick={() => ref.current?.click()} disabled={!!busy}>
        {busy || (multiple ? "+ Rasmlar qo'shish" : "Rasm tanlash")}
      </button>
      <span className="adm-help">yoki faylni shu yerga tashlang</span>
      {err && <span className="adm-err">{err}</span>}
    </div>
  );
}

export default function FieldInput({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = `f-${field.key}`;
  let input: React.ReactNode;
  switch (field.type) {
    case "textarea":
      input = <textarea id={id} className="adm-input" rows={3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "longtext":
      input = <textarea id={id} className="adm-input" rows={12} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      input = <input id={id} className="adm-input" type="number" inputMode="numeric" value={Number(value ?? 0)} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />;
      break;
    case "date":
      input = <input id={id} className="adm-input" type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "select":
      input = (
        <select id={id} className="adm-input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case "lines":
      input = (
        <textarea
          id={id}
          className="adm-input"
          rows={5}
          value={Array.isArray(value) ? value.join("\n") : ""}
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      );
      break;
    case "image": {
      const v = String(value ?? "");
      input = (
        <div className="adm-images">
          {v && (
            <div className="adm-img">
              <a href={v} target="_blank" rel="noopener"><Thumb src={v} /></a>
              <button type="button" onClick={() => onChange("")} aria-label="O'chirish">×</button>
            </div>
          )}
          <Uploader multiple={false} onDone={(u) => onChange(u[0])} />
        </div>
      );
      break;
    }
    case "images": {
      const arr: string[] = Array.isArray(value) ? (value as string[]) : [];
      const move = (i: number, d: number) => {
        const n = [...arr];
        const j = i + d;
        if (j < 0 || j >= n.length) return;
        [n[i], n[j]] = [n[j], n[i]];
        onChange(n);
      };
      input = (
        <div className="adm-images">
          {arr.map((src, i) => (
            <div className="adm-img" key={src + i}>
              <a href={src} target="_blank" rel="noopener"><Thumb src={src} /></a>
              {i === 0 && <span className="adm-cover">Muqova</span>}
              <button type="button" onClick={() => onChange(arr.filter((_, k) => k !== i))} aria-label="O'chirish">×</button>
              <div className="adm-img-move">
                <button type="button" onClick={() => move(i, -1)} aria-label="Chapga">‹</button>
                <button type="button" onClick={() => move(i, 1)} aria-label="O'ngga">›</button>
              </div>
            </div>
          ))}
          <Uploader multiple onDone={(u) => onChange([...arr, ...u])} />
        </div>
      );
      break;
    }
    default:
      input = <input id={id} className="adm-input" type={field.type === "url" ? "url" : "text"} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <div className="adm-field">
      <label htmlFor={id}>{field.label}{field.required && <span style={{ color: "#c0392b" }}> *</span>}</label>
      {input}
      {field.help && <span className="adm-help">{field.help}</span>}
    </div>
  );
}
