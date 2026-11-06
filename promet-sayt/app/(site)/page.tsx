import Link from "next/link";
import { content } from "@/lib/data";
import { formatDate, telHref, videoEmbed } from "@/lib/utils";
import Hero from "@/components/home/Hero";
import Offer from "@/components/home/Offer";
import BeforeAfter from "@/components/home/BeforeAfter";
import { RENDERS } from "@/lib/renders";
import MaterialPicker from "@/components/home/MaterialPicker";
import Process from "@/components/home/Process";
import ObjectsGallery from "@/components/ObjectsGallery";
import Calculator from "@/components/Calculator";
import WarrantyCheck from "@/components/WarrantyCheck";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import Media from "@/components/Media";
import { Alert, Arrow, Check, Doc, Layers, Shield, Users } from "@/components/Icons";

const WHY_ICONS = [Doc, Users, Layers, Shield];

export const revalidate = 3600;

export default async function Home() {
  const c = await content();
  const s = c.settings;
  const h = c.home;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const articles = [...c.articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <>
      <Hero home={h} phone={s.phone} tel={telHref(s.phone)} />

      {h.showOffer && h.offerTitle && <Offer title={h.offerTitle} text={h.offerText} deadline={h.offerDeadline} />}

      {/* Kompaniya haqida */}
      {(h.introTitle || h.introText) && (
        <section className="section glow">
          <div className="wrap intro">
            <Reveal kind="up"><h2>{h.introTitle}</h2></Reveal>
            <Reveal kind="up" className="intro-side" delay={120}>
              {h.introText && <p className="lead">{h.introText}</p>}
              <Link href="/biz-haqimizda" className="link-arrow">Kompaniya haqida <Arrow size={18} /></Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Oldin / keyin */}
      {h.showPain && (
        <section className="section deep">
          <div className="wrap pain">
            <div className="pain-copy">
              <Reveal kind="up"><h2 className="h-lg">{h.painTitle}</h2></Reveal>
              {h.painText && <p className="lead">{h.painText}</p>}
              {h.painItems.length > 0 && (
                <ul className="pain-list">
                  {h.painItems.map((it) => (
                    <li key={it.title}>
                      <Alert size={20} />
                      <h3>{it.title}</h3>
                      <p>{it.text}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/aloqa#forma" className="btn btn-green" style={{ width: "fit-content" }}>Tomimni tekshirtirish <Arrow size={18} /></Link>
            </div>
            <div>
              <BeforeAfter before={h.beforeImage || RENDERS.before} after={h.afterImage || RENDERS.after} />
              {!(h.beforeImage && h.afterImage) && <p className="viz-note">Vizualizatsiya. Chiziqni suring — eski shifer va yangi metallocherepitsa farqi.</p>}
            </div>
          </div>
        </section>
      )}

      {/* Obyektlar */}
      {h.showObjects && c.objects.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Obyektlar</span>
                <h2 className="h-lg">{h.objectsTitle}</h2>
              </div>
              <div className="side">
                {h.objectsText && <p className="lead">{h.objectsText}</p>}
                <Link href="/obyektlar" className="link-arrow">Barcha obyektlar <Arrow size={18} /></Link>
              </div>
            </div>
            <ObjectsGallery objects={c.objects} filters={false} limit={5} />
          </div>
        </section>
      )}

      {/* Materiallar */}
      {h.showMaterials && c.products.length > 0 && (
        <section className="section deep glow">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Materiallar</span>
                <h2 className="h-lg">{h.materialsTitle}</h2>
              </div>
              <div className="side">
                {h.materialsText && <p className="lead">{h.materialsText}</p>}
                <Link href="/mahsulotlar" className="link-arrow">Katalog <Arrow size={18} /></Link>
              </div>
            </div>
            <MaterialPicker products={c.products} colors={h.roofColors} />
          </div>
        </section>
      )}

      {/* Nega biz */}
      {h.showWhy && h.whyItems.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Ishonch</span>
                <h2 className="h-lg">{h.whyTitle}</h2>
              </div>
            </div>
            <div className="why">
              {h.whyItems.map((it, i) => {
                const Ic = WHY_ICONS[i % WHY_ICONS.length];
                return (
                  <div key={it.title} className="why-item">
                    <span className="ic"><Ic size={24} /></span>
                    <h3>{it.title}</h3>
                    <p>{it.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {h.showProcess && h.steps.length > 0 && <Process title={h.processTitle} steps={h.steps} />}

      {/* Kalkulyator */}
      {h.showCalculator && (
        <section className="section glow" id="kalkulyator">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Smeta kalkulyatori</span>
                <h2 className="h-lg">{h.calcTitle}</h2>
              </div>
              {h.calcText && <p className="lead">{h.calcText}</p>}
            </div>
            <Calculator pricing={c.pricing} colors={h.roofColors} />
          </div>
        </section>
      )}

      {/* Kafolat */}
      {h.showWarranty && (
        <section className="section deep">
          <div className="wrap">
            <WarrantyCheck years={s.warrantyYears} title={h.warrantyTitle} text={h.warrantyText} />
            {c.certificates.length > 0 && (
              <div style={{ marginTop: "clamp(64px, 8vw, 120px)" }}>
                <div className="certs">
                  {c.certificates.slice(0, 4).map((ct) => (
                    <a key={ct.id} href={ct.image} target="_blank" rel="noopener" className="cert">
                      <div className="img"><Media src={ct.image} alt={ct.title} sizes="300px" /></div>
                      <span>{ct.title}</span>
                    </a>
                  ))}
                </div>
                <div style={{ marginTop: 28 }}>
                  <Link href="/kafolat#sertifikatlar" className="link-arrow">Barcha sertifikatlar <Arrow size={18} /></Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Mijozlar fikri — faqat haqiqiy fikrlar qo'shilganda */}
      {h.showReviews && c.reviews.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Mijozlar fikri</span>
                <h2 className="h-lg">{h.reviewsTitle}</h2>
              </div>
            </div>
            <div className="reviews">
              {c.reviews.slice(0, 6).map((r) => {
                const v = videoEmbed(r.videoUrl);
                return (
                  <figure key={r.id} className="review">
                    {v && <iframe className="video-frame" src={v} title={`${r.name} fikri`} loading="lazy" allowFullScreen />}
                    {r.text && <blockquote>“{r.text}”</blockquote>}
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

      {/* Savollar va forma */}
      {h.showFaq && (
        <section className="section glow" id="savollar">
          <div className="wrap faq-layout">
            <div>
              <h2 className="h-lg" style={{ marginBottom: "clamp(32px, 4vw, 56px)" }}>{h.faqTitle}</h2>
              <div className="faq">
                {c.faqs.map((f) => (
                  <details key={f.id}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div className="sticky-col">
              <div className="contact-card" id="forma">
                <span className="eyebrow">Bepul o&apos;lchov</span>
                <h2 className="h-md">Usta qachon kelsin?</h2>
                <p className="muted">Raqamingizni qoldiring — ish vaqtida qo&apos;ng&apos;iroq qilib, o&apos;lchov vaqtini kelishamiz.</p>
                <LeadForm source="bosh-sahifa" compact />
                <div style={{ display: "grid", gap: 8 }}>
                  <span className="promise"><Check size={16} /> O&apos;lchov va smeta bepul, majburiyatsiz</span>
                  <span className="promise"><Check size={16} /> Raqamingiz faqat qo&apos;ng&apos;iroq uchun ishlatiladi</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Maqolalar */}
      {h.showArticles && articles.length > 0 && (
        <section className="section deep">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Maqolalar</span>
                <h2 className="h-lg">{h.articlesTitle}</h2>
              </div>
              <Link href="/maqolalar" className="link-arrow">Barcha maqolalar <Arrow size={18} /></Link>
            </div>
            <div className="articles">
              {articles.map((a, i) => (
                <Link key={a.id} href={`/maqolalar/${a.slug}`} className="article-card">
                  <Reveal kind="img" className="img"><div style={{ position: "absolute", inset: 0 }}><Media src={a.cover} alt={a.title} sizes="(max-width:960px) 100vw, 33vw" variant={i} /></div></Reveal>
                  <div className="body">
                    <span className="muted" style={{ fontSize: 14 }}>{formatDate(a.date)}</span>
                    <h3>{a.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Yakuniy chaqiriq */}
      <section className="cta-final">
        <div className="bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={h.ctaImage || RENDERS.cta} alt="" loading="lazy" />
        </div>
        <div className="wrap">
          <h2>{h.ctaTitle}</h2>
          <div className="side">
            {h.ctaText && <p>{h.ctaText}</p>}
            <a className="phone" href={telHref(s.phone)}>{s.phone}</a>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/aloqa#forma" className="btn btn-green">Murojaat qoldirish <Arrow size={18} /></Link>
              <Link href="/kalkulyator" className="btn btn-ghost">Narxni hisoblash</Link>
            </div>
          </div>
        </div>
      </section>
      {c.faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
    </>
  );
}
