import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { storageMode } from "@/lib/store";
import AdminNav from "@/components/admin/AdminNav";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Admin panel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="adm" data-storage={storageMode()}>
      <aside className="adm-side">
        <a href="/admin" className="adm-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white.png" alt="Promet" />
        </a>
        <AdminNav />
        <form action={logout}><button className="adm-logout">Chiqish</button></form>
      </aside>
      <div className="adm-main">{children}</div>
    </div>
  );
}
