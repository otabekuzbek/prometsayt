import type { Metadata } from "next";
import { content } from "@/lib/data";
import PageHero from "@/components/PageHero";
import WarrantyCheck from "@/components/WarrantyCheck";
import Media from "@/components/Media";
import { Shield } from "@/components/Icons";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Kafolat va sertifikatlar",
  description: "Promet kafolati qanday ishlaydi, sertifikatlar va kafolat raqamini onlayn tekshirish.",
};

export default async function Page() {
  const c = await content();
  const s = c.settings;
  return (
    <>
      <PageHero crumb={[{ label: "Kafolat" }]} title="Kafolat va sertifikatlar" text={`${s.warrantyYears} yillik kafolat — raqamli hujjat va ochiq reestr bilan.`} />
      <section className="section dark blueprint">
        <div className="wrap"><WarrantyCheck years={s.warrantyYears} /></div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="values" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {[
              [`${s.warrantyYears} yil muddat`, "Kafolat yopilgan tomga beriladi va hujjatda muddati bilan yoziladi."],
              ["Yozma hujjat", "Har bir mijozga raqamli, muhrli kafolat hujjati topshiriladi."],
              ["Ochiq reestr", "Hujjat raqami bilan kafolatni saytda istalgan vaqt tekshirish mumkin."],
            ].map(([t, d]) => (
              <div key={t} className="value">
                <span style={{ color: "var(--green-btn)" }}><Shield size={28} /></span>
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section white" id="sertifikatlar">
        <div className="wrap">
          <h2 className="h-lg" style={{ marginBottom: 40 }}>Sertifikatlar</h2>
          {c.certificates.length ? (
            <div className="certs">
              {c.certificates.map((ct) => (
                <a key={ct.id} href={ct.image} target="_blank" rel="noopener" className="cert">
                  <div className="img"><Media src={ct.image} alt={ct.title} sizes="240px" /></div>
                  <span>{ct.title}</span>
                  {ct.issuer && <span className="muted" style={{ fontWeight: 500 }}>{ct.issuer}</span>}
                </a>
              ))}
            </div>
          ) : (
            <div className="empty">Sertifikatlar tez orada qo&apos;shiladi.</div>
          )}
        </div>
      </section>
    </>
  );
}
