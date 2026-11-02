import Image from "next/image";
import RoofArt from "./RoofArt";

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
  if (!src) return <RoofArt variant={variant} roof={roof} label={alt} />;
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
