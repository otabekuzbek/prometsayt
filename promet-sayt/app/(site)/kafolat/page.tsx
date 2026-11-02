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
      <section className="section dark">
        <div className="wrap warranty">
          <div style={{ display: "grid", gap: 18 }}>
            <span className="eyebrow">Onlayn tekshiruv</span>
            <h2 className="h-lg">Kafolatingiz reestrda</h2>
            <p className="lead">Har bir kafolat hujjati raqam bilan reestrga kiritiladi. Uy sotilganda ham yangi egasi kafolatni shu yerda tekshira oladi.</p>
          </div>
          <WarrantyCheck />
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="values" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {[
              ["Material kafolati", "Zavod sertifikatiga ega metall: qoplama ko'chmaydi, zanglamaydi."],
              ["Montaj kafolati", "Chakka o'tsa yoki list ko'chsa — bepul tuzatamiz."],
              ["Texnik ko'rik", "Montajdan keyin jamoamiz tomni qayta ko'zdan kechiradi."],
              ["Yozma hujjat", "Muhrli, raqamli hujjat — og'zaki va'da emas."],
            ].map(([t, d]) => (
              <div key={t} className="value">
                <span style={{ color: "var(--green-action)" }}><Shield size={28} /></span>
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section white" id="sertifikatlar">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Hujjatlar</span><h2 className="h-lg">Sertifikatlar</h2></div></div>
          {c.certificates.length ? (
            <div className="certs" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
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
