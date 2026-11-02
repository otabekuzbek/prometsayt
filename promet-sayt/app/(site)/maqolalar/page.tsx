import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import Media from "@/components/Media";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Maqolalar — tom haqida foydali maslahatlar",
  description: "Tom tanlash, material sifati, narx va montaj haqida Promet mutaxassislarining maslahatlari.",
};

export default async function Page() {
  const c = await content();
  const list = [...c.articles].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHero crumb={[{ label: "Maqolalar" }]} title="Tom haqida foydali maqolalar" text="Aldanib qolmaslik va to'g'ri tanlash uchun — sodda tilda, amaliy maslahatlar." />
      <section className="section">
        <div className="wrap">
          {list.length ? (
            <div className="articles">
              {list.map((a, i) => (
                <Link key={a.id} href={`/maqolalar/${a.slug}`} className="article-card">
                  <div className="img"><Media src={a.cover} alt={a.title} sizes="(max-width:860px) 100vw, 33vw" variant={i} /></div>
                  <div className="body">
                    <span className="muted" style={{ fontSize: 13 }}>{formatDate(a.date)}</span>
                    <h3>{a.title}</h3>
                    <p className="muted">{a.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">Maqolalar tez orada.</div>
          )}
        </div>
      </section>
    </>
  );
}
