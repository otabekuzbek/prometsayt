"use client";
import { useMemo, useState, useTransition } from "react";
import type { Lead, LeadStatus } from "@/lib/types";
import { LEAD_STATUSES } from "@/lib/admin-schema";
import { removeLead, resendLead, setLeadStatus } from "@/app/admin/actions";

const fmt = (d: string) => new Date(d).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export default function LeadsTable({ initial }: { initial: Lead[] }) {
  const [leads, setLeads] = useState(initial);
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    leads.forEach((l) => (m[l.status] = (m[l.status] || 0) + 1));
    return m;
  }, [leads]);

  const list = leads.filter(
    (l) => (status === "all" || l.status === status) && (!q || `${l.name} ${l.phone} ${l.region} ${l.comment}`.toLowerCase().includes(q.toLowerCase())),
  );

  const patch = (id: string, p: Partial<Lead>) => setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...p } : l)));

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <div>
          <h1>Murojaatlar</h1>
          <span className="adm-help">Saytdagi formalar va kalkulyatordan kelgan murojaatlar. Ma&apos;lumotlar shifrlangan holda saqlanadi.</span>
        </div>
        <div className="adm-toolbar-right">
          <input className="adm-input" placeholder="Ism, telefon yoki hudud…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} />
          <a className="adm-btn" href="/admin/lidlar/csv">Excel'ga yuklab olish</a>
        </div>
      </div>
      <div className="adm-tabs" role="tablist" aria-label="Holat bo'yicha">
        <button role="tab" aria-selected={status === "all"} onClick={() => setStatus("all")}>Barchasi <b>{leads.length}</b></button>
        {LEAD_STATUSES.map((s) => (
          <button key={s.value} role="tab" aria-selected={status === s.value} onClick={() => setStatus(s.value)}>
            {s.label} <b>{counts[s.value] || 0}</b>
          </button>
        ))}
      </div>
      {msg && <div className={msg.ok ? "adm-ok" : "adm-error"} role="status">{msg.text}</div>}
      {list.length === 0 ? (
        <div className="adm-empty">{leads.length ? "Bu filtr bo'yicha murojaat yo'q." : "Hali murojaat yo'q. Saytdagi formadan kelgan har bir murojaat shu yerda paydo bo'ladi."}</div>
      ) : (
        <ul className="adm-list">
          {list.map((l) => {
            const st = LEAD_STATUSES.find((s) => s.value === l.status) || LEAD_STATUSES[0];
            const crmBad = l.crm.some((c) => !c.ok);
            return (
              <li key={l.id} className={open === l.id ? "open" : ""}>
                <div className="adm-row adm-lead">
                  <button className="adm-row-main" onClick={() => setOpen(open === l.id ? null : l.id)}>
                    <b>{l.name || "Ismsiz"} <span style={{ fontWeight: 600, color: "var(--muted)" }}>{l.phone}</span></b>
                    <span>{fmt(l.createdAt)}{l.region ? `, ${l.region}` : ""}{l.source ? `, ${l.source}` : ""}</span>
                  </button>
                  <span className={`adm-crm ${l.crm.length ? (crmBad ? "bad" : "ok") : ""}`} title={l.crm.map((c) => `${c.target}: ${c.message}`).join("\n") || "CRM'ga yuborilmagan"}>
                    {l.crm.length ? (crmBad ? "CRM xato" : "CRM ✓") : "CRM —"}
                  </span>
                  <select
                    className="adm-input adm-status"
                    style={{ borderColor: st.color, color: st.color }}
                    value={l.status}
                    aria-label="Holat"
                    onChange={(e) => {
                      const v = e.target.value as LeadStatus;
                      patch(l.id, { status: v });
                      start(async () => {
                        const r = await setLeadStatus(l.id, v);
                        if (!r.ok) setMsg({ ok: false, text: r.error || "Xato" });
                      });
                    }}
                  >
                    {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <a className="adm-btn" href={tel(l.phone)}>Qo&apos;ng&apos;iroq</a>
                </div>
                {open === l.id && (
                  <div className="adm-form">
                    <dl className="adm-dl">
                      {l.role && (<><dt>Mijoz turi</dt><dd>{l.role}</dd></>)}
                      {l.timeline && (<><dt>Qachon</dt><dd>{l.timeline}</dd></>)}
                      {l.comment && (<><dt>Izoh</dt><dd>{l.comment}</dd></>)}
                      {l.calc && (<><dt>Kalkulyator</dt><dd style={{ whiteSpace: "pre-line" }}>{l.calc}</dd></>)}
                      {l.utm && (<><dt>Reklama</dt><dd>{l.utm}</dd></>)}
                      {l.page && (<><dt>Sahifa</dt><dd>{l.page}</dd></>)}
                      <dt>CRM</dt>
                      <dd>
                        {l.crm.length ? l.crm.map((c) => (
                          <div key={c.target} style={{ color: c.ok ? "var(--green-btn)" : "var(--danger)" }}>{c.target}: {c.message}</div>
                        )) : "Yuborilmagan (integratsiya ulanmagan bo'lishi mumkin)"}
                      </dd>
                    </dl>
                    <div className="adm-form-actions">
                      <button
                        className="adm-btn"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const r = await resendLead(l.id);
                            if (r.lead) patch(l.id, { crm: r.lead.crm, crmLeadId: r.lead.crmLeadId });
                            setMsg({ ok: r.ok, text: r.ok ? `Qayta yuborildi. ${r.message || ""}` : r.error || r.message || "Xato" });
                          })
                        }
                      >
                        CRM&apos;ga qayta yuborish
                      </button>
                      <button
                        className="adm-btn adm-danger"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm(`${l.name || l.phone} murojaati o'chirilsinmi?`)) return;
                          start(async () => {
                            const r = await removeLead(l.id);
                            if (r.ok) setLeads((ls) => ls.filter((x) => x.id !== l.id));
                            else setMsg({ ok: false, text: r.error || "Xato" });
                          });
                        }}
                      >
                        O&apos;chirish
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
