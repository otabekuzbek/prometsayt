"use client";
import { useEffect, useRef, useState } from "react";
import type * as T3 from "three";

export type RoofShape = "bir" | "ikki" | "tort" | "doppi";
export type RoofMaterial = "cherepitsa" | "profnastil";

type Api = {
  setColor: (hex: string) => void;
  setShape: (s: RoofShape) => void;
  setMaterial: (m: RoofMaterial) => void;
  dispose: () => void;
};

/**
 * Interaktiv 3D uy: tom shakli, rangi va materiali o'zgaradi.
 * three.js faqat brauzerda, sahifa chizilgandan keyin yuklanadi — birinchi ekran tezligiga ta'sir qilmaydi.
 */
export default function RoofScene({
  color,
  shape = "doppi",
  material = "cherepitsa",
  intro = false,
  className,
  label = "Uyning 3D ko'rinishi. Aylantirish uchun suring.",
}: {
  color: string;
  shape?: RoofShape;
  material?: RoofMaterial;
  intro?: boolean;
  className?: string;
  label?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const first = useRef({ color, shape, material });

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    if (!el) return;
    const start = () =>
      buildScene(el, first.current, intro)
        .then((a) => {
          if (cancelled) return a.dispose();
          api.current = a;
          setReady(true);
        })
        .catch((e) => {
          console.error(e);
          if (!cancelled) setFailed(true);
        });
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 900 });
    else setTimeout(start, 200);
    return () => {
      cancelled = true;
      api.current?.dispose();
      api.current = null;
    };
  }, [intro]);

  useEffect(() => api.current?.setColor(color), [color, ready]);
  useEffect(() => api.current?.setShape(shape), [shape, ready]);
  useEffect(() => api.current?.setMaterial(material), [material, ready]);

  return (
    <div ref={host} className={`roof-scene ${ready ? "is-ready" : ""} ${className || ""}`} role="img" aria-label={label}>
      {!ready && (
        <svg className="roof-scene-poster" viewBox="0 0 400 260" aria-hidden="true">
          <path d="M60 150 L130 96 L270 96 L340 150 Z" fill={color} opacity=".9" />
          <path d="M165 96 L200 62 L235 96 Z" fill={color} />
          <rect x="88" y="150" width="224" height="78" fill="#e9e3d8" />
        </svg>
      )}
      {failed && <span className="roof-scene-fail">3D ko&apos;rinish bu qurilmada ochilmadi</span>}
    </div>
  );
}

async function buildScene(
  el: HTMLDivElement,
  init: { color: string; shape: RoofShape; material: RoofMaterial },
  intro: boolean,
): Promise<Api> {
  const THREE = await import("three");
  const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
  const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  camera.position.set(17, 9.5, 19);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 3.4, 0);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minPolarAngle = 0.55;
  controls.maxPolarAngle = 1.38;
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = 0.6;
  controls.addEventListener("start", () => (controls.autoRotate = false));

  // Yorug'lik: kunduzgi quyosh + osmon
  scene.add(new THREE.HemisphereLight(0xdbe8ff, 0x3c4a32, 0.9));
  const sun = new THREE.DirectionalLight(0xfff3e0, 2.4);
  sun.position.set(12, 18, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -14;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  // Zamin
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(16, 64),
    new THREE.ShadowMaterial({ opacity: 0.28 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xcfc6b6, roughness: 0.9 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.35, 9.2), plinthMat);
  plinth.position.y = 0.175;
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  scene.add(plinth);

  // Uy tanasi
  const W = 12; // eni (x)
  const D = 8; // chuqurligi (z)
  const H = 3.4; // devor balandligi
  const base = 0.35;
  const house = new THREE.Group();
  scene.add(house);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1ebe0, roughness: 0.85 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xd9cfbd, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x24364c, roughness: 0.08, metalness: 0.6, envMapIntensity: 1.4 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x5a3a26, roughness: 0.55 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wallMat);
  body.position.y = base + H / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  house.add(body);

  const addWindow = (x: number, z: number, rotY: number, w = 1.15, h = 1.7) => {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.28, h + 0.28, 0.12), trimMat);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.14), glassMat);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.12, 0.3), trimMat);
    sill.position.y = -h / 2 - 0.2;
    sill.position.z = 0.08;
    g.add(frame, glass, sill);
    g.position.set(x, base + 1.95, z);
    g.rotation.y = rotY;
    g.traverse((m) => ((m as T3.Mesh).castShadow = true));
    house.add(g);
  };
  [-4.3, -2.2, 2.2, 4.3].forEach((x) => addWindow(x, D / 2 + 0.02, 0));
  [-1.8, 1.8].forEach((z) => addWindow(W / 2 + 0.02, z, Math.PI / 2));
  [-1.8, 1.8].forEach((z) => addWindow(-W / 2 - 0.02, z, -Math.PI / 2));
  [-4.3, -1.4, 1.4, 4.3].forEach((x) => addWindow(x, -D / 2 - 0.02, Math.PI));

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.7, 0.16), doorMat);
  door.position.set(0, base + 1.35, D / 2 + 0.03);
  door.castShadow = true;
  house.add(door);

  // Ayvon ustunlari
  [-1.6, 1.6].forEach((x) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, H, 20), trimMat);
    col.position.set(x, base + H / 2, D / 2 + 1.1);
    col.castShadow = true;
    house.add(col);
  });
  const step = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.3, 1.6), plinthMat);
  step.position.set(0, base + 0.05, D / 2 + 1.0);
  step.receiveShadow = true;
  house.add(step);
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, 0.28, D + 0.3), trimMat);
  cornice.position.y = base + H - 0.1;
  cornice.castShadow = true;
  house.add(cornice);

  // Tom materiali — kanvasda chizilgan bo'rtma (cherepitsa pog'onasi yoki profnastil qovurg'asi)
  const makeBump = (kind: RoofMaterial) => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const x = c.getContext("2d")!;
    if (kind === "cherepitsa") {
      for (let row = 0; row < 4; row++) {
        const y0 = row * 64;
        const g = x.createLinearGradient(0, y0, 0, y0 + 64);
        g.addColorStop(0, "#9a9a9a");
        g.addColorStop(0.82, "#e8e8e8");
        g.addColorStop(0.9, "#ffffff");
        g.addColorStop(1, "#2a2a2a");
        x.fillStyle = g;
        x.fillRect(0, y0, 256, 64);
      }
      for (let col = 0; col < 4; col++) {
        const g = x.createLinearGradient(col * 64, 0, col * 64 + 64, 0);
        g.addColorStop(0, "rgba(0,0,0,.35)");
        g.addColorStop(0.5, "rgba(255,255,255,0)");
        g.addColorStop(1, "rgba(0,0,0,.35)");
        x.fillStyle = g;
        x.fillRect(col * 64, 0, 64, 256);
      }
    } else {
      for (let col = 0; col < 8; col++) {
        const x0 = col * 32;
        x.fillStyle = "#808080";
        x.fillRect(x0, 0, 32, 256);
        const g = x.createLinearGradient(x0, 0, x0 + 32, 0);
        g.addColorStop(0, "#808080");
        g.addColorStop(0.35, "#808080");
        g.addColorStop(0.42, "#ffffff");
        g.addColorStop(0.58, "#ffffff");
        g.addColorStop(0.65, "#808080");
        g.addColorStop(1, "#808080");
        x.fillStyle = g;
        x.fillRect(x0, 0, 32, 256);
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  };
  const bumps = { cherepitsa: makeBump("cherepitsa"), profnastil: makeBump("profnastil") };

  const roofMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(init.color),
    metalness: 0.55,
    roughness: 0.38,
    bumpMap: bumps[init.material],
    bumpScale: 3.2,
    envMapIntensity: 1.1,
    side: THREE.DoubleSide,
  });
  const ridgeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(init.color), metalness: 0.6, roughness: 0.32, envMapIntensity: 1.1 });

  // Planar UV: u — karniz bo'ylab, v — qiyalik bo'ylab (pog'onalar to'g'ri yo'nalishda chiqadi)
  const tri = (pos: number[], uv: number[], a: number[], b: number[], c: number[], eave: number[], slope: number[]) => {
    const s = 0.75; // 1 metrda tekstura takrorlanishi
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
    // a-b — karniz chizig'i, c-d — tepasi
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

  const eaveY = base + H + 0.05;
  const o = 0.75; // svess (chiqiq)
  const X = W / 2 + o;
  const Z = D / 2 + o;

  const gableMat = wallMat;

  const buildRoof = (shape: RoofShape) => {
    const g = new THREE.Group();
    const pos: number[] = [];
    const uv: number[] = [];
    const ridges: [number[], number[]][] = [];
    if (shape === "bir") {
      const hi = eaveY + 2.2;
      quad(pos, uv, [X, eaveY, Z], [-X, eaveY, Z], [-X, hi, -Z], [X, hi, -Z], [1, 0, 0]);
      const gp: number[] = [];
      const gu: number[] = [];
      tri(gp, gu, [W / 2, eaveY, D / 2], [W / 2, eaveY, -D / 2], [W / 2, hi - 0.2, -D / 2], [0, 0, 1], [0, 1, 0]);
      tri(gp, gu, [-W / 2, eaveY, -D / 2], [-W / 2, eaveY, D / 2], [-W / 2, hi - 0.2, -D / 2], [0, 0, 1], [0, 1, 0]);
      const gm = new THREE.Mesh(geom(gp, gu), gableMat);
      gm.castShadow = true;
      g.add(gm);
    } else if (shape === "ikki") {
      const top = eaveY + 2.9;
      quad(pos, uv, [-X, eaveY, Z], [X, eaveY, Z], [X, top, 0], [-X, top, 0], [1, 0, 0]);
      quad(pos, uv, [X, eaveY, -Z], [-X, eaveY, -Z], [-X, top, 0], [X, top, 0], [-1, 0, 0]);
      ridges.push([[-X, top, 0], [X, top, 0]]);
      const gp: number[] = [];
      const gu: number[] = [];
      tri(gp, gu, [W / 2, eaveY, D / 2], [W / 2, eaveY, -D / 2], [W / 2, top - 0.35, 0], [0, 0, 1], [0, 1, 0]);
      tri(gp, gu, [-W / 2, eaveY, -D / 2], [-W / 2, eaveY, D / 2], [-W / 2, top - 0.35, 0], [0, 0, 1], [0, 1, 0]);
      const gm = new THREE.Mesh(geom(gp, gu), gableMat);
      gm.castShadow = true;
      g.add(gm);
    } else {
      // To'rt qiyalik (va do'ppining pastki qavati)
      const top = eaveY + (shape === "doppi" ? 2.0 : 2.8);
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
        // Markaziy ko'tarma (do'ppi): devor halqasi + o'tkir piramida
        const ringW = rx * 2 + 0.2;
        const ringD = rz * 2 + 0.2;
        const ring = new THREE.Mesh(new THREE.BoxGeometry(ringW, 0.9, ringD), wallMat);
        ring.position.y = top + 0.45;
        ring.castShadow = true;
        g.add(ring);
        for (const sx of [-1, 1]) {
          for (let i = 0; i < 3; i++) {
            const w = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.06), glassMat);
            w.position.set(-ringW / 2 + ringW * (0.22 + i * 0.28), top + 0.45, sx * (ringD / 2 + 0.01));
            g.add(w);
          }
        }
        const t2 = top + 0.9;
        const px = rx + 0.55, pz = rz + 0.55, peak = t2 + 2.1;
        const a2 = [-px, t2, pz], b2 = [px, t2, pz], c2 = [px, t2, -pz], d2 = [-px, t2, -pz];
        const p1 = [-0.45, peak, 0], p2 = [0.45, peak, 0];
        quad(pos, uv, a2, b2, p2, p1, [1, 0, 0]);
        quad(pos, uv, c2, d2, p1, p2, [-1, 0, 0]);
        sideTri(pos, uv, b2, c2, p2, [0, 0, -1]);
        sideTri(pos, uv, d2, a2, p1, [0, 0, 1]);
        ridges.push([a2, p1], [b2, p2], [c2, p2], [d2, p1], [p1, p2]);
        // Shpil
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.09, 1.1, 12), ridgeMat);
        spire.position.y = peak + 0.5;
        g.add(spire);
      } else {
        sideTri(pos, uv, B, C, r2, [0, 0, -1]);
        sideTri(pos, uv, Dd, A, r1, [0, 0, 1]);
        ridges.push([A, r1], [B, r2], [C, r2], [Dd, r1], [r1, r2]);
      }
    }
    const roof = new THREE.Mesh(geom(pos, uv), roofMat);
    roof.castShadow = true;
    roof.receiveShadow = true;
    g.add(roof);
    // Konyok va qirra plankalari
    for (const [a, b] of ridges) {
      const va = new THREE.Vector3(...(a as [number, number, number]));
      const vb = new THREE.Vector3(...(b as [number, number, number]));
      const len = va.distanceTo(vb);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, len, 10), ridgeMat);
      m.position.copy(va).add(vb).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
      m.castShadow = true;
      g.add(m);
    }
    // Vodostok novi
    const gutterMat = ridgeMat;
    const gutters: [number[], number[]][] =
      shape === "bir" ? [[[-X, eaveY - 0.08, Z + 0.08], [X, eaveY - 0.08, Z + 0.08]]]
      : shape === "ikki" ? [[[-X, eaveY - 0.08, Z + 0.08], [X, eaveY - 0.08, Z + 0.08]], [[-X, eaveY - 0.08, -Z - 0.08], [X, eaveY - 0.08, -Z - 0.08]]]
      : [[[-X, eaveY - 0.08, Z + 0.08], [X, eaveY - 0.08, Z + 0.08]], [[-X, eaveY - 0.08, -Z - 0.08], [X, eaveY - 0.08, -Z - 0.08]], [[X + 0.08, eaveY - 0.08, -Z], [X + 0.08, eaveY - 0.08, Z]], [[-X - 0.08, eaveY - 0.08, -Z], [-X - 0.08, eaveY - 0.08, Z]]];
    for (const [a, b] of gutters) {
      const va = new THREE.Vector3(...(a as [number, number, number]));
      const vb = new THREE.Vector3(...(b as [number, number, number]));
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, va.distanceTo(vb), 10), gutterMat);
      m.position.copy(va).add(vb).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
      g.add(m);
    }
    for (const [x, z] of [[X - 0.3, Z + 0.1], [-X + 0.3, Z + 0.1]]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, eaveY - base, 10), gutterMat);
      p.position.set(x, base + (eaveY - base) / 2, z);
      g.add(p);
    }
    return g;
  };

  let roof = buildRoof(init.shape);
  house.add(roof);

  const disposeGroup = (g: T3.Object3D) =>
    g.traverse((o: T3.Object3D) => {
      const m = o as T3.Mesh;
      if (m.geometry) m.geometry.dispose();
    });

  // O'lcham va ko'rinish
  const resize = () => {
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Tor ekranda kamerani uzoqlashtiramiz — uy to'liq sig'sin
    const dist = w / h < 1 ? 40 : w / h < 1.25 ? 36 : 33;
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(dir.multiplyScalar(dist));
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(el);
  resize();

  // Kirish animatsiyasi: tom yuqoridan tushadi
  let introT = intro && !reduce ? 0 : 1;
  const introStart = performance.now();

  // Rang almashinuvi
  const targetColor = new THREE.Color(init.color);
  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.01 });
  io.observe(el);

  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    if (introT < 1) {
      introT = Math.min(1, (performance.now() - introStart) / 1600);
      const e = 1 - Math.pow(1 - introT, 4);
      roof.position.y = (1 - e) * 6;
      body.scale.y = Math.max(0.001, Math.min(1, introT * 2.2));
      body.position.y = base + (H * body.scale.y) / 2;
    }
    roofMat.color.lerp(targetColor, 0.12);
    ridgeMat.color.lerp(targetColor, 0.12);
    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  return {
    setColor: (hex) => targetColor.set(hex),
    setShape: (s) => {
      house.remove(roof);
      disposeGroup(roof);
      roof = buildRoof(s);
      house.add(roof);
    },
    setMaterial: (m) => {
      roofMat.bumpMap = bumps[m];
      roofMat.needsUpdate = true;
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      disposeGroup(scene);
      Object.values(bumps).forEach((t) => t.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
