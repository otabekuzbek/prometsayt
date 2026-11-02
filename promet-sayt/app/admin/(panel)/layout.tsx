import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SECTIONS } from "@/lib/admin-schema";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Admin panel", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="adm">
      <aside className="adm-side">
        <Link href="/admin" className="adm-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white.png" alt="Promet" />
        </Link>
        <nav>
          <Link href="/admin">Bosh panel</Link>
          <Link href="/admin/lidlar">Murojaatlar</Link>
          <span className="adm-side-label">Kontent</span>
          {SECTIONS.map((s) => (
            <Link key={s.key} href={`/admin/${s.key}`}>{s.title}</Link>
          ))}
          <span className="adm-side-label">Sayt</span>
          <Link href="/admin/sozlamalar">Sozlamalar va narxlar</Link>
          <a href="/" target="_blank" rel="noopener">Saytni ochish ↗</a>
        </nav>
        <form action={logout}><button className="adm-logout">Chiqish</button></form>
      </aside>
      <div className="adm-main">{children}</div>
    </div>
  );
}
