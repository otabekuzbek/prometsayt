import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/data";
import { som } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import Media from "@/components/Media";
import Reveal from "@/components/Reveal";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Mahsulotlar — metallocherepitsa, profnastil, tunkafon",
  description: "Tom va fasad uchun po'lat listlar va butlovchi qismlar: qalinlik, rang, narx va kafolat.",
};

export default async function Page() {
  const c = await content();
  return (
    <>
      <PageHero crumb={[{ label: "Mahsulotlar" }]} title="Mahsulotlar" text="Tom listi, fasad va butlovchi qismlar — bir rangda, to'liq komplektda, bir joydan." />
      <section className="section">
        <div className="wrap">
          <div className="prod-list">
            {c.products.map((p, i) => (
              <Link key={p.id} href={`/mahsulotlar/${p.slug}`} className="prod-row">
                <div>
                  <div className="cat">{p.category}</div>
                  <h3>{p.name}</h3>
                </div>
                <div className="desc" style={{ display: "grid", gap: 16 }}>
                  <p className="muted">{p.short}</p>
                  <span className="price">
                    {p.priceFrom ? <>{som(p.priceFrom)} dan<small>1 {p.unit} uchun</small></> : <>Narxi o&apos;lchovdan keyin<small>{p.thicknesses}, {p.warrantyYears} yil kafolat</small></>}
                  </span>
                </div>
                <Reveal kind="img" className="thumb"><div style={{ position: "absolute", inset: 0 }}><Media src={p.images[0]} alt={p.name} sizes="360px" variant={i} /></div></Reveal>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
