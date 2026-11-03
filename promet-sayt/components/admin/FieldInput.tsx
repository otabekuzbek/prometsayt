"use client";
import { useRef, useState } from "react";
import type { Field } from "@/lib/admin-schema";

/** Rasmni brauzerda kichraytiradi (max 2400px, WEBP) — yuklash tez, sayt yengil */
async function compress(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const max = 2400;
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * k);
    canvas.height = Math.round(bmp.height * k);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/webp", 0.85));
    if (!blob || blob.size > file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

function storage() {
  return document.querySelector<HTMLElement>(".adm")?.dataset.storage || "local";
}

/** Vercel'da fayl brauzerdan to'g'ridan-to'g'ri Blob'ga ketadi (200 MB gacha), lokalda server orqali */
export async function uploadOne(file: File, onProgress?: (p: number) => void): Promise<string> {
  const f = await compress(file);
  if (storage() === "blob") {
    const { upload } = await import("@vercel/blob/client");
    const ext = (f.name.split(".").pop() || "bin").toLowerCase();
    const type = f.type || (ext === "glb" ? "model/gltf-binary" : "application/octet-stream");
    const blob = await upload(`uploads/${Date.now()}.${ext}`, f, {
      access: "public",
      handleUploadUrl: "/api/upload/client",
      contentType: type,
      multipart: f.size > 8 * 1024 * 1024,
      onUploadProgress: (e) => onProgress?.(e.percentage),
    });
    return blob.url;
  }
  const fd = new FormData();
  fd.append("file", f);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(json.error || "Yuklashda xatolik");
  return json.url as string;
}

const isPdf = (s: string) => /\.pdf($|\?)/i.test(s);
const isVideo = (s: string) => /\.(mp4|webm)($|\?)/i.test(s);
const isModel = (s: string) => /\.glb($|\?)/i.test(s);

function Thumb({ src }: { src: string }) {
  if (isPdf(src)) return <span className="adm-pdf">PDF</span>;
  if (isModel(src)) return <span className="adm-pdf">3D</span>;
  if (isVideo(src)) return <video src={src} muted playsInline preload="metadata" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" />;
}

function Uploader({ multiple, accept, label, onDone }: { multiple: boolean; accept: string; label?: string; onDone: (urls: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);
  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setErr("");
    const urls: string[] = [];
    const list = Array.from(files);
    for (let i = 0; i < list.length; i++) {
      const name = list.length > 1 ? `${i + 1}/${list.length}` : "";
      setBusy(`Yuklanmoqda ${name}…`);
      try {
        urls.push(await uploadOne(list[i], (p) => setBusy(`Yuklanmoqda ${name} ${Math.round(p)}%`)));
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
      className={`adm-drop${over ? " over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files);
      }}
    >
      <input ref={ref} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => pick(e.target.files)} />
      <button type="button" className="adm-btn" onClick={() => ref.current?.click()} disabled={!!busy}>
        {busy || label || (multiple ? "+ Rasmlar qo'shish" : "Fayl tanlash")}
      </button>
      <span className="adm-help">yoki faylni shu yerga tashlang</span>
      {err && <span className="adm-err">{err}</span>}
    </div>
  );
}

export default function FieldInput({ field, value, onChange, idPrefix = "f" }: { field: Field; value: unknown; onChange: (v: unknown) => void; idPrefix?: string }) {
  const id = `${idPrefix}-${field.key}`;
  let input: React.ReactNode;
  switch (field.type) {
    case "textarea":
      input = <textarea id={id} className="adm-input" rows={3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "longtext":
      input = <textarea id={id} className="adm-input" rows={14} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      input = <input id={id} className="adm-input" type="number" inputMode="numeric" value={Number(value ?? 0)} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />;
      break;
    case "date":
      input = <input id={id} className="adm-input" type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "color":
      input = (
        <div className="adm-color">
          <input id={id} type="color" value={String(value || "#45494E")} onChange={(e) => onChange(e.target.value)} />
          <input className="adm-input" value={String(value || "")} onChange={(e) => onChange(e.target.value)} aria-label={`${field.label} kodi`} />
        </div>
      );
      break;
    case "toggle":
      return (
        <label className="adm-toggle" htmlFor={id}>
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span aria-hidden="true" />
          {field.label}
        </label>
      );
    case "select":
      input = (
        <select id={id} className="adm-input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case "secret": {
      const isSet = value === "__set__";
      const v = isSet ? "" : String(value ?? "");
      input = (
        <div className="adm-secret">
          <input id={id} className="adm-input" type="password" autoComplete="off" value={v === "__clear__" ? "" : v} placeholder={isSet ? "Saqlangan. O'zgartirish uchun yangisini kiriting" : ""} onChange={(e) => onChange(e.target.value)} />
          {(isSet || v === "__clear__") && (
            <button type="button" className="adm-btn adm-danger" onClick={() => onChange(v === "__clear__" ? "__set__" : "__clear__")}>
              {v === "__clear__" ? "Bekor qilish" : "O'chirish"}
            </button>
          )}
          {v === "__clear__" && <span className="adm-err">Saqlaganda o&apos;chiriladi</span>}
        </div>
      );
      break;
    }
    case "lines":
      input = <textarea id={id} className="adm-input" rows={5} value={Array.isArray(value) ? value.join("\n") : ""} onChange={(e) => onChange(e.target.value.split("\n"))} />;
      break;
    case "image":
    case "file": {
      const v = String(value ?? "");
      const accept = field.type === "image" ? "image/*,application/pdf" : field.accept || "*";
      input = (
        <div className="adm-images">
          {v && (
            <div className="adm-img">
              <a href={v} target="_blank" rel="noopener"><Thumb src={v} /></a>
              <button type="button" onClick={() => onChange("")} aria-label="O'chirish">×</button>
            </div>
          )}
          <Uploader multiple={false} accept={accept} label={v ? "Almashtirish" : undefined} onDone={(u) => onChange(u[0])} />
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
          <Uploader multiple accept="image/*" onDone={(u) => onChange([...arr, ...u])} />
        </div>
      );
      break;
    }
    case "repeater": {
      const arr: Record<string, unknown>[] = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
      const set = (i: number, k: string, v: unknown) => onChange(arr.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
      const move = (i: number, d: number) => {
        const n = [...arr];
        const j = i + d;
        if (j < 0 || j >= n.length) return;
        [n[i], n[j]] = [n[j], n[i]];
        onChange(n);
      };
      input = (
        <div className="adm-repeater">
          {arr.map((item, i) => (
            <div className="adm-rep-item" key={i}>
              <span className="adm-rep-num">{i + 1}</span>
              <div className="adm-rep-fields">
                {field.fields?.map((sf) => (
                  <FieldInput key={sf.key} field={sf} value={item[sf.key]} idPrefix={`${id}-${i}`} onChange={(v) => set(i, sf.key, v)} />
                ))}
              </div>
              <div className="adm-rep-actions">
                <button type="button" onClick={() => move(i, -1)} aria-label="Yuqoriga">↑</button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Pastga">↓</button>
                <button type="button" onClick={() => onChange(arr.filter((_, j) => j !== i))} aria-label="O'chirish">×</button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="adm-btn"
            onClick={() => onChange([...arr, Object.fromEntries((field.fields || []).map((sf) => [sf.key, sf.type === "color" ? "#45494E" : ""]))])}
          >
            + {field.itemLabel || "qator"} qo&apos;shish
          </button>
        </div>
      );
      break;
    }
    default:
      input = <input id={id} className="adm-input" type={field.type === "url" ? "url" : "text"} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <div className={`adm-field${field.type === "repeater" ? " wide" : ""}`}>
      <label htmlFor={id}>{field.label}{field.required && <span style={{ color: "#c0392b" }}> *</span>}</label>
      {input}
      {field.help && <span className="adm-help">{field.help}</span>}
    </div>
  );
}
