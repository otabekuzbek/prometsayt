import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveLead } from "@/lib/store";
import type { Lead } from "@/lib/types";

const clean = (v: unknown, max = 500) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Noto'g'ri so'rov" }, { status: 400 });
  }
  // Spam tuzog'i: odam ko'rmaydigan maydon
  if (body.website) return NextResponse.json({ ok: true });

  const phone = clean(body.phone, 40);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) return NextResponse.json({ ok: false, error: "Telefon raqamini to'g'ri kiriting" }, { status: 400 });

  const lead: Lead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name: clean(body.name, 80),
    phone,
    region: clean(body.region, 80),
    role: clean(body.role, 60),
    timeline: clean(body.timeline, 60),
    comment: clean(body.comment, 1000),
    source: clean(body.source, 60),
    calc: clean(body.calc, 1500),
    utm: clean(body.utm, 500),
    page: clean(body.page, 300),
  };

  const results = await Promise.allSettled([saveLead(lead), toAmo(lead), toTelegram(lead)]);
  if (results.every((r) => r.status === "rejected")) {
    console.error("Lid saqlanmadi", results);
    return NextResponse.json({ ok: false, error: "Server xatosi" }, { status: 500 });
  }
  results.forEach((r, i) => r.status === "rejected" && console.error(["store", "amo", "telegram"][i], r.reason));
  return NextResponse.json({ ok: true });
}

async function toAmo(lead: Lead) {
  const url = process.env.AMOCRM_WEBHOOK_URL;
  if (!url) return;
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
  if (!res.ok) throw new Error(`amoCRM ${res.status}`);
}

async function toTelegram(lead: Lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const lines = [
    "🏠 Yangi murojaat — promet sayt",
    `Ism: ${lead.name || "—"}`,
    `Tel: ${lead.phone}`,
    lead.region && `Hudud: ${lead.region}`,
    lead.role && `Kim: ${lead.role}`,
    lead.timeline && `Qachon: ${lead.timeline}`,
    lead.comment && `Izoh: ${lead.comment}`,
    lead.calc && `\nKalkulyator:\n${lead.calc}`,
    `\nManba: ${lead.source} · ${lead.page}`,
    lead.utm && `UTM: ${lead.utm}`,
  ].filter(Boolean);
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text: lines.join("\n") }),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}`);
}
