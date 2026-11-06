/**
 * Promet — realistik 3D uy sahnasi (three.js).
 * Brauzer komponenti (RoofScene) va statik render skripti (scripts/render) bir xil koddan foydalanadi.
 *
 * Realizm manbalari: fizik osmon (Sky) va undan olingan atrof-muhit yorug'ligi, ACES tonlash,
 * protsedural PBR teksturalar (metall cherepitsa, travertin fasad, granit, maysa, bruschatka),
 * AO soyalar, o'simliklar, uzoqdagi daraxtlar va tuman.
 */
import type * as T3 from "three";

export type RoofShape = "bir" | "ikki" | "tort" | "doppi";
export type RoofMaterial = "cherepitsa" | "profnastil";
export type SceneTime = "day" | "golden" | "dusk";
export type SceneView = "hero" | "orbit" | "close" | "front";

export type HouseOptions = {
  color: string;
  shape?: RoofShape;
  material?: RoofMaterial;
  /** Eski shifer tom ("oldin" holati) */
  aged?: boolean;
  time?: SceneTime;
  view?: SceneView;
  intro?: boolean;
  /** Foydalanuvchi aylantira oladimi */
  interactive?: boolean;
  /** Uyni kadrda o'ngga surish (0..0.3) — chap tomonda matn uchun joy */
  shift?: number;
  /** Bitta kadr uchun yuqori sifat (render skripti) */
  still?: boolean;
  modelUrl?: string;
  roofNames?: string;
  onRecolorable?: (ok: boolean) => void;
};

export type HouseApi = {
  setColor: (hex: string) => void;
  setShape: (s: RoofShape) => void;
  setMaterial: (m: RoofMaterial) => void;
  render: () => void;
  canvas: HTMLCanvasElement;
  dispose: () => void;
};

/* ------------------------------------------------------------------ */
/* Protsedural teksturalar                                             */
/* ------------------------------------------------------------------ */

function hash(ix: number, iy: number, seed: number) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 982451653)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Davriy (choksiz takrorlanadigan) qiymat shovqini */
function vnoise(x: number, y: number, px: number, py: number, seed: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const x0 = mod(xi, px), x1 = mod(xi + 1, px), y0 = mod(yi, py), y1 = mod(yi + 1, py);
  const a = hash(x0, y0, seed), b = hash(x1, y0, seed), c = hash(x0, y1, seed), d = hash(x1, y1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** u,v ∈ [0,1) — davriy fbm, natija ~[0,1] */
function fbm(u: number, v: number, freq: number, oct: number, seed: number, fy = freq) {
  let s = 0, amp = 0.5, tot = 0, f = freq, g = fy;
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise(u * f, v * g, f, g, seed + i * 31);
    tot += amp;
    amp *= 0.5;
    f *= 2;
    g *= 2;
  }
  return s / tot;
}
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

type TexSet = { map: HTMLCanvasElement; normal: HTMLCanvasElement; rough?: HTMLCanvasElement };

function canvasOf(n: number) {
  const c = document.createElement("canvas");
  c.width = c.height = n;
  return c;
}

/**
 * Yagona generator: har piksel uchun rang, balandlik va g'adir-budurlik qaytaradi.
 * Balandlikdan normal xarita hisoblanadi.
 */
function bake(
  n: number,
  strength: number,
  fn: (u: number, v: number) => { r: number; g: number; b: number; h: number; ro?: number },
): TexSet {
  const map = canvasOf(n), normal = canvasOf(n), rough = canvasOf(n);
  const H = new Float32Array(n * n);
  const mctx = map.getContext("2d")!, nctx = normal.getContext("2d")!, rctx = rough.getContext("2d")!;
  const md = mctx.createImageData(n, n), nd = nctx.createImageData(n, n), rd = rctx.createImageData(n, n);
  let hasRough = false;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      // v pastdan yuqoriga o'sadi (tekstura flipY bilan mos)
      const s = fn(x / n, 1 - y / n);
      const i = y * n + x;
      H[i] = s.h;
      md.data[i * 4] = Math.round(clamp01(s.r) * 255);
      md.data[i * 4 + 1] = Math.round(clamp01(s.g) * 255);
      md.data[i * 4 + 2] = Math.round(clamp01(s.b) * 255);
      md.data[i * 4 + 3] = 255;
      const ro = s.ro ?? 0.5;
      if (s.ro !== undefined) hasRough = true;
      rd.data[i * 4] = rd.data[i * 4 + 1] = rd.data[i * 4 + 2] = Math.round(clamp01(ro) * 255);
      rd.data[i * 4 + 3] = 255;
    }
  }
  const k = strength * (n / 512);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const l = H[y * n + mod(x - 1, n)], r = H[y * n + mod(x + 1, n)];
      const t = H[mod(y - 1, n) * n + x], b = H[mod(y + 1, n) * n + x];
      const dx = (r - l) * k, dy = (b - t) * k;
      let nx = -dx, ny = dy, nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len; ny /= len; nz /= len;
      const i = (y * n + x) * 4;
      nd.data[i] = Math.round((nx * 0.5 + 0.5) * 255);
      nd.data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      nd.data[i + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      nd.data[i + 3] = 255;
    }
  }
  mctx.putImageData(md, 0, 0);
  nctx.putImageData(nd, 0, 0);
  rctx.putImageData(rd, 0, 0);
  return { map, normal, rough: hasRough ? rough : undefined };
}

/** Metall cherepitsa (Monterrey): 6 to'lqin × 3 pog'ona, 1 tekstura ≈ 1.05 m */
function texMetalTile(n: number) {
  return bake(n, 26, (u, v) => {
    const wu = (u * 6) % 1;
    const wave = Math.pow(0.5 - 0.5 * Math.cos(wu * Math.PI * 2), 0.75);
    const f = (v * 3) % 1; // 0 — pog'ona tagida, 1 — keyingi pog'ona labi
    const riser = smooth(0.86, 0.97, f);
    const saw = (1 - f) * 0.55 + riser * 0.75;
    // Pog'ona labi to'lqin bo'ylab egiladi (shtamplangan ko'rinish)
    const lip = smooth(0.0, 0.06, f) * (1 - smooth(0.06, 0.2, f)) * 0.12 * wave;
    const h = wave * 0.55 + saw * 0.5 + lip;
    const ao = 1 - 0.38 * smooth(0.8, 0.97, f) - 0.16 * (1 - wave);
    const grain = 0.97 + 0.03 * fbm(u, v, 64, 2, 7);
    const c = ao * grain;
    return { r: c, g: c, b: c, h, ro: 0.32 + 0.12 * fbm(u, v, 16, 3, 3) + 0.08 * (1 - wave) };
  });
}

/** Profnastil (trapetsiya): 1 tekstura ≈ 1.0 m, 5 qovurg'a */
function texProfnastil(n: number) {
  return bake(n, 20, (u, v) => {
    const t = (u * 5) % 1;
    const prof = smooth(0.08, 0.2, t) * (1 - smooth(0.42, 0.54, t));
    const minor = 0.08 * smooth(0.66, 0.7, t) * (1 - smooth(0.78, 0.82, t));
    const h = prof + minor;
    const ao = 0.82 + 0.18 * prof;
    const c = ao * (0.97 + 0.03 * fbm(u, v, 48, 2, 9));
    return { r: c, g: c, b: c, h, ro: 0.36 + 0.1 * fbm(u, v, 12, 3, 4) };
  });
}

/** Eski asbest-shifer: kulrang, dog'lar, lishaynik, oqish izlari */
function texOldSlate(n: number) {
  return bake(n, 14, (u, v) => {
    const t = (u * 8) % 1;
    const wave = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
    const big = fbm(u, v, 3, 5, 41);
    const stain = smooth(0.5, 0.75, fbm(u, v, 2, 6, 17));
    const streak = smooth(0.5, 0.8, fbm(u, v, 24, 3, 23, 2)) * 0.7;
    const lichen = smooth(0.8, 0.86, fbm(u, v, 6, 5, 51)) * 0.8;
    const sheet = smooth(0.0, 0.015, (v * 2) % 1) * 0.08; // listlar ustma-ust
    let r = 0.62 + 0.1 * big, g = 0.6 + 0.09 * big, b = 0.55 + 0.07 * big;
    const dark = 1 - 0.45 * stain - 0.25 * streak;
    r *= dark; g *= dark; b *= dark * 0.96;
    r = r * (1 - lichen) + 0.74 * lichen;
    g = g * (1 - lichen) + 0.56 * lichen;
    b = b * (1 - lichen) + 0.22 * lichen;
    const ao = 0.78 + 0.22 * wave;
    return { r: r * ao, g: g * ao, b: b * ao, h: wave * 0.8 + sheet + big * 0.08, ro: 0.92 };
  });
}

/** Travertin fasad: 4×8 blok, 1 tekstura = 2.4 m */
function texTravertine(n: number, tone: [number, number, number] = [0.9, 0.84, 0.74]) {
  return bake(n, 7, (u, v) => {
    const rows = 8, cols = 4;
    const ry = v * rows;
    const row = Math.floor(ry);
    const off = row % 2 ? 0.5 : 0;
    const cx = u * cols + off;
    const col = Math.floor(cx);
    const fx = cx - col, fy = ry - row;
    const j = 0.012 * cols, jy = 0.012 * rows;
    const joint = Math.min(smooth(0, j, fx), smooth(0, j, 1 - fx), smooth(0, jy, fy), smooth(0, jy, 1 - fy));
    const id = hash(mod(col, cols + 1), row, 5);
    const streak = fbm(u, v, 3, 5, 61 + row, 28);
    const pores = smooth(0.78, 0.86, fbm(u, v, 40, 3, 71)) * 0.25;
    const tint = 0.94 + 0.08 * id + 0.06 * (streak - 0.5);
    const c = tint * (1 - pores * 0.5) * (0.86 + 0.14 * joint);
    return { r: tone[0] * c, g: tone[1] * c, b: tone[2] * c, h: joint * 0.6 + streak * 0.08 - pores * 0.15, ro: 0.82 };
  });
}

/** To'q granit sokol: 1 tekstura = 1.8 m, katta bloklar */
function texGranite(n: number) {
  return bake(n, 8, (u, v) => {
    const rows = 3, cols = 3;
    const ry = v * rows, row = Math.floor(ry), cx = u * cols + (row % 2 ? 0.5 : 0), col = Math.floor(cx);
    const fx = cx - col, fy = ry - row;
    const joint = Math.min(smooth(0, 0.02, fx), smooth(0, 0.02, 1 - fx), smooth(0, 0.03, fy), smooth(0, 0.03, 1 - fy));
    const speck = fbm(u, v, 96, 2, 13);
    const big = fbm(u, v, 6, 3, 19);
    const id = hash(mod(col, cols + 1), row, 9);
    const c = (0.36 + 0.06 * id + 0.12 * (speck - 0.5) + 0.06 * big) * (0.6 + 0.4 * joint);
    return { r: c * 1.02, g: c, b: c * 0.97, h: joint * 0.5 + speck * 0.05, ro: 0.6 + 0.2 * speck };
  });
}

/** Maysa: 1 tekstura = 3 m */
function texGrass(n: number) {
  return bake(n, 10, (u, v) => {
    const big = fbm(u, v, 3, 4, 81);
    const mid = fbm(u, v, 18, 3, 83);
    const blade = fbm(u, v, 160, 2, 85, 60);
    const dry = smooth(0.6, 0.8, big) * 0.5;
    const l = 0.55 + 0.35 * mid + 0.25 * (blade - 0.5);
    const r = (0.26 + 0.2 * dry) * l, g = (0.42 + 0.06 * dry) * l, b = (0.14 + 0.04 * dry) * l;
    return { r, g, b, h: blade * 0.6 + mid * 0.3, ro: 0.95 };
  });
}

/** Beton bruschatka: 1 tekstura = 1.2 m, 6×12 */
function texPavers(n: number) {
  return bake(n, 9, (u, v) => {
    const rows = 12, cols = 6;
    const ry = v * rows, row = Math.floor(ry), cx = u * cols + (row % 2 ? 0.5 : 0), col = Math.floor(cx);
    const fx = cx - col, fy = ry - row;
    const joint = Math.min(smooth(0, 0.05, fx), smooth(0, 0.05, 1 - fx), smooth(0, 0.1, fy), smooth(0, 0.1, 1 - fy));
    const id = hash(mod(col, cols + 1), row, 33);
    const g0 = fbm(u, v, 48, 3, 35);
    const c = (0.62 + 0.08 * id + 0.08 * (g0 - 0.5)) * (0.55 + 0.45 * joint);
    return { r: c * 1.03, g: c, b: c * 0.95, h: joint * 0.7 + g0 * 0.05, ro: 0.85 };
  });
}

/** Barg (butalar uchun) */
function texLeaves(n: number) {
  return bake(n, 16, (u, v) => {
    const a = fbm(u, v, 24, 3, 91);
    const b = fbm(u, v, 64, 2, 93);
    const leaf = smooth(0.35, 0.65, a);
    const l = 0.62 + 0.38 * leaf + 0.15 * (b - 0.5);
    return { r: 0.2 * l, g: 0.34 * l, b: 0.12 * l, h: leaf * 0.6 + b * 0.4, ro: 0.75 };
  });
}

/** Yong'oq daraxti eshik: vertikal tola */
function texWood(n: number) {
  return bake(n, 6, (u, v) => {
    const grain = fbm(u, v, 6, 5, 101, 0.5);
    const fine = fbm(u, v, 80, 2, 103, 4);
    const ring = 0.5 + 0.5 * Math.sin((u * 18 + grain * 6) * Math.PI);
    const c = 0.26 + 0.07 * ring + 0.05 * (fine - 0.5);
    return { r: c * 1.25, g: c * 0.86, b: c * 0.6, h: ring * 0.2 + fine * 0.1, ro: 0.45 };
  });
}

/* ------------------------------------------------------------------ */
/* Sahna                                                               */
/* ------------------------------------------------------------------ */

const PRESETS: Record<SceneTime, {
  elev: number; azim: number; turbidity: number; rayleigh: number; mie: number; mieG: number;
  sun: number; sunI: number; hemiSky: number; hemiGround: number; hemiI: number; fog: number; fogD: number;
  exposure: number; env: number; windows: number;
}> = {
  day: { elev: 38, azim: 48, turbidity: 3.2, rayleigh: 1.1, mie: 0.004, mieG: 0.8, sun: 0xfff1de, sunI: 3.2, hemiSky: 0xcfe0ff, hemiGround: 0x55603a, hemiI: 0.7, fog: 0xc9d6e2, fogD: 0.0065, exposure: 0.62, env: 0.55, windows: 0 },
  golden: { elev: 15, azim: 72, turbidity: 6, rayleigh: 2.2, mie: 0.006, mieG: 0.85, sun: 0xffc993, sunI: 4.4, hemiSky: 0xbfd0f0, hemiGround: 0x5e5236, hemiI: 0.75, fog: 0xb8c3cb, fogD: 0.0085, exposure: 0.78, env: 0.7, windows: 0.5 },
  dusk: { elev: 1.4, azim: -145, turbidity: 9, rayleigh: 3, mie: 0.01, mieG: 0.9, sun: 0xff9a5c, sunI: 1.2, hemiSky: 0x5b6fa8, hemiGround: 0x2a2420, hemiI: 0.55, fog: 0x5f5a6e, fogD: 0.012, exposure: 0.9, env: 0.7, windows: 2.6 },
};

export async function createHouse(el: HTMLElement, o: HouseOptions): Promise<HouseApi> {
  const THREE = await import("three");
  const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
  const { Sky } = await import("three/examples/jsm/objects/Sky.js");

  const still = !!o.still;
  const reduce = !still && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = !still && ((nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4);
  const TN = still ? 1024 : weak ? 256 : 512;
  const P = PRESETS[o.time || "golden"];
  const view = o.view || "orbit";

  const renderer = new THREE.WebGLRenderer({ antialias: !weak, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: still });
  renderer.setPixelRatio(still ? 1 : Math.min(window.devicePixelRatio, weak ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = P.exposure;
  renderer.shadowMap.enabled = !weak;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  /* ---- Osmon va quyosh ---- */
  const sunDir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - P.elev), THREE.MathUtils.degToRad(P.azim));
  const makeSky = () => {
    const s = new Sky();
    s.scale.setScalar(4500);
    const u = s.material.uniforms;
    u.turbidity.value = P.turbidity;
    u.rayleigh.value = P.rayleigh;
    u.mieCoefficient.value = P.mie;
    u.mieDirectionalG.value = P.mieG;
    u.sunPosition.value.copy(sunDir);
    return s;
  };
  const sky = makeSky();
  scene.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(makeSky());
  // Atrof-muhitga yer rangini qo'shamiz — pastdan qaytgan yorug'lik iliqroq bo'ladi
  const groundDome = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshBasicMaterial({ color: P.hemiGround, side: THREE.BackSide }));
  envScene.add(groundDome);
  const envTex = pmrem.fromScene(envScene, 0, 0.1, 5000).texture;
  scene.environment = envTex;
  (scene as T3.Scene & { environmentIntensity: number }).environmentIntensity = P.env;
  scene.fog = new THREE.FogExp2(P.fog, P.fogD);

  const hemi = new THREE.HemisphereLight(P.hemiSky, P.hemiGround, P.hemiI);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(P.sun, P.sunI);
  sun.position.copy(sunDir).multiplyScalar(40);
  sun.castShadow = !weak;
  const sm = still ? 4096 : 1536;
  sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 100 });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);

  /* ---- Kamera ---- */
  const camera = new THREE.PerspectiveCamera(view === "close" ? 30 : 34, 1, 0.1, 6000);
  const target = new THREE.Vector3(0, 2.9, 0);
  const VIEWS: Record<SceneView, { pos: [number, number, number]; tgt: [number, number, number] }> = {
    hero: { pos: [18.6, 2.9, 22], tgt: [0.6, 3.6, 0] },
    orbit: { pos: [18, 7.5, 20], tgt: [0, 3.2, 0] },
    close: { pos: [8.5, 7.6, 10.5], tgt: [2.2, 5.6, 2.4] },
    front: { pos: [4, 3.2, 24], tgt: [0, 3.4, 0] },
  };
  camera.position.set(...VIEWS[view].pos);
  target.set(...VIEWS[view].tgt);

  const controls = o.interactive && !still ? new OrbitControls(camera, renderer.domElement) : null;
  if (controls) {
    controls.target.copy(target);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minPolarAngle = 0.9;
    controls.maxPolarAngle = 1.5;
    controls.rotateSpeed = 0.6;
  } else camera.lookAt(target);
  let userMoved = false;
  controls?.addEventListener("start", () => (userMoved = true));

  /* ---- Teksturalar ---- */
  const tex = (c: HTMLCanvasElement, srgb: boolean, rep = 1) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(rep, rep);
    return t;
  };
  const disposables: { dispose: () => void }[] = [];
  const pbr = (set: TexSet, params: T3.MeshStandardMaterialParameters, normalScale = 1) => {
    const map = tex(set.map, true), normalMap = tex(set.normal, false);
    const roughnessMap = set.rough ? tex(set.rough, false) : undefined;
    disposables.push(map, normalMap);
    if (roughnessMap) disposables.push(roughnessMap);
    const m = new THREE.MeshStandardMaterial({ map, normalMap, roughnessMap, ...params });
    m.normalScale.set(normalScale, normalScale);
    disposables.push(m);
    return m;
  };

  /** Dunyo koordinatalari bo'yicha UV: tekstura masshtabi metrda */
  const worldUV = (g: T3.BufferGeometry, meters: number, offset = new THREE.Vector3()) => {
    const p = g.attributes.position, nrm = g.attributes.normal;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + offset.x, y = p.getY(i) + offset.y, z = p.getZ(i) + offset.z;
      const ax = Math.abs(nrm.getX(i)), ay = Math.abs(nrm.getY(i)), az = Math.abs(nrm.getZ(i));
      let a = x, b = y;
      if (ax >= ay && ax >= az) { a = z; b = y; } else if (ay >= ax && ay >= az) { a = x; b = z; }
      uv[i * 2] = a / meters;
      uv[i * 2 + 1] = b / meters;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return g;
  };
  const box = (w: number, h: number, d: number, at: [number, number, number], mat: T3.Material, meters = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (meters) worldUV(g, meters, new THREE.Vector3(...at));
    const m = new THREE.Mesh(g, mat);
    m.position.set(...at);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  const facade = pbr(texTravertine(TN), { roughness: 0.85, color: o.aged ? 0xd9d2c4 : 0xffffff }, 0.9);
  const stoneTrim = pbr(texTravertine(TN >> 1, [0.95, 0.91, 0.84]), { roughness: 0.7 }, 0.5);
  const granite = pbr(texGranite(TN), { roughness: 0.65 }, 1);
  const grass = pbr(texGrass(TN), { roughness: 1 }, 0.8);
  const pavers = pbr(texPavers(TN), { roughness: 0.9 }, 1);
  const leaves = pbr(texLeaves(TN >> 1), { roughness: 0.8 }, 0.7);
  const wood = pbr(texWood(TN >> 1), { roughness: 0.5 }, 0.5);
  const pvc = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.35, metalness: 0.3 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x8fa3b8, roughness: 0.04, metalness: 0.92, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6,
    emissive: new THREE.Color(0xffb36b), emissiveIntensity: P.windows > 1 ? P.windows * 0.08 : 0,
  });
  const glassLit = glass.clone();
  glassLit.color.set(0x5d6670);
  glassLit.emissiveIntensity = P.windows > 1 ? P.windows * 0.45 : 0;
  disposables.push(pvc, glass, glassLit);

  // Tom materiallari
  const roofSets = {
    cherepitsa: texMetalTile(TN),
    profnastil: texProfnastil(TN),
  };
  const roofTex = {
    cherepitsa: { map: tex(roofSets.cherepitsa.map, true), normal: tex(roofSets.cherepitsa.normal, false), rough: tex(roofSets.cherepitsa.rough!, false) },
    profnastil: { map: tex(roofSets.profnastil.map, true), normal: tex(roofSets.profnastil.normal, false), rough: tex(roofSets.profnastil.rough!, false) },
  };
  Object.values(roofTex).forEach((t) => disposables.push(t.map, t.normal, t.rough));
  const mat0 = o.material || "cherepitsa";
  let roofMat: T3.MeshPhysicalMaterial | T3.MeshStandardMaterial;
  if (o.aged) {
    const old = texOldSlate(TN);
    roofMat = pbr(old, { roughness: 0.95, metalness: 0, side: THREE.DoubleSide }, 1.2);
  } else {
    roofMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(o.color),
      map: roofTex[mat0].map,
      normalMap: roofTex[mat0].normal,
      roughnessMap: roofTex[mat0].rough,
      roughness: 1,
      metalness: 0.62,
      clearcoat: 0.55,
      clearcoatRoughness: 0.28,
      envMapIntensity: 1.25,
      side: THREE.DoubleSide,
    });
    roofMat.normalScale.set(1.2, 1.2);
    disposables.push(roofMat);
  }
  const trimMetal = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(o.aged ? 0x6f6a61 : o.color), roughness: o.aged ? 0.9 : 0.32, metalness: o.aged ? 0.1 : 0.65, clearcoat: o.aged ? 0 : 0.5, envMapIntensity: 1.2 });
  disposables.push(trimMetal);

  /* ---- Yer, yo'lak, o'simliklar ---- */
  const world = new THREE.Group();
  scene.add(world);
  const groundG = new THREE.CircleGeometry(420, 96);
  groundG.rotateX(-Math.PI / 2);
  worldUV(groundG, 3);
  const ground = new THREE.Mesh(groundG, grass);
  ground.receiveShadow = true;
  world.add(ground);

  const W = 12, D = 8, H = 3.6, base = 0.5;
  const eaveY = base + H + 0.05;

  // Kontakt soya (AO) — uy yerga "o'tiradi"
  const aoCanvas = canvasOf(256);
  {
    const x = aoCanvas.getContext("2d")!;
    x.fillStyle = "#000";
    x.fillRect(0, 0, 256, 256);
    x.filter = "blur(16px)";
    x.fillStyle = "#fff";
    x.fillRect(48, 54, 160, 148);
  }
  const aoTex = new THREE.CanvasTexture(aoCanvas);
  disposables.push(aoTex);
  const aoPlane = new THREE.Mesh(new THREE.PlaneGeometry(W + 6, D + 6), new THREE.MeshBasicMaterial({ alphaMap: aoTex, transparent: true, depthWrite: false, opacity: 0.6, color: 0x000000 }));
  aoPlane.rotation.x = -Math.PI / 2;
  aoPlane.position.y = 0.012;
  world.add(aoPlane);

  // Yo'lak va hovli maydonchasi
  const pathG = new THREE.BoxGeometry(3.4, 0.06, 15);
  const pathMesh = new THREE.Mesh(worldUV(pathG, 1.2, new THREE.Vector3(0, 0.03, D / 2 + 8.5)), pavers);
  pathMesh.position.set(0, 0.03, D / 2 + 8.5);
  pathMesh.receiveShadow = true;
  world.add(pathMesh);
  const apronG = new THREE.BoxGeometry(W + 2.4, 0.05, D + 2.4);
  const apron = new THREE.Mesh(worldUV(apronG, 1.2, new THREE.Vector3(0, 0.025, 0)), pavers);
  apron.position.set(0, 0.025, 0);
  apron.receiveShadow = true;
  world.add(apron);

  // Butalar
  const blobGeom = (seed: number, detail = 3) => {
    const g = new THREE.IcosahedronGeometry(1, detail);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = 0.82 + 0.3 * vnoise(v.x * 2.2 + 9, v.y * 2.2 + v.z * 1.7, 64, 64, seed) + 0.08 * vnoise(v.x * 7, v.z * 7 + v.y * 3, 64, 64, seed + 3);
      v.multiplyScalar(n);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    const uv = g.attributes.uv as T3.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 9, uv.getY(i) * 5);
    return g;
  };
  const bushGs = [blobGeom(1), blobGeom(2), blobGeom(3)];
  const blob = (x: number, y: number, z: number, sx: number, sy: number, k: number) => {
    const m = new THREE.Mesh(bushGs[k % 3], leaves);
    m.scale.set(sx, sy, sx);
    m.position.set(x, y, z);
    m.rotation.y = k * 1.7;
    m.castShadow = true;
    m.receiveShadow = true;
    world.add(m);
  };
  /** Buta — 3 ta bo'lakdan, tabiiy notekis shakl */
  const addBush = (x: number, z: number, s: number, k = 0) => {
    for (let i = 0; i < 3; i++) {
      const a = hash(k, i, 5) * Math.PI * 2, r = s * 0.45;
      const ss = s * (0.6 + hash(k, i, 6) * 0.35);
      blob(x + Math.cos(a) * r * (i ? 1 : 0), ss * 0.55, z + Math.sin(a) * r * (i ? 1 : 0), ss, ss * 0.8, k + i);
    }
  };
  [[-2.7, D / 2 + 1.0, 0.7], [2.7, D / 2 + 1.0, 0.7], [-W / 2 - 0.7, D / 2 + 0.5, 1.0], [W / 2 + 0.8, D / 2 + 0.3, 0.95], [-4.4, D / 2 + 1.1, 0.55], [4.4, D / 2 + 1.1, 0.55], [W / 2 + 0.9, -1.5, 0.8], [-W / 2 - 0.9, -2.2, 0.85]].forEach(([x, z, s], i) => addBush(x, z, s, i * 3));
  // Daraxtlar: tana + ko'p bo'lakli toj
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3c, roughness: 0.95 });
  disposables.push(trunkMat);
  const addTree = (x: number, z: number, h: number, wide: number, k: number, n = 9) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, h * 0.55, 8), trunkMat);
    t.position.set(x, h * 0.27, z);
    t.castShadow = true;
    world.add(t);
    const cy = h * 0.62, ch = h * 0.38;
    for (let i = 0; i < n; i++) {
      const a = hash(k, i, 11) * Math.PI * 2;
      const rr = Math.sqrt(hash(k, i, 12)) * wide * 0.7;
      const yy = cy + (hash(k, i, 13) - 0.5) * ch * 1.3;
      const taper = 1 - Math.abs(yy - cy) / (ch * 1.2);
      const bs = (0.45 + hash(k, i, 14) * 0.35) * Math.max(wide * 0.7, 0.6) * (0.6 + taper * 0.5);
      blob(x + Math.cos(a) * rr * taper, yy, z + Math.sin(a) * rr * taper, bs, bs * 1.1, k + i);
    }
  };
  /** Terak — baland va ingichka (O'zbekiston hovlilari uchun xos) */
  const addPoplar = (x: number, z: number, h: number, k: number) => {
    for (let i = 0; i < 7; i++) {
      const y = h * (0.2 + i * 0.11);
      const w = 0.75 * Math.sin(Math.PI * (0.15 + i * 0.12)) + 0.2;
      blob(x + (hash(k, i, 3) - 0.5) * 0.3, y, z + (hash(k, i, 4) - 0.5) * 0.3, w, h * 0.12, k + i);
    }
  };
  addPoplar(-W / 2 - 3.4, -2.2, 13, 1);
  addPoplar(-W / 2 - 1.8, -5.6, 11.5, 2);
  addPoplar(W / 2 + 3.2, -5.2, 12.5, 3);
  addPoplar(W / 2 + 5.4, -3, 10.5, 4);
  addTree(W / 2 + 7.5, 4.5, 7, 2.6, 5, 12);
  addTree(-W / 2 - 9, 2, 8, 3, 6, 12);
  addTree(-4, -D / 2 - 6, 9, 3.2, 7, 12);
  // Uzoqdagi daraxtlar halqasi (ufq)
  const farN = 160;
  const farMat = new THREE.MeshStandardMaterial({ color: 0x33452a, roughness: 1 });
  disposables.push(farMat);
  const far = new THREE.InstancedMesh(bushGs[0], farMat, farN);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < farN; i++) {
    const a = (i / farN) * Math.PI * 2 + hash(i, 1, 77) * 0.05;
    const r = 75 + hash(i, 2, 77) * 60;
    const s = 2 + hash(i, 3, 77) * 2.2;
    const hgt = s * (1.1 + hash(i, 4, 77) * 1.0) * (hash(i, 5, 77) > 0.85 ? 1.6 : 1);
    mtx.compose(new THREE.Vector3(Math.cos(a) * r, hgt * 0.55, Math.sin(a) * r), new THREE.Quaternion(), new THREE.Vector3(s, hgt, s));
    far.setMatrixAt(i, mtx);
  }
  world.add(far);

  /* ---- Uy ---- */
  const house = new THREE.Group();
  scene.add(house);
  const body = box(W, H, D, [0, base + H / 2, 0], facade, 2.4);
  house.add(body);
  const plinth = box(W + 0.24, base, D + 0.24, [0, base / 2, 0], granite, 1.8);
  house.add(plinth);
  const cornice = box(W + 0.36, 0.32, D + 0.36, [0, base + H - 0.12, 0], stoneTrim, 2.4);
  house.add(cornice);
  const band = box(W + 0.2, 0.14, D + 0.2, [0, base + 0.08, 0], stoneTrim, 2.4);
  house.add(band);

  const addWindow = (x: number, z: number, rotY: number, w = 1.5, h = 2.1, lit = false) => {
    const g = new THREE.Group();
    g.add(box(w + 0.42, h + 0.42, 0.08, [0, 0, 0.02], stoneTrim, 1.2)); // nalichnik
    g.add(box(w + 0.1, h + 0.1, 0.1, [0, 0, 0.06], pvc));
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.06, h - 0.06), lit ? glassLit : glass);
    gl.position.z = 0.115;
    g.add(gl);
    g.add(box(0.06, h, 0.05, [0, 0, 0.13], pvc));
    g.add(box(w, 0.06, 0.05, [0, h * 0.18, 0.13], pvc));
    g.add(box(w + 0.6, 0.1, 0.32, [0, -h / 2 - 0.26, 0.12], stoneTrim, 1.2)); // podokonnik
    g.add(box(w + 0.6, 0.2, 0.12, [0, h / 2 + 0.3, 0.08], stoneTrim, 1.2)); // sandrik
    g.position.set(x, base + 2.0, z);
    g.rotation.y = rotY;
    house.add(g);
  };
  [-4.5, -2.4, 2.4, 4.5].forEach((x, i) => addWindow(x, D / 2, 0, 1.4, 2.1, i === 1 || i === 2));
  [-2, 2].forEach((z, i) => addWindow(W / 2, z, Math.PI / 2, 1.4, 2.1, i === 0));
  [-2, 2].forEach((z) => addWindow(-W / 2, z, -Math.PI / 2));
  [-4.5, -1.5, 1.5, 4.5].forEach((x) => addWindow(x, -D / 2, Math.PI));

  // Kirish: ikki tabaqali eshik, ustida oyna
  const doorG = new THREE.Group();
  doorG.add(box(2.3, 3.15, 0.1, [0, 0, 0.02], stoneTrim, 1.2));
  doorG.add(box(1.9, 2.55, 0.08, [0, -0.25, 0.08], wood, 1));
  const tr = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.42), glassLit);
  tr.position.set(0, 1.28, 0.1);
  doorG.add(tr);
  doorG.add(box(0.03, 2.5, 0.04, [0, -0.25, 0.13], pvc));
  [-0.12, 0.12].forEach((x) => doorG.add(box(0.03, 0.42, 0.06, [x, -0.2, 0.15], trimMetal)));
  doorG.position.set(0, base + 1.55, D / 2);
  house.add(doorG);
  // Ayvon: zinapoya, ustunlar, pediment
  const PW = 4.8, PD = 2.4, pe = eaveY - 0.35;
  house.add(box(PW + 0.6, 0.18, PD + 0.4, [0, base - 0.09, D / 2 + PD / 2], granite, 1.8));
  house.add(box(PW + 1.2, 0.18, 0.5, [0, base - 0.27, D / 2 + PD + 0.45], granite, 1.8));
  house.add(box(PW + 1.8, 0.16, 0.5, [0, 0.08, D / 2 + PD + 0.9], granite, 1.8));
  for (const x of [-PW / 2 + 0.3, PW / 2 - 0.3]) {
    const col = new THREE.Mesh(worldUV(new THREE.CylinderGeometry(0.2, 0.23, pe - base - 0.3, 28), 1.2), stoneTrim);
    col.position.set(x, base + (pe - base - 0.3) / 2, D / 2 + PD - 0.3);
    col.castShadow = col.receiveShadow = true;
    house.add(col);
    house.add(box(0.6, 0.18, 0.6, [x, base + 0.09, D / 2 + PD - 0.3], stoneTrim, 1.2));
    house.add(box(0.62, 0.2, 0.62, [x, pe - 0.4, D / 2 + PD - 0.3], stoneTrim, 1.2));
  }
  house.add(box(PW + 0.3, 0.32, PD + 0.1, [0, pe - 0.14, D / 2 + PD / 2], stoneTrim, 2.4)); // antablement
  // Chiroqlar
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xffc27a, emissiveIntensity: P.windows > 1 ? 3 : 0.4 });
  disposables.push(lampMat);
  [-1.35, 1.35].forEach((x) => house.add(box(0.16, 0.34, 0.16, [x, base + 2.4, D / 2 + 0.12], lampMat)));
  if (P.windows > 1) {
    const pl = new THREE.PointLight(0xffb36b, 14, 9, 1.6);
    pl.position.set(0, base + 2.6, D / 2 + 1.2);
    house.add(pl);
  }
  const body0 = { y: body.position.y };

  /* ---- Tom geometriyasi ---- */
  const tri = (pos: number[], uv: number[], a: number[], b: number[], c: number[], eave: number[], slope: number[]) => {
    const s = 1 / 1.05;
    for (const p of [a, b, c]) {
      pos.push(p[0], p[1], p[2]);
      uv.push((p[0] * eave[0] + p[1] * eave[1] + p[2] * eave[2]) * s, (p[0] * slope[0] + p[1] * slope[1] + p[2] * slope[2]) * s);
    }
  };
  const norm = (v: number[]) => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return v.map((x) => x / l);
  };
  const quad = (pos: number[], uv: number[], a: number[], b: number[], c: number[], d: number[], eave: number[]) => {
    const mid = [(c[0] + d[0]) / 2 - (a[0] + b[0]) / 2, (c[1] + d[1]) / 2 - (a[1] + b[1]) / 2, (c[2] + d[2]) / 2 - (a[2] + b[2]) / 2];
    const sl = norm(mid);
    tri(pos, uv, a, b, c, eave, sl);
    tri(pos, uv, a, c, d, eave, sl);
  };
  const sideTri = (pos: number[], uv: number[], a: number[], b: number[], c: number[], eave: number[]) => {
    const mid = [c[0] - (a[0] + b[0]) / 2, c[1] - (a[1] + b[1]) / 2, c[2] - (a[2] + b[2]) / 2];
    tri(pos, uv, a, b, c, eave, norm(mid));
  };
  const geom = (pos: number[], uv: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return g;
  };
  const rod = (a: number[], b: number[], r: number, mat: T3.Material) => {
    const va = new THREE.Vector3(a[0], a[1], a[2]);
    const vb = new THREE.Vector3(b[0], b[1], b[2]);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 12), mat);
    m.position.copy(va).add(vb).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    m.castShadow = true;
    return m;
  };

  const ov = 0.8;
  const X = W / 2 + ov, Z = D / 2 + ov;

  const buildRoof = (shape: RoofShape) => {
    const g = new THREE.Group();
    const pos: number[] = [], uv: number[] = [];
    const ridges: [number[], number[]][] = [];
    const gables: number[][][] = [];
    let chimneyTop = eaveY + 2.6;
    if (shape === "bir") {
      const hi = eaveY + 2.2;
      quad(pos, uv, [X, eaveY, Z], [-X, eaveY, Z], [-X, hi, -Z], [X, hi, -Z], [1, 0, 0]);
      gables.push([[W / 2, eaveY, D / 2], [W / 2, eaveY, -D / 2], [W / 2, hi - 0.2, -D / 2]], [[-W / 2, eaveY, -D / 2], [-W / 2, eaveY, D / 2], [-W / 2, hi - 0.2, -D / 2]]);
      chimneyTop = eaveY + 2.9;
    } else if (shape === "ikki") {
      const top = eaveY + 3.0;
      quad(pos, uv, [-X, eaveY, Z], [X, eaveY, Z], [X, top, 0], [-X, top, 0], [1, 0, 0]);
      quad(pos, uv, [X, eaveY, -Z], [-X, eaveY, -Z], [-X, top, 0], [X, top, 0], [-1, 0, 0]);
      ridges.push([[-X, top, 0], [X, top, 0]]);
      gables.push([[W / 2, eaveY, D / 2], [W / 2, eaveY, -D / 2], [W / 2, top - 0.35, 0]], [[-W / 2, eaveY, -D / 2], [-W / 2, eaveY, D / 2], [-W / 2, top - 0.35, 0]]);
      chimneyTop = eaveY + 3.1;
    } else {
      const top = eaveY + (shape === "doppi" ? 2.0 : 2.9);
      const rx = shape === "doppi" ? X - Z * 0.72 : X - Z;
      const rz = shape === "doppi" ? Z * 0.28 : 0;
      const A = [-X, eaveY, Z], B = [X, eaveY, Z], C = [X, eaveY, -Z], Dd = [-X, eaveY, -Z];
      const r1 = [-rx, top, rz], r2 = [rx, top, rz], r3 = [rx, top, -rz], r4 = [-rx, top, -rz];
      quad(pos, uv, A, B, r2, r1, [1, 0, 0]);
      quad(pos, uv, C, Dd, r4, r3, [-1, 0, 0]);
      if (shape === "doppi") {
        quad(pos, uv, B, C, r3, r2, [0, 0, -1]);
        quad(pos, uv, Dd, A, r1, r4, [0, 0, 1]);
        ridges.push([A, r1], [B, r2], [C, r3], [Dd, r4]);
        const ringW = rx * 2 + 0.2, ringD = rz * 2 + 0.2;
        g.add(box(ringW, 1.0, ringD, [0, top + 0.5, 0], facade, 2.4));
        g.add(box(ringW + 0.2, 0.16, ringD + 0.2, [0, top + 0.95, 0], stoneTrim, 2.4));
        for (const sx of [-1, 1]) {
          for (let i = 0; i < 4; i++) {
            const w = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.5), i === 1 ? glassLit : glass);
            w.position.set(-ringW / 2 + ringW * (0.16 + i * 0.227), top + 0.52, sx * (ringD / 2 + 0.012));
            if (sx < 0) w.rotation.y = Math.PI;
            g.add(w);
          }
        }
        const t2 = top + 1.0;
        const px = rx + 0.6, pz = rz + 0.6, peak = t2 + 2.0;
        const a2 = [-px, t2, pz], b2 = [px, t2, pz], c2 = [px, t2, -pz], d2 = [-px, t2, -pz];
        const p1 = [-0.5, peak, 0], p2 = [0.5, peak, 0];
        quad(pos, uv, a2, b2, p2, p1, [1, 0, 0]);
        quad(pos, uv, c2, d2, p1, p2, [-1, 0, 0]);
        sideTri(pos, uv, b2, c2, p2, [0, 0, -1]);
        sideTri(pos, uv, d2, a2, p1, [0, 0, 1]);
        ridges.push([a2, p1], [b2, p2], [c2, p2], [d2, p1], [p1, p2]);
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.08, 1.2, 16), trimMetal);
        spire.position.y = peak + 0.55;
        g.add(spire);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), trimMetal);
        ball.position.y = peak + 0.12;
        g.add(ball);
        chimneyTop = eaveY + 2.5;
      } else {
        sideTri(pos, uv, B, C, r2, [0, 0, -1]);
        sideTri(pos, uv, Dd, A, r1, [0, 0, 1]);
        ridges.push([A, r1], [B, r2], [C, r2], [Dd, r1], [r1, r2]);
      }
    }
    // Ayvon pedimenti (old tomonda)
    {
      const z0 = D / 2 - 0.2, z1 = D / 2 + PD + 0.35, x0 = PW / 2 + 0.45, py = pe + 0.05, ph = py + 1.45;
      quad(pos, uv, [-x0, py, z1], [-x0, py, z0], [0, ph, z0], [0, ph, z1], [0, 0, -1]);
      quad(pos, uv, [x0, py, z0], [x0, py, z1], [0, ph, z1], [0, ph, z0], [0, 0, 1]);
      ridges.push([[0, ph, z0], [0, ph, z1]]);
      const tp: number[] = [], tu: number[] = [];
      tri(tp, tu, [-PW / 2, py, z1 - 0.3], [PW / 2, py, z1 - 0.3], [0, ph - 0.22, z1 - 0.3], [1, 0, 0], [0, 1, 0]);
      const ped = new THREE.Mesh(geom(tp, tu), stoneTrim);
      ped.castShadow = true;
      g.add(ped);
      g.add(rod([-PW / 2 - 0.1, py - 0.05, z1 - 0.15], [PW / 2 + 0.1, py - 0.05, z1 - 0.15], 0.1, trimMetal));
    }
    const roof = new THREE.Mesh(geom(pos, uv), roofMat);
    roof.castShadow = true;
    roof.receiveShadow = true;
    g.add(roof);
    for (const [a, b] of ridges) g.add(rod(a, b, 0.12, trimMetal));
    // Frontonlar
    for (const t of gables) {
      const gp: number[] = [], gu: number[] = [];
      tri(gp, gu, t[0], t[1], t[2], [0, 0, 1], [0, 1, 0]);
      const gm = new THREE.Mesh(geom(gp, gu), facade);
      gm.castShadow = gm.receiveShadow = true;
      g.add(gm);
    }
    // Karniz osti (sofit)
    const sof = new THREE.MeshStandardMaterial({ color: 0xe9e3d8, roughness: 0.8 });
    disposables.push(sof);
    g.add(box(2 * X, 0.05, ov, [0, eaveY - 0.02, D / 2 + ov / 2], sof));
    g.add(box(2 * X, 0.05, ov, [0, eaveY - 0.02, -D / 2 - ov / 2], sof));
    g.add(box(ov, 0.05, D, [W / 2 + ov / 2, eaveY - 0.02, 0], sof));
    g.add(box(ov, 0.05, D, [-W / 2 - ov / 2, eaveY - 0.02, 0], sof));
    // Vodostok
    const gy = eaveY - 0.1;
    const gutters: [number[], number[]][] =
      shape === "bir" ? [[[-X, gy, Z + 0.1], [X, gy, Z + 0.1]]]
      : shape === "ikki" ? [[[-X, gy, Z + 0.1], [X, gy, Z + 0.1]], [[-X, gy, -Z - 0.1], [X, gy, -Z - 0.1]]]
      : [[[-X, gy, Z + 0.1], [X, gy, Z + 0.1]], [[-X, gy, -Z - 0.1], [X, gy, -Z - 0.1]], [[X + 0.1, gy, -Z], [X + 0.1, gy, Z]], [[-X - 0.1, gy, -Z], [-X - 0.1, gy, Z]]];
    for (const [a, b] of gutters) g.add(rod(a, b, 0.11, trimMetal));
    for (const [x, z] of [[X - 0.25, Z + 0.1], [-X + 0.25, Z + 0.1], [X - 0.25, -Z - 0.1], [-X + 0.25, -Z - 0.1]]) {
      g.add(rod([x, gy, z], [x, gy - 0.4, z * 0.94], 0.065, trimMetal));
      g.add(rod([x, gy - 0.4, z * 0.94], [x, 0.25, z * 0.94], 0.065, trimMetal));
    }
    // Mo'ri
    const chH = chimneyTop - eaveY + 0.4;
    g.add(box(0.9, chH, 0.9, [-4.4, eaveY - 0.4 + chH / 2, -2.4], facade, 2.4));
    g.add(box(1.1, 0.16, 1.1, [-4.4, chimneyTop + 0.08, -2.4], stoneTrim, 1.2));
    g.add(box(0.95, 0.06, 0.95, [-4.4, chimneyTop + 0.42, -2.4], trimMetal));
    return g;
  };

  let roof = buildRoof(o.shape || "doppi");
  house.add(roof);

  /* ---- Admin yuklagan GLB model (standart uy o'rniga) ---- */
  const roofMats: T3.MeshStandardMaterial[] = [];
  if (o.modelUrl) {
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
    const { DRACOLoader } = await import("three/examples/jsm/loaders/DRACOLoader.js");
    const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    loader.setDRACOLoader(draco);
    loader.setMeshoptDecoder(MeshoptDecoder);
    disposables.push(draco);
    let gltf;
    try {
      gltf = await loader.loadAsync(o.modelUrl);
    } catch (e) {
      renderer.dispose();
      renderer.domElement.remove();
      throw e;
    }
    scene.remove(house);
    aoPlane.visible = false;
    apron.visible = false;
    const model = gltf.scene;
    const bx = new THREE.Box3().setFromObject(model);
    const size = bx.getSize(new THREE.Vector3());
    const k = 14 / Math.max(size.x, size.z, size.y * 1.3, 0.001);
    model.scale.multiplyScalar(k);
    bx.setFromObject(model);
    const c = bx.getCenter(new THREE.Vector3());
    model.position.x -= c.x;
    model.position.z -= c.z;
    model.position.y -= bx.min.y;
    bx.setFromObject(model);
    target.set(0, bx.max.y * 0.45, 0);
    controls?.target.copy(target);
    const tokens = (o.roofNames || "").toLowerCase().split(",").map((t) => t.trim()).filter(Boolean);
    model.traverse((ob: T3.Object3D) => {
      const m = ob as T3.Mesh;
      if (!m.isMesh) return;
      m.castShadow = m.receiveShadow = true;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const names = [m.name, m.parent?.name || "", ...mats.map((x) => x.name)].join(" ").toLowerCase();
      if (tokens.length && tokens.some((t) => names.includes(t))) {
        const cloned = mats.map((x) => {
          const cm = (x as T3.MeshStandardMaterial).clone();
          if ("color" in cm && cm.color) roofMats.push(cm);
          return cm;
        });
        m.material = Array.isArray(m.material) ? cloned : cloned[0];
      }
    });
    roofMats.forEach((m) => m.color.set(o.color));
    scene.add(model);
    o.onRecolorable?.(roofMats.length > 0);
  } else o.onRecolorable?.(true);

  /* ---- O'lcham ---- */
  const shift = o.shift || 0;
  const baseDist = camera.position.distanceTo(target);
  const baseTargetY = target.y;
  const resize = () => {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Tor ekranda uzoqlashamiz; keng ekranda uy o'ngga suriladi
    const a = w / h;
    const k = a < 0.8 ? 1.55 : a < 1.2 ? 1.25 : 1;
    const dir = camera.position.clone().sub(target).normalize();
    // Tik ekranda (telefon) qahramon kadrida uy pastroqqa tushadi — tepada matn uchun osmon qoladi
    const lift = view === "hero" && a < 0.8 ? 4.2 : 0;
    target.y = baseTargetY + lift;
    controls?.target.copy(target);
    camera.position.copy(target).add(dir.multiplyScalar(baseDist * k));
    if (shift && a > 1.2) camera.setViewOffset(w, h, -w * shift, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    if (!controls) camera.lookAt(target);
  };
  resize();
  const ro = still ? null : new ResizeObserver(resize);
  ro?.observe(el);

  /* ---- Animatsiya ---- */
  let introT = o.intro && !reduce && !still ? 0 : 1;
  const introStart = performance.now();
  const roofColor = new THREE.Color(o.color);
  const startSph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(target));
  const t0 = performance.now();

  const renderOnce = () => renderer.render(scene, camera);
  let visible = true;
  const io = still ? null : new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.01 });
  io?.observe(el);
  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const now = performance.now();
    if (introT < 1) {
      introT = Math.min(1, (now - introStart) / 1800);
      const e = 1 - Math.pow(1 - introT, 4);
      roof.position.y = (1 - e) * 7;
      const b = Math.min(1, introT * 2);
      body.scale.y = Math.max(0.001, b);
      body.position.y = base + (H * b) / 2;
      if (introT >= 1) body.position.y = body0.y;
    }
    if (!o.aged) (roofMat as T3.MeshStandardMaterial).color.lerp(roofColor, 0.1);
    trimMetal.color.lerp(roofColor, 0.1);
    roofMats.forEach((m) => m.color.lerp(roofColor, 0.1));
    // Sekin "nafas olish" — foydalanuvchi aylantirmaguncha
    if (!userMoved && !reduce) {
      const t = (now - t0) / 1000;
      const sph = startSph.clone();
      sph.theta += Math.sin(t * 0.12) * 0.32;
      sph.phi += Math.sin(t * 0.09) * 0.03;
      camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(sph));
      if (!controls) camera.lookAt(target);
    }
    controls?.update();
    renderOnce();
  };
  if (!still) tick();
  else renderOnce();

  return {
    canvas: renderer.domElement,
    render: renderOnce,
    setColor: (hex) => {
      roofColor.set(hex);
      if (still) {
        if (!o.aged) (roofMat as T3.MeshStandardMaterial).color.set(hex);
        trimMetal.color.set(hex);
        renderOnce();
      }
    },
    setShape: (s) => {
      house.remove(roof);
      roof.traverse((ob: T3.Object3D) => (ob as T3.Mesh).geometry?.dispose());
      roof = buildRoof(s);
      house.add(roof);
      if (still) renderOnce();
    },
    setMaterial: (m) => {
      if (o.aged) return;
      const t = roofTex[m];
      const rm = roofMat as T3.MeshStandardMaterial;
      rm.map = t.map;
      rm.normalMap = t.normal;
      rm.roughnessMap = t.rough;
      rm.needsUpdate = true;
      if (still) renderOnce();
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      controls?.dispose();
      scene.traverse((ob: T3.Object3D) => (ob as T3.Mesh).geometry?.dispose());
      disposables.forEach((d) => d.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
