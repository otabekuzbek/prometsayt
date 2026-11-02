import type { Metadata } from "next";
import { content } from "@/lib/data";
import PageHero from "@/components/PageHero";
import Calculator from "@/components/Calculator";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Tom smeta kalkulyatori",
  description: "Tom shakli, material va uy o'lchamini kiriting — tom maydoni, material ro'yxati va taxminiy narxni bir zumda oling.",
};

export default async function Page() {
  const c = await content();
  return (
    <>
      <PageHero crumb={[{ label: "Kalkulyator" }]} title="Tom smeta kalkulyatori" text="Tom maydoni, kerakli listlar, butlovchi qismlar va taxminiy narx. Natijani PDF qilib saqlashingiz yoki ustaga yuborishingiz mumkin." />
      <section className="section">
        <div className="wrap"><Calculator pricing={c.pricing} /></div>
      </section>
    </>
  );
}
