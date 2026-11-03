/** Material ko'ndalang kesimi — texnik chizma uslubida. */
export type ProfileKind = "metallocherepitsa" | "profnastil" | "tunkafon" | "butlovchi-qismlar";

function path(kind: ProfileKind) {
  const y = 230;
  if (kind === "metallocherepitsa") {
    // Yumaloq to'lqinlar
    let d = `M80 ${y}`;
    for (let i = 0; i < 6; i++) {
      const x = 80 + i * 140;
      d += ` C ${x + 25} ${y} ${x + 35} ${y - 70} ${x + 70} ${y - 70} S ${x + 115} ${y} ${x + 140} ${y}`;
    }
    return d;
  }
  if (kind === "profnastil") {
    // Trapetsiya qovurg'alar
    let d = `M80 ${y}`;
    for (let i = 0; i < 5; i++) {
      const x = 80 + i * 168;
      d += ` L ${x + 40} ${y} L ${x + 64} ${y - 80} L ${x + 120} ${y - 80} L ${x + 144} ${y} L ${x + 168} ${y}`;
    }
    return d;
  }
  if (kind === "tunkafon") {
    let d = `M80 ${y}`;
    for (let i = 0; i < 10; i++) {
      const x = 80 + i * 84;
      d += ` L ${x + 30} ${y} L ${x + 38} ${y - 26} L ${x + 62} ${y - 26} L ${x + 70} ${y} L ${x + 84} ${y}`;
    }
    return d;
  }
  // Konyok (tom qirrasi plankasi)
  return `M200 ${y + 20} L 250 ${y} L 500 ${y - 120} L 750 ${y} L 800 ${y + 20}`;
}

export default function Profile({ kind, label }: { kind: ProfileKind; label: string }) {
  const d = path(kind);
  return (
    <svg className="profile" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${label} profili`} key={kind}>
      <path d={`${d} L 920 300 L 80 300 Z`} fill="#7bd07f" opacity=".08" />
      <path className="draw" d={d} fill="none" stroke="#7bd07f" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
      <g className="dim" stroke="#8c98a8" strokeWidth="1.5" fill="#9eadc2" fontFamily="var(--f-body)" fontSize="22">
        <path d="M80 300 V330 M920 300 V330 M80 318 H920" fill="none" />
        <text x="500" y="356" textAnchor="middle" stroke="none">{label}</text>
      </g>
    </svg>
  );
}
