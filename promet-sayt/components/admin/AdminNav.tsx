"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS: { label?: string; items: { href: string; label: string }[] }[] = [
  { items: [{ href: "/admin", label: "Bosh panel" }, { href: "/admin/lidlar", label: "Murojaatlar" }] },
  {
    label: "Sayt mazmuni",
    items: [
      { href: "/admin/bosh-sahifa", label: "Bosh sahifa" },
      { href: "/admin/obyektlar", label: "Obyektlar" },
      { href: "/admin/mahsulotlar", label: "Mahsulotlar" },
      { href: "/admin/sertifikatlar", label: "Sertifikatlar" },
      { href: "/admin/sharhlar", label: "Mijozlar fikri" },
      { href: "/admin/savollar", label: "Savol-javoblar" },
      { href: "/admin/maqolalar", label: "Maqolalar" },
    ],
  },
  { label: "Kafolat", items: [{ href: "/admin/kafolatlar", label: "Kafolat reestri" }] },
  {
    label: "Sozlamalar",
    items: [
      { href: "/admin/sozlamalar", label: "Aloqa, SEO, analitika" },
      { href: "/admin/narxlar", label: "Kalkulyator narxlari" },
      { href: "/admin/integratsiyalar", label: "CRM va Telegram" },
      { href: "/admin/xavfsizlik", label: "Parol" },
    ],
  },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin menyu">
      {GROUPS.map((g, i) => (
        <div key={i} className="adm-nav-group">
          {g.label && <span className="adm-side-label">{g.label}</span>}
          {g.items.map((it) => (
            <Link key={it.href} href={it.href} aria-current={(it.href === "/admin" ? path === it.href : path.startsWith(it.href)) ? "page" : undefined}>
              {it.label}
            </Link>
          ))}
        </div>
      ))}
      <a href="/" target="_blank" rel="noopener" className="adm-site-link">Saytni ochish ↗</a>
    </nav>
  );
}
