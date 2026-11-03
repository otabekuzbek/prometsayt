import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/auth";

/** Brauzerdan Vercel Blob'ga to'g'ridan-to'g'ri yuklash uchun ruxsat (3D model, video, katta rasmlar) */
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!(await isAdmin())) throw new Error("Ruxsat yo'q");
        return {
          allowedContentTypes: [
            "image/jpeg", "image/png", "image/webp", "image/avif",
            "application/pdf",
            "video/mp4", "video/webm",
            "model/gltf-binary", "application/octet-stream",
          ],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Yuklashda xato" }, { status: 400 });
  }
}
