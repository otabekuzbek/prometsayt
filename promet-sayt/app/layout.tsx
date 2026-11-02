import type { Metadata, Viewport } from "next";
import "@fontsource-variable/montserrat/index.css";
import "@fontsource/marck-script/latin.css";
import "@fontsource/marck-script/cyrillic.css";
import "./globals.css";
import { siteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Promet Tom Markazi — tom yopish 15 yil kafolat bilan", template: "%s | Promet Tom Markazi" },
  description:
    "Profnastil, metallocherepitsa, tunikafon va butlovchi qismlar. Bepul o'lchov, aniq smeta, montaj va 15 yillik kafolat — O'zbekiston bo'ylab.",
  openGraph: { type: "website", locale: "uz_UZ", siteName: "Promet Tom Markazi", images: ["/logo.png"] },
};

export const viewport: Viewport = { themeColor: "#11305a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
