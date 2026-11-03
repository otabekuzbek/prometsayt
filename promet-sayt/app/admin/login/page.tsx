import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin — kirish", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="adm-login">
      <div className="adm-card" style={{ width: "min(420px, 100%)", padding: 32 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Promet" style={{ height: 40, width: "auto", marginBottom: 24 }} />
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>Boshqaruv paneli</h1>
        <LoginForm />
      </div>
    </div>
  );
}
