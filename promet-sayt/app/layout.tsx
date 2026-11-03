import type { Metadata, Viewport } from "next";
import "@fontsource-variable/cormorant-garamond/index.css";
import "@fontsource-variable/geist/index.css";
import "@fontsource/marck-script/latin.css";
import "@fontsource/marck-script/cyrillic.css";
import "./globals.css";
import { getContent } from "@/lib/store";
import { siteUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getContent();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.metaTitle || s.companyName, template: `%s | ${s.companyName}` },
    description: s.metaDescription,
    openGraph: { type: "website", locale: "uz_UZ", siteName: s.companyName, images: [s.ogImage || "/logo.png"] },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* JS yoqilgan bo'lsa animatsiyalar ishlaydi, aks holda kontent darhol ko'rinadi */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
