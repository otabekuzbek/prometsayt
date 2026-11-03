type P = { size?: number };
const s = (size = 20) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const Phone = ({ size }: P) => (<svg {...s(size)}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>);
export const Send = ({ size }: P) => (<svg {...s(size)}><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>);
export const Ruler = ({ size }: P) => (<svg {...s(size)}><path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"/><path d="m7.5 10.5 2-2M10.5 13.5l2-2M13.5 16.5l2-2"/></svg>);
export const Pin = ({ size }: P) => (<svg {...s(size)}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>);
export const Clock = ({ size }: P) => (<svg {...s(size)}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>);
export const Mail = ({ size }: P) => (<svg {...s(size)}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>);
export const Shield = ({ size }: P) => (<svg {...s(size)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>);
export const Arrow = ({ size, left }: P & { left?: boolean }) => (<svg {...s(size)} style={left ? { transform: "scaleX(-1)" } : undefined}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
export const Drag = ({ size }: P) => (<svg {...s(size)}><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M4 12h16"/></svg>);
export const Menu = ({ size }: P) => (<svg {...s(size)}><path d="M3 6h18M3 12h18M3 18h18"/></svg>);
export const Close = ({ size }: P) => (<svg {...s(size)}><path d="M18 6 6 18M6 6l12 12"/></svg>);
export const Instagram = ({ size }: P) => (<svg {...s(size)}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>);
export const Youtube = ({ size }: P) => (<svg {...s(size)}><path d="M22.5 6.4a2.8 2.8 0 0 0-2-2C18.9 4 12 4 12 4s-6.9 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.6 2.8 2.8 0 0 0 2 2c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.6z"/><path d="m10 15 5-3-5-3z"/></svg>);
export const Play = ({ size }: P) => (<svg {...s(size)}><path d="m6 4 14 8-14 8z" fill="currentColor"/></svg>);
