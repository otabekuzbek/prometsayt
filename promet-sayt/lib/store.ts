import "server-only";
import { put, list, get, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "crypto";
import { seedContent, seedIntegrations, seedPrivate } from "./seed";
import type { Content, Lead, PrivateData } from "./types";

/**
 * Ma'lumotlar ombori.
 * - Vercel'da (BLOB_READ_WRITE_TOKEN bor): Vercel Blob.
 * - Lokal ishlab chiqishda: loyiha ichidagi .data/ papkasi.
 *
 * Ochiq kontent (sahifalardagi matn, rasm) — content.json, ochiq.
 * Maxfiy ma'lumot (lidlar, kafolat reestri, CRM tokenlari, parol) — AES-256-GCM bilan shifrlanadi.
 * Kalit AUTH_SECRET'dan olinadi: uni o'zgartirsangiz, eski maxfiy ma'lumot o'qilmay qoladi.
 */

const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const DATA_DIR = path.join(process.cwd(), ".data");
const CONTENT_PATH = "data/content.json";
const PRIVATE_PATH = "private/store.enc";
const LEADS_PREFIX = "private/leads/";

// ---------- Shifrlash ----------

function key() {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "promet-dev-secret";
  return createHash("sha256").update(`promet:${secret}`).digest();
}

export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return "enc1:" + Buffer.concat([iv, c.getAuthTag(), data]).toString("base64");
}

export function decrypt(payload: string): string {
  if (!payload.startsWith("enc1:")) return payload; // eski, shifrlanmagan yozuv
  const buf = Buffer.from(payload.slice(5), "base64");
  const d = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}

async function readText(pathname: string): Promise<string | null> {
  if (useBlob()) {
    const res = await get(pathname, { access: "public", useCache: false });
    if (!res || !res.stream) return null;
    return await new Response(res.stream).text();
  }
  return fs.readFile(path.join(DATA_DIR, pathname), "utf8").catch(() => null);
}

async function writeText(pathname: string, body: string, contentType = "application/json") {
  if (useBlob()) {
    await put(pathname, body, { access: "public", contentType, addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
    return;
  }
  const file = path.join(DATA_DIR, pathname);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body);
}

async function removePath(pathname: string) {
  if (useBlob()) {
    await del(pathname).catch(() => undefined);
    return;
  }
  await fs.rm(path.join(DATA_DIR, pathname), { force: true });
}

// ---------- Ochiq kontent ----------

function withDefaults(raw: Partial<Content> | null): Content {
  const base = structuredClone(seedContent);
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    settings: { ...base.settings, ...(raw.settings || {}) },
    home: { ...base.home, ...(raw.home || {}) },
    pricing: { ...base.pricing, ...(raw.pricing || {}) },
  };
}

export async function getContent(): Promise<Content> {
  try {
    const text = await readText(CONTENT_PATH);
    return withDefaults(text ? JSON.parse(text) : null);
  } catch (e) {
    console.error("content o'qilmadi", e);
    return withDefaults(null);
  }
}

export async function saveContent(content: Content): Promise<void> {
  await writeText(CONTENT_PATH, JSON.stringify(content, null, 1));
}

// ---------- Maxfiy ma'lumot ----------

/** Eski versiyadagi shifrlanmagan private/data*.json faylini topadi (bir martalik ko'chirish uchun) */
async function legacyPrivate(): Promise<Partial<PrivateData> | null> {
  try {
    if (useBlob()) {
      const { blobs } = await list({ prefix: "private/data" });
      if (!blobs.length) return null;
      blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
      const res = await get(blobs[0].url, { access: "public", useCache: false });
      return res?.stream ? JSON.parse(await new Response(res.stream).text()) : null;
    }
    const t = await fs.readFile(path.join(DATA_DIR, "private.json"), "utf8").catch(() => null);
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
}

export async function getPrivate(): Promise<PrivateData> {
  const text = await readText(PRIVATE_PATH);
  let raw: Partial<PrivateData> | null = null;
  if (text) {
    // Shifr ochilmasa xato beramiz — aks holda bo'sh ma'lumot ustiga yozib yuborish xavfi bor
    raw = JSON.parse(decrypt(text));
  } else {
    raw = await legacyPrivate();
  }
  const base = structuredClone(seedPrivate);
  return {
    ...base,
    ...(raw || {}),
    integrations: { ...seedIntegrations, ...(raw?.integrations || {}) },
  };
}

export async function savePrivate(data: PrivateData): Promise<void> {
  await writeText(PRIVATE_PATH, encrypt(JSON.stringify(data)), "text/plain");
}

// ---------- Lidlar ----------

const leadPath = (l: Pick<Lead, "id" | "createdAt">) => `${LEADS_PREFIX}${l.createdAt.slice(0, 10)}-${l.id}.enc`;

export async function saveLead(lead: Lead): Promise<void> {
  await writeText(leadPath(lead), encrypt(JSON.stringify(lead)), "text/plain");
}

function normalizeLead(l: Partial<Lead>): Lead {
  return {
    id: "", createdAt: "", name: "", phone: "", region: "", role: "", timeline: "", comment: "", source: "", calc: "", utm: "", page: "",
    status: "yangi", crm: [], ...l,
  } as Lead;
}

export async function getLeads(limit = 500): Promise<Lead[]> {
  try {
    if (useBlob()) {
      const blobs: { url: string; uploadedAt: Date }[] = [];
      let cursor: string | undefined;
      do {
        const r = await list({ prefix: LEADS_PREFIX, limit: 1000, cursor });
        blobs.push(...r.blobs);
        cursor = r.hasMore ? r.cursor : undefined;
      } while (cursor && blobs.length < 5000);
      blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
      const items = await Promise.all(
        blobs.slice(0, limit).map(async (b) => {
          try {
            const res = await get(b.url, { access: "public", useCache: false });
            if (!res?.stream) return null;
            return normalizeLead(JSON.parse(decrypt(await new Response(res.stream).text())));
          } catch {
            return null;
          }
        }),
      );
      return (items.filter(Boolean) as Lead[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const dir = path.join(DATA_DIR, LEADS_PREFIX);
    const files = await fs.readdir(dir).catch(() => [] as string[]);
    const items = await Promise.all(
      files.map(async (f) => {
        try {
          return normalizeLead(JSON.parse(decrypt(await fs.readFile(path.join(dir, f), "utf8"))));
        } catch {
          return null;
        }
      }),
    );
    return (items.filter(Boolean) as Lead[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  } catch (e) {
    console.error("lidlar o'qilmadi", e);
    return [];
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  const all = await getLeads(5000);
  return all.find((l) => l.id === id) || null;
}

export async function updateLead(lead: Lead): Promise<void> {
  await saveLead(lead);
}

export async function deleteLead(lead: Lead): Promise<void> {
  await removePath(leadPath(lead));
  // eski formatdagi fayllar
  if (useBlob()) {
    const { blobs } = await list({ prefix: `${LEADS_PREFIX}${lead.createdAt.slice(0, 10)}` });
    for (const b of blobs) {
      try {
        const res = await get(b.url, { access: "public", useCache: false });
        const t = res?.stream ? await new Response(res.stream).text() : "";
        if (t && JSON.parse(decrypt(t)).id === lead.id) await del(b.url);
      } catch {
        /* o'tkazib yuboramiz */
      }
    }
  }
}

// ---------- Fayl yuklash (kichik fayllar uchun server orqali) ----------

export async function uploadFile(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${randomUUID()}.${ext}`;
  if (useBlob()) {
    const blob = await put(`uploads/${name}`, file, { access: "public", contentType: file.type || undefined, addRandomSuffix: false });
    return blob.url;
  }
  const dir = path.join(DATA_DIR, "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/api/files/${name}`;
}

/** Lokal rejimda yuklangan faylni o'qish (Vercel'da fayllar Blob'dan to'g'ridan-to'g'ri beriladi) */
export async function readLocalUpload(name: string): Promise<Buffer | null> {
  if (!/^[a-f0-9-]+\.[a-z0-9]+$/.test(name)) return null;
  return fs.readFile(path.join(DATA_DIR, "uploads", name)).catch(() => null);
}

export const storageMode = () => (useBlob() ? "blob" : "local");
