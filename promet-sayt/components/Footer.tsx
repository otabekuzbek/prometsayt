import Link from "next/link";
import type { Settings } from "@/lib/types";
import { telHref, telegramHref } from "@/lib/utils";
import { Facebook, Instagram, Send, Youtube } from "./Icons";

export default function Footer({ s }: { s: Settings }) {
  const tg = telegramHref(s.telegram);
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-white.png" alt="Promet Tom Markazi" width={186} height={40} />
            </div>
            <p style={{ maxWidth: "34ch" }}>
              Tom yopish bo&apos;yicha {s.yearsExperience} yillik tajriba. Material, montaj va {s.warrantyYears} yillik kafolat — bir jamoadan.
            </p>
            <div className="socials">
              {s.instagram && <a href={s.instagram} target="_blank" rel="noopener" aria-label="Instagram"><Instagram /></a>}
              {tg && <a href={tg} target="_blank" rel="noopener" aria-label="Telegram"><Send /></a>}
              {s.facebook && <a href={s.facebook} target="_blank" rel="noopener" aria-label="Facebook"><Facebook /></a>}
              {s.youtube && <a href={s.youtube} target="_blank" rel="noopener" aria-label="YouTube"><Youtube /></a>}
            </div>
          </div>
          <div>
            <h4>Sayt</h4>
            <ul>
              <li><Link href="/obyektlar">Obyektlar</Link></li>
              <li><Link href="/kalkulyator">Smeta kalkulyatori</Link></li>
              <li><Link href="/kafolat">Kafolat va sertifikatlar</Link></li>
              <li><Link href="/maqolalar">Maqolalar</Link></li>
              <li><Link href="/biz-haqimizda">Biz haqimizda</Link></li>
            </ul>
          </div>
          <div>
            <h4>Mahsulotlar</h4>
            <ul>
              <li><Link href="/mahsulotlar/metallocherepitsa">Metallocherepitsa</Link></li>
              <li><Link href="/mahsulotlar/profnastil">Profnastil</Link></li>
              <li><Link href="/mahsulotlar/tunkafon">Tunkafon</Link></li>
              <li><Link href="/mahsulotlar/butlovchi-qismlar">Butlovchi qismlar</Link></li>
            </ul>
          </div>
          <div>
            <h4>Aloqa</h4>
            <ul>
              <li><a href={telHref(s.phone)} style={{ color: "#fff", fontFamily: "var(--f-serif)", fontSize: 26 }}>{s.phone}</a></li>
              {s.phone2 && <li><a href={telHref(s.phone2)}>{s.phone2}</a></li>}
              {s.email && <li><a href={`mailto:${s.email}`}>{s.email}</a></li>}
              {s.address && <li>{s.address}</li>}
              <li>{s.workingHours}</li>
            </ul>
          </div>
        </div>
        <div className="footer-mark" aria-hidden="true">Promet</div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {s.companyName}</span>
          <Link href="/maxfiylik">Maxfiylik siyosati</Link>
        </div>
      </div>
    </footer>
  );
}
