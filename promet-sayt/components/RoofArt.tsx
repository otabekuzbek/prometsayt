/**
 * Rasm yuklanmaguncha ko'rinadigan "arxitektura chizmasi": uyning old fasadi chiziqlarda.
 * variant — tom shakli (do'ppi, to'rt qiyalik, ikki qiyalik).
 */
export default function RoofArt({ variant = 0, label, roof }: { variant?: number; label?: string; roof?: string; sky?: boolean; ribs?: boolean }) {
  const v = Math.abs(variant) % 3;
  const accent = roof || "#7bd07f";
  const roofPath =
    v === 0
      ? "M120 330 L250 250 L550 250 L680 330 M300 250 L340 205 L460 205 L500 250 M340 205 L400 150 L460 205"
      : v === 1
        ? "M110 330 L290 215 L510 215 L690 330"
        : "M110 330 L400 170 L690 330";
  const fill =
    v === 0
      ? "M120 330 L250 250 L300 250 L340 205 L400 150 L460 205 L500 250 L550 250 L680 330 Z"
      : v === 1
        ? "M110 330 L290 215 L510 215 L690 330 Z"
        : "M110 330 L400 170 L690 330 Z";
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label || "Uy chizmasi"} style={{ background: "#0a1a33" }}>
      <defs>
        <pattern id={`bp${v}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#8c98a8" strokeOpacity=".16" strokeWidth="1" />
        </pattern>
        <linearGradient id={`fd${v}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity=".35" />
          <stop offset="1" stopColor={accent} stopOpacity=".05" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#bp${v})`} />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={fill} fill={`url(#fd${v})`} stroke="none" />
        <path d={roofPath} stroke={accent} strokeWidth="3" />
        <path d="M150 330 H650 V470 H150 Z" stroke="#c9d2de" strokeWidth="2" />
        <path d="M140 330 H660" stroke="#c9d2de" strokeWidth="2" />
        {[190, 260, 480, 550].map((x) => (
          <path key={x} d={`M${x} 360 h44 v66 h-44 Z M${x + 22} 360 v66`} stroke="#8c98a8" strokeWidth="1.5" />
        ))}
        <path d="M372 470 V385 a28 28 0 0 1 56 0 V470" stroke="#c9d2de" strokeWidth="2" />
        <path d="M90 470 H710" stroke="#8c98a8" strokeWidth="1.5" />
        <path d="M150 505 H650 M150 497 v16 M650 497 v16" stroke="#8c98a8" strokeOpacity=".7" strokeWidth="1" />
      </g>
    </svg>
  );
}
