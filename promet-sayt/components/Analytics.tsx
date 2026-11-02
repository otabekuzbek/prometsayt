import Script from "next/script";
import type { Settings } from "@/lib/types";

/** Analitika skriptlari sahifa to'liq yuklangandan keyin ulanadi — tezlikka ta'sir qilmaydi */
export default function Analytics({ s }: { s: Settings }) {
  const ga = s.gaId.trim();
  const ym = s.yandexMetrikaId.trim().replace(/\D/g, "");
  const fb = s.metaPixelId.trim().replace(/\D/g, "");
  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} strategy="lazyOnload" />
          <Script id="ga" strategy="lazyOnload">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ga)});`}</Script>
        </>
      )}
      {ym && (
        <Script id="ym" strategy="lazyOnload">{`window.__ymId=${ym};(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${ym},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}</Script>
      )}
      {fb && (
        <Script id="fb" strategy="lazyOnload">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fb}');fbq('track','PageView');`}</Script>
      )}
    </>
  );
}
