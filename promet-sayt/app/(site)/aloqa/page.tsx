import type { Metadata } from "next";
import { content } from "@/lib/data";
import { telHref, telegramHref } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import LeadForm from "@/components/LeadForm";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Aloqa — bepul o'lchov", description: "Bepul o'lchov va smeta uchun murojaat qoldiring yoki qo'ng'iroq qiling." };

export default async function Page() {
  const { settings: s } = await content();
  const tg = telegramHref(s.telegram);
  return (
    <>
      <PageHero crumb={[{ label: "Aloqa" }]} title="Bepul o'lchovga yoziling" text="Formani to'ldiring — mutaxassisimiz ish vaqtida qo'ng'iroq qilib, o'lchov vaqtini kelishadi." />
      <section className="section">
        <div className="wrap faq-layout">
          <div style={{ display: "grid", gap: 48 }}>
            <div className="contact-list">
              <div className="contact-item"><span>Telefon</span><div style={{ display: "grid", gap: 6 }}><a href={telHref(s.phone)}>{s.phone}</a>{s.phone2 && <a href={telHref(s.phone2)}>{s.phone2}</a>}</div></div>
              {tg && <div className="contact-item"><span>Telegram</span><a href={tg} target="_blank" rel="noopener">{s.telegram.startsWith("http") ? "Telegramda yozish" : s.telegram}</a></div>}
              {s.email && <div className="contact-item"><span>Email</span><a href={`mailto:${s.email}`}>{s.email}</a></div>}
              {s.address && <div className="contact-item"><span>Manzil</span><b>{s.address}</b></div>}
              <div className="contact-item"><span>Ish vaqti</span><b>{s.workingHours}</b></div>
            </div>
            {s.mapEmbedUrl && <iframe className="map-frame" src={s.mapEmbedUrl} title="Xaritada manzil" loading="lazy" />}
          </div>
          <div className="sticky-col">
            <div className="contact-card" id="forma">
              <h2 className="h-md">Murojaat qoldiring</h2>
              <LeadForm source="aloqa" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
