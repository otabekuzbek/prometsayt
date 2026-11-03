import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/store";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf", "video/mp4", "video/webm", "model/gltf-binary", "application/octet-stream"];

/** Lokal rejim uchun (Vercel'da katta fayllar /api/upload/client orqali to'g'ridan-to'g'ri Blob'ga ketadi) */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  const isGlb = file.name.toLowerCase().endsWith(".glb");
  if (!ALLOWED.includes(file.type) && !isGlb) return NextResponse.json({ error: "Bu turdagi fayl qabul qilinmaydi" }, { status: 400 });
  const max = process.env.BLOB_READ_WRITE_TOKEN ? 4 : 200;
  if (file.size > max * 1024 * 1024) return NextResponse.json({ error: `Fayl ${max} MB dan katta` }, { status: 400 });
  const url = await uploadFile(file);
  return NextResponse.json({ url });
}
