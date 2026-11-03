"use client";
import { useState, useTransition } from "react";
import { changePassword } from "@/app/admin/actions";

export default function PasswordForm() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="adm-form"
      style={{ padding: 0, border: 0, background: "none" }}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const cur = String(f.get("current") || "");
        const next = String(f.get("next") || "");
        if (next !== String(f.get("repeat") || "")) return setMsg({ ok: false, text: "Yangi parollar bir xil emas" });
        const form = e.currentTarget;
        start(async () => {
          const r = await changePassword(cur, next);
          setMsg({ ok: r.ok, text: r.ok ? r.message || "O'zgartirildi" : r.error || "Xato" });
          if (r.ok) form.reset();
        });
      }}
    >
      <div className="adm-field"><label htmlFor="pw-cur">Joriy parol</label><input id="pw-cur" name="current" type="password" className="adm-input" autoComplete="current-password" required /></div>
      <div className="adm-field"><label htmlFor="pw-new">Yangi parol</label><input id="pw-new" name="next" type="password" className="adm-input" autoComplete="new-password" minLength={8} required /><span className="adm-help">Kamida 8 belgi, harf va raqam</span></div>
      <div className="adm-field"><label htmlFor="pw-rep">Yangi parolni takrorlang</label><input id="pw-rep" name="repeat" type="password" className="adm-input" autoComplete="new-password" required /></div>
      {msg && <div className={msg.ok ? "adm-ok" : "adm-error"}>{msg.text}</div>}
      <button className="adm-btn adm-primary" disabled={pending} style={{ justifySelf: "start" }}>{pending ? "Saqlanmoqda…" : "Parolni o'zgartirish"}</button>
    </form>
  );
}
