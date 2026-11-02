import type { Metadata } from "next";
import { content } from "@/lib/data";
import PageHero from "@/components/PageHero";
import ObjectsGallery from "@/components/ObjectsGallery";
import Link from "next/link";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Obyektlar — biz yopgan tomlar",
  description: "Promet jamoasi yopgan uylar, tijorat va sanoat obyektlari: viloyatlar bo'yicha foto va videolar.",
};

export default async function Page() {
  const c = await content();
  return (
    <>
      <PageHero crumb={[{ label: "Obyektlar" }]} script="Har bir tom — imzomiz" title="Biz yopgan tomlar" text="Viloyatni tanlang va o'zingizga yaqin obyektlarni ko'ring. Ko'pchilik mijozlarimiz qo'shnisining tomini ko'rib murojaat qiladi." />
      <section className="section">
        <div className="wrap">
          <ObjectsGallery objects={c.objects} />
          <div style={{ marginTop: 48, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/aloqa#forma" className="btn btn-green">Menga ham shunday tom kerak</Link>
            {c.settings.instagram && <a href={c.settings.instagram} target="_blank" rel="noopener" className="btn btn-ghost">Instagramda yana ko&apos;proq</a>}
          </div>
        </div>
      </section>
    </>
  );
}
