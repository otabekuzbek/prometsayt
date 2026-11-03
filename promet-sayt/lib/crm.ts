import "server-only";
import type { CrmResult, Integrations, Lead } from "./types";

/**
 * Lidni ulangan tizimlarga yuborish: amoCRM (API v4), Bitrix24 (incoming webhook),
 * istalgan webhook (n8n, Make, Zapier...) va Telegram.
 * Admin paneldagi qiymat bo'lmasa, muhit o'zgaruvchisi (AMOCRM_DOMAIN, AMOCRM_TOKEN, ...) ishlatiladi.
 */

export function resolveIntegrations(saved: Integrations): Integrations {
  const env = process.env;
  const pick = (a: string, b?: string) => (a && a.trim()) || (b || "").trim();
  return {
    amoDomain: pick(saved.amoDomain, env.AMOCRM_DOMAIN),
    amoToken: pick(saved.amoToken, env.AMOCRM_TOKEN),
    amoPipelineId: pick(saved.amoPipelineId, env.AMOCRM_PIPELINE_ID),
    amoStatusId: pick(saved.amoStatusId, env.AMOCRM_STATUS_ID),
    amoResponsibleId: pick(saved.amoResponsibleId, env.AMOCRM_RESPONSIBLE_ID),
    amoTags: pick(saved.amoTags, env.AMOCRM_TAGS),
    bitrixWebhook: pick(saved.bitrixWebhook, env.BITRIX24_WEBHOOK),
    webhookUrl: pick(saved.webhookUrl, env.LEAD_WEBHOOK_URL || env.AMOCRM_WEBHOOK_URL),
    telegramToken: pick(saved.telegramToken, env.TELEGRAM_BOT_TOKEN),
    telegramChatId: pick(saved.telegramChatId, env.TELEGRAM_CHAT_ID),
  };
}

const ROLE_SOURCES: Record<string, string> = {
  "bosh-sahifa": "Bosh sahifa formasi",
  aloqa: "Aloqa sahifasi",
  kalkulyator: "Kalkulyator",
};

export function leadTitle(l: Lead) {
  const src = ROLE_SOURCES[l.source] || (l.source.startsWith("mahsulot-") ? `Mahsulot: ${l.source.slice(9)}` : l.source || "Sayt");
  return `Saytdan murojaat — ${src}`;
}

export function leadText(l: Lead) {
  const utm = new URLSearchParams(l.utm);
  return [
    `Ism: ${l.name || "—"}`,
    `Telefon: ${l.phone}`,
    l.region && `Hudud: ${l.region}`,
    l.role && `Mijoz turi: ${l.role}`,
    l.timeline && `Qachon boshlaydi: ${l.timeline}`,
    l.comment && `Izoh: ${l.comment}`,
    l.calc && `\nKalkulyator hisobi:\n${l.calc}`,
    `\nManba: ${leadTitle(l)}`,
    l.page && `Sahifa: ${l.page}`,
    utm.get("utm_source") && `UTM source: ${utm.get("utm_source")}`,
    utm.get("utm_medium") && `UTM medium: ${utm.get("utm_medium")}`,
    utm.get("utm_campaign") && `UTM campaign: ${utm.get("utm_campaign")}`,
    utm.get("utm_content") && `UTM content: ${utm.get("utm_content")}`,
    utm.get("gclid") && `gclid: ${utm.get("gclid")}`,
    utm.get("yclid") && `yclid: ${utm.get("yclid")}`,
    utm.get("fbclid") && `fbclid: ${utm.get("fbclid")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function fetchJson(url: string, init: RequestInit, timeoutMs = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* matn javob */
    }
    return { res, json, text };
  } finally {
    clearTimeout(t);
  }
}

function amoBase(domain: string) {
  const d = domain.trim().replace(/\/+$/, "");
  if (/^https?:\/\//.test(d)) return d; // test yoki maxsus manzil
  const host = d.includes(".") ? d : `${d}.amocrm.ru`;
  return `https://${host}`;
}

/** amoCRM: lid + kontakt (telefon bilan) + teglar bitta so'rovda, keyin to'liq ma'lumot izoh sifatida */
export async function sendAmo(l: Lead, cfg: Integrations): Promise<{ ok: boolean; message: string; leadId?: string }> {
  const base = amoBase(cfg.amoDomain);
  const headers = { Authorization: `Bearer ${cfg.amoToken}`, "Content-Type": "application/json" };
  const num = (v: string) => (v && /^\d+$/.test(v.trim()) ? Number(v.trim()) : undefined);
  const tags = cfg.amoTags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
  const utm = new URLSearchParams(l.utm);
  if (utm.get("utm_source")) tags.push({ name: utm.get("utm_source")! });

  const body = [
    {
      name: leadTitle(l),
      ...(num(cfg.amoPipelineId) ? { pipeline_id: num(cfg.amoPipelineId) } : {}),
      ...(num(cfg.amoStatusId) ? { status_id: num(cfg.amoStatusId) } : {}),
      ...(num(cfg.amoResponsibleId) ? { responsible_user_id: num(cfg.amoResponsibleId) } : {}),
      _embedded: {
        tags,
        contacts: [
          {
            first_name: l.name || "Saytdan mijoz",
            ...(num(cfg.amoResponsibleId) ? { responsible_user_id: num(cfg.amoResponsibleId) } : {}),
            custom_fields_values: [{ field_code: "PHONE", values: [{ enum_code: "WORK", value: l.phone }] }],
          },
        ],
      },
    },
  ];
  const { res, json, text } = await fetchJson(`${base}/api/v4/leads/complex`, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const hint = res.status === 401 ? " (token noto'g'ri yoki muddati tugagan)" : res.status === 400 ? " (pipeline/status ID yoki maydonlarni tekshiring)" : "";
    return { ok: false, message: `amoCRM ${res.status}${hint}: ${text.slice(0, 300)}` };
  }
  const leadId = Array.isArray(json) && json[0] && typeof json[0] === "object" ? String((json[0] as { id?: number }).id ?? "") : "";
  if (leadId) {
    const note = [{ entity_id: Number(leadId), note_type: "common", params: { text: leadText(l) } }];
    const n = await fetchJson(`${base}/api/v4/leads/notes`, { method: "POST", headers, body: JSON.stringify(note) });
    if (!n.res.ok) return { ok: true, leadId, message: `Lid #${leadId} yaratildi, lekin izoh qo'shilmadi (${n.res.status})` };
  }
  return { ok: true, leadId, message: leadId ? `Lid #${leadId} yaratildi` : "Yuborildi" };
}

/** Bitrix24: crm.lead.add incoming webhook orqali */
export async function sendBitrix(l: Lead, url: string) {
  const base = url.trim().replace(/\/+$/, "");
  const endpoint = /crm\.lead\.add/.test(base) ? base : `${base}/crm.lead.add.json`;
  const utm = new URLSearchParams(l.utm);
  const fields = {
    TITLE: leadTitle(l),
    NAME: l.name || "Saytdan mijoz",
    PHONE: [{ VALUE: l.phone, VALUE_TYPE: "WORK" }],
    COMMENTS: leadText(l).replace(/\n/g, "<br>"),
    SOURCE_ID: "WEB",
    SOURCE_DESCRIPTION: l.page,
    UTM_SOURCE: utm.get("utm_source") || "",
    UTM_MEDIUM: utm.get("utm_medium") || "",
    UTM_CAMPAIGN: utm.get("utm_campaign") || "",
    UTM_CONTENT: utm.get("utm_content") || "",
  };
  const { res, json, text } = await fetchJson(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields, params: { REGISTER_SONET_EVENT: "Y" } }),
  });
  const err = json && typeof json === "object" && "error" in json ? String((json as { error_description?: string }).error_description || (json as { error: string }).error) : "";
  if (!res.ok || err) return { ok: false, message: `Bitrix24 ${res.status}: ${err || text.slice(0, 200)}` };
  const id = json && typeof json === "object" && "result" in json ? String((json as { result: number }).result) : "";
  return { ok: true, message: id ? `Lid #${id} yaratildi` : "Yuborildi" };
}

export async function sendWebhook(l: Lead, url: string) {
  const { res, text } = await fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: l.id, createdAt: l.createdAt, name: l.name, phone: l.phone, region: l.region, role: l.role, timeline: l.timeline, comment: l.comment, source: l.source, calc: l.calc, utm: l.utm, page: l.page, title: leadTitle(l), text: leadText(l) }),
  });
  return res.ok ? { ok: true, message: `Yuborildi (${res.status})` } : { ok: false, message: `Webhook ${res.status}: ${text.slice(0, 200)}` };
}

export async function sendTelegram(l: Lead, token: string, chatId: string) {
  const text = `🏠 ${leadTitle(l)}\n\n${leadText(l)}`;
  const { res, json } = await fetchJson(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4000), disable_web_page_preview: true }),
  });
  const desc = json && typeof json === "object" && "description" in json ? String((json as { description: string }).description) : "";
  return res.ok ? { ok: true, message: "Xabar yuborildi" } : { ok: false, message: `Telegram ${res.status}: ${desc}` };
}

/** Barcha ulangan tizimlarga yuboradi va natijalarni qaytaradi */
export async function dispatchLead(l: Lead, cfg: Integrations): Promise<{ results: CrmResult[]; crmLeadId?: string }> {
  const at = new Date().toISOString();
  const jobs: Promise<CrmResult & { leadId?: string }>[] = [];
  const wrap = (target: string, p: Promise<{ ok: boolean; message: string; leadId?: string }>) =>
    p.then((r) => ({ target, at, ...r })).catch((e) => ({ target, at, ok: false, message: e?.name === "AbortError" ? "Javob kutish vaqti tugadi" : String(e?.message || e) }));

  if (cfg.amoDomain && cfg.amoToken) jobs.push(wrap("amoCRM", sendAmo(l, cfg)));
  if (cfg.bitrixWebhook) jobs.push(wrap("Bitrix24", sendBitrix(l, cfg.bitrixWebhook)));
  if (cfg.webhookUrl) jobs.push(wrap("Webhook", sendWebhook(l, cfg.webhookUrl)));
  if (cfg.telegramToken && cfg.telegramChatId) jobs.push(wrap("Telegram", sendTelegram(l, cfg.telegramToken, cfg.telegramChatId)));

  const all = await Promise.all(jobs);
  const amo = all.find((r) => r.target === "amoCRM" && r.ok);
  return { results: all.map(({ target, ok, message, at }) => ({ target, ok, message, at })), crmLeadId: amo?.leadId };
}
