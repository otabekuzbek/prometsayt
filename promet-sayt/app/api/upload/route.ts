import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/store";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"];

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Faqat JPG, PNG, WEBP yoki PDF" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Fayl 4 MB dan katta" }, { status: 400 });
  const url = await uploadFile(file);
  return NextResponse.json({ url });
}
