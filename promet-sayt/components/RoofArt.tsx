/**
 * Rasm yuklanmaguncha ishlatiladigan brendli illyustratsiya: do'ppi tomli hovli uy.
 * `roof` — tom rangi (vizualizatorda ham shu chizma ishlatiladi).
 */
export default function RoofArt({
  roof = "#45494E",
  variant = 0,
  label,
  sky = true,
  ribs = false,
}: {
  roof?: string;
  variant?: number;
  label?: string;
  sky?: boolean;
  ribs?: boolean;
}) {
  const v = Math.abs(variant) % 3;
  const wall = ["#efe7da", "#f4efe6", "#e8dfd1"][v];
  const id = `g${v}${ribs ? "r" : "t"}${roof.replace("#", "")}`;
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label || "Do'ppi tomli uy"}>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={v === 1 ? "#9cc3e6" : "#b9d6ef"} />
          <stop offset="1" stopColor="#eef4f9" />
        </linearGradient>
        <linearGradient id={`rf${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
        {ribs ? (
          <pattern id={`tile${id}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M9 0 V18" stroke="#000" strokeOpacity=".22" strokeWidth="2" />
            <path d="M11 0 V18" stroke="#fff" strokeOpacity=".12" strokeWidth="1.5" />
          </pattern>
        ) : (
          <pattern id={`tile${id}`} width="24" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 15.5 H24" stroke="#000" strokeOpacity=".22" strokeWidth="1.5" />
            <path d="M12 0 V16" stroke="#000" strokeOpacity=".08" strokeWidth="1" />
          </pattern>
        )}
      </defs>
      {sky && <rect width="800" height="600" fill={`url(#sky${id})`} />}
      {sky && <rect y="470" width="800" height="130" fill="#b9c9a7" />}
      {sky && <rect y="470" width="800" height="10" fill="#a7b993" />}
      {/* devor */}
      <rect x="150" y="300" width="500" height="175" fill={wall} />
      <rect x="150" y="300" width="500" height="14" fill="#000" opacity=".08" />
      {/* ustunlar va eshik */}
      {[190, 290, 470, 570].map((x) => (
        <g key={x}>
          <rect x={x} y="345" width="44" height="80" rx="3" fill="#2e3a48" />
          <rect x={x + 3} y="348" width="38" height="36" fill="#6f8aa5" opacity=".65" />
          <rect x={x - 6} y="425" width="56" height="8" fill="#d8cdbb" />
        </g>
      ))}
      <rect x="370" y="340" width="60" height="135" rx="4" fill="#5b3b28" />
      <path d="M370 340 a30 30 0 0 1 60 0" fill="#5b3b28" />
      <rect x="140" y="470" width="520" height="8" fill="#cdbfa9" />
      {/* tom: asosiy qiyaliklar */}
      <path d="M95 310 L250 205 L550 205 L705 310 Z" fill={roof} />
      <path d="M95 310 L250 205 L550 205 L705 310 Z" fill={`url(#tile${id})`} />
      <path d="M95 310 L250 205 L550 205 L705 310 Z" fill={`url(#rf${id})`} />
      {/* do'ppi (markaziy ko'tarma) */}
      <path d="M300 205 L400 128 L500 205 Z" fill={roof} />
      <path d="M300 205 L400 128 L500 205 Z" fill={`url(#tile${id})`} />
      <path d="M400 128 L500 205 L400 205 Z" fill="#000" opacity=".16" />
      {/* qirralar va karniz */}
      <path d="M95 310 L250 205 M705 310 L550 205 M300 205 L400 128 L500 205" stroke="#000" strokeOpacity=".28" strokeWidth="4" fill="none" />
      <rect x="88" y="308" width="624" height="9" fill={roof} />
      <rect x="88" y="314" width="624" height="4" fill="#000" opacity=".25" />
      <path d="M555 210 L705 310 L550 310 Z" fill="#000" opacity=".1" />
      {/* daraxtlar */}
      {sky && (
        <g opacity=".9">
          <ellipse cx="60" cy="430" rx="48" ry="70" fill="#5b8a4a" />
          <rect x="56" y="450" width="8" height="40" fill="#5b4632" />
          <ellipse cx="748" cy="440" rx="40" ry="58" fill="#6a9a55" />
          <rect x="744" y="455" width="8" height="35" fill="#5b4632" />
        </g>
      )}
    </svg>
  );
}
