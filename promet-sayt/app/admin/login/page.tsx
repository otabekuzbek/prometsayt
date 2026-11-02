import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin — kirish", robots: { index: false } };

export default async function Page() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="adm-login">
      <div className="adm-card" style={{ width: "min(400px, 100%)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Promet" style={{ height: 40, width: "auto", marginBottom: 20 }} />
        <h1 style={{ fontSize: 22, marginBottom: 16 }}>Boshqaruv paneli</h1>
        <LoginForm />
      </div>
    </div>
  );
}
