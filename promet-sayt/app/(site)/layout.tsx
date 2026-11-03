import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import Motion from "@/components/Motion";
import { content } from "@/lib/data";
import { siteUrl, telHref, telegramHref } from "@/lib/utils";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings: s } = await content();
  const org = {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    name: s.companyName,
    url: siteUrl(),
    logo: `${siteUrl()}/logo.png`,
    telephone: s.phone,
    ...(s.address ? { address: { "@type": "PostalAddress", streetAddress: s.address, addressCountry: "UZ" } } : {}),
    areaServed: "UZ",
    sameAs: [s.instagram, telegramHref(s.telegram), s.facebook, s.youtube].filter(Boolean),
  };
  return (
    <>
      <Header phone={s.phone} telHref={telHref(s.phone)} telegram={telegramHref(s.telegram)} />
      <main>{children}</main>
      <Footer s={s} />
      <Analytics s={s} />
      <Motion />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
    </>
  );
}
