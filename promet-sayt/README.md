# Promet Tom Markazi — sayt

Next.js 16 asosidagi tez, SEO'ga tayyor sayt va admin panel. Vercel'ga joylashga tayyor.

## Imkoniyatlar

**Sayt**
- Bosh sahifa: foto-hero, obyektlar galereyasi, tom rangi vizualizatori, mahsulotlar, o'rnatilgan kalkulyator, mijozlar fikri, kafolat tekshiruvi, ish jarayoni, savol-javob va forma
- Obyektlar: viloyat va tur bo'yicha filtr, rasm va video ko'rish oynasi
- Mahsulotlar katalogi va alohida mahsulot sahifalari
- Smeta kalkulyatori: 4 xil tom shakli, qiyalik, material ro'yxati (list, konyok, vodostok, vint, plyonka), narx oralig'i, PDF qilib saqlash, natijani lid bilan yuborish
- Kafolat: sertifikatlar va kafolat raqamini onlayn tekshirish (mijoz ismi qisman yashiriladi)
- Maqolalar, Biz haqimizda, Aloqa (xarita bilan), Maxfiylik siyosati
- Mobil pastki panel (Qo'ng'iroq / O'lchov / Telegram), suzuvchi Telegram tugmasi
- SEO: har sahifa uchun meta, sitemap.xml, robots.txt, Schema.org (RoofingContractor, Product, FAQ, Article)
- Lidlar: UTM / gclid / yclid bilan saqlanadi, amoCRM va Telegram'ga yuboriladi, Yandex/GA4/Meta konversiyasi ishlaydi
- Analitika skriptlari sahifa yuklangandan keyin ulanadi — tezlikka ta'sir qilmaydi

**Admin panel** — `sayt.uz/admin`
- Obyektlar, sertifikatlar, mahsulotlar, mijozlar fikri, savol-javoblar, maqolalar — qo'shish, tahrirlash, o'chirish, tartibini o'zgartirish
- Rasm yuklash: bir nechtasini birdan yoki sudrab tashlab; rasmlar avtomatik kichraytiriladi (WEBP, max 2000px)
- Kafolat reestri — saytdagi tekshiruv shu ro'yxatdan ishlaydi
- Sozlamalar: telefon, manzil, xarita, ijtimoiy tarmoqlar, bosh ekran rasmi va matni, statistika, analitika ID'lari, kalkulyator narxlari
- Murojaatlar ro'yxati
- Saqlangan o'zgarish saytda darhol ko'rinadi

## Vercel'ga joylash

1. **GitHub'ga yuklang.** Ushbu papkani yangi GitHub repozitoriyaga yuklang (`node_modules` va `.next` kerak emas).
2. **Vercel'da loyiha yarating.** vercel.com → *Add New → Project* → repozitoriyani tanlang → *Deploy*. Sozlamalar avtomatik aniqlanadi (Framework: Next.js).
3. **Blob Storage ulang.** Loyiha → *Storage* → *Create → Blob* → access: **Public** → loyihaga ulang. `BLOB_READ_WRITE_TOKEN` avtomatik qo'shiladi. Rasmlar va kontent shu yerda saqlanadi.
4. **Muhit o'zgaruvchilarini kiriting.** Loyiha → *Settings → Environment Variables*:

   | Nomi | Majburiy | Izoh |
   |---|---|---|
   | `ADMIN_PASSWORD` | ha | Admin panel paroli (kuchli parol tanlang) |
   | `AUTH_SECRET` | ha | Uzun tasodifiy satr, masalan 40 ta belgi |
   | `NEXT_PUBLIC_SITE_URL` | ha | Saytning to'liq manzili, masalan `https://promet.uz` |
   | `AMOCRM_WEBHOOK_URL` | yo'q | amoCRM'ga lid yuborish manzili (integratsiya yoki webhook) |
   | `TELEGRAM_BOT_TOKEN` | yo'q | @BotFather'dan olingan bot tokeni |
   | `TELEGRAM_CHAT_ID` | yo'q | Lidlar tushadigan guruh ID'si (bot guruhga qo'shilgan bo'lishi kerak) |

5. **Qayta joylang.** *Deployments → ⋯ → Redeploy*.
6. **Domen ulang.** *Settings → Domains* → domeningizni qo'shing va ko'rsatilgan DNS yozuvlarini domen provayderida kiriting.
7. **Admin panelga kiring.** `https://domeningiz/admin` → parol → *Sozlamalar*'da manzil, Telegram, xarita va narxlarni kiriting, keyin obyekt rasmlarini yuklang.

## Ishga tushirishdan oldin tekshiring

- **Narxlar** (Sozlamalar → Kalkulyator narxlari va har bir mahsulot narxi) — boshlang'ich qiymatlar taxminiy, haqiqiy narxlarni kiriting.
- **Manzil, Telegram, xarita** — hozircha bo'sh.
- **Obyekt sarlavhalari va maydonlari** — Instagram postlaridan olingan namuna; haqiqiy ma'lumot va rasmlar bilan almashtiring.
- **Kafolat reestri** — `PRM-2026-0001` namuna yozuvini o'chirib, haqiqiy kafolatlarni kiriting.
- **Logotip** — `public/logo.png` rastr fayldan tayyorlangan; vektor (SVG) fayl bo'lsa almashtiring.

## Lokal ishga tushirish

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD va AUTH_SECRET'ni to'ldiring
npm run dev                  # http://localhost:3000
```

Lokalda `BLOB_READ_WRITE_TOKEN` bo'lmasa, ma'lumotlar va rasmlar loyiha ichidagi `.data/` papkasida saqlanadi.

## Tuzilma

```
app/(site)/        — ochiq sahifalar
app/admin/         — admin panel (login, bo'limlar, sozlamalar, lidlar)
app/api/           — lid, rasm yuklash, kafolat tekshiruvi
components/        — sayt va admin komponentlari
lib/seed.ts        — boshlang'ich kontent
lib/store.ts       — ma'lumotlar ombori (Vercel Blob yoki lokal)
lib/admin-schema.ts — admin formalar tuzilmasi (yangi maydon qo'shish shu yerda)
```
