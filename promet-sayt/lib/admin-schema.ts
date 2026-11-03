import { REGIONS } from "./utils";

export type FieldType =
  | "text" | "textarea" | "longtext" | "number" | "select" | "image" | "images" | "lines" | "date" | "url"
  | "toggle" | "file" | "secret" | "repeater" | "color";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  help?: string;
  required?: boolean;
  accept?: string; // file
  fields?: Field[]; // repeater
  itemLabel?: string; // repeater
  showIf?: { key: string; equals: string[] };
}

export interface Group { group: string; help?: string; fields: Field[] }

export interface SectionSchema {
  key: string;
  store: "objects" | "certificates" | "products" | "reviews" | "faqs" | "articles" | "warranties";
  title: string;
  singular: string;
  titleField: string;
  subtitle?: (item: Record<string, unknown>) => string;
  imageField?: string;
  fields: Field[];
  blank: () => Record<string, unknown>;
}

const regionOpts = REGIONS.map((r) => ({ value: r, label: r }));
const today = () => new Date().toISOString().slice(0, 10);
const MATERIALS = ["Metallocherepitsa", "Profnastil", "Tunkafon", "Boshqa"].map((v) => ({ value: v, label: v }));

export const SECTIONS: SectionSchema[] = [
  {
    key: "obyektlar",
    store: "objects",
    title: "Obyektlar",
    singular: "obyekt",
    titleField: "title",
    imageField: "images",
    subtitle: (o) => [o.region, o.district, o.product, o.area ? `${o.area} m²` : ""].filter(Boolean).join(", "),
    fields: [
      { key: "title", label: "Sarlavha", type: "text", required: true, help: "Masalan: 15 yil kafolat bilan do'ppi tom" },
      { key: "region", label: "Viloyat", type: "select", options: regionOpts },
      { key: "district", label: "Tuman yoki shahar", type: "text", help: "Saytda «Namangan Xamzada» ko'rinishida chiqadi" },
      { key: "type", label: "Obyekt turi", type: "select", options: [
        { value: "turar-joy", label: "Turar-joy" }, { value: "tijorat", label: "Tijorat" }, { value: "sanoat", label: "Sanoat" },
      ] },
      { key: "product", label: "Material", type: "select", options: MATERIALS },
      { key: "area", label: "Maydon, m²", type: "number", help: "0 bo'lsa saytda ko'rsatilmaydi" },
      { key: "year", label: "Yil", type: "number" },
      { key: "images", label: "Rasmlar", type: "images", help: "Birinchi rasm — muqova. Tartibni strelkalar bilan o'zgartiring" },
      { key: "videoUrl", label: "Video havolasi (YouTube yoki Instagram reels)", type: "url" },
    ],
    blank: () => ({ title: "", region: "Namangan", district: "", type: "turar-joy", product: "Metallocherepitsa", area: 0, year: new Date().getFullYear(), images: [], videoUrl: "" }),
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
      { key: "slug", label: "Sahifa manzili (slug)", type: "text", help: "Saytdagi manzil: /mahsulotlar/slug. Bo'sh qolsa nomdan yasaladi" },
      { key: "category", label: "Toifa", type: "text" },
      { key: "short", label: "Qisqa tavsif", type: "textarea" },
      { key: "description", label: "To'liq tavsif", type: "longtext" },
      { key: "thicknesses", label: "Qalinlik", type: "text" },
      { key: "colors", label: "Ranglar", type: "text" },
      { key: "priceFrom", label: "Narx (dan), so'm", type: "number", help: "0 bo'lsa «Narxi o'lchovdan keyin» deb chiqadi" },
      { key: "unit", label: "O'lchov birligi", type: "text" },
      { key: "warrantyYears", label: "Kafolat, yil", type: "number" },
      { key: "specs", label: "Texnik ko'rsatkichlar", type: "lines", help: "Har qatorda bittadan: «Nomi: qiymati»" },
      { key: "images", label: "Rasmlar", type: "images" },
    ],
    blank: () => ({ name: "", slug: "", category: "", short: "", description: "", thicknesses: "", colors: "", priceFrom: 0, unit: "m²", warrantyYears: 10, specs: [], images: [] }),
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
      { key: "issuer", label: "Kim bergan", type: "text", help: "Zavod nomi yoki sertifikatlash organi" },
      { key: "image", label: "Sertifikat (JPG, PNG yoki PDF)", type: "image" },
    ],
    blank: () => ({ title: "", issuer: "", image: "" }),
  },
  {
    key: "sharhlar",
    store: "reviews",
    title: "Mijozlar fikri",
    singular: "fikr",
    titleField: "name",
    imageField: "image",
    subtitle: (o) => String(o.region || ""),
    fields: [
      { key: "name", label: "Mijoz ismi", type: "text", required: true },
      { key: "region", label: "Hudud", type: "text" },
      { key: "text", label: "Fikr matni", type: "textarea" },
      { key: "image", label: "Surat", type: "image" },
      { key: "videoUrl", label: "Video havolasi", type: "url", help: "YouTube yoki Instagram reels" },
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
      { key: "slug", label: "Sahifa manzili (slug)", type: "text", help: "Bo'sh qolsa sarlavhadan yasaladi" },
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
    subtitle: (o) => [o.clientName, o.region, o.installedAt].filter(Boolean).join(", "),
    fields: [
      { key: "number", label: "Kafolat raqami", type: "text", required: true, help: "Masalan: PRM-2026-0001. Mijoz saytda shu raqam bilan tekshiradi" },
      { key: "clientName", label: "Mijoz ismi", type: "text", help: "Saytda qisman yashirin ko'rinadi: A**** K****" },
      { key: "region", label: "Hudud", type: "select", options: regionOpts },
      { key: "product", label: "Material", type: "select", options: MATERIALS },
      { key: "area", label: "Maydon, m²", type: "number" },
      { key: "installedAt", label: "O'rnatilgan sana", type: "date" },
      { key: "years", label: "Kafolat muddati, yil", type: "number" },
    ],
    blank: () => ({ number: "", clientName: "", region: "Namangan", product: "Metallocherepitsa", area: 0, installedAt: today(), years: 15 }),
  },
];

const heroModes = [
  { value: "3d", label: "Standart 3D uy (ranglari almashadi)" },
  { value: "model", label: "O'zimizning 3D model (.glb)" },
  { value: "image", label: "Rasm" },
  { value: "video", label: "Video" },
];

export const HOME_GROUPS: Group[] = [
  {
    group: "Birinchi ekran",
    help: "Saytga kirgan odam birinchi ko'radigan qism.",
    fields: [
      { key: "heroMode", label: "Fon turi", type: "select", options: heroModes },
      { key: "heroModel", label: "3D model fayli (.glb)", type: "file", accept: ".glb,model/gltf-binary", showIf: { key: "heroMode", equals: ["model"] },
        help: "Blender, SketchUp yoki 3ds Max'dan GLB formatida eksport qiling. Tavsiya: 20 MB gacha. Model avtomatik markazga joylanadi" },
      { key: "heroModelRoof", label: "Tom materiali nomlari", type: "text", showIf: { key: "heroMode", equals: ["model"] },
        help: "Modeldagi tom materiali yoki obyekt nomi (vergul bilan). Shu qismlar rang tugmalari bilan bo'yaladi. Masalan: roof, tom" },
      { key: "heroImage", label: "Rasm", type: "image", showIf: { key: "heroMode", equals: ["image", "video"] }, help: "Keng format, kamida 1920 px. Video rejimida video yuklanguncha ko'rinadi" },
      { key: "heroVideo", label: "Video (MP4)", type: "file", accept: "video/mp4,video/webm", showIf: { key: "heroMode", equals: ["video"] }, help: "Ovozsiz, 10–30 soniya, 15 MB gacha tavsiya etiladi" },
      { key: "heroLocation", label: "Qo'lyozma yozuv", type: "text", help: "Masalan: Namangan Xamzada. Bo'sh qoldirsa ko'rinmaydi" },
      { key: "heroTitle", label: "Asosiy sarlavha", type: "text" },
      { key: "heroText", label: "Sarlavha osti matni", type: "textarea" },
      { key: "heroCta", label: "Asosiy tugma matni", type: "text" },
      { key: "stats", label: "Raqamlar", type: "repeater", itemLabel: "raqam", fields: [
        { key: "value", label: "Qiymat", type: "text" }, { key: "label", label: "Izoh", type: "text" },
      ] },
      { key: "roofColors", label: "Tom ranglari", type: "repeater", itemLabel: "rang", help: "Bosh sahifa va kalkulyatordagi rang tugmalari", fields: [
        { key: "name", label: "Nomi", type: "text" }, { key: "ral", label: "RAL", type: "text" }, { key: "hex", label: "Rang", type: "color" },
      ] },
    ],
  },
  {
    group: "Kompaniya haqida qisqa",
    fields: [
      { key: "introTitle", label: "Sarlavha", type: "textarea" },
      { key: "introText", label: "Matn", type: "textarea" },
    ],
  },
  {
    group: "Materiallar bo'limi",
    fields: [
      { key: "showMaterials", label: "Bo'limni ko'rsatish", type: "toggle" },
      { key: "materialsTitle", label: "Sarlavha", type: "text" },
      { key: "materialsText", label: "Matn", type: "textarea" },
    ],
  },
  {
    group: "Obyektlar bo'limi",
    fields: [
      { key: "showObjects", label: "Bo'limni ko'rsatish", type: "toggle" },
      { key: "objectsTitle", label: "Sarlavha", type: "text" },
      { key: "objectsText", label: "Matn", type: "textarea" },
    ],
  },
  {
    group: "Ish tartibi",
    fields: [
      { key: "showProcess", label: "Bo'limni ko'rsatish", type: "toggle" },
      { key: "processTitle", label: "Sarlavha", type: "text" },
      { key: "steps", label: "Qadamlar", type: "repeater", itemLabel: "qadam", fields: [
        { key: "title", label: "Nomi", type: "text" }, { key: "text", label: "Tavsif", type: "textarea" },
      ] },
    ],
  },
  {
    group: "Kalkulyator",
    fields: [
      { key: "showCalculator", label: "Bo'limni ko'rsatish", type: "toggle" },
      { key: "calcTitle", label: "Sarlavha", type: "text" },
      { key: "calcText", label: "Matn", type: "textarea" },
    ],
  },
  {
    group: "Kafolat",
    fields: [
      { key: "showWarranty", label: "Bo'limni ko'rsatish", type: "toggle" },
      { key: "warrantyTitle", label: "Sarlavha", type: "text" },
      { key: "warrantyText", label: "Matn", type: "textarea" },
    ],
  },
  {
    group: "Mijozlar fikri, savollar va maqolalar",
    help: "Mijozlar fikri bo'limi faqat kamida bitta fikr qo'shilganda ko'rinadi.",
    fields: [
      { key: "showReviews", label: "Mijozlar fikrini ko'rsatish", type: "toggle" },
      { key: "reviewsTitle", label: "Mijozlar fikri sarlavhasi", type: "text" },
      { key: "showFaq", label: "Savol-javoblarni ko'rsatish", type: "toggle" },
      { key: "faqTitle", label: "Savol-javob sarlavhasi", type: "text" },
      { key: "showArticles", label: "Maqolalarni ko'rsatish", type: "toggle" },
      { key: "articlesTitle", label: "Maqolalar sarlavhasi", type: "text" },
    ],
  },
  {
    group: "Yakuniy chaqiriq",
    fields: [
      { key: "ctaTitle", label: "Sarlavha", type: "text" },
      { key: "ctaText", label: "Matn", type: "textarea" },
    ],
  },
];

export const SETTINGS_GROUPS: Group[] = [
  {
    group: "Aloqa",
    fields: [
      { key: "companyName", label: "Kompaniya nomi", type: "text" },
      { key: "phone", label: "Asosiy telefon", type: "text" },
      { key: "phone2", label: "Qo'shimcha telefon", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "address", label: "Manzil", type: "text", help: "Bo'sh qolsa saytda ko'rsatilmaydi" },
      { key: "workingHours", label: "Ish vaqti", type: "text" },
      { key: "mapEmbedUrl", label: "Xarita havolasi", type: "url", help: "Google Maps → Ulashish → Xaritani joylashtirish → src=\"...\" ichidagi havola. Yandex xarita konstruktoridagi havola ham bo'ladi" },
    ],
  },
  {
    group: "Ijtimoiy tarmoqlar",
    fields: [
      { key: "telegram", label: "Telegram (@username yoki havola)", type: "text" },
      { key: "instagram", label: "Instagram", type: "url" },
      { key: "facebook", label: "Facebook", type: "url" },
      { key: "youtube", label: "YouTube", type: "url" },
    ],
  },
  {
    group: "Kompaniya ma'lumotlari",
    fields: [
      { key: "yearsExperience", label: "Tajriba, yil", type: "number", help: "Matnlarda ishlatiladi" },
      { key: "warrantyYears", label: "Kafolat, yil", type: "number" },
    ],
  },
  {
    group: "SEO (Google va Yandex qidiruvi)",
    fields: [
      { key: "metaTitle", label: "Sayt sarlavhasi", type: "text", help: "60 belgigacha" },
      { key: "metaDescription", label: "Sayt tavsifi", type: "textarea", help: "160 belgigacha" },
      { key: "ogImage", label: "Ulashish rasmi", type: "image", help: "Telegram va ijtimoiy tarmoqlarda havola ulashilganda chiqadi. 1200×630 px" },
    ],
  },
  {
    group: "Analitika",
    fields: [
      { key: "gaId", label: "Google Analytics ID", type: "text", help: "G-XXXXXXX" },
      { key: "yandexMetrikaId", label: "Yandex Metrika raqami", type: "text" },
      { key: "metaPixelId", label: "Meta Pixel ID", type: "text" },
    ],
  },
];

export const PRICING_GROUPS: Group[] = [
  {
    group: "Kalkulyator narxlari (so'm / m²)",
    help: "Kalkulyator shu oraliqlar asosida taxminiy narx chiqaradi. Narxlar o'zgarganda shu yerda yangilang.",
    fields: [
      { key: "cherepitsaMin", label: "Metallocherepitsa, minimal", type: "number" },
      { key: "cherepitsaMax", label: "Metallocherepitsa, maksimal", type: "number" },
      { key: "profnastilMin", label: "Profnastil, minimal", type: "number" },
      { key: "profnastilMax", label: "Profnastil, maksimal", type: "number" },
      { key: "turnkeyMin", label: "Montaj bilan (kalit topshirish), minimal", type: "number" },
      { key: "turnkeyMax", label: "Montaj bilan (kalit topshirish), maksimal", type: "number" },
    ],
  },
];

export const INTEGRATION_GROUPS: Group[] = [
  {
    group: "amoCRM",
    help: "amoCRM → Sozlamalar → Integratsiyalar → «+ Integratsiya yaratish» (xususiy) → «Kalitlar va dostuplar» bo'limidan «Uzoq muddatli token» oling. Har bir murojaat amoCRM'da yangi lid, kontakt (telefon bilan) va to'liq izoh bo'lib tushadi.",
    fields: [
      { key: "amoDomain", label: "amoCRM manzili", type: "text", help: "Masalan: promet.amocrm.ru (yoki promet.kommo.com)" },
      { key: "amoToken", label: "Uzoq muddatli token", type: "secret" },
      { key: "amoPipelineId", label: "Voronka ID (ixtiyoriy)", type: "text", help: "Bo'sh qolsa asosiy voronkaga tushadi. ID voronka manzilida ko'rinadi: .../leads/pipeline/1234567" },
      { key: "amoStatusId", label: "Bosqich ID (ixtiyoriy)", type: "text" },
      { key: "amoResponsibleId", label: "Mas'ul xodim ID (ixtiyoriy)", type: "text" },
      { key: "amoTags", label: "Teglar", type: "text", help: "Vergul bilan. Reklama UTM manbasi ham avtomatik teg bo'ladi" },
    ],
  },
  {
    group: "Telegram xabarnoma",
    help: "@BotFather'da bot yarating, tokenni kiriting, botni sotuv guruhiga qo'shing. Guruh ID'sini @getmyid_bot orqali bilasiz (odatda -100 bilan boshlanadi).",
    fields: [
      { key: "telegramToken", label: "Bot tokeni", type: "secret" },
      { key: "telegramChatId", label: "Guruh yoki chat ID", type: "text" },
    ],
  },
  {
    group: "Boshqa tizimlar",
    fields: [
      { key: "bitrixWebhook", label: "Bitrix24 kiruvchi webhook", type: "secret", help: "Masalan: https://kompaniya.bitrix24.kz/rest/1/abc123/ — «crm» huquqi bilan" },
      { key: "webhookUrl", label: "Umumiy webhook (n8n, Make, Zapier)", type: "secret", help: "Har bir murojaat JSON ko'rinishida POST qilinadi" },
    ],
  },
];

export const LEAD_STATUSES: { value: string; label: string; color: string }[] = [
  { value: "yangi", label: "Yangi", color: "#1e4b8a" },
  { value: "boglanildi", label: "Bog'lanildi", color: "#7a5300" },
  { value: "olchov", label: "O'lchov", color: "#5b3fa0" },
  { value: "shartnoma", label: "Shartnoma", color: "#278035" },
  { value: "rad", label: "Rad etildi", color: "#8a1c13" },
];
