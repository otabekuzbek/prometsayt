import Link from "next/link";
import Image from "next/image";
import { content } from "@/lib/data";
import { som, videoEmbed } from "@/lib/utils";
import RoofArt from "@/components/RoofArt";
import Media from "@/components/Media";
import ObjectsGallery from "@/components/ObjectsGallery";
import RoofVisualizer from "@/components/RoofVisualizer";
import Calculator from "@/components/Calculator";
import WarrantyCheck from "@/components/WarrantyCheck";
import LeadForm from "@/components/LeadForm";
import { Arrow, Phone } from "@/components/Icons";
import { telHref } from "@/lib/utils";

export const revalidate = 3600;

export default async function Home() {
  const c = await content();
  const s = c.settings;
  const heroImg = s.heroImage || c.objects.find((o) => o.images[0])?.images[0] || "";

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      {/* 1. Hero */}
      <section className="hero on-photo">
        <div className="hero-media">
          {heroImg ? (
            <Image src={heroImg} alt="Promet yopgan tom" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
          ) : (
            <RoofArt variant={1} label="Do'ppi tomli uy" />
          )}
        </div>
        <div className="wrap hero-inner">
          <span className="script">{s.heroLocation}</span>
          <h1 className="h-xl">{s.heroTitle}</h1>
          <p className="hero-text">{s.heroText}</p>
          <div className="hero-actions">
            <Link href="/aloqa#forma" className="btn btn-green">Bepul o&apos;lchovga yozilish <Arrow /></Link>
            <a href={telHref(s.phone)} className="btn btn-ghost"><Phone /> {s.phone}</a>
          </div>
          <div className="hero-facts">
            <div><b>{s.yearsExperience} yil</b><span>bozordagi tajriba</span></div>
            <div><b>{s.warrantyYears} yil</b><span>yozma kafolat</span></div>
            <div><b>{s.objectsDone.toLocaleString("ru-RU").replace(/ /g, " ")}+</b><span>yopilgan tom</span></div>
            <div><b>{s.followers}</b><span>Instagram oilasi</span></div>
          </div>
        </div>
      </section>

      {/* 2. Obyektlar */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Obyektlarimiz</span>
              <h2 className="h-lg">Biz yopgan tomlar</h2>
            </div>
            <Link href="/obyektlar" className="link-arrow">Barcha obyektlar <Arrow /></Link>
          </div>
          <ObjectsGallery objects={c.objects} filters={false} limit={5} />
        </div>
      </section>

      {/* 3. Rang vizualizatori */}
      <section className="section white">
        <div className="wrap"><RoofVisualizer /></div>
      </section>

      {/* 4. Mahsulotlar */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Mahsulotlar</span>
              <h2 className="h-lg">Tom uchun hamma narsa</h2>
            </div>
            <Link href="/mahsulotlar" className="link-arrow">Katalog <Arrow /></Link>
          </div>
          <div className="prod-rows">
            {c.products.map((p, i) => (
              <Link key={p.id} href={`/mahsulotlar/${p.slug}`} className="prod-row">
                <span className="num">0{i + 1}</span>
                <div>
                  <div className="cat">{p.category}</div>
                  <h3>{p.name}</h3>
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

      {/* 5. Kalkulyator */}
      <section className="section white" id="kalkulyator">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Smeta kalkulyatori</span>
              <h2 className="h-lg">Tomingiz narxi — 30 soniyada</h2>
            </div>
            <Link href="/kalkulyator#calc-lead" className="link-arrow">Aniq smeta olish <Arrow /></Link>
          </div>
          <Calculator pricing={c.pricing} withForm={false} />
        </div>
      </section>

      {/* 6. Sharhlar */}
      {c.reviews.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Mijozlar fikri</span>
                <h2 className="h-lg">Videoda boshqa, hayotda boshqa emas</h2>
              </div>
            </div>
            <div className="reviews">
              {c.reviews.slice(0, 6).map((r) => {
                const v = videoEmbed(r.videoUrl);
                return (
                  <figure key={r.id} className="review" style={{ margin: 0 }}>
                    {v && <iframe className="video-frame" src={v} title={`${r.name} fikri`} loading="lazy" allowFullScreen />}
                    <blockquote>“{r.text}”</blockquote>
                    <figcaption className="who">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt="" loading="lazy" />
                      ) : (
                        <span className="avatar">{r.name.slice(0, 1)}</span>
                      )}
                      <span><b>{r.name}</b><span>{r.region}</span></span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. Kafolat */}
      <section className="section dark">
        <div className="wrap warranty">
          <div style={{ display: "grid", gap: 20 }}>
            <span className="eyebrow">Kafolat</span>
            <h2 className="h-lg">{s.warrantyYears} yil — qog&apos;ozda, muhr bilan</h2>
            <p className="lead">Har bir yopilgan tomga raqamli kafolat hujjati beriladi. Raqamni shu yerda tekshirasiz — og&apos;zaki va&apos;da emas, reestrdagi yozuv.</p>
            <WarrantyCheck />
          </div>
          <div>
            {c.certificates.length > 0 ? (
              <div className="certs">
                {c.certificates.slice(0, 6).map((ct) => (
                  <a key={ct.id} href={ct.image} target="_blank" rel="noopener" className="cert">
                    <div className="img"><Media src={ct.image} alt={ct.title} sizes="200px" /></div>
                    {ct.title}
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ aspectRatio: "4/3", borderRadius: 16, overflow: "hidden", position: "relative" }}><RoofArt variant={2} /></div>
            )}
            <Link href="/kafolat" className="link-arrow" style={{ marginTop: 20 }}>Barcha sertifikatlar <Arrow /></Link>
          </div>
        </div>
      </section>

      {/* 8. Jarayon */}
      <section className="section white">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Ish jarayoni</span>
              <h2 className="h-lg">Murojaatdan tayyor tomgacha</h2>
            </div>
          </div>
          <ol className="process">
            <li><h3>Murojaat</h3><p>Sayt, telefon yoki Telegram orqali yozasiz.</p></li>
            <li><h3>Bepul o&apos;lchov</h3><p>Usta joyga kelib o&apos;lchaydi, rang va material tanlashda yordam beradi.</p></li>
            <li><h3>Smeta va 3D dizayn</h3><p>Yozma smeta va tomingizning 3D ko&apos;rinishi tayyorlanadi.</p></li>
            <li><h3>Yetkazish va montaj</h3><p>Material to&apos;liq komplektda keladi, jamoamiz tomni yopadi.</p></li>
            <li><h3>Kafolat hujjati</h3><p>Raqamli kafolat beriladi va reestrga kiritiladi.</p></li>
          </ol>
        </div>
      </section>

      {/* 9. Savollar + forma */}
      <section className="section" id="savollar">
        <div className="wrap faq-layout">
          <div className="contact-card" id="forma">
            <span className="eyebrow">Bepul o&apos;lchov</span>
            <h2 className="h-md">Usta qachon kelsin?</h2>
            <p className="muted">Raqamingizni qoldiring — ish vaqtida 15 daqiqa ichida qo&apos;ng&apos;iroq qilamiz.</p>
            <LeadForm source="bosh-sahifa" compact />
          </div>
          <div>
            <span className="eyebrow">Savollar</span>
            <h2 className="h-lg" style={{ margin: "14px 0 20px" }}>Ko&apos;p so&apos;raladi</h2>
            <div className="faq">
              {c.faqs.map((f) => (
                <details key={f.id}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
