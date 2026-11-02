import type { Metadata } from "next";
import { content } from "@/lib/data";
import { telHref, telegramHref } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import LeadForm from "@/components/LeadForm";
import { Clock, Mail, Phone, Pin, Send } from "@/components/Icons";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Aloqa — bepul o'lchov", description: "Bepul o'lchov va smeta uchun murojaat qoldiring yoki qo'ng'iroq qiling." };

export default async function Page() {
  const { settings: s } = await content();
  const tg = telegramHref(s.telegram);
  return (
    <>
      <PageHero crumb={[{ label: "Aloqa" }]} title="Bepul o'lchovga yoziling" text="Formani to'ldiring — mutaxassisimiz ish vaqtida 15 daqiqa ichida qo'ng'iroq qiladi." />
      <section className="section">
        <div className="wrap faq-layout">
          <div className="contact-list">
            <div className="contact-item"><span className="ic"><Phone /></span><div><b>Telefon</b><a href={telHref(s.phone)} style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", textDecoration: "none" }}>{s.phone}</a>{s.phone2 && <div><a href={telHref(s.phone2)}>{s.phone2}</a></div>}</div></div>
            {tg && <div className="contact-item"><span className="ic"><Send /></span><div><b>Telegram</b><a href={tg} target="_blank" rel="noopener">{s.telegram}</a></div></div>}
            {s.email && <div className="contact-item"><span className="ic"><Mail /></span><div><b>Email</b><a href={`mailto:${s.email}`}>{s.email}</a></div></div>}
            <div className="contact-item"><span className="ic"><Pin /></span><div><b>Manzil</b><span>{s.address}</span></div></div>
            <div className="contact-item"><span className="ic"><Clock /></span><div><b>Ish vaqti</b><span>{s.workingHours}</span></div></div>
            {s.mapEmbedUrl && <iframe className="map-frame" src={s.mapEmbedUrl} title="Xaritada manzil" loading="lazy" />}
          </div>
          <div className="contact-card" id="forma">
            <h2 className="h-md">Murojaat formasi</h2>
            <LeadForm source="aloqa" />
          </div>
        </div>
      </section>
    </>
  );
}
