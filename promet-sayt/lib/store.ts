import "server-only";
import { put, list, get, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { seedContent, seedPrivate } from "./seed";
import type { Content, Lead, PrivateData } from "./types";

/**
 * Ma'lumotlar ombori.
 * - Vercel'da (BLOB_READ_WRITE_TOKEN bor): Vercel Blob.
 * - Lokal ishlab chiqishda: loyiha ichidagi .data/ papkasi va public/uploads.
 *
 * Ochiq kontent (mahsulot, obyekt, sertifikat...) — content.json.
 * Maxfiy ma'lumot (kafolat reestri, lidlar) — tasodifiy nomli fayllarda,
 * ularning manzili faqat server tomonidan (token bilan) topiladi.
 */

const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const DATA_DIR = path.join(process.cwd(), ".data");
const CONTENT_PATH = "data/content.json";
const PRIVATE_PREFIX = "private/";
const LEADS_PREFIX = "private/leads/";

async function readStream(stream: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!stream) throw new Error("Bo'sh javob");
  return await new Response(stream).text();
}

function withDefaults(raw: Partial<Content> | null): Content {
  if (!raw) return structuredClone(seedContent);
  return {
    ...structuredClone(seedContent),
    ...raw,
    settings: { ...seedContent.settings, ...(raw.settings || {}) },
    pricing: { ...seedContent.pricing, ...(raw.pricing || {}) },
  };
}

// ---------- Ochiq kontent ----------

export async function getContent(): Promise<Content> {
  try {
    if (useBlob()) {
      const res = await get(CONTENT_PATH, { access: "public", useCache: false });
      if (!res) return withDefaults(null);
      return withDefaults(JSON.parse(await readStream(res.stream)));
    }
    const file = await fs.readFile(path.join(DATA_DIR, "content.json"), "utf8");
    return withDefaults(JSON.parse(file));
  } catch {
    return withDefaults(null);
  }
}

export async function saveContent(content: Content): Promise<void> {
  const body = JSON.stringify(content, null, 1);
  if (useBlob()) {
    await put(CONTENT_PATH, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, "content.json"), body);
}

// ---------- Maxfiy ma'lumot (kafolat reestri) ----------

async function findPrivateDataUrl(): Promise<string | null> {
  const { blobs } = await list({ prefix: `${PRIVATE_PREFIX}data` });
  if (!blobs.length) return null;
  blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
  return blobs[0].url;
}

export async function getPrivate(): Promise<PrivateData> {
  try {
    if (useBlob()) {
      const url = await findPrivateDataUrl();
      if (!url) return structuredClone(seedPrivate);
      const res = await get(url, { access: "public", useCache: false });
      if (!res) return structuredClone(seedPrivate);
      return { ...structuredClone(seedPrivate), ...JSON.parse(await readStream(res.stream)) };
    }
    const file = await fs.readFile(path.join(DATA_DIR, "private.json"), "utf8");
    return { ...structuredClone(seedPrivate), ...JSON.parse(file) };
  } catch {
    return structuredClone(seedPrivate);
  }
}

export async function savePrivate(data: PrivateData): Promise<void> {
  const body = JSON.stringify(data, null, 1);
  if (useBlob()) {
    const old = await list({ prefix: `${PRIVATE_PREFIX}data` });
    await put(`${PRIVATE_PREFIX}data.json`, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
      cacheControlMaxAge: 60,
    });
    if (old.blobs.length) await del(old.blobs.map((b) => b.url));
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, "private.json"), body);
}

// ---------- Lidlar ----------

export async function saveLead(lead: Lead): Promise<void> {
  const body = JSON.stringify(lead);
  if (useBlob()) {
    await put(`${LEADS_PREFIX}${lead.createdAt.slice(0, 10)}.json`, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
    });
    return;
  }
  const dir = path.join(DATA_DIR, "leads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${lead.id}.json`), body);
}

export async function getLeads(limit = 200): Promise<Lead[]> {
  try {
    if (useBlob()) {
      const { blobs } = await list({ prefix: LEADS_PREFIX, limit: 1000 });
      blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
      const items = await Promise.all(
        blobs.slice(0, limit).map(async (b) => {
          const res = await get(b.url, { access: "public" });
          return res ? (JSON.parse(await readStream(res.stream)) as Lead) : null;
        }),
      );
      return items.filter(Boolean) as Lead[];
    }
    const dir = path.join(DATA_DIR, "leads");
    const files = await fs.readdir(dir).catch(() => [] as string[]);
    const items = await Promise.all(
      files.map(async (f) => JSON.parse(await fs.readFile(path.join(dir, f), "utf8")) as Lead),
    );
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  } catch {
    return [];
  }
}

// ---------- Fayl yuklash ----------

export async function uploadFile(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${randomUUID()}.${ext}`;
  if (useBlob()) {
    const blob = await put(`uploads/${name}`, file, {
      access: "public",
      contentType: file.type || undefined,
      addRandomSuffix: false,
    });
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
