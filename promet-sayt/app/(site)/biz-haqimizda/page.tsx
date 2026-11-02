import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/data";
import PageHero from "@/components/PageHero";
import RoofArt from "@/components/RoofArt";
import Media from "@/components/Media";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Biz haqimizda", description: "Promet Tom Markazi — 15 yillik tajribaga ega tom yopish korxonasi." };

export default async function Page() {
  const c = await content();
  const s = c.settings;
  const img = c.objects.find((o) => o.images[0])?.images[0];
  return (
    <>
      <PageHero crumb={[{ label: "Biz haqimizda" }]} script="Promet jamoasi" title="Biz tom yopamiz — va javob beramiz" />
      <section className="section">
        <div className="wrap about-grid">
          <div style={{ display: "grid", gap: 18 }}>
            <span className="eyebrow">Kompaniya</span>
            <h2 className="h-lg">{s.yearsExperience} yil — minglab tomlar</h2>
            <p style={{ fontSize: 17 }}>
              {s.companyName} — material yetkazib berishdan montajgacha hammasini o&apos;zi bajaradigan tom yopish korxonasi. Biz uchun tom — bu
              uyning eng muhim qismi: u oilani yillar davomida himoya qilishi kerak.
            </p>
            <p className="muted">
              Shuning uchun ishni o&apos;lchovdan boshlaymiz, smetani yozma beramiz va har bir tomga raqamli kafolat hujjatini topshiramiz.
              Mijozlarimizning ko&apos;pchiligi bizni qo&apos;shnisining tomini ko&apos;rib topadi.
            </p>
            <Link href="/obyektlar" className="btn btn-navy" style={{ width: "fit-content" }}>Obyektlarni ko&apos;rish</Link>
          </div>
          <div className="gallery-main">{img ? <Media src={img} alt="Promet obyekti" /> : <RoofArt variant={2} />}</div>
        </div>
      </section>
      <section className="section dark">
        <div className="wrap" style={{ display: "grid", gap: 40 }}>
          <div className="big-stats">
            <div><b>{s.yearsExperience}</b>yillik tajriba</div>
            <div><b>{s.warrantyYears}</b>yil kafolat</div>
            <div><b>{s.objectsDone}+</b>yopilgan tom</div>
            <div><b>{s.followers}</b>Instagram obunachi</div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Qadriyatlar</span><h2 className="h-lg">Biz qanday ishlaymiz</h2></div></div>
          <div className="values">
            {[
              ["Halol smeta", "Narx o'lchovdan keyin yoziladi va o'zgarmaydi. Yashirin to'lov yo'q."],
              ["O'z jamoamiz", "Montajni tasodifiy ustalar emas, o'qitilgan Promet brigadalari bajaradi."],
              ["To'liq komplekt", "List, planka, vodostok va vintlar bir rangda, bir vaqtda yetkaziladi."],
              ["Ochiq kafolat", "Kafolat raqami reestrda — istalgan vaqt saytda tekshiriladi."],
            ].map(([t, d]) => (
              <div key={t} className="value"><h3>{t}</h3><p className="muted">{d}</p></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
