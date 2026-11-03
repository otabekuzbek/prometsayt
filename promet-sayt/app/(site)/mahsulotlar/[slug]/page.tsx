import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/data";
import { som, telHref } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import ProductGallery from "@/components/ProductGallery";
import ObjectsGallery from "@/components/ObjectsGallery";
import LeadForm from "@/components/LeadForm";

export const revalidate = 3600;

export async function generateStaticParams() {
  const c = await content();
  return c.products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await content()).products.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.name, description: p.short, openGraph: { images: p.images[0] ? [p.images[0]] : ["/logo.png"] } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await content();
  const p = c.products.find((x) => x.slug === slug);
  if (!p) notFound();
  const related = c.objects.filter((o) => o.product.toLowerCase() === p.name.toLowerCase());
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    brand: { "@type": "Brand", name: "Promet" },
    image: p.images,
    ...(p.priceFrom ? { offers: { "@type": "Offer", priceCurrency: "UZS", price: p.priceFrom, availability: "https://schema.org/InStock" } } : {}),
  };
  return (
    <>
      <PageHero crumb={[{ href: "/mahsulotlar", label: "Mahsulotlar" }, { label: p.name }]} title={p.name} text={p.short} />
      <section className="section">
        <div className="wrap pdp">
          <ProductGallery images={p.images} name={p.name} ribs={p.slug !== "metallocherepitsa"} />
          <div style={{ display: "grid", gap: 24 }}>
            <div className="price-box">
                            <span className="p">{p.priceFrom ? `${som(p.priceFrom)} dan` : "Narxi o'lchovdan keyin"}</span>
              <span className="muted" style={{ marginTop: -6 }}>{p.priceFrom > 0 ? `1 ${p.unit} uchun, faqat material` : "Tom maydoni va murakkabligiga qarab yozma smetada"}</span>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/kalkulyator" className="btn btn-navy">Tomim narxini hisoblash</Link>
                <a href={telHref(c.settings.phone)} className="btn btn-ghost">{c.settings.phone}</a>
              </div>
            </div>
            <p style={{ fontSize: 17 }}>{p.description}</p>
            <table className="spec-table">
              <tbody>
                <tr><td>Qalinlik</td><td>{p.thicknesses}</td></tr>
                <tr><td>Ranglar</td><td>{p.colors}</td></tr>
                <tr><td>Kafolat</td><td>{p.warrantyYears} yil</td></tr>
                {p.specs.map((sp) => {
                  const [k, ...v] = sp.split(":");
                  return v.length ? <tr key={sp}><td>{k}</td><td>{v.join(":").trim()}</td></tr> : <tr key={sp}><td colSpan={2} style={{ color: "var(--ink)", fontWeight: 700 }}>{sp}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section white">
          <div className="wrap">
            <h2 className="h-lg" style={{ marginBottom: 40 }}>{p.name} bilan yopilgan tomlar</h2>
            <ObjectsGallery objects={related} filters={false} limit={5} />
          </div>
        </section>
      )}
      <section className="section">
        <div className="wrap faq-layout">
          <div>
            <h2 className="h-lg">Qaysi qalinlik va rang sizga mos?</h2>
            <p className="lead" style={{ marginTop: 14 }}>Usta joyga kelib tomni o&apos;lchaydi va namunalarni ko&apos;rsatadi. O&apos;lchov bepul.</p>
          </div>
          <div className="contact-card"><h3 className="h-sm">Bepul o&apos;lchovga yoziling</h3><LeadForm source={`mahsulot-${p.slug}`} compact /></div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
