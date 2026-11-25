// Build Your 1911: three.js viewer plus option picker. Display model only.
import * as THREE from "./vendor/three/three.module.js";
import { GLTFLoader } from "./vendor/three/GLTFLoader.js";
import { OrbitControls } from "./vendor/three/OrbitControls.js";
import { RoomEnvironment } from "./vendor/three/RoomEnvironment.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- procedural textures (canvas, no image files) ---------- */
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function canvasTex(size, draw, repeat = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t._canvas = c;
  return t;
}
const TEX = {};
function colorCase() {
  return TEX.cc || (TEX.cc = canvasTex(512, (g, n) => {
    const r = rng(7);
    g.fillStyle = "#9da2a9"; g.fillRect(0, 0, n, n);
    const cols = ["rgba(40,80,170,.75)", "rgba(120,60,160,.6)", "rgba(215,150,50,.7)", "rgba(50,120,170,.7)", "rgba(235,195,100,.6)", "rgba(25,35,90,.7)"];
    for (let i = 0; i < 260; i++) {
      const x = r() * n, y = r() * n, rad = 10 + r() * 60;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, cols[i % cols.length]); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rad, rad * (0.4 + r() * 0.6), r() * 3, 0, 7); g.fill();
    }
  }, 0.6));
}
function walnut() {
  return TEX.wal || (TEX.wal = canvasTex(512, (g, n) => {
    const r = rng(3);
    g.fillStyle = "#5a3018"; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 140; i++) {
      const y0 = r() * n, amp = 4 + r() * 14, f = 0.01 + r() * 0.02;
      g.strokeStyle = `rgba(${20 + r() * 30},${8 + r() * 12},${2},${0.15 + r() * 0.35})`;
      g.lineWidth = 0.6 + r() * 2.4;
      g.beginPath();
      for (let x = 0; x <= n; x += 6) g.lineTo(x, y0 + Math.sin(x * f + i) * amp);
      g.stroke();
    }
    g.fillStyle = "rgba(160,90,40,.12)"; g.fillRect(0, 0, n, n);
  }, 1));
}
function stag() {
  return TEX.stag || (TEX.stag = canvasTex(512, (g, n) => {
    const r = rng(11);
    g.fillStyle = "#d9cdb4"; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 900; i++) {
      const x = r() * n, y = r() * n, w = 2 + r() * 14, h = 1 + r() * 4;
      g.fillStyle = `rgba(${70 + r() * 40},${50 + r() * 30},${30},${0.15 + r() * 0.5})`;
      g.beginPath(); g.ellipse(x, y, w, h, 0.2 + r() * 0.3, 0, 7); g.fill();
    }
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = `rgba(60,40,25,${0.2 + r() * 0.3})`; g.lineWidth = 1 + r() * 3;
      g.beginPath(); const x = r() * n; g.moveTo(x, 0); g.bezierCurveTo(x + 30, n / 3, x - 30, n / 2, x + r() * 40, n); g.stroke();
    }
  }, 1));
}
function checker(base, line) {
  const k = "chk" + base;
  return TEX[k] || (TEX[k] = canvasTex(256, (g, n) => {
    g.fillStyle = base; g.fillRect(0, 0, n, n);
    g.strokeStyle = line; g.lineWidth = 2;
    const s = n / 16;
    for (let i = -16; i <= 32; i++) {
      g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s + n, n); g.stroke();
      g.beginPath(); g.moveTo(i * s, n); g.lineTo(i * s + n, 0); g.stroke();
    }
  }, 2));
}
function swatchBg(t) { return t ? `url(${t._canvas.toDataURL("image/jpeg", 0.7)})` : null; }

/* ---------- finishes ---------- */
const F = {
  stainless: { name: "Stainless", color: "#c3c6ca", metal: 1, rough: 0.28 },
  blued: { name: "Polished Blue", color: "#1c2433", metal: 1, rough: 0.16 },
  black: { name: "Black Cerakote", color: "#1b1b1c", metal: 0.25, rough: 0.6 },
  tan: { name: "Desert Tan Cerakote", color: "#b39874", metal: 0.1, rough: 0.65 },
  colorcase: { name: "Color Case", color: "#ffffff", metal: 0.55, rough: 0.28, map: colorCase },
  nitride: { name: "Black Nitride", color: "#26272a", metal: 1, rough: 0.35 },
  gold: { name: "Gold", color: "#d4a93c", metal: 1, rough: 0.22 },
  walnut: { name: "Walnut", color: "#ffffff", metal: 0, rough: 0.5, map: walnut },
  stag: { name: "Stag", color: "#ffffff", metal: 0, rough: 0.6, map: stag },
  g10: { name: "Black G10, Checkered", color: "#ffffff", metal: 0, rough: 0.7, map: () => checker("#1d1d1f", "#353539") },
  ivory: { name: "Ivory Polymer", color: "#eee4cf", metal: 0, rough: 0.35 },
  cocobolo: { name: "Cocobolo, Checkered", color: "#ffffff", metal: 0, rough: 0.55, map: () => checker("#6b2a14", "#3c1408") },
  sblack: { name: "Plain Black", color: "#111111", metal: 0.3, rough: 0.5 },
  fred: { name: "Red Fiber Optic", color: "#e3221b", metal: 0, rough: 0.3, glow: "#ff2a1a" },
  fgreen: { name: "Green Fiber Optic", color: "#38d14a", metal: 0, rough: 0.3, glow: "#30ff40" },
  bead: { name: "Gold Bead", color: "#d4a93c", metal: 1, rough: 0.22 },
};

const GROUPS = [
  { key: "frame", label: "Frame Finish", parts: ["Frame", "GripSafety"], choices: ["stainless", "blued", "black", "colorcase", "tan"], def: "stainless" },
  { key: "slide", label: "Slide Finish", parts: ["Slide"], choices: ["stainless", "blued", "black", "colorcase", "tan"], def: "stainless" },
  { key: "grips", label: "Grips", parts: ["GripLeft", "GripRight"], choices: ["walnut", "stag", "cocobolo", "g10", "ivory"], def: "walnut" },
  { key: "controls", label: "Hammer and Controls", parts: ["Hammer", "ThumbSafety", "SlideStop", "MagRelease", "MagBase"], choices: ["blued", "stainless", "black", "gold"], def: "blued" },
  { key: "trigger", label: "Trigger", parts: ["Trigger"], choices: ["blued", "stainless", "black", "gold"], def: "blued" },
  { key: "barrel", label: "Barrel and Bushing", parts: ["Barrel", "Bushing"], choices: ["stainless", "nitride", "gold"], def: "stainless" },
  { key: "front", label: "Front Sight", parts: ["FrontSight"], choices: ["sblack", "fred", "fgreen", "bead"], def: "sblack" },
];

/* ---------- state ---------- */
const state = {};
GROUPS.forEach((g) => (state[g.key] = g.def));
try { const saved = JSON.parse(sessionStorage.getItem("tsgBuildState") || "null"); if (saved) GROUPS.forEach((g) => { if (g.choices.includes(saved[g.key])) state[g.key] = saved[g.key]; }); } catch (e) { /* storage blocked */ }

const matCache = {};
function material(id) {
  if (matCache[id]) return matCache[id];
  const f = F[id];
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(f.color), metalness: f.metal, roughness: f.rough, envMapIntensity: 1.1 });
  if (f.map) m.map = f.map();
  if (f.glow) { m.emissive = new THREE.Color(f.glow); m.emissiveIntensity = 0.6; }
  return (matCache[id] = m);
}

/* ---------- options UI ---------- */
function swatchStyle(id) {
  const f = F[id];
  if (f.map) return `background-image:${swatchBg(f.map())}`;
  const shade = f.metal > 0.5 ? `linear-gradient(135deg,rgba(255,255,255,.55),rgba(255,255,255,0) 45%,rgba(0,0,0,.35))` : "none";
  return `background:${shade},${f.color}`;
}
function renderOpts() {
  $("#bld-opts").innerHTML = GROUPS.map((g) => `
    <div class="bld-grp"><h3>${esc(g.label)}<small id="bld-cur-${g.key}">${esc(F[state[g.key]].name)}</small></h3>
      <div class="bld-sw" role="group" aria-label="${esc(g.label)}">${g.choices.map((c) => `<button type="button" data-g="${g.key}" data-c="${c}" aria-pressed="${state[g.key] === c}" title="${esc(F[c].name)}" aria-label="${esc(F[c].name)}"><span style="${swatchStyle(c)}"></span></button>`).join("")}</div>
    </div>`).join("");
}
function summary() {
  return GROUPS.map((g) => `${g.label}: ${F[state[g.key]].name}`);
}
function renderSum() {
  $("#bld-list").innerHTML = GROUPS.map((g) => `<li><b>${esc(g.label)}</b><span>${esc(F[state[g.key]].name)}</span></li>`).join("");
  try {
    sessionStorage.setItem("tsgBuildState", JSON.stringify(state));
    sessionStorage.setItem("tsgBuild", "Build Your 1911\n" + summary().join("\n"));
  } catch (e) { /* storage blocked, quote form just starts empty */ }
}

/* ---------- three.js scene ---------- */
const canvas = $("#bld-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(0.4, 0.6, 0.5); scene.add(key);
const rim = new THREE.DirectionalLight(0xbfd4ff, 0.9); rim.position.set(-0.6, 0.3, -0.5); scene.add(rim);

const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 10);
camera.position.set(0.12, 0.08, 0.5);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 0.22;
controls.maxDistance = 0.9;
controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
controls.autoRotateSpeed = 0.8;
controls.addEventListener("start", () => (controls.autoRotate = false));

const meshes = {};
function applyAll() {
  GROUPS.forEach((g) => g.parts.forEach((p) => (meshes[p] || []).forEach((m) => (m.material = material(state[g.key])))));
}

let fitSize = null;
function fit() {
  if (!fitSize) return;
  const v = THREE.MathUtils.degToRad(camera.fov / 2);
  const hz = Math.atan(Math.tan(v) * camera.aspect);
  const d = Math.max((fitSize.x * 0.72) / Math.tan(hz), (fitSize.y * 0.72) / Math.tan(v));
  const dir = camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(controls.target).addScaledVector(dir, d);
  controls.minDistance = d * 0.45;
  controls.maxDistance = d * 1.8;
}
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  fit();
}
new ResizeObserver(resize).observe(canvas);

new GLTFLoader().load("assets/models/1911.glb", (gltf) => {
  const root = gltf.scene;
  root.traverse((o) => {
    if (!o.isMesh) return;
    // a part can come in as a group of primitives; walk up to the named node
    let n = o; while (n && !GROUPS.some((g) => g.parts.includes(n.name)) && n.parent) n = n.parent;
    const name = n && n.name ? n.name : o.name;
    (meshes[name] = meshes[name] || []).push(o);
  });
  scene.add(root);
  const box = new THREE.Box3().setFromObject(root);
  fitSize = box.getSize(new THREE.Vector3());
  controls.target.copy(box.getCenter(new THREE.Vector3()));
  fit();
  applyAll();
  $("#bld-load").classList.add("done");
}, undefined, () => { $("#bld-load").textContent = "The 3D model could not load. Your picks below still work."; });

renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });

/* ---------- events ---------- */
$("#bld-opts").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-g]");
  if (!b) return;
  state[b.dataset.g] = b.dataset.c;
  b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  $("#bld-cur-" + b.dataset.g).textContent = F[b.dataset.c].name;
  applyAll();
  renderSum();
});
$("#bld-reset").addEventListener("click", () => {
  GROUPS.forEach((g) => (state[g.key] = g.def));
  renderOpts(); renderSum(); applyAll();
});

renderOpts();
renderSum();
