import Link from "next/link";
import { getContent, getLeads, getPrivate, storageMode } from "@/lib/store";
import { resolveIntegrations } from "@/lib/crm";
import { LEAD_STATUSES } from "@/lib/admin-schema";

export default async function Dashboard() {
  const [c, leads] = await Promise.all([getContent(), getLeads(1000)]);
  let p = null;
  let privateErr = false;
  try {
    p = await getPrivate();
  } catch {
    privateErr = true;
  }
  const cfg = p ? resolveIntegrations(p.integrations) : null;
  const crm = cfg ? [cfg.amoDomain && cfg.amoToken && "amoCRM", cfg.bitrixWebhook && "Bitrix24", cfg.webhookUrl && "Webhook", cfg.telegramToken && cfg.telegramChatId && "Telegram"].filter(Boolean) : [];
  const now = Date.now();
  const week = leads.filter((l) => now - +new Date(l.createdAt) < 7 * 864e5).length;
  const today = leads.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;
  const fresh = leads.filter((l) => l.status === "yangi").length;
  const crmErr = leads.filter((l) => l.crm.some((x) => !x.ok)).length;

  const warnings: React.ReactNode[] = [];
  if (storageMode() === "local") warnings.push(<>Lokal rejim: ma&apos;lumotlar kompyuterdagi <code>.data</code> papkasida. Vercel&apos;da Blob ulanganda bulutga o&apos;tadi.</>);
  if (!process.env.AUTH_SECRET) warnings.push(<>Vercel&apos;da <b>AUTH_SECRET</b> o&apos;rnatilmagan. Maxfiy ma&apos;lumotlarni shifrlash uchun uni qo&apos;shing (40 ta tasodifiy belgi) va keyin o&apos;zgartirmang.</>);
  if (privateErr) warnings.push(<>Maxfiy ma&apos;lumotlar ochilmadi — AUTH_SECRET o&apos;zgartirilgan bo&apos;lishi mumkin.</>);
  if (!crm.length) warnings.push(<>Murojaatlar hech qaysi CRM&apos;ga yuborilmayapti. <Link href="/admin/integratsiyalar">amoCRM yoki Telegram&apos;ni ulang</Link>.</>);
  if (crmErr) warnings.push(<>{crmErr} ta murojaat CRM&apos;ga yetib bormagan. <Link href="/admin/lidlar">Murojaatlarni oching</Link> va «qayta yuborish»ni bosing.</>);
  const noPhotos = c.objects.filter((o) => !o.images.length).length;
  if (noPhotos) warnings.push(<>{noPhotos} ta obyektda rasm yo&apos;q. <Link href="/admin/obyektlar">Rasm yuklang</Link> — sayt haqiqiy fotolar bilan kuchliroq ko&apos;rinadi.</>);

  const cards = [
    { href: "/admin/lidlar", label: "Bugungi murojaatlar", n: today, hint: `7 kunda: ${week}` },
    { href: "/admin/lidlar", label: "Yangi (ishlanmagan)", n: fresh, hint: `Jami: ${leads.length}` },
    { href: "/admin/obyektlar", label: "Obyektlar", n: c.objects.length, hint: "Saytdagi galereya" },
    { href: "/admin/integratsiyalar", label: "Ulangan tizimlar", n: crm.length, hint: crm.join(", ") || "Ulanmagan" },
  ];
  return (
    <div className="adm-stack">
      <div className="adm-toolbar"><h1>Bosh panel</h1></div>
      {warnings.map((w, i) => <div key={i} className="adm-warn">{w}</div>)}
      <div className="adm-cards">
        {cards.map((k) => (
          <Link key={k.label} href={k.href} className="adm-card adm-stat">
            <span>{k.label}</span>
            <b>{k.n}</b>
            <small>{k.hint}</small>
          </Link>
        ))}
      </div>
      <section className="adm-card">
        <div className="adm-toolbar" style={{ marginBottom: 8 }}>
          <h2>So&apos;nggi murojaatlar</h2>
          <Link href="/admin/lidlar" className="adm-btn">Barchasi</Link>
        </div>
        {leads.length ? (
          <table className="adm-table">
            <tbody>
              {leads.slice(0, 8).map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(l.createdAt).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" })}</td>
                  <td><b>{l.name || "—"}</b></td>
                  <td style={{ whiteSpace: "nowrap" }}><a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}>{l.phone}</a></td>
                  <td>{l.region}</td>
                  <td>{LEAD_STATUSES.find((s) => s.value === l.status)?.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="adm-help">Hali murojaat yo&apos;q.</p>
        )}
      </section>
      <section className="adm-card">
        <h2>Tezkor havolalar</h2>
        <div className="adm-quick">
          <Link href="/admin/bosh-sahifa" className="adm-btn">Birinchi ekran va 3D model</Link>
          <Link href="/admin/obyektlar" className="adm-btn">Obyekt qo&apos;shish</Link>
          <Link href="/admin/kafolatlar" className="adm-btn">Kafolat qo&apos;shish</Link>
          <Link href="/admin/narxlar" className="adm-btn">Narxlarni yangilash</Link>
        </div>
      </section>
    </div>
  );
}
