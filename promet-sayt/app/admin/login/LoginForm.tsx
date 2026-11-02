"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="adm-stack">
      <div className="adm-field">
        <label htmlFor="pw">Parol</label>
        <input id="pw" name="password" type="password" className="adm-input" autoComplete="current-password" required autoFocus />
      </div>
      {state?.error && <div className="adm-error">{state.error}</div>}
      <button className="adm-btn adm-primary" disabled={pending}>{pending ? "Tekshirilmoqda…" : "Kirish"}</button>
    </form>
  );
}
