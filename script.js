// Primal Lab Planner - Core Interactions

// ===============================
// ELEMENTS
// ===============================
const grid = document.getElementById("grid");
const drawLayer = document.getElementById("drawLayer");
const equipmentSearch = document.getElementById("search");
const equipmentResults = document.getElementById("results");
const toolButton = document.getElementById("toolButton");
const toolModal = document.getElementById("toolModal");
const structureSearch = document.getElementById("structureSearch");
const structureResults = document.getElementById("structureResults");
const snapToggle = document.getElementById("snapToggle");
const applyScaleBtn = document.getElementById("applyScale");
const roomW = document.getElementById("roomW");
const roomL = document.getElementById("roomL");
const viewButtons = document.querySelectorAll(".view-btn");

const shapeBtn = document.getElementById("customShapeToggle");
const shapePanel = document.getElementById("customShapePanel");
const shapeTabs = document.querySelectorAll(".shape-tab");
const shapeSections = document.querySelectorAll(".shape-section");
const shapeDone = document.getElementById("shapeDone");
const shapeCancel = document.getElementById("shapeCancel");
const shapeName = document.getElementById("shapeName");
const shapeWidth = document.getElementById("shapeWidth");
const shapeLength = document.getElementById("shapeLength");

const freeDrawArea = document.getElementById("freeDrawArea");
const freeDrawCanvas = document.getElementById("freeDrawCanvas");

const clearAllBtn = document.getElementById("clearAllBtn");
const confirmToast = document.getElementById("confirmToast");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

const exportBtn = document.getElementById("exportBtn");
const exportModal = document.getElementById("exportModal");
const exportConfirm = document.getElementById("exportConfirm");
const exportCancel = document.getElementById("exportCancel");
const exportFlooring = document.getElementById("exportFlooring");
const exportStructures = document.getElementById("exportStructures");
const exportEquipment = document.getElementById("exportEquipment");

const toast = document.getElementById("toast");

// ===============================
// STATE
// ===============================
let snapEnabled = true;
let metersPerPixelX = 1;
let metersPerPixelY = 1;
let gridSizePx = 50;
let currentView = "all";
let activeStructureCategory = "structure";

let drawCtx = null;
let drawing = false;
let drawStart = null;
let drawPoints = [];
let lastShape = null;

// ===============================
// DATA
// ===============================
const EQUIPMENT = [
  // ===== FREE WEIGHTS =====
  ["Dumbbells", 2.0, 0.6],
  ["Adjustable dumbbells", 0.6, 0.6],
  ["Pro-style dumbbells", 2.4, 0.7],
  ["Studio dumbbells", 1.5, 0.5],
  ["Olympic barbell", 2.2, 0.45],
  ["Power bar", 2.2, 0.45],
  ["Deadlift bar", 2.3, 0.45],
  ["Weightlifting bar", 2.2, 0.45],
  ["Technique bar", 1.8, 0.45],
  ["EZ curl bar", 1.2, 0.25],
  ["Super curl bar", 1.2, 0.25],
  ["Trap bar", 2.2, 0.75],
  ["Open trap bar", 2.2, 0.75],
  ["Safety squat bar", 2.2, 0.45],
  ["Cambered bar", 2.2, 0.45],
  ["Swiss bar", 2.2, 0.45],
  ["Football bar", 2.2, 0.45],
  ["Axle bar", 2.2, 0.5],
  ["Log bar", 2.0, 1.0],

  // ===== BENCHES =====
  ["Flat bench", 1.2, 0.6],
  ["Competition bench", 1.4, 0.6],
  ["Adjustable bench", 1.4, 0.7],
  ["Heavy-duty adjustable bench", 1.5, 0.75],
  ["Incline bench", 1.4, 0.6],
  ["Decline bench", 1.4, 0.6],
  ["Utility bench", 1.1, 0.5],
  ["Ab bench", 1.4, 0.6],
  ["Nordic bench", 1.6, 0.6],
  ["Seal row bench", 1.6, 0.6],

  // ===== RACKS & FRAMES =====
  ["Power rack", 1.5, 1.5],
  ["6-post power rack", 1.5, 2.4],
  ["Half rack", 1.4, 1.3],
  ["Squat rack", 1.4, 1.2],
  ["Wall-mounted rack", 1.3, 1.2],
  ["Folding rack", 1.3, 1.2],
  ["Monolift", 1.6, 1.5],
  ["Combo rack", 1.6, 1.5],
  ["Smith machine", 2.2, 1.5],
  ["Counterbalanced Smith", 2.2, 1.5],

  // ===== PLATES & STORAGE =====
  ["Bumper plates set", 2.0, 0.6],
  ["Competition bumpers", 2.0, 0.6],
  ["Iron plates set", 2.0, 0.6],
  ["Calibrated plates set", 2.0, 0.6],
  ["Change plates rack", 0.8, 0.4],
  ["Plate tree", 1.0, 1.0],
  ["Horizontal plate rack", 2.0, 0.6],
  ["Vertical plate rack", 1.5, 0.6],
  ["Dumbbell rack", 2.0, 0.6],
  ["3-tier dumbbell rack", 2.4, 0.7],
  ["Kettlebell rack", 1.2, 0.6],
  ["Multi-tier kettlebell rack", 1.8, 0.6],
  ["Medicine ball rack", 1.2, 0.6],
  ["Wall ball rack", 1.2, 0.6],
  ["Barbell vertical storage", 0.6, 0.6],
  ["Barbell horizontal storage", 1.2, 0.4],

  // ===== CABLE & SELECTORISED =====
  ["Cable machine", 2.0, 1.0],
  ["Dual adjustable pulley", 2.2, 1.2],
  ["Functional trainer", 2.2, 1.2],
  ["Cable crossover", 3.5, 1.0],
  ["Lat pulldown", 1.2, 1.0],
  ["Wide lat pulldown", 1.3, 1.0],
  ["Low row machine", 1.2, 1.0],
  ["High row machine", 1.3, 1.0],
  ["Assisted pull-up machine", 1.4, 1.2],
  ["Selectorised tricep pushdown", 1.2, 1.0],

  // ===== UPPER BODY MACHINES =====
  ["Chest press machine", 1.4, 1.2],
  ["Iso-lateral chest press", 1.6, 1.3],
  ["Incline chest press", 1.4, 1.2],
  ["Decline chest press", 1.4, 1.2],
  ["Seated row machine", 1.4, 1.2],
  ["Iso-lateral row", 1.6, 1.3],
  ["Plate-loaded row", 1.8, 1.4],
  ["Shoulder press machine", 1.4, 1.2],
  ["Iso-lateral shoulder press", 1.6, 1.3],
  ["Lateral raise machine", 1.2, 1.0],
  ["Pec deck", 1.5, 1.3],
  ["Rear delt fly", 1.4, 1.2],
  ["Pullover machine", 1.5, 1.2],
  ["Bicep curl machine", 1.2, 1.0],
  ["Preacher curl machine", 1.3, 1.0],
  ["Tricep extension machine", 1.2, 1.0],
  ["Dip assist machine", 1.4, 1.2],

  // ===== LOWER BODY MACHINES =====
  ["Leg press", 2.3, 1.6],
  ["45-degree leg press", 2.5, 1.8],
  ["Horizontal leg press", 2.2, 1.6],
  ["Hack squat", 2.5, 1.6],
  ["Pendulum squat", 2.6, 1.6],
  ["Belt squat", 2.0, 1.5],
  ["Leg extension", 1.3, 1.1],
  ["Seated leg curl", 1.3, 1.1],
  ["Lying leg curl", 1.6, 1.1],
  ["Standing leg curl", 1.2, 1.0],
  ["Hip abductor", 1.3, 1.1],
  ["Hip adductor", 1.3, 1.1],
  ["Glute kickback machine", 1.4, 1.2],
  ["Glute bridge machine", 1.6, 1.3],
  ["Standing calf raise", 1.2, 1.0],
  ["Seated calf raise", 1.2, 1.0],
  ["Donkey calf raise", 1.4, 1.1],

  // ===== STRONGMAN =====
  ["Yoke", 2.5, 1.2],
  ["Farmers carry handles", 1.2, 0.4],
  ["Farmers walk frame", 2.0, 1.0],
  ["Atlas stones", 1.5, 1.5],
  ["Stone loading platform", 1.5, 1.5],
  ["Circus dumbbell", 1.6, 0.6],
  ["Husafell stone", 1.0, 0.8],
  ["Tire flip tire", 2.0, 0.8],
  ["Sled", 1.5, 0.8],
  ["Heavy sled", 2.0, 1.0],

  // ===== CARDIO =====
  ["Treadmill", 2.0, 1.0],
  ["Curved treadmill", 2.0, 0.9],
  ["Incline trainer", 2.2, 1.0],
  ["Rowing machine", 2.4, 0.6],
  ["Water rower", 2.4, 0.6],
  ["Air bike", 1.2, 0.6],
  ["Spin bike", 1.4, 0.6],
  ["Upright bike", 1.2, 0.6],
  ["Recumbent bike", 1.6, 0.8],
  ["Elliptical", 2.0, 0.8],
  ["Cross trainer", 2.0, 0.8],
  ["Stair climber", 1.6, 1.0],
  ["Ski erg", 1.2, 0.6],
  ["Arm ergometer", 1.2, 0.6],

  // ===== FUNCTIONAL / CONDITIONING =====
  ["Kettlebells", 1.2, 0.6],
  ["Competition kettlebells", 1.2, 0.6],
  ["Medicine balls", 1.2, 0.6],
  ["Wall balls", 1.2, 0.6],
  ["Sandbags", 1.2, 0.6],
  ["Bulgarian bags", 1.2, 0.6],
  ["Battle ropes", 5.0, 0.5],
  ["Climbing rope", 4.0, 0.5],
  ["Plyo box", 0.75, 0.75],
  ["Soft plyo box", 0.9, 0.9],
  ["TRX suspension trainer", 0.6, 0.3],
  ["Gymnastic rings", 0.6, 0.3],
  ["Speed ladder", 4.0, 0.5],
  ["Agility hurdles", 1.5, 0.6],
  ["Reaction trainer", 0.6, 0.6],

  // ===== COMBAT / SPORT =====
  ["Heavy boxing bag", 0.6, 0.6],
  ["Uppercut bag", 0.6, 0.6],
  ["Double-end bag", 0.5, 0.5],
  ["Speed bag platform", 1.2, 1.2],
  ["Grappling dummy", 1.5, 0.6],
  ["MMA cage panel", 2.5, 0.1],

  // ===== RECOVERY / REHAB =====
  ["Foam roller rack", 0.8, 0.4],
  ["Massage gun station", 0.6, 0.4],
  ["Stretching mat area", 2.0, 1.0],
  ["Inversion table", 1.4, 0.8],
  ["Compression boots station", 0.8, 0.6],
  ["Cold plunge", 1.5, 0.8],
  ["Sauna", 2.0, 2.0],
  
  // ===== BOXING BAGS =====
  ["Heavy boxing bag", 0.6, 0.6],
  ["Muay Thai heavy bag", 0.6, 0.6],
  ["Uppercut bag", 0.6, 0.6],
  ["Angle bag", 0.6, 0.6],
  ["Teardrop bag", 0.6, 0.6],
  ["Banana bag", 1.8, 0.6],
  ["Body opponent bag", 0.7, 0.7],
  ["Freestanding heavy bag", 0.8, 0.8],
  ["Water-filled heavy bag", 0.7, 0.7],
  ["Aqua training bag", 0.7, 0.7],

  // ===== SPEED & REFLEX =====
  ["Speed bag", 0.3, 0.3],
  ["Speed bag platform", 1.2, 1.2],
  ["Double-end bag", 0.5, 0.5],
  ["Reflex bag", 0.5, 0.5],
  ["Slip bag", 0.3, 0.3],
  ["Cobra reflex bar", 0.5, 0.5],
  ["Reaction ball station", 0.4, 0.4],

  // ===== PADS & TARGETS =====
  ["Focus mitts", 0.5, 0.3],
  ["Thai pads", 0.8, 0.4],
  ["Kick shields", 1.0, 0.6],
  ["Body shields", 1.2, 0.7],
  ["Forearm pads", 0.6, 0.3],
  ["Wall-mounted striking pad", 1.2, 0.6],

  // ===== RINGS & CAGES =====
  ["Boxing ring", 6.0, 6.0],
  ["Training boxing ring", 5.0, 5.0],
  ["MMA cage", 7.0, 7.0],
  ["Training MMA cage", 5.0, 5.0],
  ["Cage wall panel", 2.5, 0.1],
  ["Cage door section", 1.2, 0.1],
  ["Ring corner stool", 0.6, 0.6],

  // ===== FLOORING & MATS =====
  ["Tatami mats", 2.0, 2.0],
  ["Roll-out grappling mats", 10.0, 2.0],
  ["Wrestling mat", 9.0, 9.0],
  ["Judo mat", 2.0, 2.0],
  ["Wall padding", 2.0, 0.1],
  ["Cage wall padding", 2.5, 0.1],

  // ===== GRAPPLING & WRESTLING =====
  ["Grappling dummy", 1.5, 0.6],
  ["Throwing dummy", 1.6, 0.7],
  ["Wrestling dummy", 1.6, 0.7],
  ["Takedown shield", 1.2, 0.6],
  ["Wall wrestling pad", 2.0, 0.6],
  ["Clinch wall", 3.0, 0.2],

  // ===== BJJ =====
  ["BJJ mat space", 6.0, 6.0],
  ["Gi drying rack", 1.5, 0.6],
  ["Belt display rack", 1.2, 0.3],
  ["Grip training board", 1.2, 0.3],
  ["Finger strength board", 1.2, 0.3],

  // ===== CONDITIONING =====
  ["Jump ropes station", 1.2, 0.4],
  ["Weighted jump ropes", 1.2, 0.4],
  ["Agility ladder", 4.0, 0.5],
  ["Agility hurdles", 1.5, 0.6],
  ["Battle ropes", 5.0, 0.5],
  ["Sledgehammer station", 1.5, 1.5],
  ["Tire flip tire", 2.0, 0.8],
  ["Sled", 1.5, 0.8],
  ["Pull-up rig", 2.5, 1.2],

  // ===== STRENGTH (COMBAT-FOCUSED) =====
  ["Landmine station", 1.5, 0.6],
  ["Grip rollers", 1.2, 0.4],
  ["Thick grip bars", 1.2, 0.4],
  ["Neck harness station", 0.8, 0.8],
  ["Neck training bench", 1.4, 0.6],
  ["Wrist roller station", 1.2, 0.4],

  // ===== COACHING & ANALYSIS =====
  ["Coach corner", 2.0, 2.0],
  ["Video replay screen", 1.5, 0.1],
  ["Fight timer display", 0.6, 0.2],
  ["Round timer clock", 0.6, 0.2],
  ["Strategy whiteboard", 1.2, 0.05],

  // ===== RECOVERY =====
  ["Ice bath", 1.5, 0.8],
  ["Cold plunge", 1.5, 0.8],
  ["Foam roller station", 1.2, 0.6],
  ["Massage table", 2.0, 0.8],
  ["Stretching mat area", 2.0, 1.0],
  ["Breathwork zone", 2.0, 2.0],

  // ===== STORAGE =====
  ["Glove storage rack", 1.5, 0.6],
  ["Headgear storage", 1.2, 0.6],
  ["Shin guard rack", 1.2, 0.6],
  ["Mouthguard station", 0.6, 0.4],
  ["Towel station", 0.6, 0.4],

  // ===== EVENT / FIGHT NIGHT =====
  ["Judges table", 2.0, 0.8],
  ["Announcer table", 2.0, 0.8],
  ["Lighting rig", 3.0, 3.0],
  ["Walkout tunnel", 4.0, 1.5],
  ["Backdrop wall", 3.0, 0.2]
];

const FLOORING = [
  ["Rubber floor mats", 2.0, 2.0],
  ["Interlocking tiles", 2.0, 2.0],
  ["Heavy-duty rubber rolls", 10.0, 1.5],
  ["Lifting platform", 3.0, 2.5],
  ["Deadlift platform", 2.5, 2.0],
  ["Olympic platform", 4.0, 3.0],
  ["Turf strip", 15.0, 1.5],
  ["Sprint track turf", 20.0, 2.0],
  ["Sled track", 25.0, 2.0],
  ["Shock-absorbing tiles", 2.0, 2.0],
  ["Tatami mats", 2.0, 2.0]
];

const STRUCTURES = [
  ["Wall mirror", 1.8, 0.06],
  ["Mirror wall section", 3.0, 0.06],
  ["Full mirror wall", 6.0, 0.06],
  ["Wall clock", 0.35, 0.08],
  ["Digital clock", 0.5, 0.1],
  ["Door", 0.82, 0.1],
  ["Double door", 1.6, 0.1],
  ["Roller door", 3.0, 0.2],
  ["Window", 1.2, 0.1],
  ["Floor-to-ceiling window", 2.5, 0.1],
  ["Shelving unit", 1.8, 0.45],
  ["Storage cabinet", 1.2, 0.6],
  ["Equipment cage", 2.0, 2.0],
  ["Locker unit", 2.0, 0.6],
  ["Bench seating", 1.5, 0.5],
  ["Reception desk", 2.0, 0.8],
  ["POS terminal", 0.5, 0.4],
  ["Retail display", 1.2, 0.6],
  ["Towel station", 0.6, 0.4],
  ["Laundry unit", 1.2, 0.8],
  ["Water cooler", 0.4, 0.4],
  ["Bottle refill station", 0.6, 0.4],
  ["TV display", 1.2, 0.08],
  ["LED video wall", 3.0, 0.1],
  ["Digital leaderboard", 1.5, 0.1],
  ["Whiteboard", 1.2, 0.05],
  ["Coach desk", 1.5, 0.7],
  ["Speaker system", 0.3, 0.3],
  ["Subwoofer", 0.6, 0.6],
  ["Wall fan", 0.7, 0.4],
  ["Industrial fan", 1.0, 1.0],
  ["Air conditioning unit", 0.9, 0.4],
  ["HVAC ducting", 2.0, 0.6],
  ["First aid station", 0.6, 0.3],
  ["AED", 0.4, 0.3],
  ["Fire extinguisher", 0.3, 0.2],
  ["Emergency exit sign", 0.5, 0.1]
];


const FLOORING_NAMES = new Set(FLOORING.map(([name]) => name));

// ===============================
// HELPERS
// ===============================
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 200);
  }, 2000);
}

function syncGridScale() {
  if (!grid) return;
  const wrap = grid.parentElement;
  if (!wrap) return;

  const roomWidth = Math.max(0.1, Number(roomW.value) || 1);
  const roomLength = Math.max(0.1, Number(roomL.value) || 1);
  const ratio = roomWidth / roomLength;

  const padding = 40;
  const maxWidth = Math.max(200, wrap.clientWidth - padding);
  const maxHeight = Math.max(200, wrap.clientHeight - padding);

  let width = maxWidth;
  let height = Math.round(maxWidth / ratio);
  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(maxHeight * ratio);
  }

  grid.style.setProperty("--grid-w", `${width}px`);
  grid.style.setProperty("--grid-h", `${height}px`);

  metersPerPixelX = roomWidth / width;
  metersPerPixelY = roomLength / height;
  gridSizePx = width / roomWidth;
  grid.style.setProperty("--grid-size", `${gridSizePx}px`);

  drawLayer.width = grid.clientWidth;
  drawLayer.height = grid.clientHeight;

  document.querySelectorAll(".equipment").forEach(resize);
}

function resize(el) {
  el.style.width = (el.dataset.w / metersPerPixelX) + "px";
  el.style.height = (el.dataset.h / metersPerPixelY) + "px";
}

function setPosition(el, x, y) {
  if (snapEnabled) {
    x = Math.round(x / gridSizePx) * gridSizePx;
    y = Math.round(y / gridSizePx) * gridSizePx;
  }
  el.style.left = x + "px";
  el.style.top = y + "px";
  clamp(el);
}

function clamp(el) {
  const g = grid.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  let dx = 0, dy = 0;
  if (r.left < g.left) dx = g.left - r.left;
  if (r.right > g.right) dx = g.right - r.right;
  if (r.top < g.top) dy = g.top - r.top;
  if (r.bottom > g.bottom) dy = g.bottom - r.bottom;
  el.style.left = (el.offsetLeft + dx) + "px";
  el.style.top = (el.offsetTop + dy) + "px";
}

function applyLayerStyles(el) {
  const layer = el.dataset.layer || "equipment";
  if (layer === "flooring") el.style.zIndex = "1";
  else if (layer === "structure") el.style.zIndex = "5";
  else el.style.zIndex = "10";
}

function applyViewFilter() {
  document.querySelectorAll(".equipment").forEach((el) => {
    const layer = el.dataset.layer || "equipment";
    const show = currentView === "all" || currentView === layer;
    el.style.display = show ? "block" : "none";
  });
}

// ===============================
// SPAWN + RESULTS
// ===============================
function createResult({ name, w, h, layer }) {
  const item = document.createElement("div");
  item.className = "result";
  item.textContent = `${name} (${w}m × ${h}m)`;
  item.draggable = true;
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("item", JSON.stringify({ name, w, h, layer }));
  });
  return item;
}

function spawn(name, w, h, x, y, layer = "equipment") {
  const el = document.createElement("div");
  el.className = "equipment";
  el.dataset.name = name;
  el.dataset.w = w;
  el.dataset.h = h;
  el.dataset.layer = layer;
  el.dataset.locked = "false";

  el.innerHTML = `
    <div class="rotate">⟳</div>
    <div class="lock">🔓</div>
    <div class="label">${name}</div>
  `;

  applyLayerStyles(el);
  resize(el);
  grid.appendChild(el);
  setPosition(el, x - el.offsetWidth / 2, y - el.offsetHeight / 2);
  bind(el);
  applyViewFilter();
  return el;
}

// ===============================
// INTERACTIONS
// ===============================
function bind(el) {
  enableDrag(el);
  enableRotate(el);
  enableLock(el);

  el.oncontextmenu = (e) => {
    e.preventDefault();
    if (el.dataset.locked === "true") return;
    el.remove();
  };
}

function enableDrag(el) {
  el.onmousedown = (e) => {
    if (el.dataset.locked === "true") return;
    if (e.target.classList.contains("rotate")) return;
    if (e.target.classList.contains("lock")) return;

    const sx = e.clientX;
    const sy = e.clientY;
    const ox = el.offsetLeft;
    const oy = el.offsetTop;

    document.onmousemove = (ev) => {
      setPosition(el, ox + ev.clientX - sx, oy + ev.clientY - sy);
    };
    document.onmouseup = () => {
      document.onmousemove = null;
    };
  };
}

function enableRotate(el) {
  const handle = el.querySelector(".rotate");
  handle.onmousedown = (e) => {
    e.stopPropagation();
    if (el.dataset.locked === "true") return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const snapStep = 45;
    const snapThreshold = 8;

    document.onmousemove = (ev) => {
      let angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;
      if (angle < 0) angle += 360;
      const snapped = Math.round(angle / snapStep) * snapStep;
      if (Math.abs(angle - snapped) <= snapThreshold) {
        angle = snapped;
      }
      el.style.transform = `rotate(${angle}deg)`;
      clamp(el);
    };
    document.onmouseup = () => {
      document.onmousemove = null;
    };
  };
}

function enableLock(el) {
  const lock = el.querySelector(".lock");
  lock.onmousedown = (e) => {
    e.stopPropagation();
    const locked = el.dataset.locked === "true";
    el.dataset.locked = (!locked).toString();
    lock.textContent = locked ? "🔓" : "🔒";
    el.classList.toggle("locked", !locked);
  };
}

// ===============================
// SEARCH
// ===============================
equipmentSearch?.addEventListener("input", () => {
  equipmentResults.innerHTML = "";
  const q = equipmentSearch.value.trim().toLowerCase();
  if (!q) return;

  EQUIPMENT.filter(([name]) => name.toLowerCase().includes(q))
    .forEach(([name, w, h]) => {
      const layer = FLOORING_NAMES.has(name) ? "flooring" : "equipment";
      equipmentResults.appendChild(createResult({ name, w, h, layer }));
    });
});

structureSearch?.addEventListener("input", () => {
  structureResults.innerHTML = "";
  const q = structureSearch.value.trim().toLowerCase();
  if (!q) return;

  const list = activeStructureCategory === "flooring" ? FLOORING : STRUCTURES;
  const layer = activeStructureCategory === "flooring" ? "flooring" : "structure";

  list.filter(([name]) => name.toLowerCase().includes(q))
    .forEach(([name, w, h]) => {
      structureResults.appendChild(createResult({ name, w, h, layer }));
    });
});

// ===============================
// GRID DROP
// ===============================
grid.addEventListener("dragover", (e) => e.preventDefault());

grid.addEventListener("drop", (e) => {
  e.preventDefault();
  const raw = e.dataTransfer.getData("item");
  if (!raw) return;
  const { name, w, h, layer } = JSON.parse(raw);
  spawn(name, w, h, e.offsetX, e.offsetY, layer);
});

// ===============================
// UI CONTROLS
// ===============================
snapToggle.onclick = () => {
  snapEnabled = !snapEnabled;
  snapToggle.classList.toggle("active", snapEnabled);
  showToast(snapEnabled ? "Snap enabled" : "Snap disabled");
};

applyScaleBtn.onclick = () => {
  syncGridScale();
  showToast("Scale updated");
};

viewButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    viewButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentView = btn.dataset.view || "all";
    applyViewFilter();
  });
});

// Tool modal
const toolTabs = document.querySelectorAll(".tool-tab");
const structurePlaceholder = "Search structures…";
const flooringPlaceholder = "Search flooring…";

toolTabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.stopPropagation();
    toolTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeStructureCategory = tab.dataset.category || "structure";
    structureSearch.value = "";
    structureResults.innerHTML = "";
    structureSearch.placeholder = activeStructureCategory === "flooring"
      ? flooringPlaceholder
      : structurePlaceholder;
  });
});

toolButton.onclick = (e) => {
  e.stopPropagation();
  toolModal.classList.toggle("hidden");
};

toolModal.onclick = (e) => e.stopPropagation();

// Custom shape panel
shapeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  shapePanel.classList.toggle("hidden");
  setupFreeDraw();
});

shapePanel?.addEventListener("click", (e) => e.stopPropagation());

document.addEventListener("click", () => {
  toolModal.classList.add("hidden");
  shapePanel.classList.add("hidden");
});

shapeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    shapeTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const mode = tab.dataset.mode;
    shapeSections.forEach((section) => {
      section.classList.toggle("hidden", section.dataset.mode !== mode);
    });
    if (mode === "free") {
      setupFreeDraw();
    }
  });
});

shapeDone?.addEventListener("click", () => {
  const activeMode = document.querySelector(".shape-tab.active")?.dataset.mode || "dimensions";

  if (activeMode === "dimensions") {
    const w = Number(shapeWidth.value);
    const h = Number(shapeLength.value);
    const name = shapeName.value.trim() || "Custom";
    if (!w || !h) {
      showToast("Enter width and length");
      return;
    }
    spawn(name, w, h, grid.clientWidth / 2, grid.clientHeight / 2, "structure");
  } else if (lastShape) {
    const name = shapeName.value.trim() || "Custom Shape";
    if (lastShape.type === "circle") {
      const diameterPx = lastShape.r * 2;
      const w = diameterPx * metersPerPixelX;
      const h = diameterPx * metersPerPixelY;
      const el = spawn(
        name,
        w,
        h,
        lastShape.cx,
        lastShape.cy,
        "structure"
      );
      if (el) el.style.borderRadius = "50%";
    } else {
      const w = lastShape.w * metersPerPixelX;
      const h = lastShape.h * metersPerPixelY;
      spawn(
        name,
        w,
        h,
        lastShape.x + lastShape.w / 2,
        lastShape.y + lastShape.h / 2,
        "structure"
      );
    }
  }

  shapeName.value = "";
  shapeWidth.value = "";
  shapeLength.value = "";
  clearFreeDraw();
  shapePanel.classList.add("hidden");
});

shapeCancel?.addEventListener("click", () => {
  shapeName.value = "";
  shapeWidth.value = "";
  shapeLength.value = "";
  clearFreeDraw();
  shapePanel.classList.add("hidden");
});

// Free draw (simple rectangle)
function setupFreeDraw() {
  if (!freeDrawCanvas || !freeDrawArea) return;
  freeDrawCanvas.width = freeDrawArea.clientWidth;
  freeDrawCanvas.height = freeDrawArea.clientHeight;
  drawCtx = freeDrawCanvas.getContext("2d");
}

function clearFreeDraw() {
  lastShape = null;
  drawPoints = [];
  if (drawCtx) drawCtx.clearRect(0, 0, freeDrawCanvas.width, freeDrawCanvas.height);
}

freeDrawCanvas?.addEventListener("mousedown", (e) => {
  drawing = true;
  const rect = freeDrawCanvas.getBoundingClientRect();
  drawStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  drawPoints = [drawStart];
});

freeDrawCanvas?.addEventListener("mousemove", (e) => {
  if (!drawing || !drawCtx) return;
  const rect = freeDrawCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  drawPoints.push({ x, y });

  drawCtx.clearRect(0, 0, freeDrawCanvas.width, freeDrawCanvas.height);
  drawCtx.strokeStyle = "#ffffff";
  drawCtx.lineWidth = 2;
  drawCtx.setLineDash([]);
  drawCtx.beginPath();
  drawCtx.moveTo(drawPoints[0].x, drawPoints[0].y);
  drawPoints.forEach((p) => drawCtx.lineTo(p.x, p.y));
  drawCtx.stroke();
});

freeDrawCanvas?.addEventListener("mouseup", () => {
  drawing = false;
  if (!drawCtx || drawPoints.length < 6) return;
  lastShape = snapFreeDraw(drawPoints);
  drawCtx.clearRect(0, 0, freeDrawCanvas.width, freeDrawCanvas.height);
  if (lastShape) {
    drawCtx.strokeStyle = "#ffffff";
    drawCtx.lineWidth = 2;
    drawCtx.setLineDash([6, 4]);
    if (lastShape.type === "circle") {
      drawCtx.beginPath();
      drawCtx.arc(lastShape.cx, lastShape.cy, lastShape.r, 0, Math.PI * 2);
      drawCtx.stroke();
    } else {
      drawCtx.strokeRect(lastShape.x, lastShape.y, lastShape.w, lastShape.h);
    }
    drawCtx.setLineDash([]);
  }
});

freeDrawCanvas?.addEventListener("mouseleave", () => {
  drawing = false;
});

function snapFreeDraw(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  points.forEach((p) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });
  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 6 || h < 6) return null;

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const aspect = w / h;
  const nearSquare = aspect > 0.85 && aspect < 1.15;

  // Circle score (lower is better)
  const radii = points.map((p) => Math.hypot(p.x - cx, p.y - cy));
  const rAvg = radii.reduce((a, b) => a + b, 0) / radii.length;
  const rVar = Math.sqrt(
    radii.reduce((a, b) => a + Math.pow(b - rAvg, 2), 0) / radii.length
  );
  const rScore = (rVar / rAvg) + (nearSquare ? 0 : 0.15);

  // Rectangle score
  const rectEdgeRatio = edgeHitRatio(points, minX, minY, maxX, maxY);
  const rectScore = 1 - rectEdgeRatio;

  // Triangle score (check two orientations)
  const candidates = [
    { type: "circle", score: rScore, data: { type: "circle", cx, cy, r: rAvg } },
    { type: "rect", score: rectScore, data: { type: "rect", x: minX, y: minY, w, h } }
  ];

  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];

  // Confidence thresholds
  if (best.type === "circle" && best.score <= 0.12 && nearSquare) return best.data;
  if (best.type === "rect" && best.score <= 0.45) {
    if (nearSquare) {
      const size = Math.max(w, h);
      const sx = cx - size / 2;
      const sy = cy - size / 2;
      return { type: "rect", x: sx, y: sy, w: size, h: size };
    }
    return best.data;
  }

  // Fallback rectangle
  return { type: "rect", x: minX, y: minY, w, h };
}

function edgeHitRatio(points, minX, minY, maxX, maxY) {
  const w = maxX - minX;
  const h = maxY - minY;
  const edgeTol = Math.max(6, Math.min(w, h) * 0.1);
  let edgeHits = 0;
  points.forEach((p) => {
    const distLeft = Math.abs(p.x - minX);
    const distRight = Math.abs(p.x - maxX);
    const distTop = Math.abs(p.y - minY);
    const distBottom = Math.abs(p.y - maxY);
    const nearEdge = Math.min(distLeft, distRight, distTop, distBottom) <= edgeTol;
    if (nearEdge) edgeHits += 1;
  });
  return edgeHits / points.length;
}


function pointLineDistance(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

// Clear all
clearAllBtn?.addEventListener("click", () => {
  confirmToast.classList.remove("hidden");
});

confirmYes?.addEventListener("click", () => {
  grid.innerHTML = "";
  confirmToast.classList.add("hidden");
});

confirmNo?.addEventListener("click", () => {
  confirmToast.classList.add("hidden");
});

// Export
exportBtn?.addEventListener("click", () => {
  exportModal.classList.remove("hidden");
  exportModal.setAttribute("aria-hidden", "false");
});

exportCancel?.addEventListener("click", () => {
  exportModal.classList.add("hidden");
  exportModal.setAttribute("aria-hidden", "true");
});

exportConfirm?.addEventListener("click", () => {
  const selected = new Set();
  if (exportFlooring?.checked) selected.add("flooring");
  if (exportStructures?.checked) selected.add("structure");
  if (exportEquipment?.checked) selected.add("equipment");
  if (selected.size === 0) {
    showToast("Select at least one layer");
    return;
  }
  exportModal.classList.add("hidden");
  exportModal.setAttribute("aria-hidden", "true");
  runExport(selected);
});

function runExport(selectedLayers) {
  const canvas = document.createElement("canvas");
  canvas.width = 2200;
  canvas.height = 1400;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const margin = 140;
  const gx = margin;
  const gy = margin;
  const gw = canvas.width - margin * 2;
  const gh = canvas.height - margin * 2;

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;
  ctx.strokeRect(gx, gy, gw, gh);

  const rect = grid.getBoundingClientRect();
  const sx = gw / rect.width;
  const sy = gh / rect.height;

  const items = [];
  document.querySelectorAll(".equipment").forEach((el) => {
    const layer = el.dataset.layer || "equipment";
    if (!selectedLayers.has(layer)) return;
    const r = el.getBoundingClientRect();
    items.push({
      name: el.dataset.name || "Item",
      x: gx + (r.left - rect.left) * sx,
      y: gy + (r.top - rect.top) * sy,
      w: r.width * sx,
      h: r.height * sy
    });
  });

  items.forEach((it) => {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(it.x, it.y, it.w, it.h);
    ctx.font = "12px monospace";
    ctx.fillStyle = "#000";
    ctx.fillText(it.name, it.x + 6, it.y + 16);
  });

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "primal-lab-layout.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Init
syncGridScale();
setupFreeDraw();
window.addEventListener("resize", () => {
  syncGridScale();
  setupFreeDraw();
});
