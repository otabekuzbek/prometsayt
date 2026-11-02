"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { checkPassword, createSession, destroySession, isAdmin } from "@/lib/auth";
import { getContent, getPrivate, saveContent, savePrivate } from "@/lib/store";
import { SECTIONS, SETTINGS_FIELDS, PRICING_FIELDS, type Field } from "@/lib/admin-schema";
import type { Content, Pricing, Settings } from "@/lib/types";

export async function login(_: unknown, form: FormData) {
  const pw = String(form.get("password") || "");
  if (!process.env.ADMIN_PASSWORD) return { error: "Serverda ADMIN_PASSWORD o'rnatilmagan" };
  await new Promise((r) => setTimeout(r, 400)); // taxmin qilishni sekinlatish
  if (!checkPassword(pw)) return { error: "Parol noto'g'ri" };
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

function slugify(s: string) {
  const map: Record<string, string> = { "o'": "o", "g'": "g", "oʻ": "o", "gʻ": "g", sh: "sh", ch: "ch" };
  let out = s.toLowerCase();
  for (const [k, v] of Object.entries(map)) out = out.split(k).join(v);
  return out.replace(/[ʻʼ'`’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || randomUUID().slice(0, 8);
}

function coerce(fields: Field[], raw: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = raw[f.key];
    switch (f.type) {
      case "number":
        out[f.key] = Number(v) || 0;
        break;
      case "images":
      case "lines":
        out[f.key] = Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];
        break;
      default:
        out[f.key] = String(v ?? "").trim();
    }
  }
  return out;
}

export async function saveSection(sectionKey: string, items: Record<string, unknown>[]) {
  if (!(await isAdmin())) return { ok: false, error: "Sessiya tugagan, qayta kiring" };
  const schema = SECTIONS.find((s) => s.key === sectionKey);
  if (!schema) return { ok: false, error: "Bo'lim topilmadi" };

  const clean = items.map((it) => {
    const c = coerce(schema.fields, it);
    c.id = typeof it.id === "string" && it.id ? it.id : randomUUID();
    if ("slug" in c) c.slug = slugify(String(c.slug || c[schema.titleField] || ""));
    return c;
  });
  for (const f of schema.fields.filter((f) => f.required)) {
    if (clean.some((c) => !c[f.key])) return { ok: false, error: `«${f.label}» maydoni to'ldirilmagan` };
  }
  if (clean.some((c) => "slug" in c)) {
    const slugs = clean.map((c) => c.slug);
    if (new Set(slugs).size !== slugs.length) return { ok: false, error: "Ikki yozuvning manzili (slug) bir xil" };
  }

  try {
    if (schema.store === "warranties") {
      const nums = clean.map((c) => String(c.number).toUpperCase());
      if (new Set(nums).size !== nums.length) return { ok: false, error: "Kafolat raqamlari takrorlanmasligi kerak" };
      const p = await getPrivate();
      await savePrivate({ ...p, warranties: clean as never });
    } else {
      const c = await getContent();
      (c as unknown as Record<string, unknown>)[schema.store] = clean;
      await saveContent(c);
      revalidatePath("/", "layout");
    }
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Saqlashda xatolik. Qayta urinib ko'ring." };
  }
}

export async function saveSettings(settings: Record<string, unknown>, pricing: Record<string, unknown>) {
  if (!(await isAdmin())) return { ok: false, error: "Sessiya tugagan, qayta kiring" };
  try {
    const c: Content = await getContent();
    const sFields = SETTINGS_FIELDS.flatMap((g) => g.fields);
    c.settings = { ...c.settings, ...(coerce(sFields, settings) as unknown as Settings) };
    c.pricing = { ...c.pricing, ...(coerce(PRICING_FIELDS, pricing) as unknown as Pricing) };
    await saveContent(c);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Saqlashda xatolik. Qayta urinib ko'ring." };
  }
}
