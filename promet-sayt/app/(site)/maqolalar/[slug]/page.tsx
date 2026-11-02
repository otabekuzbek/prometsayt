import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import Media from "@/components/Media";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await content()).articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = (await content()).articles.find((x) => x.slug === slug);
  if (!a) return {};
  return { title: a.title, description: a.excerpt, openGraph: { type: "article", images: a.cover ? [a.cover] : ["/logo.png"] } };
}

/** Oddiy belgilash: "## " — sarlavha, bo'sh qator — yangi xatboshi */
function Body({ text }: { text: string }) {
  return (
    <div className="prose">
      {text.split(/\n\s*\n/).map((block, i) =>
        block.startsWith("## ") ? <h2 key={i}>{block.slice(3)}</h2> : <p key={i}>{block}</p>,
      )}
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await content();
  const a = c.articles.find((x) => x.slug === slug);
  if (!a) notFound();
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: a.title, datePublished: a.date, description: a.excerpt, publisher: { "@type": "Organization", name: c.settings.companyName } };
  return (
    <>
      <PageHero crumb={[{ href: "/maqolalar", label: "Maqolalar" }, { label: a.title }]} title={a.title} text={formatDate(a.date)} />
      <section className="section">
        <div className="wrap" style={{ display: "grid", gap: 40, justifyItems: "start" }}>
          {a.cover && <div className="gallery-main" style={{ width: "100%", maxWidth: 900, aspectRatio: "16/8" }}><Media src={a.cover} alt={a.title} priority /></div>}
          <Body text={a.body} />
          <div className="contact-card" style={{ maxWidth: 720, width: "100%" }}>
            <h3 className="h-md">Savolingiz qoldimi?</h3>
            <p className="muted">Usta joyga kelib, sizning tomingiz bo&apos;yicha aniq maslahat beradi — bepul.</p>
            <Link href="/aloqa#forma" className="btn btn-green" style={{ width: "fit-content" }}>Bepul o&apos;lchovga yozilish</Link>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
