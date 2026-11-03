import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getPrivate } from "./store";

const COOKIE = "promet_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 kun

function secret() {
  return `${process.env.AUTH_SECRET || ""}|${process.env.ADMIN_PASSWORD || ""}`;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `s1:${salt}:${scryptSync(pw, salt, 32).toString("hex")}`;
}

function verifyHash(pw: string, stored: string) {
  const [v, salt, hash] = stored.split(":");
  if (v !== "s1" || !salt || !hash) return false;
  return safeEqual(scryptSync(pw, salt, 32).toString("hex"), hash);
}

/** Admin paneldan o'rnatilgan parol yoki ADMIN_PASSWORD (zaxira kirish) */
export async function checkPassword(input: string) {
  if (!input) return false;
  try {
    const p = await getPrivate();
    if (p.passwordHash && verifyHash(input, p.passwordHash)) return true;
  } catch {
    /* maxfiy ma'lumot o'qilmasa, faqat ADMIN_PASSWORD bilan kiriladi */
  }
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return safeEqual(sign(`pw:${input}`), sign(`pw:${real}`));
}

export async function canLogin() {
  if (process.env.ADMIN_PASSWORD) return true;
  try {
    return Boolean((await getPrivate()).passwordHash);
  } catch {
    return false;
  }
}

export async function createSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const token = `${exp}.${sign(`session:${exp}`)}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return false;
    const [exp, sig] = token.split(".");
    if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
    return safeEqual(sig, sign(`session:${exp}`));
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
