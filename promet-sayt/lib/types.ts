export type ObjectType = "turar-joy" | "tijorat" | "sanoat";
export type HeroMode = "3d" | "model" | "image" | "video";

export interface Stat { value: string; label: string }
export interface Step { title: string; text: string }
export interface RoofColor { name: string; ral: string; hex: string }

export interface Settings {
  companyName: string;
  phone: string;
  phone2: string;
  email: string;
  address: string;
  workingHours: string;
  mapEmbedUrl: string;
  telegram: string;
  instagram: string;
  youtube: string;
  facebook: string;
  yearsExperience: number;
  warrantyYears: number;
  // SEO
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  // Analitika
  gaId: string;
  yandexMetrikaId: string;
  metaPixelId: string;
}

/** Bosh sahifa: har bir bo'lim matni va ko'rinishi admin paneldan boshqariladi */
export interface Home {
  heroMode: HeroMode;
  heroModel: string; // .glb fayl
  heroModelRoof: string; // tom materiali nomlari, vergul bilan
  heroImage: string;
  heroVideo: string;
  heroLocation: string;
  heroTitle: string;
  heroText: string;
  heroCta: string;
  stats: Stat[];
  roofColors: RoofColor[];

  introTitle: string;
  introText: string;

  showMaterials: boolean;
  materialsTitle: string;
  materialsText: string;

  showObjects: boolean;
  objectsTitle: string;
  objectsText: string;

  showProcess: boolean;
  processTitle: string;
  steps: Step[];

  showCalculator: boolean;
  calcTitle: string;
  calcText: string;

  showWarranty: boolean;
  warrantyTitle: string;
  warrantyText: string;

  showReviews: boolean;
  reviewsTitle: string;

  showFaq: boolean;
  faqTitle: string;

  showArticles: boolean;
  articlesTitle: string;

  ctaTitle: string;
  ctaText: string;
}

export interface Pricing {
  profnastilMin: number;
  profnastilMax: number;
  cherepitsaMin: number;
  cherepitsaMax: number;
  turnkeyMin: number;
  turnkeyMax: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  short: string;
  description: string;
  specs: string[];
  thicknesses: string;
  colors: string;
  priceFrom: number;
  unit: string;
  warrantyYears: number;
  images: string[];
}

export interface RoofObject {
  id: string;
  title: string;
  region: string;
  district: string;
  type: ObjectType;
  product: string;
  area: number;
  year: number;
  images: string[];
  videoUrl: string;
}

export interface Certificate { id: string; title: string; issuer: string; image: string }
export interface Review { id: string; name: string; region: string; text: string; image: string; videoUrl: string }
export interface Faq { id: string; q: string; a: string }
export interface Article { id: string; slug: string; title: string; excerpt: string; body: string; date: string; cover: string }

export interface Warranty {
  id: string;
  number: string;
  clientName: string;
  region: string;
  product: string;
  area: number;
  installedAt: string;
  years: number;
}

export interface Content {
  settings: Settings;
  home: Home;
  pricing: Pricing;
  products: Product[];
  objects: RoofObject[];
  certificates: Certificate[];
  reviews: Review[];
  faqs: Faq[];
  articles: Article[];
}

export interface Integrations {
  amoDomain: string; // masalan: promet.amocrm.ru
  amoToken: string; // uzoq muddatli token
  amoPipelineId: string;
  amoStatusId: string;
  amoResponsibleId: string;
  amoTags: string;
  bitrixWebhook: string;
  webhookUrl: string;
  telegramToken: string;
  telegramChatId: string;
}

export interface PrivateData {
  warranties: Warranty[];
  integrations: Integrations;
  passwordHash: string;
}

export type LeadStatus = "yangi" | "boglanildi" | "olchov" | "shartnoma" | "rad";

export interface CrmResult { target: string; ok: boolean; message: string; at: string }

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  region: string;
  role: string;
  timeline: string;
  comment: string;
  source: string;
  calc: string;
  utm: string;
  page: string;
  status: LeadStatus;
  crm: CrmResult[];
  crmLeadId?: string;
}
