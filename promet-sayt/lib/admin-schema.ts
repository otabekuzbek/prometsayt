import { REGIONS } from "./utils";

export type FieldType = "text" | "textarea" | "longtext" | "number" | "select" | "image" | "images" | "lines" | "date" | "url";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  help?: string;
  required?: boolean;
}

export interface SectionSchema {
  key: string; // URL qismi
  store: "objects" | "certificates" | "products" | "reviews" | "faqs" | "articles" | "warranties";
  title: string;
  singular: string;
  titleField: string;
  subtitle?: (item: Record<string, unknown>) => string;
  imageField?: string;
  fields: Field[];
  blank: () => Record<string, unknown>;
  canAdd?: boolean;
}

const regionOpts = REGIONS.map((r) => ({ value: r, label: r }));
const today = () => new Date().toISOString().slice(0, 10);

export const SECTIONS: SectionSchema[] = [
  {
    key: "obyektlar",
    store: "objects",
    title: "Obyektlar",
    singular: "obyekt",
    titleField: "title",
    imageField: "images",
    subtitle: (o) => `${o.region} ${o.district} · ${o.product} · ${o.area} m²`,
    fields: [
      { key: "title", label: "Sarlavha", type: "text", required: true, help: "Masalan: 15 yil kafolat bilan do'ppi tom" },
      { key: "region", label: "Viloyat", type: "select", options: regionOpts },
      { key: "district", label: "Tuman / shahar", type: "text", help: "Saytda «Namangan Xamzada» ko'rinishida chiqadi" },
      { key: "type", label: "Obyekt turi", type: "select", options: [
        { value: "turar-joy", label: "Turar-joy" }, { value: "tijorat", label: "Tijorat" }, { value: "sanoat", label: "Sanoat" },
      ] },
      { key: "product", label: "Material", type: "select", options: ["Metallocherepitsa", "Profnastil", "Tunkafon"].map((v) => ({ value: v, label: v })) },
      { key: "area", label: "Maydon, m²", type: "number" },
      { key: "year", label: "Yil", type: "number" },
      { key: "images", label: "Rasmlar", type: "images", help: "Birinchi rasm — muqova" },
      { key: "videoUrl", label: "Video havolasi (YouTube yoki Instagram reels)", type: "url" },
    ],
    blank: () => ({ title: "", region: "Toshkent", district: "", type: "turar-joy", product: "Metallocherepitsa", area: 0, year: new Date().getFullYear(), images: [], videoUrl: "" }),
  },
  {
    key: "sertifikatlar",
    store: "certificates",
    title: "Sertifikatlar",
    singular: "sertifikat",
    titleField: "title",
    imageField: "image",
    subtitle: (o) => String(o.issuer || ""),
    fields: [
      { key: "title", label: "Nomi", type: "text", required: true },
      { key: "issuer", label: "Kim bergan", type: "text", help: "Masalan: zavod nomi yoki sertifikatlash organi" },
      { key: "image", label: "Sertifikat rasmi (JPG/PNG yoki PDF)", type: "image" },
    ],
    blank: () => ({ title: "", issuer: "", image: "" }),
  },
  {
    key: "mahsulotlar",
    store: "products",
    title: "Mahsulotlar",
    singular: "mahsulot",
    titleField: "name",
    imageField: "images",
    subtitle: (o) => String(o.category || ""),
    fields: [
      { key: "name", label: "Nomi", type: "text", required: true },
      { key: "slug", label: "Manzil (slug)", type: "text", help: "Saytdagi manzil: /mahsulotlar/slug. Bo'sh qolsa nomdan yasaladi" },
      { key: "category", label: "Toifa", type: "text" },
      { key: "short", label: "Qisqa tavsif", type: "textarea" },
      { key: "description", label: "To'liq tavsif", type: "longtext" },
      { key: "thicknesses", label: "Qalinlik", type: "text" },
      { key: "colors", label: "Ranglar", type: "text" },
      { key: "priceFrom", label: "Narx (dan), so'm", type: "number", help: "0 — «Narxi so'rov bo'yicha»" },
      { key: "unit", label: "O'lchov birligi", type: "text" },
      { key: "warrantyYears", label: "Kafolat, yil", type: "number" },
      { key: "specs", label: "Texnik ko'rsatkichlar", type: "lines", help: "Har qatorda bittadan: «Kalit: qiymat»" },
      { key: "images", label: "Rasmlar", type: "images" },
    ],
    blank: () => ({ name: "", slug: "", category: "", short: "", description: "", thicknesses: "", colors: "", priceFrom: 0, unit: "m²", warrantyYears: 10, specs: [], images: [] }),
  },
  {
    key: "sharhlar",
    store: "reviews",
    title: "Mijozlar fikri",
    singular: "sharh",
    titleField: "name",
    imageField: "image",
    subtitle: (o) => String(o.region || ""),
    fields: [
      { key: "name", label: "Mijoz ismi", type: "text", required: true },
      { key: "region", label: "Hudud", type: "text" },
      { key: "text", label: "Fikr matni", type: "textarea" },
      { key: "image", label: "Surat (ixtiyoriy)", type: "image" },
      { key: "videoUrl", label: "Video havolasi (ixtiyoriy)", type: "url" },
    ],
    blank: () => ({ name: "", region: "", text: "", image: "", videoUrl: "" }),
  },
  {
    key: "savollar",
    store: "faqs",
    title: "Savol-javoblar",
    singular: "savol",
    titleField: "q",
    fields: [
      { key: "q", label: "Savol", type: "text", required: true },
      { key: "a", label: "Javob", type: "textarea" },
    ],
    blank: () => ({ q: "", a: "" }),
  },
  {
    key: "maqolalar",
    store: "articles",
    title: "Maqolalar",
    singular: "maqola",
    titleField: "title",
    imageField: "cover",
    subtitle: (o) => String(o.date || ""),
    fields: [
      { key: "title", label: "Sarlavha", type: "text", required: true },
      { key: "slug", label: "Manzil (slug)", type: "text", help: "Bo'sh qolsa sarlavhadan yasaladi" },
      { key: "date", label: "Sana", type: "date" },
      { key: "excerpt", label: "Qisqa mazmun", type: "textarea" },
      { key: "cover", label: "Muqova rasmi", type: "image" },
      { key: "body", label: "Matn", type: "longtext", help: "Bo'sh qator — yangi xatboshi. «## » bilan boshlangan qator — kichik sarlavha" },
    ],
    blank: () => ({ title: "", slug: "", date: today(), excerpt: "", cover: "", body: "" }),
  },
  {
    key: "kafolatlar",
    store: "warranties",
    title: "Kafolat reestri",
    singular: "kafolat",
    titleField: "number",
    subtitle: (o) => `${o.clientName} · ${o.region} · ${o.installedAt}`,
    fields: [
      { key: "number", label: "Kafolat raqami", type: "text", required: true, help: "Masalan: PRM-2026-0002. Mijoz saytda shu raqam bilan tekshiradi" },
      { key: "clientName", label: "Mijoz ismi", type: "text", help: "Saytda qisman yashirin ko'rinadi: A**** K****" },
      { key: "region", label: "Hudud", type: "select", options: regionOpts },
      { key: "product", label: "Material", type: "text" },
      { key: "area", label: "Maydon, m²", type: "number" },
      { key: "installedAt", label: "O'rnatilgan sana", type: "date" },
      { key: "years", label: "Kafolat muddati, yil", type: "number" },
    ],
    blank: () => ({ number: "", clientName: "", region: "Toshkent", product: "Metallocherepitsa", area: 0, installedAt: today(), years: 15 }),
  },
];

export const SETTINGS_FIELDS: { group: string; fields: Field[] }[] = [
  {
    group: "Aloqa",
    fields: [
      { key: "companyName", label: "Kompaniya nomi", type: "text" },
      { key: "phone", label: "Asosiy telefon", type: "text" },
      { key: "phone2", label: "Qo'shimcha telefon", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "address", label: "Manzil", type: "text" },
      { key: "workingHours", label: "Ish vaqti", type: "text" },
      { key: "mapEmbedUrl", label: "Xarita (Google/Yandex embed havolasi)", type: "url", help: "Google Maps > Ulashish > Xaritani joylashtirish > src ichidagi havola" },
    ],
  },
  {
    group: "Ijtimoiy tarmoqlar",
    fields: [
      { key: "telegram", label: "Telegram (@username yoki havola)", type: "text" },
      { key: "instagram", label: "Instagram havolasi", type: "url" },
      { key: "youtube", label: "YouTube havolasi", type: "url" },
    ],
  },
  {
    group: "Bosh sahifa",
    fields: [
      { key: "heroImage", label: "Bosh ekran rasmi", type: "image", help: "Keng format (gorizontal), kamida 1600px. Bo'sh qolsa birinchi obyekt rasmi olinadi" },
      { key: "heroLocation", label: "Qo'lyozma yozuv", type: "text", help: "Masalan: Namangan Xamzada" },
      { key: "heroTitle", label: "Asosiy sarlavha", type: "text" },
      { key: "heroText", label: "Sarlavha osti matni", type: "textarea" },
      { key: "yearsExperience", label: "Tajriba, yil", type: "number" },
      { key: "warrantyYears", label: "Kafolat, yil", type: "number" },
      { key: "objectsDone", label: "Yopilgan tomlar soni", type: "number" },
      { key: "followers", label: "Instagram obunachilar", type: "text" },
    ],
  },
  {
    group: "Analitika",
    fields: [
      { key: "gaId", label: "Google Analytics ID (G-XXXX)", type: "text" },
      { key: "yandexMetrikaId", label: "Yandex Metrika raqami", type: "text" },
      { key: "metaPixelId", label: "Meta Pixel ID", type: "text" },
    ],
  },
];

export const PRICING_FIELDS: Field[] = [
  { key: "profnastilMin", label: "Profnastil, min (so'm/m²)", type: "number" },
  { key: "profnastilMax", label: "Profnastil, max (so'm/m²)", type: "number" },
  { key: "cherepitsaMin", label: "Metallocherepitsa, min (so'm/m²)", type: "number" },
  { key: "cherepitsaMax", label: "Metallocherepitsa, max (so'm/m²)", type: "number" },
  { key: "turnkeyMin", label: "Kalit topshirish, min (so'm/m²)", type: "number" },
  { key: "turnkeyMax", label: "Kalit topshirish, max (so'm/m²)", type: "number" },
];
