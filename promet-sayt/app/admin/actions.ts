"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { checkPassword, createSession, destroySession, hashPassword, isAdmin } from "@/lib/auth";
import { deleteLead, getContent, getLead, getPrivate, saveContent, savePrivate, updateLead } from "@/lib/store";
import { dispatchLead, resolveIntegrations } from "@/lib/crm";
import { HOME_GROUPS, INTEGRATION_GROUPS, LEAD_STATUSES, PRICING_GROUPS, SECTIONS, SETTINGS_GROUPS, type Field, type Group } from "@/lib/admin-schema";
import type { Content, Integrations, Lead, LeadStatus } from "@/lib/types";

type Result = { ok: boolean; error?: string; message?: string };
const DENIED: Result = { ok: false, error: "Sessiya tugagan. Qayta kiring" };

// Parolni taxmin qilishni sekinlashtirish
const attempts = new Map<string, { n: number; until: number }>();

export async function login(_: unknown, form: FormData) {
  const pw = String(form.get("password") || "");
  const key = "admin";
  const a = attempts.get(key);
  if (a && a.until > Date.now()) return { error: "Ko'p noto'g'ri urinish. 1 daqiqadan keyin qayta urinib ko'ring" };
  await new Promise((r) => setTimeout(r, 400));
  if (!(await checkPassword(pw))) {
    const n = (a?.n || 0) + 1;
    attempts.set(key, { n, until: n >= 5 ? Date.now() + 60_000 : 0 });
    return { error: process.env.ADMIN_PASSWORD ? "Parol noto'g'ri" : "Serverda ADMIN_PASSWORD o'rnatilmagan (Vercel → Environment Variables)" };
  }
  attempts.delete(key);
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

function slugify(s: string) {
  let out = s.toLowerCase().replace(/[ʻʼ'`’‘]/g, "");
  const map: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya", қ: "q", ғ: "g", ҳ: "h", ў: "o" };
  out = out.replace(/[а-яёқғҳў]/g, (c) => map[c] ?? "");
  return out.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || randomUUID().slice(0, 8);
}

function coerce(fields: Field[], raw: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = raw[f.key];
    switch (f.type) {
      case "number":
        out[f.key] = Number(v) || 0;
        break;
      case "toggle":
        out[f.key] = Boolean(v);
        break;
      case "images":
      case "lines":
        out[f.key] = Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];
        break;
      case "repeater":
        out[f.key] = Array.isArray(v)
          ? v.map((item) => coerce(f.fields || [], (item || {}) as Record<string, unknown>)).filter((item) => Object.values(item).some((x) => String(x).trim()))
          : [];
        break;
      case "color": {
        const s = String(v ?? "").trim();
        out[f.key] = /^#[0-9a-f]{6}$/i.test(s) ? s : "#45494E";
        break;
      }
      default:
        out[f.key] = String(v ?? "").trim();
    }
  }
  return out;
}

const flat = (groups: Group[]) => groups.flatMap((g) => g.fields);

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveSection(sectionKey: string, items: Record<string, unknown>[]): Promise<Result> {
  if (!(await isAdmin())) return DENIED;
  const schema = SECTIONS.find((s) => s.key === sectionKey);
  if (!schema) return { ok: false, error: "Bo'lim topilmadi" };

  const clean = items.map((it) => {
    const c = coerce(schema.fields, it);
    c.id = typeof it.id === "string" && it.id ? it.id : randomUUID();
    if ("slug" in c) c.slug = slugify(String(c.slug || c[schema.titleField] || ""));
    return c;
  });
  for (const f of schema.fields.filter((f) => f.required)) {
    const bad = clean.findIndex((c) => !c[f.key]);
    if (bad >= 0) return { ok: false, error: `${bad + 1}-yozuvda «${f.label}» to'ldirilmagan` };
  }
  if (clean.some((c) => "slug" in c)) {
    const slugs = clean.map((c) => c.slug);
    if (new Set(slugs).size !== slugs.length) return { ok: false, error: "Ikki yozuvning sahifa manzili (slug) bir xil. Birini o'zgartiring" };
  }

  try {
    if (schema.store === "warranties") {
      const nums = clean.map((c) => String(c.number).trim().toUpperCase());
      if (new Set(nums).size !== nums.length) return { ok: false, error: "Kafolat raqamlari takrorlanmasligi kerak" };
      const p = await getPrivate();
      await savePrivate({ ...p, warranties: clean as never });
    } else {
      const c = await getContent();
      (c as unknown as Record<string, unknown>)[schema.store] = clean;
      await saveContent(c);
      refresh();
    }
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Saqlashda xatolik. Internetni tekshirib, qayta urinib ko'ring" };
  }
}

export async function saveObject(kind: "settings" | "home" | "pricing", data: Record<string, unknown>): Promise<Result> {
  if (!(await isAdmin())) return DENIED;
  try {
    const c: Content = await getContent();
    if (kind === "settings") c.settings = { ...c.settings, ...(coerce(flat(SETTINGS_GROUPS), data) as object) };
    if (kind === "home") c.home = { ...c.home, ...(coerce(flat(HOME_GROUPS), data) as object) };
    if (kind === "pricing") {
      const p = coerce(flat(PRICING_GROUPS), data) as Record<string, number>;
      if (p.cherepitsaMin > p.cherepitsaMax || p.profnastilMin > p.profnastilMax || p.turnkeyMin > p.turnkeyMax) {
        return { ok: false, error: "Minimal narx maksimaldan katta bo'lmasligi kerak" };
      }
      c.pricing = { ...c.pricing, ...(p as object) };
    }
    await saveContent(c);
    refresh();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Saqlashda xatolik. Qayta urinib ko'ring" };
  }
}

/** Integratsiyalar: maxfiy maydon bo'sh yuborilsa — eski qiymat saqlanadi, "__clear__" — o'chiriladi */
export async function saveIntegrations(data: Record<string, unknown>): Promise<Result> {
  if (!(await isAdmin())) return DENIED;
  try {
    const p = await getPrivate();
    const next = { ...p.integrations } as Record<string, string>;
    for (const f of flat(INTEGRATION_GROUPS)) {
      const v = String(data[f.key] ?? "").trim();
      if (f.type === "secret") {
        if (v === "__clear__") next[f.key] = "";
        else if (v) next[f.key] = v;
      } else next[f.key] = v;
    }
    next.amoDomain = next.amoDomain.replace(/^https?:\/\/(?=[^/]*amocrm|[^/]*kommo)/, "").replace(/\/+$/, "");
    await savePrivate({ ...p, integrations: next as unknown as Integrations });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Saqlab bo'lmadi. AUTH_SECRET o'zgartirilgan bo'lishi mumkin" };
  }
}

export async function testIntegrations(): Promise<Result & { results?: { target: string; ok: boolean; message: string }[] }> {
  if (!(await isAdmin())) return DENIED;
  const p = await getPrivate();
  const c = await getContent();
  const cfg = resolveIntegrations(p.integrations);
  const test: Lead = {
    id: randomUUID(), createdAt: new Date().toISOString(), name: "Test murojaat", phone: c.settings.phone.replace(/[^\d+]/g, ""),
    region: "Toshkent", role: "Test", timeline: "", comment: "Bu admin paneldan yuborilgan sinov xabari. O'chirib yuborishingiz mumkin.",
    source: "test", calc: "", utm: "utm_source=test", page: "/admin", status: "yangi", crm: [],
  };
  const { results } = await dispatchLead(test, cfg);
  if (!results.length) return { ok: false, error: "Hech qanday tizim ulanmagan. Avval maydonlarni to'ldirib saqlang" };
  return { ok: results.every((r) => r.ok), results };
}

export async function setLeadStatus(id: string, status: LeadStatus): Promise<Result> {
  if (!(await isAdmin())) return DENIED;
  if (!LEAD_STATUSES.some((s) => s.value === status)) return { ok: false, error: "Noto'g'ri holat" };
  const l = await getLead(id);
  if (!l) return { ok: false, error: "Murojaat topilmadi" };
  await updateLead({ ...l, status });
  return { ok: true };
}

export async function resendLead(id: string): Promise<Result & { lead?: Lead }> {
  if (!(await isAdmin())) return DENIED;
  const l = await getLead(id);
  if (!l) return { ok: false, error: "Murojaat topilmadi" };
  const p = await getPrivate();
  const { results, crmLeadId } = await dispatchLead(l, resolveIntegrations(p.integrations));
  if (!results.length) return { ok: false, error: "Hech qanday CRM ulanmagan. Integratsiyalar bo'limini to'ldiring" };
  const next = { ...l, crm: results, crmLeadId: crmLeadId || l.crmLeadId };
  await updateLead(next);
  return { ok: results.every((r) => r.ok), lead: next, message: results.map((r) => `${r.target}: ${r.message}`).join("; ") };
}

export async function removeLead(id: string): Promise<Result> {
  if (!(await isAdmin())) return DENIED;
  const l = await getLead(id);
  if (!l) return { ok: false, error: "Murojaat topilmadi" };
  await deleteLead(l);
  return { ok: true };
}

export async function changePassword(current: string, next: string): Promise<Result> {
  if (!(await isAdmin())) return DENIED;
  if (!(await checkPassword(current))) return { ok: false, error: "Joriy parol noto'g'ri" };
  if (next.length < 8) return { ok: false, error: "Yangi parol kamida 8 belgidan iborat bo'lsin" };
  if (!/\d/.test(next) || !/[a-zA-Z]/.test(next)) return { ok: false, error: "Parolda harf va raqam bo'lsin" };
  const p = await getPrivate();
  await savePrivate({ ...p, passwordHash: hashPassword(next) });
  return { ok: true, message: "Parol o'zgartirildi. Keyingi kirishda yangi paroldan foydalaning" };
}
