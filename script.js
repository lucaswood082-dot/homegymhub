document.addEventListener("DOMContentLoaded", () => {
  const shapeDone = document.getElementById("shapeDone");
const shapeCancel = document.getElementById("shapeCancel");
const shapeWidth = document.getElementById("shapeWidth");
const shapeLength = document.getElementById("shapeLength");
const shapeName = document.getElementById("shapeName");


shapeDone.onclick = e => {
  e.stopPropagation();
  showToast("Shape added");

  // ===============================
  // FREE DRAW SHAPE
  // ===============================
  if (lastSnappedShape) {
    let w, h;

    if (lastSnappedShape.type === "circle") {
      const diameterPx = lastSnappedShape.r * 2;
    
      // convert pixels → meters independently
      w = diameterPx * metersPerPixelX;
      h = diameterPx * metersPerPixelY;
    
    }

    if (lastSnappedShape.type === "rect") {
      w = lastSnappedShape.w * metersPerPixelX;
      h = lastSnappedShape.h * metersPerPixelY;
    }

    const name =
      shapeName.value.trim() ||
      (lastSnappedShape.type === "circle"
        ? "Custom Circle"
        : "Custom Shape");

    const el = spawn(
      name,
      w,
      h,
      grid.clientWidth / 2,
      grid.clientHeight / 2
    );

    // 👇 MAKE CIRCLES LOOK LIKE CIRCLES
    if (lastSnappedShape.type === "circle") {
      el.style.borderRadius = "50%";
    }

    // cleanup
    lastSnappedShape = null;
    freeCtx.clearRect(0, 0, freeCanvas.width, freeCanvas.height);
    shapeName.value = "";

    document.getElementById("customShapePanel").classList.add("hidden");
    return;
  }

  // ===============================
  // DIMENSIONS MODE
  // ===============================
  const w = Number(shapeWidth.value);
  const h = Number(shapeLength.value);
  const name = shapeName.value.trim() || "Custom";

  if (!w || !h) {
    showToast("Enter width and length");
    return;
  }

  spawn(
    name,
    w,
    h,
    grid.clientWidth / 2,
    grid.clientHeight / 2
  );

  shapeName.value = "";
  shapeWidth.value = "";
  shapeLength.value = "";

  document.getElementById("customShapePanel").classList.add("hidden");
};



/* =====================================================
   CORE ELEMENTS
===================================================== */


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


const GRID_SIZE = 50;
let snapEnabled = true;

let metersPerPixelX = roomW.value / grid.clientWidth;
let metersPerPixelY = roomL.value / grid.clientHeight;


drawLayer.width = grid.clientWidth;
drawLayer.height = grid.clientHeight;


/* =====================================================
   EQUIPMENT DATABASE
===================================================== */

const EQUIPMENT = [
  // Dumbbells & free weights
  ["Dumbbells",2,0.6],["Adjustable dumbbells",2,0.6],["Fixed dumbbells",2,0.6],
  ["Hex dumbbells",2,0.6],["Rubber dumbbells",2,0.6],
  ["Kettlebells",1.8,0.6],["Adjustable kettlebells",1.8,0.6],
  ["Competition kettlebells",1.8,0.6],
  ["Medicine balls",1.2,0.6],["Slam balls",1.2,0.6],
  ["Wall balls",1.2,0.6],["Sandbags",1.2,0.6],
  ["Bulgarian bags",1.2,0.6],["Steel maces",1.2,0.6],
  ["Clubbells",1.2,0.6],["Weighted vests",0.6,0.6],

  // Barbells
  ["Olympic barbell",2.2,0.3],["Power barbell",2.2,0.3],
  ["Deadlift bar",2.3,0.3],["Trap bar",2.1,0.8],
  ["Hex bar",2.1,0.8],["EZ curl bar",1.2,0.3],
  ["Swiss bar",2.1,0.4],["Cambered bar",2.2,0.5],
  ["Safety squat bar",2.2,0.5],["Axle bar",2.2,0.4],
  ["Technique bar",1.8,0.3],["Fixed weight barbells",2.2,0.4],

  // Plates
  ["Bumper plates",1.2,0.6],["Rubber plates",1.2,0.6],
  ["Cast iron plates",1.2,0.6],["Fractional plates",0.6,0.4],
  ["Change plates",0.8,0.4],

  // Benches
  ["Flat bench",1.2,0.6],["Adjustable bench",1.4,0.7],
  ["Incline bench",1.4,0.7],["Decline bench",1.4,0.7],
  ["FID bench",1.4,0.7],["Olympic bench",1.9,1.2],
  ["Competition bench",1.9,1.2],["Utility bench",1.2,0.6],
  ["Ab bench",1.4,0.6],["Sit-up bench",1.4,0.6],

  // Racks & machines
  ["Power rack",1.5,1.5],["Half rack",1.4,1.3],
  ["Squat rack",1.4,1.2],["Wall-mounted squat rack",1.3,1.2],
  ["Folding squat rack",1.3,1.2],["Smith machine",2.2,1.5],
  ["Monolift",2,1.5],["Cage rack",1.6,1.6],
  ["Pull-up rig",3,1.2],
  ["Functional trainer",2,1],["Cable machine",2,1],
  ["Dual adjustable pulley machine",2,1],
  ["Cable crossover machine",2.5,1],
  ["Lat pulldown machine",1.2,1],
  ["Low row machine",1.2,1],
  

  // Strength machines
  ["Chest press machine",1.6,1.5],["Incline chest press machine",1.6,1.5],
  ["Shoulder press machine",1.6,1.5],
  ["Seated row machine",1.6,1.5],["Iso-lateral row machine",1.8,1.5],
  ["Pec deck machine",1.6,1.5],["Rear delt fly machine",1.6,1.5],
  ["Assisted pull-up machine",1.6,1.5],["Dip machine",1.6,1.2],
  ["Bicep curl machine",1.4,1.2],["Tricep extension machine",1.4,1.2],

  // Leg machines
  ["Leg press machine",2.5,2],["Hack squat machine",2.3,2],
  ["Pendulum squat",2.4,2],
  ["Belt squat machine",1.8,1.5],
  ["Leg extension machine",1.6,1.2],
  ["Seated leg curl machine",1.6,1.2],
  ["Lying leg curl machine",1.8,1.2],
  ["Standing leg curl machine",1.4,1.2],

  // Glutes & posterior
  ["Hip thrust machine",1.8,1.5],["Glute bridge machine",1.8,1.5],
  ["Hip abductor machine",1.6,1.2],["Hip adductor machine",1.6,1.2],
  ["Calf raise machine",1.4,1.2],["Donkey calf raise machine",1.6,1.4],
  ["Back extension machine",1.6,1.2],["Roman chair",1.6,1.2],
  ["Reverse hyper machine",1.8,1.4],
  ["GHD machine",1.8,1.4],

  // Core
  ["Ab crunch machine",1.4,1.2],["Rotary torso machine",1.6,1.4],

  // Multi gyms
  ["Multi-station home gym",3,2],
  ["Selectorized home gym",3,2],
  ["Plate-loaded machines",2,1.5],

  // Cardio
  ["Treadmill",2,1],["Manual treadmill",2,1],
  ["Incline treadmill",2,1],["Air runner treadmill",2,1],
  ["Curved treadmill",2,1],
  ["Elliptical",2,0.8],["Upright bike",1.2,0.6],
  ["Recumbent bike",1.5,0.8],["Spin bike",1.2,0.6],
  ["Air bike",1.2,0.6],["Fan bike",1.2,0.6],
  ["Rowing machine",2.4,0.6],["Ski erg machine",1.2,0.6],
  ["Stair climber",1.2,1.2],["Stepmill",1.2,1.2],
  ["Mini stepper",1,0.6],

  // Functional / strongman
  ["Plyometric boxes",1.2,1.2],["Soft plyometric boxes",1.2,1.2],
  ["Wood plyo boxes",1.2,1.2],["Stackable plyo boxes",1.2,1.2],
  ["Battle rope anchor machine",1.2,1.2],
  ["Power sled",1.5,1],["Weight sled",1.5,1],
  ["Push sled",1.5,1],["Pull sled",1.5,1],
  ["Tire sled",1.6,1],
  ["Farmers walk frame",1.5,1],
  ["Farmers carry handles",1.2,0.6],
  ["Yoke carry frame",2.5,1.2],
  ["Strongman log",2.2,0.6],
  ["Atlas stones",1.5,1.5],
  ["Stone loading platform",2,2],
  ["Tire flip tire",1.8,1.8],
  ["Tire hammer station",2,2],

  // Gymnastics / boxing
  ["Parallettes bars",1.2,0.6],
  ["Gymnastics ring frame",2,1.2],
  ["Dip station",1.2,1],
  ["Pull-up tower",1.4,1.2],
  ["Captain’s chair",1.2,1],
  ["Vertical knee raise station",1.2,1],
  ["Free-standing punching bag",1.2,1.2],
  ["Heavy bag stand",1.5,1.5],
  ["Speed bag platform",1.2,1.2],
  ["Boxing dummy",1.2,1.2],
  ["Boxing bag",1,1],
  ["Boxing wall mount",1,1],

  // Misc
  ["Resistance stair machine",1.2,1.2],
  ["Climbing rope frame",2,1.2],
  ["Peg board wall",2,0.3],
  ["Monkey bar rig",3,1.5],
  ["Agility frame",2,2],
  ["Sprint track sled",2,1],

  // Platforms & flooring
  ["Weightlifting platform",3,2.5],
  ["Deadlift platform",3,2],
  ["Lifting stage",4,3],
  ["Rubber gym flooring",2,2],
  ["Interlocking gym mats",2,2],
  ["Horse stall mats",2,2],
  ["Mirror wall panels",2,0.2],

  // Storage
  ["Storage cage",2,1.5],
  ["Dumbbell rack",2,0.6],
  ["Barbell rack",1.2,0.6],
  ["Plate tree",1,1],
  ["Kettlebell rack",1.8,0.6],
  ["Medicine ball rack",1.8,0.6],
  ["Multi-storage rack",2,0.8],
  ["Corner storage unit",1,1],
  ["Wall storage system",2,0.4]
];

const STRUCTURES = [

/* ================= FLOORING ================= */
["Rubber floor mats", 2.0, 2.0],
["Foam tiles", 2.0, 2.0],
["Lifting platform", 3.0, 2.5],
["Plywood sheets", 2.4, 1.2],

/* ================= WALL & VISUAL ================= */
["Wall mirrors", 1.8, 0.06],
["Full-length mirror", 0.45, 0.06],
["Wall art / posters", 1.0, 0.06],
["Motivational signs", 0.8, 0.06],
["Chalkboard / notice board", 1.2, 0.08],
["Whiteboard", 1.2, 0.08],

/* ================= CLOCKS & TIMERS ================= */
["Wall clock", 0.35, 0.08],
["Digital timer / clock", 0.45, 0.08],

/* ================= LIGHTING ================= */
["Ceiling lights", 0.6, 0.6],
["LED strip lighting", 1.0, 0.05],
["Ring light", 0.6, 0.6],
["Softbox lights", 0.7, 0.7],
["Motion sensor lights", 0.4, 0.3],

/* ================= AUDIO / MEDIA ================= */
["Wall-mounted TV", 1.4, 0.1],
["Sound system (speakers)", 0.6, 0.4],
["Subwoofer", 0.4, 0.4],
["Streaming device / remote", 0.3, 0.2],

/* ================= POWER & ELECTRICAL ================= */
["Power boards", 0.35, 0.15],
["Extension leads / reels", 0.45, 0.45],
["Wall outlets", 0.25, 0.08],
["Charging hub / cables", 0.3, 0.2],
["Electrical junction box", 0.3, 0.3],

/* ================= DOORS & WINDOWS ================= */
["Single door", 0.82, 0.1],
["Double door", 1.6, 0.1],
["Sliding door", 1.8, 0.1],
["Windows", 1.2, 0.1],
["Blinds / curtains", 1.5, 0.08],

/* ================= CLIMATE / AIR ================= */
["Air conditioner", 0.9, 0.3],
["Portable heater", 0.45, 0.45],
["Fan (portable)", 0.45, 0.45],
["Ventilation / exhaust fan", 0.4, 0.4],
["Dehumidifier / purifier", 0.45, 0.35],

/* ================= STORAGE ================= */
["Shelving units", 1.8, 0.45],
["Wall shelves", 1.2, 0.3],
["Cabinets (lockable)", 1.0, 0.55],
["Tool chest", 0.75, 0.5],
["Storage bins & tubs", 0.6, 0.4],
["Overhead storage rack", 2.0, 1.0],

/* ================= CLEANING ================= */
["Shop vacuum", 0.55, 0.55],
["Cleaning station", 0.6, 0.4],
["Bins (rubbish/recycling)", 0.45, 0.45],

/* ================= WORK / OFFICE ================= */
["Desk", 1.4, 0.7],
["Workbench", 1.8, 0.75],
["Office chair", 0.6, 0.6],
["Stool / folding chair", 0.45, 0.45],
["Ladder (stored)", 0.6, 0.8],

/* ================= TOOLS & HARDWARE ================= */
["Toolbox", 0.55, 0.35],
["Hand tools set", 0.5, 0.35],
["Power tools", 0.6, 0.4],
["Fasteners & fixings", 0.4, 0.3],

/* ================= SAFETY ================= */
["Fire extinguisher", 0.3, 0.2],
["Fire blanket", 0.3, 0.2],
["First aid kit", 0.35, 0.25],
["Smoke / CO detector", 0.25, 0.25],

/* ================= SECURITY & SMART ================= */
["Security camera", 0.25, 0.2],
["Alarm system / sensors", 0.35, 0.25],
["Smart hub / plugs", 0.35, 0.25],
["WiFi router", 0.3, 0.2],

/* ================= APPLIANCES ================= */
["Mini fridge", 0.55, 0.55],
["Drink fridge", 0.6, 0.6],
["Water dispenser", 0.45, 0.45],
["Utility sink", 0.6, 0.5],
["Couch", 1, 2],
["Sofa", 1, 2],

/* ================= COMFORT / MISC ================= */
["Mats / anti-slip tape", 1.0, 0.6],
["Soundproof panels", 1.2, 0.1],
["Wall hooks / pegboard", 1.2, 0.08],
["Notice / checklist board", 0.9, 0.08],
["Vending Machine", 0.7, 0.7],
["Clipboards / sign-up sheets",0.3,0.4], 
["Key tags / membership cards",0.3,0.3],
["Floor markings",2,0.1], 
["Air fresheners / scent diffusers",0.5,0.5],
["First aid kits / defibrillators",0.6,0.6],
["Step counters / wearable charging stations",0.4,0.4],
["Wall-mounted timers / interval lights",0.5,0.5],
["Rubber flooring / anti-slip mats",2.5,2.5],
["Hand sanitizer stations",0.4,0.4],
["Foam rollers",0.6,0.2],
["Massage guns / percussion devices",0.3,0.3],
["Resistance bands hooks / wall anchors",0.3,0.2],
["Wall-mounted mirrors with posture marks",2.2,0.1],
["Jump rope racks / storage",0.5,0.3],
["Weighted balls for wall throws",0.4,0.4],
["Pull-up assist bands hooked to ceiling",0.5,0.2],
["Chalk buckets / grips for lifting",0.3,0.2],
["Ceiling-mounted hooks for TRX / suspension straps",0.4,0.2],
["Wall-mounted instructional diagrams",0.3,0.1],
["Temperature / humidity monitors",0.3,0.3],
["Towel warmers",0.6,0.3],["Shoe racks",1,0.4],
["Small storage bins for accessories",0.6,0.3],
["Acoustic panels",2,0.2],
["Timer bells / buzzers",0.4,0.2],
["Weighted door stops",0.5,0.2],
["Mirrors with squat depth markings",2.2,0.1],
["Resistance tubing wall mounts",0.4,0.2],


/* ================= BEDROOM ================= */
["Single bed", 0.92, 1.88],
["King single bed", 1.07, 2.03],
["Double bed", 1.38, 1.88],
["Queen bed", 1.53, 2.03],
["King bed", 1.83, 2.03],

/*==================TOILETRY====================*/

["Toilet", 1.1, 0.7],
["Sink", 0.3, 0.5],
["Double Sink", 0.8, 1.1],
["Shower", 1.5, 1.5],
["Towel Rack", 1.1, 1.9],
["Scale", 0.5, 0.5]

];



/* =====================================================
   INFO PANEL
===================================================== */

const infoPanel = document.createElement("div");
infoPanel.id = "infoPanel";
infoPanel.className = "info-panel hidden";

infoPanel.innerHTML = `
  <div class="info-header">
    <span id="infoTitle"></span>
    <button id="closeInfo">✕</button>
  </div>
  <div class="info-row">
    <label>Cost</label>
    <input id="infoPrice" type="number" placeholder="$0">
  </div>
  <div class="info-row">
    <label>Notes</label>
    <textarea id="infoNotes"></textarea>
  </div>
`;

document.body.appendChild(infoPanel);

const infoTitle = infoPanel.querySelector("#infoTitle");
const infoNotes = infoPanel.querySelector("#infoNotes");
const infoPrice = infoPanel.querySelector("#infoPrice");
const closeInfo = infoPanel.querySelector("#closeInfo");

let activeItem = null;

/* =====================================================
   RESULT CREATOR
===================================================== */

function createResult({ name, w, h }) {
  const item = document.createElement("div");
  item.className = "result";
  item.textContent = `${name} (${w}m × ${h}m)`;
  item.draggable = true;

  item.addEventListener("dragstart", e => {
    e.dataTransfer.setData("item", JSON.stringify({ name, w, h }));
  });

  return item;
}

/* =====================================================
   SEARCH
===================================================== */

equipmentSearch.addEventListener("input", () => {
  equipmentResults.innerHTML = "";
  const q = equipmentSearch.value.toLowerCase().trim();
  if (!q) return;

  EQUIPMENT.filter(([n]) => n.toLowerCase().includes(q))
    .forEach(([name, w, h]) =>
      equipmentResults.appendChild(createResult({ name, w, h }))
    );
});

/* =====================================================
   GRID DROP
===================================================== */

grid.addEventListener("dragover", e => e.preventDefault());

grid.addEventListener("drop", e => {
  e.preventDefault();
  const raw = e.dataTransfer.getData("item");
  if (!raw) return;

  const { name, w, h } = JSON.parse(raw);
  spawn(name, w, h, e.offsetX, e.offsetY);
});

/* =====================================================
   SPAWN
===================================================== */

function spawn(name, w, h, x, y) {
  const el = document.createElement("div");
  el.className = "equipment";

  el.dataset.name = name;
  el.dataset.w = w;
  el.dataset.h = h;
  el.dataset.notes = "";
  el.dataset.price = "";
  el.dataset.locked = "false";

  el.innerHTML = `
    <div class="rotate">⟳</div>
    <div class="lock">🔓</div>
    <div class="label">${name}</div>
  `;

  resize(el);
  grid.appendChild(el);
  setPosition(el, x - el.offsetWidth / 2, y - el.offsetHeight / 2);
  bind(el);
  return el;  
}

/* =====================================================
   INTERACTIONS
===================================================== */

function bind(el) {
  enableDrag(el);
  enableRotate(el);
  function enableRotate(el) {
    const handle = el.querySelector(".rotate");
    const SNAP_ANGLE = 15; // degrees for snapping (you can adjust)
    const SNAP_TARGETS = [0, 45, 90, 135, 180, 225, 270, 315, 360]; // angles to snap to
  
    handle.onmousedown = e => {
      e.stopPropagation();
      if (el.dataset.locked === "true") return;
  
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
  
      document.onmousemove = ev => {
        let angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;
  
        // Convert negative angles to 0-360
        if (angle < 0) angle += 360;
  
        // Check if near a SNAP_TARGET
        for (let target of SNAP_TARGETS) {
          if (Math.abs(angle - target) < SNAP_ANGLE) {
            angle = target;
            break;
          }
        }
  
        el.style.transform = `rotate(${angle}deg)`;
        clamp(el);
      };
  
      document.onmouseup = () => {
        document.onmousemove = null;
      };
    };
  }
  
  enableLock(el);

  el.addEventListener("dblclick", e => {
    e.stopPropagation();
    openInfo(el);
  });

  el.oncontextmenu = e => {
    e.preventDefault();
    if (el.dataset.locked === "true") return;
    el.remove();
    closeInfoPanel();
  };
}

function enableDrag(el) {
  el.onmousedown = e => {
    if (el.dataset.locked === "true") return;
    if (e.target.classList.contains("rotate")) return;
    if (e.target.classList.contains("lock")) return;

    const sx = e.clientX;
    const sy = e.clientY;
    const ox = el.offsetLeft;
    const oy = el.offsetTop;

    document.onmousemove = ev => {
      setPosition(el, ox + ev.clientX - sx, oy + ev.clientY - sy);
    };

    document.onmouseup = () => {
      document.onmousemove = null;
    };
  };
}

function enableRotate(el) {
  const handle = el.querySelector(".rotate");

  handle.onmousedown = e => {
    e.stopPropagation();
    if (el.dataset.locked === "true") return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    document.onmousemove = ev => {
      const angle =
        Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;
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

  lock.onmousedown = e => {
    e.stopPropagation();

    const locked = el.dataset.locked === "true";
    el.dataset.locked = (!locked).toString();

    lock.textContent = locked ? "🔓" : "🔒";
    el.classList.toggle("locked", !locked);
  };
}


/* =====================================================
   INFO PANEL
===================================================== */

function openInfo(el) {
  activeItem = el;
  infoTitle.textContent = el.dataset.name;
  infoNotes.value = el.dataset.notes;
  infoPrice.value = el.dataset.price;

  const rect = el.getBoundingClientRect();
  infoPanel.style.left = rect.right + 12 + "px";
  infoPanel.style.top = rect.top + "px";
  infoPanel.classList.remove("hidden");
}

function closeInfoPanel() {
  infoPanel.classList.add("hidden");
  activeItem = null;
}

infoNotes.oninput = () => {
  if (activeItem) activeItem.dataset.notes = infoNotes.value;
};

infoPrice.oninput = () => {
  if (activeItem) activeItem.dataset.price = infoPrice.value;
};

closeInfo.onclick = closeInfoPanel;

/* =====================================================
   POSITION / SIZE
===================================================== */

function resize(el) {
  el.style.width = el.dataset.w / metersPerPixelX + "px";
  el.style.height = el.dataset.h / metersPerPixelY + "px";
}

function setPosition(el, x, y) {
  if (snapEnabled) {
    x = Math.round(x / GRID_SIZE) * GRID_SIZE;
    y = Math.round(y / GRID_SIZE) * GRID_SIZE;
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

  el.style.left = el.offsetLeft + dx + "px";
  el.style.top = el.offsetTop + dy + "px";
}

/* =====================================================
   CONTROLS
===================================================== */

snapToggle.onclick = () => {
  snapEnabled = !snapEnabled;
  snapToggle.classList.toggle("active", snapEnabled);
  showToast(snapEnabled ? "Snap enabled" : "Snap disabled");
};

applyScaleBtn.onclick = () => {
  metersPerPixelX = roomW.value / grid.clientWidth;
  metersPerPixelY = roomL.value / grid.clientHeight;
  document.querySelectorAll(".equipment").forEach(resize);
};

toolButton.onclick = e => {
  e.stopPropagation();
  toolModal.classList.toggle("hidden");
};

toolModal.onclick = e => e.stopPropagation();
infoPanel.onclick = e => e.stopPropagation();

document.addEventListener("click", () => {
  toolModal.classList.add("hidden");
  closeInfoPanel();
});
structureSearch.addEventListener("input", () => {
  structureResults.innerHTML = "";

  const q = structureSearch.value.trim().toLowerCase();
  if (!q) return;

  STRUCTURES
    .filter(([name]) => name.toLowerCase().includes(q))
    .forEach(([name, w, h]) => {
      structureResults.appendChild(
        createResult({ name, w, h })
      );
    });
});
const shapeBtn = document.getElementById("customShapeToggle");
const shapePanel = document.getElementById("customShapePanel");

shapeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  shapePanel.classList.toggle("hidden");
});

// optional: click outside closes panel
document.addEventListener("click", () => {
  shapePanel.classList.add("hidden");
});

shapePanel.addEventListener("click", (e) => {
  e.stopPropagation();
});
// ===============================
// Custom Shape Tabs (Dimensions / Free Draw)
// ===============================

const shapeTabs = document.querySelectorAll(".shape-tab");
const shapeSections = document.querySelectorAll(".shape-section");

shapeTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {

    shapeTabs.forEach(t => t.classList.remove("active"));
    shapeSections.forEach(sec => sec.classList.add("hidden"));

    tab.classList.add("active");
    shapeSections[index].classList.remove("hidden");

    if (index === 1) activateFreeDrawCanvas();
    let lastSnappedShape = null;

    
  });


});

});
/* =====================================================
   FREE DRAW — POPUP CANVAS (CLEAN + WORKING)
===================================================== */

const freeCanvas = document.getElementById("freeDrawCanvas");
const freeCtx = freeCanvas.getContext("2d");

let isDrawing = false;
let drawnPoints = [];

function activateFreeDrawCanvas() {
  freeCanvas.width = freeCanvas.offsetWidth;
  freeCanvas.height = freeCanvas.offsetHeight;
  freeCtx.clearRect(0, 0, freeCanvas.width, freeCanvas.height);
}

freeCanvas.addEventListener("pointerdown", e => {
  isDrawing = true;
  drawnPoints = [];

  freeCtx.beginPath();
  freeCtx.moveTo(e.offsetX, e.offsetY);

  drawnPoints.push({ x: e.offsetX, y: e.offsetY });
});

freeCanvas.addEventListener("pointermove", e => {
  if (!isDrawing) return;

  freeCtx.strokeStyle = "#00ff88";
  freeCtx.lineWidth = 2;
  freeCtx.lineCap = "round";

  freeCtx.lineTo(e.offsetX, e.offsetY);
  freeCtx.stroke();

  drawnPoints.push({ x: e.offsetX, y: e.offsetY });
});


freeCanvas.addEventListener("pointerup", () => {
  isDrawing = false;

  const snapped = detectSnappedShape(drawnPoints);
  if (!snapped) {
    lastSnappedShape = null;
    return;
  }

  lastSnappedShape = snapped;

  freeCtx.clearRect(0, 0, freeCanvas.width, freeCanvas.height);
  freeCtx.strokeStyle = "#00ff88";
  freeCtx.lineWidth = 2;

  if (snapped.type === "circle") {
    freeCtx.beginPath();
    freeCtx.arc(snapped.cx, snapped.cy, snapped.r, 0, Math.PI * 2);
    freeCtx.stroke();
  }

  if (snapped.type === "rect") {
    freeCtx.strokeRect(snapped.x, snapped.y, snapped.w, snapped.h);
  }
});





freeCanvas.addEventListener("pointerleave", () => {
  isDrawing = false;
});
function detectSnappedShape(points) {
  if (points.length < 20) return null;

  const start = points[0];
  const end = points[points.length - 1];

  // must roughly close
  if (Math.hypot(start.x - end.x, start.y - end.y) > 25) return null;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  points.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  // ---------- CIRCLE CHECK ----------
  const radius = (width + height) / 4;
  let variance = 0;

  points.forEach(p => {
    const d = Math.hypot(p.x - centerX, p.y - centerY);
    variance += Math.abs(d - radius);
  });

  variance /= points.length;

  if (variance < 10) {
    return {
      type: "circle",
      cx: centerX,
      cy: centerY,
      r: radius
    };
  }

  // ---------- RECTANGLE CHECK ----------
  if (Math.abs(width - height) > 10) {
    return {
      type: "rect",
      x: minX,
      y: minY,
      w: width,
      h: height
    };
  }

  return null;
}
let lastSnappedShape = null;
let freeDrawActive = false;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 250);
  }, 2200);
}
document.getElementById("applyScale").addEventListener("click", () => {
  showToast("Scale updated");
});
// =====================================================
// HOME GYM PLANNER — FULL CAD TECHNICAL EXPORT
// =====================================================
(() => {
  const btn = document.getElementById("exportBtn");
  const grid = document.getElementById("grid");
  const roomW = document.getElementById("roomW");
  const roomL = document.getElementById("roomL");

  if (!btn || !grid || !roomW || !roomL) return;
  if (btn.dataset.bound) return;
  btn.dataset.bound = "true";

  btn.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 3600;
    canvas.height = 2400;
    const ctx = canvas.getContext("2d");

    // ================= BASE =================
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    ctx.font = "14px monospace";
    ctx.fillStyle = "#000";

    const M = 220;
    const TITLE_H = 320;

    const gx = M;
    const gy = M;
    const gw = canvas.width - M * 2;
    const gh = canvas.height - M * 2 - TITLE_H;

    // ================= GRID =================
    ctx.strokeStyle = "#e1e1e1";
    ctx.lineWidth = 1;
    for (let x = gx; x <= gx + gw; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x, gy + gh);
      ctx.stroke();
    }
    for (let y = gy; y <= gy + gh; y += 100) {
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx + gw, y);
      ctx.stroke();
    }

    // ================= ROOM FRAME =================
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.strokeRect(gx, gy, gw, gh);

    const rect = grid.getBoundingClientRect();
    const sx = gw / rect.width;
    const sy = gh / rect.height;

    const pxPerMeterX = gw / roomW.value;
const pxPerMeterY = gh / roomL.value;


    // ================= COLLECT OBJECTS =================
const items = [];
document.querySelectorAll(".equipment").forEach(el => {
  const r = el.getBoundingClientRect();
  items.push({
    name: el.dataset.name || "Item",
    x: gx + (r.left - rect.left) * sx,
    y: gy + (r.top - rect.top) * sy,
    w: r.width * sx,
    h: r.height * sy,
    mw: Number(el.dataset.w || 0),
    mh: Number(el.dataset.h || 0)
  });
});


    // ================= DRAW OBJECTS =================
    ctx.font = "15px monospace";
    items.forEach(it => {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.strokeRect(it.x, it.y, it.w, it.h);

             // ===== EQUIPMENT NAME =====
  ctx.font = "16px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#000";
  ctx.fillText(
    it.name,
    it.x + it.w / 2,
    it.y - 32
  );


      ctx.fillText(
        `${it.mw.toFixed(2)} m`,
        it.x + it.w / 2 - 28,
        it.y - 12
      );

      ctx.save();
      ctx.translate(it.x + it.w + 14, it.y + it.h / 2 + 20);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${it.mh.toFixed(2)} m`, 0, 0);
      ctx.restore();
    });

    // ================= WALL CLEARANCES =================
    ctx.font = "13px monospace";
    ctx.strokeStyle = "#555";
    ctx.setLineDash([6, 4]);

    items.forEach(it => {
      ctx.beginPath();
      ctx.moveTo(gx, it.y + it.h / 2);
      ctx.lineTo(it.x, it.y + it.h / 2);
      ctx.stroke();

      ctx.fillText(
        `${((it.x - gx) / pxPerMeterX).toFixed(2)
        } m`,
        (gx + it.x) / 2 - 20,
        it.y + it.h / 2 - 6
      );

      ctx.beginPath();
      ctx.moveTo(it.x + it.w / 2, gy);
      ctx.lineTo(it.x + it.w / 2, it.y);
      ctx.stroke();

      ctx.fillText(
        `${((it.y - gy) / pxPerMeterY).toFixed(2)} m`,
        it.x + it.w / 2 + 6,
        (gy + it.y) / 2
      );
    });

    ctx.setLineDash([]);

    // ================= EQUIPMENT SPACING =================
    ctx.font = "13px monospace";
    for (let i = 0; i < items.length - 1; i++) {
      const a = items[i];
      const b = items[i + 1];
      const gap = b.x - (a.x + a.w);
      if (gap > 30) {
        ctx.beginPath();
        ctx.moveTo(a.x + a.w, a.y + a.h / 2);
        ctx.lineTo(b.x, b.y + b.h / 2);
        ctx.stroke();

        ctx.fillText(
          `${(gap / pxPerMeterX).toFixed(2)} m`,
          a.x + a.w + gap / 2 - 20,
          a.y + a.h / 2 - 8

        );
      }
    }

    // ================= ROOM DIMENSIONS =================
    ctx.font = "18px monospace";
    ctx.fillText(`${roomW.value} m`, gx + gw / 2 - 22, gy - 60);
    ctx.save();
    ctx.translate(gx - 80, gy + gh / 2 + 36);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${roomL.value} m`, 0, 0);
    ctx.restore();
    // ================= SCALE BAR =================
const scaleMeters = 1; // 1 meter scale bar

// how many pixels = 1 meter in export
const pixelsPerMeter = gw / roomW.value;
const barPx = scaleMeters * pixelsPerMeter;

// position (bottom-left, above title block)
const sbX = gx + 40;
const sbY = gy + gh - 40;

// draw bar
ctx.strokeStyle = "#000";
ctx.lineWidth = 3;

ctx.beginPath();
ctx.moveTo(sbX, sbY);
ctx.lineTo(sbX + barPx, sbY);
ctx.stroke();

// end ticks
ctx.beginPath();
ctx.moveTo(sbX, sbY - 10);
ctx.lineTo(sbX, sbY + 10);
ctx.moveTo(sbX + barPx, sbY - 10);
ctx.lineTo(sbX + barPx, sbY + 10);
ctx.stroke();

// label
ctx.font = "16px monospace";
ctx.fillStyle = "#000";
ctx.fillText("1 m", sbX + barPx / 2 - 12, sbY - 16);

ctx.textAlign = "left";

    // ================= TITLE BLOCK =================
    const ty = gy + gh + 40;
    ctx.strokeRect(gx, ty, gw, TITLE_H - 40);

    ctx.font = "32px monospace";
    ctx.fillText("HOME GYM — TECHNICAL LAYOUT", gx + 26, ty + 56);

    ctx.font = "16px monospace";
    ctx.fillText("Units: metres (m)", gx + 26, ty + 98);
    ctx.fillText("View: Orthographic Plan", gx + 26, ty + 128);
    ctx.fillText("Scale: 1 : 50 (Approx.)", gx + 26, ty + 158);

    ctx.fillText(
      `Room Size: ${roomW.value} m × ${roomL.value} m`,
      gx + 460,
      ty + 98
    );
    ctx.fillText(
      `Aspect Ratio: ${(roomW.value / roomL.value).toFixed(2)} : 1`,
      gx + 460,
      ty + 128
    );
    ctx.fillText(
      `Exported: ${new Date().toLocaleString()}`,
      gx + 460,
      ty + 158
    );

    ctx.textAlign = "right";
    ctx.fillText(
      "Exported from Home Gym Planner",
      gx + gw - 26,
      ty + 158
    );
    ctx.textAlign = "left";

    // ================= DOWNLOAD =================
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "home-gym-technical-layout.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
  });
})();
document.addEventListener("DOMContentLoaded", () => {
  // --- AI Score system ---
  const aiBtn = document.getElementById("aiScoreBtn");
  const aiPopup = document.getElementById("aiScorePopup");
  const aiScoreText = document.getElementById("aiScoreText");
  const aiFeedbackList = document.getElementById("aiFeedbackList");
  const aiCloseBtn = document.getElementById("closeAiScore");

  function evaluateGymLayout() {
    const items = Array.from(document.querySelectorAll(".equipment")).map(el => el.dataset.name);

    let score = 100;
    const feedback = [];

    const hasDumbbells = items.some(i => i.toLowerCase().includes("dumbbell"));
    const hasBench = items.some(i => i.toLowerCase().includes("bench"));
    const hasCardio = items.some(i => ["treadmill","bike","row"].some(c => i.toLowerCase().includes(c)));
    const hasRack = items.some(i => i.toLowerCase().includes("rack"));
    const hasWeights = items.some(i => ["dumbbell","barbell","plate"].some(c => i.toLowerCase().includes(c)));

    if (hasDumbbells && !hasBench) {
      score -= 20;
      feedback.push("Add a bench to pair with your dumbbells.");
    }

    if (!hasCardio) {
      score -= 15;
      feedback.push("Include some cardio equipment for a full workout.");
    }

    if (hasWeights && !hasRack) {
      score -= 10;
      feedback.push("Add a rack to store your weights safely.");
    }

    if (items.length < 5) {
      score -= 10;
      feedback.push("Your gym feels empty — consider adding more equipment.");
    }

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return { score, feedback };
  }

  aiBtn.onclick = () => {
    const result = evaluateGymLayout();
    aiScoreText.textContent = `Score: ${result.score}/100`;

    aiFeedbackList.innerHTML = "";
    result.feedback.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f;
      aiFeedbackList.appendChild(li);
    });

    aiPopup.classList.remove("hidden");
  };

  aiCloseBtn.onclick = () => {
    aiPopup.classList.add("hidden");
  };
});
// ===============================
// SHAPE CANCEL BUTTON — FULL RESET
// ===============================
document.getElementById("shapeCancel").addEventListener("click", e => {
  e.stopPropagation();

  // 1️⃣ Hide the shape panel
  const panel = document.getElementById("customShapePanel");
  if (panel) panel.classList.add("hidden");

  // 2️⃣ Clear the free draw canvas
  if (typeof freeCtx !== "undefined" && freeCanvas) {
    freeCtx.clearRect(0, 0, freeCanvas.width, freeCanvas.height);
  }

  // 3️⃣ Reset all shape inputs
  const shapeWidth = document.getElementById("shapeWidth");
  const shapeLength = document.getElementById("shapeLength");
  const shapeName = document.getElementById("shapeName");
  if (shapeWidth) shapeWidth.value = "";
  if (shapeLength) shapeLength.value = "";
  if (shapeName) shapeName.value = "";

  // 4️⃣ Clear any "last snapped" reference
  lastSnappedShape = null;

  // 5️⃣ Reset drawing flag
  isDrawing = false;
  drawnPoints = [];

  console.log("Shape creation cancelled.");
});

const grid = document.getElementById("grid")
const clearAllBtn = document.getElementById("clearAllBtn")
const confirmToast = document.getElementById("confirmToast")
const confirmYes = document.getElementById("confirmYes")
const confirmNo = document.getElementById("confirmNo")

clearAllBtn.addEventListener("click", ()=>{
     confirmToast.classList.remove("hidden")
})

// ===============================
// NO BUTTON — instant close + popup animation
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const confirmNo = document.getElementById("confirmNo");
  const confirmToast = document.getElementById("confirmToast");

  if (!confirmNo || !confirmToast) return;

  // Show toast function with animation
  function showConfirmToast(message) {
    confirmToast.textContent = message;
    confirmToast.classList.remove("hidden");
    confirmToast.classList.add("show"); // animation class
  }

  // NO button closes immediately
  confirmNo.onclick = e => {
    e.stopPropagation(); // prevent bubbling
    confirmToast.classList.remove("show");
    confirmToast.classList.add("hidden"); // instantly hide
  };
});
// Close toast when clicking anywhere outside
document.addEventListener("click", (e) => {
  if (confirmToast.classList.contains("show")) {
      if (!confirmToast.contains(e.target) && e.target !== clearAllBtn) {
          confirmToast.classList.remove("show");
      }
  }
});

// Show toast on Clear All click
clearAllBtn.addEventListener("click", () => {
  confirmToast.classList.add("show");
});

// Yes button
confirmYes.addEventListener("click", () => {
  grid.innerHTML = "";
  confirmToast.classList.remove("show");
});

// No button
confirmNo.addEventListener("click", () => {
  confirmToast.classList.remove("show");
});

// Show toast
clearAllBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    confirmToast.style.display = "flex"; // show instantly
    confirmToast.classList.add("show");  // animation
});

// Close toast clicking outside
document.addEventListener("click", (e) => {
    if (confirmToast.style.display === "flex") {
        if (!confirmToast.contains(e.target) && e.target !== clearAllBtn) {
            confirmToast.style.display = "none"; // hide instantly
        }
    }
});

// YES button: clear grid AND hide toast instantly
confirmYes.addEventListener("click", (e) => {
    e.stopPropagation();
    grid.innerHTML = "";               // clear grid
    confirmToast.style.display = "none"; // hide toast
});

// NO button: hide toast instantly
confirmNo.addEventListener("click", (e) => {
    e.stopPropagation();
    confirmToast.style.display = "none"; // hide toast
});
const plannerToggle = document.getElementById("plannerDarkToggle");

// On page load, set according to saved preference
if (localStorage.getItem("plannerDarkMode") === "true") {
  document.body.classList.add("planner-dark-mode");
} else {
  document.body.classList.remove("planner-dark-mode");
}

// Toggle on button click
plannerToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("planner-dark-mode");
  localStorage.setItem("plannerDarkMode", isDark ? "true" : "false");
});
function getEventCoords(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if (e.changedTouches && e.changedTouches.length > 0) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}
item.addEventListener("touchstart", (e) => {
  longPressTimer = setTimeout(() => {
    showToast("Release to delete");
    item.classList.add("deleting");
  }, 800);
});
let lastTap = 0;
el.addEventListener("click", (e) => {
  const now = Date.now();
  if (now - lastTap < 300) {
    openInfo(el);
  }
  lastTap = now;
});