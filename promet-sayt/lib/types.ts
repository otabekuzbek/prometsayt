export type ObjectType = "turar-joy" | "tijorat" | "sanoat";

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
  heroImage: string;
  heroLocation: string;
  heroTitle: string;
  heroText: string;
  yearsExperience: number;
  warrantyYears: number;
  objectsDone: number;
  followers: string;
  gaId: string;
  yandexMetrikaId: string;
  metaPixelId: string;
}

export interface Pricing {
  /** so'm / m² — faqat material */
  profnastilMin: number;
  profnastilMax: number;
  cherepitsaMin: number;
  cherepitsaMax: number;
  /** so'm / m² — montaj bilan (kalit topshirish) */
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
  specs: string[]; // "Kalit: qiymat"
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

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  image: string;
}

export interface Review {
  id: string;
  name: string;
  region: string;
  text: string;
  image: string;
  videoUrl: string;
}

export interface Faq {
  id: string;
  q: string;
  a: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  cover: string;
}

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
  pricing: Pricing;
  products: Product[];
  objects: RoofObject[];
  certificates: Certificate[];
  reviews: Review[];
  faqs: Faq[];
  articles: Article[];
}

export interface PrivateData {
  warranties: Warranty[];
}

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
}
