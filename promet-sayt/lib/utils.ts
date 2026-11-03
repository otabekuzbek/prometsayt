export const REGIONS = [
  "Toshkent",
  "Toshkent viloyati",
  "Andijon",
  "Namangan",
  "Farg'ona",
  "Samarqand",
  "Buxoro",
  "Qashqadaryo",
  "Surxondaryo",
  "Jizzax",
  "Sirdaryo",
  "Navoiy",
  "Xorazm",
  "Qoraqalpog'iston",
];

export const OBJECT_TYPES: Record<string, string> = {
  "turar-joy": "Turar-joy",
  tijorat: "Tijorat",
  sanoat: "Sanoat",
};

export const ROOF_COLORS = [
  { ral: "8017", name: "Shokolad", hex: "#45322E" },
  { ral: "7024", name: "Grafit", hex: "#45494E" },
  { ral: "3005", name: "Vishnya", hex: "#5E2129" },
  { ral: "6005", name: "Yashil", hex: "#114232" },
  { ral: "5005", name: "Ko'k", hex: "#1E4B8A" },
  { ral: "9006", name: "Kumush", hex: "#A1A1A0" },
];

export function som(n: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)).replace(/ /g, " ") + " so'm";
}

/** 54 100 000 → "54,1 mln" */
export function mln(n: number) {
  if (n < 1_000_000) return new Intl.NumberFormat("ru-RU").format(Math.round(n)).replace(/\u00a0/g, " ");
  return (Math.round(n / 100_000) / 10).toFixed(1).replace(".", ",").replace(",0", "") + " mln";
}

export function telHref(phone: string) {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

export function telegramHref(v: string) {
  if (!v) return "";
  if (v.startsWith("http")) return v;
  return "https://t.me/" + v.replace(/^@/, "");
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://promet.uz").replace(/\/$/, "");
}

export function formatDate(d: string) {
  const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  const dt = new Date(d);
  if (isNaN(+dt)) return d;
  return `${dt.getDate()}-${months[dt.getMonth()]}, ${dt.getFullYear()}`;
}

/** YouTube/Instagram havolasini iframe manziliga aylantiradi */
export function videoEmbed(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const ig = url.match(/instagram\.com\/(?:p|reel|reels)\/([\w-]+)/);
  if (ig) return `https://www.instagram.com/p/${ig[1]}/embed`;
  return null;
}

/** "Namangan Xamzada" uslubidagi joy nomi */
export function placeName(region: string, district: string) {
  return district ? `${region} ${district}da` : `${region}da`;
}
