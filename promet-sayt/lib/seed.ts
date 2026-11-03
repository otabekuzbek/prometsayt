import type { Content, PrivateData } from "./types";

// Boshlang'ich ma'lumotlar. Hammasi admin paneldan o'zgartiriladi.
// Faqat tasdiqlangan faktlar: 15 yillik tajriba, 15 yil kafolat, telefon, Instagram.
// Narxlar (kalkulyator) — taxminiy, admin panel > Sozlamalar'da haqiqiysini kiriting.
export const seedContent: Content = {
  settings: {
    companyName: "Promet Tom Markazi",
    phone: "+998 88 260 66 66",
    phone2: "",
    email: "",
    address: "",
    workingHours: "Har kuni 9:00 – 19:00",
    mapEmbedUrl: "",
    telegram: "",
    instagram: "https://www.instagram.com/promet_tommarkazi/",
    youtube: "",
    heroImage: "",
    heroLocation: "Namangan Xamzada",
    heroTitle: "Tom bir marta yopiladi. Puxta yopilsin.",
    heroText:
      "Metallocherepitsa, profnastil va tunkafon. O'lchovdan montajgacha o'z jamoamiz bajaradi, har bir tomga 15 yillik yozma kafolat beramiz.",
    yearsExperience: 15,
    warrantyYears: 15,
    objectsDone: 0,
    followers: "21.6K",
    gaId: "",
    yandexMetrikaId: "",
    metaPixelId: "",
  },
  pricing: {
    profnastilMin: 85000,
    profnastilMax: 120000,
    cherepitsaMin: 125000,
    cherepitsaMax: 170000,
    turnkeyMin: 230000,
    turnkeyMax: 320000,
  },
  products: [
    {
      id: "p1",
      slug: "metallocherepitsa",
      name: "Metallocherepitsa",
      category: "Tom qoplamasi",
      short: "Do'ppi va ko'p qiyalikli tomlar uchun. Uyga tabiiy cherepitsa ko'rinishini beradi.",
      description:
        "Metallocherepitsa — tabiiy cherepitsa shaklida profillangan po'lat list. Do'ppi tom, mansard va ko'p qiyalikli tomlarda uy salobatli va tugallangan ko'rinadi. Polimer qoplama quyosh va yog'ingarchilikka chidamli, rangi uzoq yillar o'chmaydi.",
      specs: [
        "Qoplama: polimer, matoviy yoki yaltiroq",
        "Ishchi eni: 1100 mm",
        "Minimal qiyalik: 14°",
      ],
      thicknesses: "0.45 / 0.5 mm",
      colors: "RAL 8017, 7024, 3005, 6005, 5005",
      priceFrom: 0,
      unit: "m²",
      warrantyYears: 15,
      images: [],
    },
    {
      id: "p2",
      slug: "profnastil",
      name: "Profnastil",
      category: "Tom va devor",
      short: "Tez o'rnatiladi, mustahkam va tejamkor. Uy, ombor, ayvon va to'siq uchun.",
      description:
        "Profnastil — to'lqinsimon profilli po'lat list. Yengil, mustahkam va tez o'rnatiladi. Tom uchun baland to'lqinli, devor va to'siq uchun past to'lqinli profillar tayyorlanadi. Uzunligi buyurtma bo'yicha kesiladi, shuning uchun chiqindi kam bo'ladi.",
      specs: ["Profillar: C-8, C-20, C-21, HC-35", "Qoplama: rux yoki polimer", "Uzunlik: buyurtma bo'yicha"],
      thicknesses: "0.35 / 0.4 / 0.5 mm",
      colors: "15 dan ortiq RAL rang",
      priceFrom: 0,
      unit: "m²",
      warrantyYears: 10,
      images: [],
    },
    {
      id: "p3",
      slug: "tunkafon",
      name: "Tunkafon",
      category: "Fasad va to'siq",
      short: "Fasad, darvoza va to'siq uchun. Tom bilan bir rangda uy yaxlit ko'rinadi.",
      description:
        "Tunkafon — fasad va to'siq uchun profillangan list. Uyning tashqi ko'rinishini tomga moslab yakunlaydi: tom va fasad bir rangda bo'lsa, uy yaxlit va puxta ko'rinadi.",
      specs: ["Qoplama: polimer", "Qo'llanishi: fasad, darvoza, to'siq"],
      thicknesses: "0.4 / 0.5 mm",
      colors: "Tom rangiga mos",
      priceFrom: 0,
      unit: "m²",
      warrantyYears: 10,
      images: [],
    },
    {
      id: "p4",
      slug: "butlovchi-qismlar",
      name: "Butlovchi qismlar",
      category: "To'liq komplekt",
      short: "Konyok, vodostok, qor ushlagich, vint va plankalar — tom rangida, bir joydan.",
      description:
        "Tomning umri faqat listga emas, detallarga ham bog'liq. Konyok, endova, karniz plankalari, vodostok tizimi, qor ushlagich va germetik vintlarni tom rangiga mos holda to'liq komplektda yetkazamiz.",
      specs: ["Konyok va endova", "Vodostok tizimi", "Qor ushlagich", "Germetik vintlar", "Karniz va torets plankalari"],
      thicknesses: "Listga mos",
      colors: "Listga mos",
      priceFrom: 0,
      unit: "",
      warrantyYears: 10,
      images: [],
    },
  ],
  // Instagram sahifasidagi obyektlar. Rasmlarni admin paneldan yuklang.
  objects: [
    {
      id: "o1",
      title: "1000 m² li loyihani bir jamoa bilan yopdik",
      region: "Namangan",
      district: "Xamza",
      type: "turar-joy",
      product: "Metallocherepitsa",
      area: 1000,
      year: 2026,
      images: [],
      videoUrl: "",
    },
    {
      id: "o2",
      title: "15 yil kafolat bilan do'ppi tom",
      region: "Andijon",
      district: "Bo'ston",
      type: "turar-joy",
      product: "Metallocherepitsa",
      area: 0,
      year: 2026,
      images: [],
      videoUrl: "",
    },
    {
      id: "o3",
      title: "Tumandagi noodatiy tomlar yana bittaga ko'paydi",
      region: "Namangan",
      district: "Kosonsoy",
      type: "turar-joy",
      product: "Metallocherepitsa",
      area: 0,
      year: 2026,
      images: [],
      videoUrl: "",
    },
  ],
  certificates: [],
  // Faqat haqiqiy mijozlar fikri qo'shilsin (admin panel > Mijozlar fikri)
  reviews: [],
  faqs: [
    {
      id: "f1",
      q: "O'lchov uchun pul to'lash kerakmi?",
      a: "Yo'q. Mutaxassisimiz joyga borib o'lchaydi va smeta tayyorlaydi. Bu bepul va hech qanday majburiyat yuklamaydi.",
    },
    {
      id: "f2",
      q: "Kafolat qanday rasmiylashtiriladi?",
      a: "Ish tugagach, raqamli kafolat hujjati beriladi. Hujjat raqamini saytdagi «Kafolat» bo'limida istalgan vaqt tekshirishingiz mumkin.",
    },
    {
      id: "f3",
      q: "Do'ppi tom uchun qaysi material yaxshi?",
      a: "Ko'p qirrali do'ppi tomda metallocherepitsa eng chiroyli natija beradi: chiziqlar tekis tushadi, uy salobatli ko'rinadi. Byudjet cheklangan bo'lsa, profnastil ham ishonchli tanlov.",
    },
    {
      id: "f4",
      q: "Qaysi viloyatlarda ishlaysiz?",
      a: "Toshkent, Farg'ona vodiysi, Samarqand va boshqa viloyatlarda o'lchov, yetkazib berish va montaj xizmatini ko'rsatamiz. Hududingizni qo'ng'iroq qilib aniqlashtiring.",
    },
    {
      id: "f5",
      q: "Tom yopish qancha vaqt oladi?",
      a: "Muddat tom maydoni va murakkabligiga bog'liq. Aniq muddat o'lchovdan keyin smetada yoziladi.",
    },
    {
      id: "f6",
      q: "Usta va quruvchilar bilan hamkorlik qilasizmi?",
      a: "Ha. Doimiy ishlaydigan usta va quruvchilar uchun alohida shartlar bor. Formada «Usta / quruvchi»ni tanlang.",
    },
  ],
  articles: [
    {
      id: "a1",
      slug: "doppi-tom-nega-tanlanadi",
      title: "Nega aynan do'ppi tom yoptirish kerak?",
      excerpt: "Do'ppi tomning afzalliklari, narxga ta'siri va qaysi material bilan chiroyli chiqishi.",
      date: "2026-10-15",
      cover: "",
      body:
        "Do'ppi tom — to'rt va undan ortiq qiyalikdan iborat, markazga qarab ko'tariladigan tom shakli. Hovli uylarda u eng ko'p tanlanadigan yechimlardan biri.\n\n## Afzalliklari\n\nShamol yuki barcha qiyaliklarga teng taqsimlanadi, shuning uchun tom mustahkam turadi. Har tomondan karniz chiqib turadi va devorlarni yomg'irdan himoya qiladi. Eng muhimi — uy salobatli va tugallangan ko'rinadi.\n\n## Narxga ta'siri\n\nQiyalik va qirralar ko'p bo'lgani uchun material sarfi oddiy ikki qiyalikli tomga nisbatan ko'proq bo'ladi. Konyok va endova plankalari ham ko'proq ketadi.\n\n## Qaysi material?\n\nDo'ppi tomda metallocherepitsa eng chiroyli natija beradi. Muhimi — listlar aniq kesilishi va qirralar germetik yopilishi. Shuning uchun bunday tomni tajribali jamoaga topshirgan ma'qul.",
    },
    {
      id: "a2",
      slug: "aldanib-qolmang-sifatsiz-metall",
      title: "Aldanib qolmang: sifatsiz tom metalini qanday aniqlash mumkin?",
      excerpt: "Qalinlik, rux qatlami, qoplama va hujjat — xariddan oldin tekshiriladigan to'rt belgi.",
      date: "2026-10-01",
      cover: "",
      body:
        "Arzon tom ba'zan bir necha yilda zanglaydi yoki rangi o'chadi. Xariddan oldin quyidagilarni tekshiring.\n\n## 1. Haqiqiy qalinlik\n\nSotuvchi aytgan qalinlikni mikrometr bilan o'lchab ko'ring. Qalinlik va'da qilinganidan kam bo'lsa, list tez egiladi va uzoq xizmat qilmaydi.\n\n## 2. Rux qatlami\n\nListning kesilgan chetiga qarang. Sifatli metallda rux qatlami bir tekis bo'ladi.\n\n## 3. Qoplama\n\nPolimer qoplama tirnoq bilan qirilganda ko'chmasligi kerak. Rang butun list bo'ylab bir xil bo'lishi lozim.\n\n## 4. Hujjat\n\nZavod sertifikati va yozma kafolat bo'lmasa, xavf sizning zimmangizda qoladi. Promet har bir tomga raqamli kafolat hujjati beradi.",
    },
    {
      id: "a3",
      slug: "profnastil-qalinligini-tanlash",
      title: "Profnastil qalinligini qanday tanlash kerak?",
      excerpt: "0.35, 0.4 yoki 0.5 mm — tom, devor va to'siq uchun qaysi biri to'g'ri keladi.",
      date: "2026-09-20",
      cover: "",
      body:
        "Profnastil qalinligi tomning umri va mustahkamligiga bevosita ta'sir qiladi.\n\n## 0.35 mm\n\nTo'siq, vaqtinchalik inshoot va yengil ayvonlar uchun. Turar-joy tomi uchun tavsiya etilmaydi.\n\n## 0.4 mm\n\nKo'pchilik hovli uylar va omborlar uchun muvozanatli tanlov: yetarlicha mustahkam va tejamkor.\n\n## 0.5 mm\n\nQor yuki katta hududlar, keng oraliqli tomlar va tijorat obyektlari uchun. Ustida yurish va xizmat ko'rsatishga chidamli.",
    },
  ],
};

export const seedPrivate: PrivateData = {
  warranties: [],
};
