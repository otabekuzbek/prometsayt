"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Close, Menu, Phone, Send, Ruler } from "./Icons";

const NAV = [
  { href: "/obyektlar", label: "Obyektlar" },
  { href: "/mahsulotlar", label: "Mahsulotlar" },
  { href: "/kalkulyator", label: "Kalkulyator" },
  { href: "/kafolat", label: "Kafolat" },
  { href: "/maqolalar", label: "Maqolalar" },
  { href: "/biz-haqimizda", label: "Biz haqimizda" },
  { href: "/aloqa", label: "Aloqa" },
];

export default function Header({
  phone,
  telHref,
  workingHours,
  address,
  telegram,
}: {
  phone: string;
  telHref: string;
  workingHours: string;
  address: string;
  telegram: string;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>{workingHours} · {address}</span>
          <div className="topbar-right">
            {telegram && <a href={telegram} target="_blank" rel="noopener">Telegram</a>}
            <a href="/kafolat#tekshirish">Kafolatni tekshirish</a>
          </div>
        </div>
      </div>
      <header className="header">
        <div className="wrap">
          <Link href="/" className="logo" aria-label="Promet Tom Markazi — bosh sahifa">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Promet Tom Markazi" width={204} height={44} />
          </Link>
          <nav className="nav" aria-label="Asosiy menyu">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-cta">
            <a className="header-phone" href={telHref}>{phone}</a>
            <Link className="btn btn-green btn-sm" href="/aloqa#forma">Bepul o&apos;lchov</Link>
            <button className="burger" aria-label={open ? "Menyuni yopish" : "Menyuni ochish"} aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <nav className="mobile-nav" data-open={open} aria-label="Mobil menyu">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href}>{n.label}</Link>
        ))}
        <a href={telHref} style={{ color: "var(--green-action)" }}>{phone}</a>
      </nav>
      <div className="mobile-bar">
        <a href={telHref}><Phone /> Qo&apos;ng&apos;iroq</a>
        <Link href="/aloqa#forma" className="main"><Ruler /> Bepul o&apos;lchov</Link>
        <a href={telegram || "/aloqa"} target={telegram ? "_blank" : undefined} rel="noopener"><Send /> Telegram</a>
      </div>
      {telegram && (
        <a className="float-tg" href={telegram} target="_blank" rel="noopener" aria-label="Telegramda yozish">
          <Send size={24} />
        </a>
      )}
    </>
  );
}
