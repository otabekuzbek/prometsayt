import { isAdmin } from "@/lib/auth";
import { getLeads } from "@/lib/store";
import { LEAD_STATUSES } from "@/lib/admin-schema";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** Excel'da to'g'ri ochiladigan CSV (UTF-8 BOM, nuqtali vergul) */
export async function GET() {
  if (!(await isAdmin())) return new Response("Ruxsat yo'q", { status: 401 });
  const leads = await getLeads(5000);
  const head = ["Sana", "Ism", "Telefon", "Hudud", "Mijoz turi", "Qachon", "Holat", "Manba", "Izoh", "Kalkulyator", "UTM", "Sahifa", "CRM"];
  const rows = leads.map((l) => [
    new Date(l.createdAt).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" }),
    l.name, l.phone, l.region, l.role, l.timeline,
    LEAD_STATUSES.find((s) => s.value === l.status)?.label || l.status,
    l.source, l.comment, l.calc, l.utm, l.page,
    l.crm.map((c) => `${c.target}: ${c.ok ? "OK" : "xato"}`).join(", "),
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="murojaatlar-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
