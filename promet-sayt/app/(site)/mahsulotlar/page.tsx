import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/data";
import { som } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import Media from "@/components/Media";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Mahsulotlar — metallocherepitsa, profnastil, tunikafon",
  description: "Tom va fasad uchun po'lat listlar va butlovchi qismlar: qalinlik, rang, narx va kafolat.",
};

export default async function Page() {
  const c = await content();
  return (
    <>
      <PageHero crumb={[{ label: "Mahsulotlar" }]} title="Mahsulotlar" text="Tom listi, fasad va butlovchi qismlar — bir rangda, to'liq komplektda, bitta joydan." />
      <section className="section">
        <div className="wrap">
          <div className="prod-rows">
            {c.products.map((p, i) => (
              <Link key={p.id} href={`/mahsulotlar/${p.slug}`} className="prod-row">
                <span className="num">0{i + 1}</span>
                <div>
                  <div className="cat">{p.category}</div>
                  <h3>{p.name}</h3>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    <span className="tag tag-light">{p.thicknesses}</span>
                    <span className="tag tag-light">{p.warrantyYears} yil kafolat</span>
                  </div>
                </div>
                <p className="desc muted">{p.short}</p>
                <div style={{ display: "grid", gap: 10 }}>
                  <div className="thumb"><Media src={p.images[0]} alt={p.name} sizes="220px" variant={i} /></div>
                  <span className="price">
                    {p.priceFrom ? <>{som(p.priceFrom)} dan<small>1 {p.unit} uchun</small></> : <>Narxi so&apos;rov bo&apos;yicha<small>to&apos;liq komplekt</small></>}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
