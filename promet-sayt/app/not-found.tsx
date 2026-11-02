import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
        <span className="slashes"><i /><i /><i /></span>
        <h1 className="h-lg">Sahifa topilmadi</h1>
        <p className="muted">Bu sahifa ko&apos;chirilgan yoki o&apos;chirilgan bo&apos;lishi mumkin.</p>
        <Link href="/" className="btn btn-green">Bosh sahifaga qaytish</Link>
      </div>
    </main>
  );
}
