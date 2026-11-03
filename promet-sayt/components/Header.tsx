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

export default function Header({ phone, telHref, telegram }: { phone: string; telHref: string; telegram: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (open) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [path]);

  return (
    <>
      <header className={`header${solid && !open ? " is-solid" : ""}${open ? " menu-open" : ""}`}>
        <div className="wrap">
          <Link href="/" className="logo" aria-label="Promet Tom Markazi — bosh sahifa">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="on-dark-logo" src="/logo-white.png" alt="" width={196} height={42} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="on-light" src="/logo.png" alt="Promet Tom Markazi" width={196} height={42} />
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
            <button className="burger" aria-label={open ? "Menyuni yopish" : "Menyuni ochish"} aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(!open)}>
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <div id="site-menu" className="menu-overlay" data-open={open} aria-hidden={!open}>
        <nav aria-label="Menyu">
          <Link href="/" tabIndex={open ? 0 : -1} style={{ transitionDelay: open ? "0.1s" : "0s" }}>Bosh sahifa</Link>
          {NAV.map((n, i) => (
            <Link key={n.href} href={n.href} tabIndex={open ? 0 : -1} style={{ transitionDelay: open ? `${0.14 + i * 0.04}s` : "0s" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="menu-foot">
          <a href={telHref} tabIndex={open ? 0 : -1}>{phone}</a>
          {telegram && <a href={telegram} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>Telegram</a>}
          <span>O&apos;lchov va smeta bepul</span>
        </div>
      </div>
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
