/** Saytdagi tayyor 3D vizualizatsiyalar (public/renders). Admin rasm yuklasa — o'sha ishlatiladi. */
export const RENDERS = {
  heroDesktop: "/renders/hero-desktop.webp",
  heroMobile: "/renders/hero-mobile.webp",
  before: "/renders/before.webp",
  after: "/renders/after.webp",
  cta: "/renders/cta-dusk.webp",
  houses: ["/renders/house-ikki.webp", "/renders/house-tort.webp", "/renders/after.webp"],
  profnastil: "/renders/close-profnastil.webp",
};

const CLOSE = ["45494e", "45322e", "5e2129", "114232", "1e4b8a", "a1a1a0"];

function rgb(hex: string) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0);
}

/** Tanlangan rangga eng yaqin tayyor yaqin-plan render */
export function closeRender(hex: string) {
  const [r, g, b] = rgb(hex);
  let best = CLOSE[0], d = Infinity;
  for (const c of CLOSE) {
    const [r2, g2, b2] = rgb(c);
    const dd = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (dd < d) { d = dd; best = c; }
  }
  return `/renders/close-${best}.webp`;
}
