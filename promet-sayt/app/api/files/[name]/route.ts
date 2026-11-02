import { readLocalUpload } from "@/lib/store";

const TYPES: Record<string, string> = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", avif: "image/avif", pdf: "application/pdf" };

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const buf = await readLocalUpload(name);
  if (!buf) return new Response("Topilmadi", { status: 404 });
  const ext = name.split(".").pop() || "";
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
