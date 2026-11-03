# Promet Tom Markazi — sayt va boshqaruv paneli

Next.js 16 asosidagi premium sayt: interaktiv 3D uy, CRM integratsiyasi va to'liq admin panel. Vercel'da ishlaydi.

## Sayt imkoniyatlari

- **Birinchi ekran** — admin paneldan tanlanadi:
  - standart 3D uy (aylanadi, tom rangi tugmalar bilan almashadi);
  - **o'zingizning 3D modelingiz (.glb)** — tom qismi nomi bo'yicha bo'yaladi;
  - keng rasm yoki ovozsiz video.
- Obyektlar galereyasi (viloyat va tur bo'yicha saralash, rasm va video ko'rish oynasi)
- Materiallar: chizilib chiqadigan profil kesimi, texnik ko'rsatkichlar
- 4 bosqichli smeta kalkulyatori: jonli 3D, material ro'yxati, PDF smeta, natija murojaat bilan birga yuboriladi
- Kafolat hujjati va raqam bo'yicha onlayn tekshiruv
- Savol-javob, mijozlar fikri, maqolalar, aloqa (xarita bilan)
- Silliq skroll, rasmlar ochilish animatsiyasi, mobil pastki panel
- SEO: meta, Open Graph, sitemap, robots, Schema.org

## Murojaatlar va CRM

Saytdagi har bir forma va kalkulyator murojaati:
1. shifrlangan holda saqlanadi (admin → Murojaatlar);
2. ulangan tizimlarga avtomatik yuboriladi:
   - **amoCRM (API v4)** — yangi lid, telefonli kontakt, teglar (reklama manbasi ham teg bo'ladi), to'liq izoh (hudud, kalkulyator hisobi, UTM);
   - **Bitrix24** — `crm.lead.add` orqali, UTM maydonlari bilan;
   - **Telegram** guruhga xabar;
   - istalgan **webhook** (n8n, Make, Zapier).

Reklama belgilari (utm_source, utm_campaign, gclid, yclid, fbclid) 30 kun eslab qolinadi.

### amoCRM'ni ulash
1. amoCRM → Sozlamalar → Integratsiyalar → «+ Integratsiya yaratish» → xususiy integratsiya.
2. «Kalitlar va dostuplar» bo'limidan **uzoq muddatli token** yarating.
3. Sayt admin paneli → **CRM va Telegram** → amoCRM manzili (masalan `promet.amocrm.ru`) va tokenni kiriting → Saqlash.
4. «Sinov murojaatini yuborish» tugmasini bosing — amoCRM'da «Test murojaat» lidi paydo bo'lishi kerak.

## Admin panel — `sayt/admin`

| Bo'lim | Nima boshqariladi |
|---|---|
| Bosh panel | Bugungi murojaatlar, ogohlantirishlar (CRM ulanmagan, rasm yo'q va h.k.) |
| Murojaatlar | Holat (yangi → bog'lanildi → o'lchov → shartnoma), CRM natijasi, qayta yuborish, o'chirish, Excel'ga yuklash |
| Bosh sahifa | Birinchi ekran turi, 3D model/rasm/video, sarlavhalar, raqamlar, tom ranglari, har bir bo'lim matni va ko'rinishi |
| Obyektlar, Mahsulotlar, Sertifikatlar, Mijozlar fikri, Savol-javob, Maqolalar | Qo'shish, tahrirlash, tartiblash, rasm yuklash |
| Kafolat reestri | Saytdagi tekshiruv shu ro'yxatdan ishlaydi |
| Aloqa, SEO, analitika | Telefon, manzil, xarita, ijtimoiy tarmoqlar, Google/Yandex/Meta kodlari |
| Kalkulyator narxlari | So'm/m² oraliqlari |
| CRM va Telegram | Integratsiyalar va sinov |
| Parol | Admin parolini o'zgartirish |

Fayllar (3D model 200 MB gacha, video, rasmlar) brauzerdan to'g'ridan-to'g'ri Vercel Blob'ga yuklanadi. Rasmlar avtomatik siqiladi.

### 3D model tayyorlash
- Blender: File → Export → glTF 2.0 → format **GLB**. SketchUp/3ds Max'da GLB eksport plagini orqali.
- Tom qismining materialiga yoki obyektiga `roof` (yoki `tom`) nomini bering — shu qism sayt rang tugmalari bilan bo'yaladi.
- Tavsiya: 20 MB gacha, Draco siqish qo'llab-quvvatlanadi.

## Vercel muhit o'zgaruvchilari

| Nomi | Majburiy | Izoh |
|---|---|---|
| `ADMIN_PASSWORD` | ha | Admin paroli (zaxira kirish) |
| `AUTH_SECRET` | ha | 40 belgili tasodifiy satr. **Bir marta qo'yiladi, o'zgartirilmaydi** — maxfiy ma'lumotlar shu kalit bilan shifrlanadi |
| `NEXT_PUBLIC_SITE_URL` | ha | Saytning to'liq manzili |
| `BLOB_READ_WRITE_TOKEN` | ha | Storage → Blob ulanganda avtomatik |
| `AMOCRM_*`, `BITRIX24_WEBHOOK`, `TELEGRAM_*` | yo'q | Admin panelda bo'sh qolsa ishlatiladi |

## Lokal ishga tushirish

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD va AUTH_SECRET'ni to'ldiring
npm run dev                  # http://localhost:3000
```
Lokalda ma'lumotlar `.data/` papkasida saqlanadi.

## Tuzilma

```
app/(site)/          ochiq sahifalar
app/admin/           admin panel
app/api/lead         murojaat qabul qilish va CRM'ga yuborish
app/api/upload       fayl yuklash (client — Vercel Blob'ga to'g'ridan-to'g'ri)
components/          sayt va admin komponentlari (RoofScene — 3D sahna)
lib/crm.ts           amoCRM, Bitrix24, Telegram, webhook
lib/store.ts         ma'lumotlar ombori va shifrlash
lib/admin-schema.ts  admin formalar tuzilmasi
```
