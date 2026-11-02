import type { MetadataRoute } from "next";
import { getContent } from "@/lib/store";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getContent();
  const base = siteUrl();
  const pages = ["", "/obyektlar", "/mahsulotlar", "/kalkulyator", "/kafolat", "/maqolalar", "/biz-haqimizda", "/aloqa"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...c.products.map((p) => ({ url: `${base}/mahsulotlar/${p.slug}`, priority: 0.8 })),
    ...c.articles.map((a) => ({ url: `${base}/maqolalar/${a.slug}`, lastModified: a.date, priority: 0.6 })),
  ];
}
