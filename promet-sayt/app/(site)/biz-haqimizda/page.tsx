import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/data";
import PageHero from "@/components/PageHero";
import RoofArt from "@/components/RoofArt";
import Media from "@/components/Media";
import { Arrow } from "@/components/Icons";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Biz haqimizda", description: "Promet Tom Markazi — 15 yillik tajribaga ega tom yopish korxonasi." };

export default async function Page() {
  const c = await content();
  const s = c.settings;
  const img = c.objects.find((o) => o.images[0])?.images[0];
  const stats = [
    { v: String(s.yearsExperience), l: "yillik tajriba" },
    { v: String(s.warrantyYears), l: "yil kafolat" },
    ...(s.objectsDone > 0 ? [{ v: `${s.objectsDone}+`, l: "yopilgan tom" }] : []),
    ...(s.followers ? [{ v: s.followers, l: "Instagram obunachi" }] : []),
  ];
  return (
    <>
      <PageHero crumb={[{ label: "Biz haqimizda" }]} script="Promet jamoasi" title="Tomni yopamiz va unga javob beramiz" />
      <section className="section">
        <div className="wrap about-grid">
          <div style={{ display: "grid", gap: 20 }}>
            <h2 className="h-lg">{s.yearsExperience} yildan beri tom yopamiz</h2>
            <p style={{ fontSize: 18 }}>
              {s.companyName} — materialni yetkazib berishdan montajgacha hammasini o&apos;zi bajaradigan tom yopish korxonasi. Biz uchun tom
              uyning eng muhim qismi: u oilani yillar davomida himoya qilishi kerak.
            </p>
            <p className="muted">
              Shuning uchun ishni o&apos;lchovdan boshlaymiz, smetani yozma beramiz va har bir tomga raqamli kafolat hujjatini topshiramiz.
            </p>
            <Link href="/obyektlar" className="btn btn-navy" style={{ width: "fit-content" }}>Obyektlarni ko&apos;rish <Arrow size={18} /></Link>
          </div>
          <div className="gallery-main">{img ? <Media src={img} alt="Promet obyekti" /> : <RoofArt variant={0} />}</div>
        </div>
      </section>
      <section className="section-tight dark">
        <div className="wrap">
          <div className="big-stats">
            {stats.map((x) => (
              <div key={x.l}><b>{x.v}</b>{x.l}</div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <h2 className="h-lg" style={{ marginBottom: 40 }}>Qanday ishlaymiz</h2>
          <div className="values">
            {[
              ["Halol smeta", "Narx o'lchovdan keyin yoziladi va o'zgarmaydi. Yashirin to'lov yo'q."],
              ["O'z jamoamiz", "Montajni tasodifiy ustalar emas, Promet brigadalari bajaradi."],
              ["To'liq komplekt", "List, planka, vodostok va vintlar bir rangda, bir vaqtda keladi."],
              ["Ochiq kafolat", "Kafolat raqami reestrda — saytda istalgan vaqt tekshiriladi."],
            ].map(([t, d]) => (
              <div key={t} className="value"><h3>{t}</h3><p className="muted">{d}</p></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
