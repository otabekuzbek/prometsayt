import { NextResponse, after } from "next/server";
import { randomUUID } from "crypto";
import { getPrivate, saveLead, updateLead } from "@/lib/store";
import { dispatchLead, resolveIntegrations } from "@/lib/crm";
import type { Lead } from "@/lib/types";

const clean = (v: unknown, max = 500) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);

/** +998 90 123 45 67 ko'rinishiga keltiradi; xorijiy raqamlarni o'zgartirmaydi */
function normalizePhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 9) return `+998${d}`;
  if (d.length === 12 && d.startsWith("998")) return `+${d}`;
  return raw.trim().startsWith("+") ? `+${d}` : d;
}

// Oddiy himoya: bitta IP'dan daqiqasiga 5 tadan ko'p so'rov qabul qilinmaydi
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "So'rov noto'g'ri yuborildi" }, { status: 400 });
  }
  if (body.website) return NextResponse.json({ ok: true }); // bot tuzog'i

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Juda ko'p urinish. Bir daqiqadan keyin qayta yuboring" }, { status: 429 });

  const phoneRaw = clean(body.phone, 40);
  const digits = phoneRaw.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) {
    return NextResponse.json({ ok: false, error: "Telefon raqamini to'liq kiriting, masalan +998 90 123 45 67" }, { status: 400 });
  }

  const lead: Lead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name: clean(body.name, 80),
    phone: normalizePhone(phoneRaw),
    region: clean(body.region, 80),
    role: clean(body.role, 60),
    timeline: clean(body.timeline, 60),
    comment: clean(body.comment, 1000),
    source: clean(body.source, 60),
    calc: clean(body.calc, 1500),
    utm: clean(body.utm, 500),
    page: clean(body.page, 300),
    status: "yangi",
    crm: [],
  };

  try {
    await saveLead(lead);
  } catch (e) {
    console.error("Lid saqlanmadi", e);
    // Saqlash ishlamasa ham CRM'ga yuborishga harakat qilamiz — mijoz yo'qolmasin
    try {
      const p = await getPrivate();
      const r = await dispatchLead(lead, resolveIntegrations(p.integrations));
      if (r.results.some((x) => x.ok)) return NextResponse.json({ ok: true });
    } catch (e2) {
      console.error(e2);
    }
    return NextResponse.json({ ok: false, error: "Server xatosi. Iltimos, qo'ng'iroq qiling" }, { status: 500 });
  }

  // CRM va Telegram'ga javob qaytgandan keyin yuboriladi — mijoz kutib qolmaydi
  after(async () => {
    try {
      const p = await getPrivate();
      const { results, crmLeadId } = await dispatchLead(lead, resolveIntegrations(p.integrations));
      if (results.length) await updateLead({ ...lead, crm: results, crmLeadId });
    } catch (e) {
      console.error("CRM yuborishda xato", e);
    }
  });

  return NextResponse.json({ ok: true });
}
