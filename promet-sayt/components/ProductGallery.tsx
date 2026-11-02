"use client";
import { useState } from "react";
import Image from "next/image";
import RoofArt from "./RoofArt";

export default function ProductGallery({ images, name, ribs }: { images: string[]; name: string; ribs?: boolean }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="gallery-main">
        {images[i] ? (
          <Image src={images[i]} alt={name} fill priority sizes="(max-width: 860px) 100vw, 55vw" style={{ objectFit: "cover" }} />
        ) : (
          <RoofArt label={name} ribs={ribs} />
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, k) => (
            <button key={src} aria-current={k === i} onClick={() => setI(k)} aria-label={`${k + 1}-rasm`} style={{ position: "relative" }}>
              <Image src={src} alt="" fill sizes="84px" style={{ objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
