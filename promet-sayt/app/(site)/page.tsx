import Link from "next/link";
import { content } from "@/lib/data";
import { telHref, videoEmbed } from "@/lib/utils";
import Hero from "@/components/home/Hero";
import MaterialPicker from "@/components/home/MaterialPicker";
import ProcessScroll from "@/components/home/ProcessScroll";
import { ObjectsRail } from "@/components/ObjectsGallery";
import Calculator from "@/components/Calculator";
import WarrantyCheck from "@/components/WarrantyCheck";
import LeadForm from "@/components/LeadForm";
import { Arrow } from "@/components/Icons";

export const revalidate = 3600;

export default async function Home() {
  const c = await content();
  const s = c.settings;

  const facts = [
    { value: `${s.yearsExperience} yil`, label: "tom yopish tajribasi" },
    { value: `${s.warrantyYears} yil`, label: "yozma kafolat" },
    ...(s.objectsDone > 0 ? [{ value: `${s.objectsDone.toLocaleString("ru-RU").replace(/ /g, " ")}+`, label: "yopilgan tom" }] : [{ value: "Bepul", label: "o'lchov va smeta" }]),
    ...(s.followers ? [{ value: s.followers, label: "Instagram obunachi" }] : []),
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <Hero location={s.heroLocation} title={s.heroTitle} text={s.heroText} facts={facts} />

      {/* Materiallar */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Materiallar</span>
              <h2 className="h-lg">Tom uchun kerak bo&apos;lgan hamma narsa — bir rangda</h2>
            </div>
            <Link href="/mahsulotlar" className="link-arrow">Barcha mahsulotlar <Arrow size={18} /></Link>
          </div>
          <MaterialPicker products={c.products} />
        </div>
      </section>

      {/* Obyektlar */}
      {c.objects.length > 0 && (
        <section className="section white" style={{ overflow: "hidden" }}>
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Obyektlar</span>
                <h2 className="h-lg">Biz yopgan tomlar</h2>
                <p className="lead">Ko&apos;p mijozlarimiz bizni qo&apos;shnisining tomini ko&apos;rib topadi. Sizning hududingizda ham ishlarimiz bor.</p>
              </div>
              <Link href="/obyektlar" className="link-arrow">Barcha obyektlar <Arrow size={18} /></Link>
            </div>
            <ObjectsRail objects={c.objects} />
          </div>
        </section>
      )}

      <ProcessScroll />

      {/* Kalkulyator */}
      <section className="section" id="kalkulyator">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Smeta kalkulyatori</span>
              <h2 className="h-lg">Tomingiz narxini bir daqiqada hisoblang</h2>
            </div>
            <p className="lead">Shakl, material va o&apos;lchamni tanlang — 3D modelda ko&apos;rasiz, material ro&apos;yxati va taxminiy narxni olasiz.</p>
          </div>
          <Calculator pricing={c.pricing} />
        </div>
      </section>

      {/* Kafolat */}
      <section className="section dark blueprint">
        <div className="wrap">
          <WarrantyCheck years={s.warrantyYears} />
          {c.certificates.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div className="certs">
                {c.certificates.slice(0, 5).map((ct) => (
                  <a key={ct.id} href={ct.image} target="_blank" rel="noopener" className="cert">
                    <div className="img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {ct.image && !ct.image.endsWith(".pdf") && <img src={ct.image} alt="" loading="lazy" />}
                    </div>
                    {ct.title}
                  </a>
                ))}
              </div>
              <Link href="/kafolat#sertifikatlar" className="link-arrow" style={{ marginTop: 20 }}>Barcha sertifikatlar <Arrow size={18} /></Link>
            </div>
          )}
        </div>
      </section>

      {/* Mijozlar fikri — faqat haqiqiy sharhlar bo'lsa */}
      {c.reviews.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Mijozlar fikri</span>
                <h2 className="h-lg">Tom egalari nima deydi</h2>
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
      <section className={`section${c.reviews.length ? " white" : ""}`} id="savollar">
        <div className="wrap faq-layout">
          <div className="sticky-col">
            <div className="contact-card" id="forma">
              <span className="eyebrow">Bepul o&apos;lchov</span>
              <h2 className="h-md">Usta qachon kelsin?</h2>
              <p className="muted">Raqamingizni qoldiring — ish vaqtida qo&apos;ng&apos;iroq qilib, o&apos;lchov vaqtini kelishamiz.</p>
              <LeadForm source="bosh-sahifa" compact />
            </div>
          </div>
          <div>
            <h2 className="h-lg" style={{ marginBottom: 28 }}>Ko&apos;p beriladigan savollar</h2>
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

      {/* Yakuniy chaqiriq */}
      <section className="cta-final">
        <svg className="wave" viewBox="0 0 1000 300" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="6">
          <path d="M0 220 C40 220 50 120 100 120 S160 220 200 220 C240 220 250 120 300 120 S360 220 400 220 C440 220 450 120 500 120 S560 220 600 220 C640 220 650 120 700 120 S760 220 800 220 C840 220 850 120 900 120 S960 220 1000 220" />
        </svg>
        <div className="wrap">
          <h2>O&apos;lchov bepul. Bugun qo&apos;ng&apos;iroq qiling.</h2>
          <a className="phone" href={telHref(s.phone)}>{s.phone}</a>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/aloqa#forma" className="btn btn-navy">Murojaat qoldirish <Arrow size={18} /></Link>
            <Link href="/obyektlar" className="btn btn-ghost">Obyektlarni ko&apos;rish</Link>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
