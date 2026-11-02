import { NextResponse } from "next/server";
import { getPrivate } from "@/lib/store";

/** Kafolat raqamini tekshirish. Mijoz ismi qisman yashiriladi. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("raqam")?.trim().toUpperCase() || "";
  if (q.length < 4) return NextResponse.json({ found: false });
  const { warranties } = await getPrivate();
  const w = warranties.find((x) => x.number.trim().toUpperCase() === q);
  if (!w) return NextResponse.json({ found: false });
  const start = new Date(w.installedAt);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + (w.years || 0));
  const mask = (n: string) => n.split(" ").map((p) => (p ? p[0] + "*".repeat(Math.max(p.length - 1, 2)) : p)).join(" ");
  return NextResponse.json({
    found: true,
    number: w.number,
    client: mask(w.clientName),
    region: w.region,
    product: w.product,
    area: w.area,
    installedAt: w.installedAt,
    validUntil: end.toISOString().slice(0, 10),
    active: end > new Date(),
  });
}
