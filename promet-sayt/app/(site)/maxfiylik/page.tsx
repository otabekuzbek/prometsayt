import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { content } from "@/lib/data";

export const metadata: Metadata = { title: "Maxfiylik siyosati", robots: { index: false } };

export default async function Page() {
  const { settings: s } = await content();
  return (
    <>
      <PageHero crumb={[{ label: "Maxfiylik siyosati" }]} title="Maxfiylik siyosati" />
      <section className="section">
        <div className="wrap prose">
          <p>{s.companyName} saytdagi formalar orqali ismingiz, telefon raqamingiz va qo&apos;shimcha izohingizni faqat siz bilan bog&apos;lanish, o&apos;lchov va smeta tayyorlash uchun yig&apos;adi.</p>
          <h2>Ma&apos;lumotlardan foydalanish</h2>
          <p>Ma&apos;lumotlar uchinchi shaxslarga sotilmaydi. Ular kompaniyaning mijozlar bazasida (CRM) saqlanadi va faqat xizmat ko&apos;rsatish uchun ishlatiladi.</p>
          <h2>Analitika</h2>
          <p>Saytni yaxshilash uchun anonim tashrif statistikasi (Google Analytics, Yandex Metrika, Meta Pixel) yig&apos;ilishi mumkin.</p>
          <h2>Bog&apos;lanish</h2>
          <p>Ma&apos;lumotlaringizni o&apos;chirish yoki o&apos;zgartirish uchun {s.phone} raqamiga murojaat qiling.</p>
        </div>
      </section>
    </>
  );
}
