import Image from "next/image";
import { RENDERS } from "@/lib/renders";

/** Rasm bo'lsa — optimallashtirilgan rasm, bo'lmasa — brendli illyustratsiya. */
export default function Media({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  variant = 0,
  roof,
}: {
  src?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  variant?: number;
  roof?: string;
}) {
  if (!src) {
    // Rasm yuklanmagan — realistik 3D vizualizatsiya
    void roof;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={RENDERS.houses[Math.abs(variant) % RENDERS.houses.length]} alt={alt} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  if (src.toLowerCase().endsWith(".pdf")) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100%", fontWeight: 800, color: "var(--navy)" }}>PDF</div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      style={{ objectFit: "cover" }}
    />
  );
}
