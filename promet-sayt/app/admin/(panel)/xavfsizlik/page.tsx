import PasswordForm from "@/components/admin/PasswordForm";

export default function Page() {
  return (
    <div className="adm-stack">
      <div className="adm-toolbar"><div><h1>Xavfsizlik</h1><span className="adm-help">Admin panel paroli</span></div></div>
      <section className="adm-card" style={{ maxWidth: 520 }}>
        <PasswordForm />
        <p className="adm-help" style={{ marginTop: 16 }}>
          Parolni unutsangiz, Vercel&apos;dagi ADMIN_PASSWORD bilan kirishingiz mumkin — u zaxira kalit sifatida doim ishlaydi.
        </p>
      </section>
    </div>
  );
}
