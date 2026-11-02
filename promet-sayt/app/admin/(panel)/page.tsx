import Link from "next/link";
import { getContent, getLeads, getPrivate } from "@/lib/store";

export default async function Dashboard() {
  const [c, p, leads] = await Promise.all([getContent(), getPrivate(), getLeads(10)]);
  const noBlob = !process.env.BLOB_READ_WRITE_TOKEN;
  const cards = [
    { href: "/admin/obyektlar", label: "Obyektlar", n: c.objects.length, hint: `${c.objects.filter((o) => !o.images.length).length} tasida rasm yo'q` },
    { href: "/admin/sertifikatlar", label: "Sertifikatlar", n: c.certificates.length, hint: "Kafolat sahifasida" },
    { href: "/admin/kafolatlar", label: "Kafolat reestri", n: p.warranties.length, hint: "Onlayn tekshiruv" },
    { href: "/admin/mahsulotlar", label: "Mahsulotlar", n: c.products.length, hint: `${c.products.filter((x) => !x.images.length).length} tasida rasm yo'q` },
    { href: "/admin/sharhlar", label: "Mijozlar fikri", n: c.reviews.length, hint: "Bosh sahifada" },
    { href: "/admin/maqolalar", label: "Maqolalar", n: c.articles.length, hint: "SEO uchun" },
  ];
  return (
    <div className="adm-stack">
      <div className="adm-toolbar"><h1>Bosh panel</h1></div>
      {noBlob && (
        <div className="adm-warn">
          Lokal rejim: ma&apos;lumotlar kompyuterdagi <code>.data</code> papkasida saqlanmoqda. Vercel&apos;da Blob Storage ulanganda avtomatik bulutga o&apos;tadi.
        </div>
      )}
      <div className="adm-cards">
        {cards.map((k) => (
          <Link key={k.href} href={k.href} className="adm-card adm-stat">
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
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.createdAt).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" })}</td>
                  <td><b>{l.name || "—"}</b></td>
                  <td><a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}>{l.phone}</a></td>
                  <td>{l.region}</td>
                  <td>{l.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="adm-help">Hali murojaat yo&apos;q.</p>
        )}
      </section>
    </div>
  );
}
