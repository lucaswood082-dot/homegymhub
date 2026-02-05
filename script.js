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
const designTabs = document.getElementById("designTabs");
const addDesignBtn = document.getElementById("addDesign");
const designModal = document.getElementById("designModal");
const designList = document.getElementById("designList");
const designRenameBtn = document.getElementById("designRename");
const designDeleteBtn = document.getElementById("designDelete");
const designCreateBtn = document.getElementById("designCreate");
const designEditor = document.getElementById("designEditor");
const designNameInput = document.getElementById("designNameInput");
const designSaveName = document.getElementById("designSaveName");
const designCancelName = document.getElementById("designCancelName");
const designExportBox = document.getElementById("designExportBox");
const designExportText = document.getElementById("designExportText");
const designDownload = document.getElementById("designDownload");
const designCopy = document.getElementById("designCopy");
const designCloseExport = document.getElementById("designCloseExport");
const designImportBox = document.getElementById("designImportBox");
const designImportText = document.getElementById("designImportText");
const designImportFile = document.getElementById("designImportFile");
const designDoImport = document.getElementById("designDoImport");
const designCloseImport = document.getElementById("designCloseImport");
const designDeleteConfirm = document.getElementById("designDeleteConfirm");
const designConfirmDelete = document.getElementById("designConfirmDelete");
const designCancelDelete = document.getElementById("designCancelDelete");
const designExportOpen = document.getElementById("designExportOpen");
const designImportOpen = document.getElementById("designImportOpen");
const designExportSelect = document.getElementById("designExportSelect");
const designPublishBtn = document.getElementById("designPublish");
const designPublishBox = document.getElementById("designPublishBox");
const designPublishTitle = document.getElementById("designPublishTitle");
const designPublishDesc = document.getElementById("designPublishDesc");
const designConfirmPublish = document.getElementById("designConfirmPublish");
const designCancelPublish = document.getElementById("designCancelPublish");
const libraryBtn = document.getElementById("libraryBtn");
const libraryModal = document.getElementById("libraryModal");
const libraryTabs = document.querySelectorAll(".library-tab");
const libraryPresets = document.getElementById("libraryPresets");
const libraryCommunity = document.getElementById("libraryCommunity");
const libraryMine = document.getElementById("libraryMine");
const librarySearch = document.getElementById("librarySearch");
const libraryMinW = document.getElementById("libraryMinW");
const libraryMinL = document.getElementById("libraryMinL");

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

let designs = [];
let activeDesignId = null;
let loadingDesign = false;
let pendingDeleteId = null;
let useSupabaseDesigns = false;
let currentUserId = null;

let selectedItems = new Set();
let selectionBox = null;
let selectionStart = null;
let isSelecting = false;

const DESIGN_STORAGE_KEY = "pl_planner_designs_v1";
const DESIGN_ACTIVE_KEY = "pl_planner_design_active_v1";

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

const PRESET_DESIGNS = [
  {
    id: "preset_garage_small",
    name: "Small Garage Setup",
    description: "Compact layout with rack, bench, and storage.",
    roomW: 5,
    roomL: 4,
    items: [
      { name: "Power rack", w: 1.5, h: 1.5, x: 120, y: 80, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Flat bench", w: 1.2, h: 0.6, x: 340, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Dumbbell rack", w: 2.0, h: 0.6, x: 180, y: 260, rot: 0, layer: "equipment", locked: false, circle: false }
    ]
  },
  {
    id: "preset_strength_zone",
    name: "Strength Zone",
    description: "Rack + platform + plate storage.",
    roomW: 6,
    roomL: 5,
    items: [
      { name: "6-post power rack", w: 1.5, h: 2.4, x: 160, y: 80, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Platform", w: 2.4, h: 2.4, x: 320, y: 200, rot: 0, layer: "structure", locked: false, circle: false },
      { name: "Plate tree", w: 1.0, h: 1.0, x: 100, y: 300, rot: 0, layer: "equipment", locked: false, circle: false }
    ]
  },
  {
    id: "preset_cardio_corner",
    name: "Cardio Corner",
    description: "Treadmill + rower + bike.",
    roomW: 4,
    roomL: 4,
    items: [
      { name: "Treadmill", w: 2.0, h: 1.0, x: 120, y: 80, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Rowing machine", w: 2.4, h: 0.6, x: 140, y: 210, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Air bike", w: 1.2, h: 0.6, x: 260, y: 120, rot: 0, layer: "equipment", locked: false, circle: false }
    ]
  },
  {
    id: "preset_large_garage",
    name: "Large Garage",
    description: "Full strength + cardio in a 7x6 space.",
    roomW: 7,
    roomL: 6,
    items: [
      { name: "6-post power rack", w: 1.5, h: 2.4, x: 140, y: 80, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Flat bench", w: 1.2, h: 0.6, x: 360, y: 140, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Dumbbell rack", w: 2.0, h: 0.6, x: 180, y: 300, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Treadmill", w: 2.0, h: 1.0, x: 420, y: 320, rot: 0, layer: "equipment", locked: false, circle: false }
    ]
  },
  {
    id: "preset_powerlifting",
    name: "Powerlifting Room",
    description: "Rack, platform, and competition bench.",
    roomW: 8,
    roomL: 6,
    items: [
      { name: "Power rack", w: 1.5, h: 1.5, x: 140, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Platform", w: 2.4, h: 2.4, x: 320, y: 220, rot: 0, layer: "structure", locked: false, circle: false },
      { name: "Competition bench", w: 1.4, h: 0.6, x: 520, y: 140, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Plate tree", w: 1.0, h: 1.0, x: 120, y: 360, rot: 0, layer: "equipment", locked: false, circle: false }
    ]
  },
  {
    id: "preset_commercial",
    name: "Commercial Floor",
    description: "Multi‑zone commercial layout.",
    roomW: 12,
    roomL: 9,
    items: [
      { name: "Cable crossover", w: 3.5, h: 1.0, x: 180, y: 90, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Smith machine", w: 2.2, h: 1.5, x: 520, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Rowing machine", w: 2.4, h: 0.6, x: 220, y: 340, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Air bike", w: 1.2, h: 0.6, x: 420, y: 360, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Leg press", w: 2.3, h: 1.6, x: 760, y: 260, rot: 0, layer: "equipment", locked: false, circle: false }
    ]
  },
  {
    id: "preset_functional",
    name: "Functional Zone",
    description: "Open training area + storage.",
    roomW: 10,
    roomL: 7,
    items: [
      { name: "Half rack", w: 1.4, h: 1.3, x: 140, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Kettlebell rack", w: 1.2, h: 0.6, x: 320, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Sled", w: 1.5, h: 0.8, x: 520, y: 260, rot: 0, layer: "equipment", locked: false, circle: false }
    ]
  },
  {
    id: "preset_boxing_compact",
    name: "Boxing Compact",
    description: "Bag + floor space + storage.",
    roomW: 5,
    roomL: 4,
    items: [
      { name: "Heavy bag", w: 1.0, h: 1.0, x: 140, y: 100, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Double-end bag", w: 0.8, h: 0.8, x: 260, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Glove storage", w: 1.2, h: 0.5, x: 140, y: 260, rot: 0, layer: "equipment", locked: false, circle: false }
    ]
  },
  {
    id: "preset_boxing_studio",
    name: "Boxing Studio",
    description: "Bag line + open sparring zone.",
    roomW: 10,
    roomL: 6,
    items: [
      { name: "Heavy bag", w: 1.0, h: 1.0, x: 120, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Heavy bag", w: 1.0, h: 1.0, x: 240, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Heavy bag", w: 1.0, h: 1.0, x: 360, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Speed bag platform", w: 1.2, h: 1.0, x: 520, y: 120, rot: 0, layer: "equipment", locked: false, circle: false }
    ]
  },
  {
    id: "preset_boxing_power",
    name: "Boxing + Strength",
    description: "Boxing zone plus rack and bench.",
    roomW: 8,
    roomL: 6,
    items: [
      { name: "Heavy bag", w: 1.0, h: 1.0, x: 140, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Speed bag platform", w: 1.2, h: 1.0, x: 320, y: 120, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Power rack", w: 1.5, h: 1.5, x: 520, y: 140, rot: 0, layer: "equipment", locked: false, circle: false },
      { name: "Flat bench", w: 1.2, h: 0.6, x: 520, y: 300, rot: 0, layer: "equipment", locked: false, circle: false }
    ]
  }
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
// SELECTION
// ===============================
function clearSelection() {
  selectedItems.forEach((el) => el.classList.remove("selected"));
  selectedItems.clear();
}

function addToSelection(el) {
  selectedItems.add(el);
  el.classList.add("selected");
}

function toggleSelection(el) {
  if (selectedItems.has(el)) {
    selectedItems.delete(el);
    el.classList.remove("selected");
  } else {
    addToSelection(el);
  }
}

function getEquipmentElements() {
  return Array.from(document.querySelectorAll(".equipment"));
}

function updateSelectionBox(x1, y1, x2, y2) {
  if (!selectionBox) return;
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  selectionBox.style.left = `${left}px`;
  selectionBox.style.top = `${top}px`;
  selectionBox.style.width = `${width}px`;
  selectionBox.style.height = `${height}px`;
}

function createSelectionBox() {
  if (!grid) return;
  selectionBox = document.createElement("div");
  selectionBox.className = "selection-box";
  grid.appendChild(selectionBox);
}

function removeSelectionBox() {
  if (!selectionBox) return;
  selectionBox.remove();
  selectionBox = null;
}

function selectInBox(append) {
  if (!selectionBox) return;
  const box = selectionBox.getBoundingClientRect();
  if (!append) clearSelection();
  getEquipmentElements().forEach((el) => {
    const r = el.getBoundingClientRect();
    const intersects = !(r.right < box.left || r.left > box.right || r.bottom < box.top || r.top > box.bottom);
    if (intersects) addToSelection(el);
  });
}

function duplicateSelected() {
  if (!selectedItems.size) return;
  const offset = gridSizePx || 12;
  const items = Array.from(selectedItems);
  clearSelection();
  items.forEach((el) => {
    const w = Number(el.dataset.w) || 0;
    const h = Number(el.dataset.h) || 0;
    const layer = el.dataset.layer || "equipment";
    const cx = el.offsetLeft + el.offsetWidth / 2 + offset;
    const cy = el.offsetTop + el.offsetHeight / 2 + offset;
    const newEl = spawn(el.dataset.name || "Item", w, h, cx, cy, layer);
    if (!newEl) return;
    const rot = el.style.transform || "";
    if (rot) newEl.style.transform = rot;
    if (el.style.borderRadius === "50%") newEl.style.borderRadius = "50%";
    if (el.dataset.locked === "true") {
      newEl.dataset.locked = "true";
      newEl.classList.add("locked");
      const lock = newEl.querySelector(".lock");
      if (lock) lock.textContent = "🔒";
    }
    addToSelection(newEl);
  });
  saveCurrentDesign();
}
// ===============================
// DESIGN TABS
// ===============================
function generateId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `design_${Math.random().toString(36).slice(2, 9)}`;
}

function getRotationDeg(el) {
  const t = el.style.transform || "";
  const match = t.match(/rotate\(([-\d.]+)deg\)/);
  return match ? Number(match[1]) : 0;
}

function serializeDesign() {
  const items = Array.from(document.querySelectorAll(".equipment")).map((el) => {
    const isCircle = el.style.borderRadius === "50%";
    return {
      name: el.dataset.name || "",
      w: Number(el.dataset.w) || 0,
      h: Number(el.dataset.h) || 0,
      x: el.offsetLeft,
      y: el.offsetTop,
      rot: getRotationDeg(el),
      layer: el.dataset.layer || "equipment",
      locked: el.dataset.locked === "true",
      circle: isCircle
    };
  });

  return {
    roomW: Number(roomW?.value) || 6,
    roomL: Number(roomL?.value) || 4,
    items
  };
}

function applyDesign(data) {
  if (!grid) return;
  loadingDesign = true;
  grid.innerHTML = "";
  if (roomW) roomW.value = data.roomW ?? 6;
  if (roomL) roomL.value = data.roomL ?? 4;
  syncGridScale();

  (data.items || []).forEach((item) => {
    const pxW = item.w / metersPerPixelX;
    const pxH = item.h / metersPerPixelY;
    const cx = item.x + pxW / 2;
    const cy = item.y + pxH / 2;
    const el = spawn(item.name, item.w, item.h, cx, cy, item.layer);
    if (!el) return;
    el.style.transform = `rotate(${item.rot || 0}deg)`;
    if (item.circle) el.style.borderRadius = "50%";
    if (item.locked) {
      el.dataset.locked = "true";
      el.classList.add("locked");
      const lock = el.querySelector(".lock");
      if (lock) lock.textContent = "🔒";
    }
  });

  applyViewFilter();
  loadingDesign = false;
}

function saveDesigns() {
  if (!useSupabaseDesigns) return;
  // Supabase saving happens per-design via saveCurrentDesign
}

function saveCurrentDesign() {
  if (loadingDesign || !activeDesignId) return;
  const idx = designs.findIndex((d) => d.id === activeDesignId);
  if (idx === -1) return;
  designs[idx] = { ...designs[idx], ...serializeDesign() };
  saveDesigns();
  if (useSupabaseDesigns) {
    upsertDesignSupabase(designs[idx]);
  }
}

function renderTabs() {
  if (!designTabs) return;
  designTabs.innerHTML = "";
  designs.forEach((d) => {
    const btn = document.createElement("button");
    btn.className = `design-tab${d.id === activeDesignId ? " active" : ""}`;
    btn.dataset.id = d.id;
    btn.onclick = () => {
      switchDesign(d.id);
    };
    btn.ondblclick = () => {
      switchDesign(d.id);
      openDesignModal();
    };

    const label = document.createElement("span");
    label.className = "design-tab-label";
    label.textContent = d.name;

    const del = document.createElement("span");
    del.className = "design-tab-delete";
    del.textContent = "×";
    del.title = "Delete design";
    del.onclick = (e) => {
      e.stopPropagation();
      pendingDeleteId = d.id;
      showDeleteConfirm();
    };

    btn.appendChild(label);
    btn.appendChild(del);
    designTabs.appendChild(btn);
  });

  if (addDesignBtn) {
    designTabs.appendChild(addDesignBtn);
  }
}

function switchDesign(id) {
  if (id === activeDesignId) return;
  saveCurrentDesign();
  activeDesignId = id;
  const design = designs.find((d) => d.id === id);
  if (design) applyDesign(design);
  renderTabs();
  saveDesigns();
}

function addDesign() {
  openDesignModal("create");
}

function initDesignTabs() {
  if (!designTabs) return;
  initDesignTabsAsync();
  if (addDesignBtn) {
    addDesignBtn.onclick = addDesign;
  }
}

async function initDesignTabsAsync() {
  const client = window.supabaseClient;
  if (client) {
    const { data: sessionData } = await client.auth.getSession();
    const session = sessionData?.session;
    if (session?.user?.id) {
      useSupabaseDesigns = true;
      currentUserId = session.user.id;
      await loadDesignsFromSupabase();
      return;
    }
  }
  // Not logged in: keep in-memory only
  useSupabaseDesigns = false;
  designs = [{ id: generateId(), name: "Design 1", roomW: 6, roomL: 4, items: [] }];
  activeDesignId = designs[0].id;
  renderTabs();
  applyDesign(designs[0]);
  showToast("Log in to save designs to your account");
}

async function loadDesignsFromSupabase() {
  const client = window.supabaseClient;
  if (!client || !currentUserId) return;
  const { data, error } = await client
    .from("user_designs")
    .select("id, name, room_w, room_l, items")
    .order("updated_at", { ascending: false });
  if (error) {
    showToast("Failed to load your designs");
    return;
  }
  designs = (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    roomW: Number(row.room_w),
    roomL: Number(row.room_l),
    items: row.items || []
  }));
  if (!designs.length) {
    const id = generateId();
    const seed = { id, name: "Design 1", roomW: 6, roomL: 4, items: [] };
    designs = [seed];
    activeDesignId = id;
    renderTabs();
    applyDesign(seed);
    await upsertDesignSupabase(seed);
    return;
  }
  activeDesignId = designs[0].id;
  renderTabs();
  applyDesign(designs[0]);
}

async function upsertDesignSupabase(design) {
  const client = window.supabaseClient;
  if (!client || !currentUserId || !design) return;
  await client.from("user_designs").upsert({
    id: design.id,
    name: design.name,
    room_w: Number(design.roomW) || 6,
    room_l: Number(design.roomL) || 4,
    items: design.items || []
  });
}

async function deleteDesignSupabase(id) {
  const client = window.supabaseClient;
  if (!client || !currentUserId || !id) return;
  await client.from("user_designs").delete().eq("id", id);
}

function closeDesignModal() {
  if (!designModal) return;
  designModal.classList.add("hidden");
  designModal.setAttribute("aria-hidden", "true");
  hideDesignEditors();
}

function openDesignModal(mode) {
  if (!designModal) return;
  renderDesignList();
  updateDesignExportSelect();
  designModal.classList.remove("hidden");
  designModal.setAttribute("aria-hidden", "false");
  if (mode === "create") {
    showRenameEditor(true);
  }
}

function renderDesignList() {
  if (!designList) return;
  designList.innerHTML = "";
  designs.forEach((d) => {
    const item = document.createElement("div");
    item.className = `design-item${d.id === activeDesignId ? " active" : ""}`;
    item.textContent = d.name;
    item.onclick = () => {
      switchDesign(d.id);
      renderDesignList();
    };
    designList.appendChild(item);
  });
}

function updateDesignExportSelect() {
  if (!designExportSelect) return;
  designExportSelect.innerHTML = "";
  designs.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.name;
    designExportSelect.appendChild(opt);
  });
  if (activeDesignId) {
    designExportSelect.value = activeDesignId;
  }
}

// ===============================
// DESIGN LIBRARY
// ===============================
function openLibraryModal() {
  if (!libraryModal) return;
  libraryModal.classList.remove("hidden");
  libraryModal.setAttribute("aria-hidden", "false");
  renderPresetLibrary();
  loadCommunityLibrary();
  renderMyDesigns();
}

function closeLibraryModal() {
  if (!libraryModal) return;
  libraryModal.classList.add("hidden");
  libraryModal.setAttribute("aria-hidden", "true");
}

function renderPresetLibrary() {
  if (!libraryPresets) return;
  libraryPresets.innerHTML = "";
  const query = (librarySearch?.value || "").toLowerCase();
  const minW = Number(libraryMinW?.value) || 0;
  const minL = Number(libraryMinL?.value) || 0;
  PRESET_DESIGNS
    .filter((d) => d.roomW >= minW && d.roomL >= minL)
    .filter((d) => !query || `${d.name} ${d.description}`.toLowerCase().includes(query))
    .forEach((d) => {
    const card = document.createElement("div");
    card.className = "library-card";
    card.innerHTML = `
      <h4>${d.name}</h4>
      <div class="library-meta">${d.description || ""}</div>
      <div class="library-meta">Room: ${d.roomW}m × ${d.roomL}m</div>
      <button class="header-btn" data-id="${d.id}">Import</button>
    `;
    const btn = card.querySelector("button");
    btn.onclick = () => importDesignData(d);
    libraryPresets.appendChild(card);
  });
}

async function loadCommunityLibrary() {
  if (!libraryCommunity) return;
  libraryCommunity.innerHTML = "";
  const client = window.supabaseClient;
  if (!client) {
    libraryCommunity.innerHTML = `<div class="library-meta">Supabase not available.</div>`;
    return;
  }
  const { data: sessionData } = await client.auth.getSession();
  const session = sessionData?.session;
  if (!session) {
    libraryCommunity.innerHTML = `<div class="library-meta">Log in to view community designs.</div>`;
    return;
  }
  const userId = session.user?.id || "";
  const { data, error } = await client
    .from("designs")
    .select("id, name, description, room_w, room_l, items, created_by, display_name, author_email, author_avatar")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    libraryCommunity.innerHTML = `<div class="library-meta">Failed to load community designs.</div>`;
    return;
  }
  const query = (librarySearch?.value || "").toLowerCase();
  const minW = Number(libraryMinW?.value) || 0;
  const minL = Number(libraryMinL?.value) || 0;
  data
    .map((row) => {
      return ({
      id: row.id,
      name: row.name,
      description: row.description,
      roomW: Number(row.room_w),
      roomL: Number(row.room_l),
      items: row.items || [],
      createdBy: row.created_by,
      displayName: row.display_name || "Community",
      authorEmail: row.author_email || "",
      authorAvatar: row.author_avatar || ""
    });
    })
    .filter((d) => d.roomW >= minW && d.roomL >= minL)
    .filter((d) => !query || `${d.name} ${d.description}`.toLowerCase().includes(query))
    .forEach((d) => {
      const card = document.createElement("div");
      card.className = "library-card";
      card.innerHTML = `
      <h4>${d.name}</h4>
      <div class="library-meta">${d.description || ""}</div>
      <div class="library-author">
        ${d.authorAvatar ? `<img src="${d.authorAvatar}" alt="${d.displayName}">` : ""}
        <div>
          <div>${d.displayName}</div>
          ${d.authorEmail && d.authorEmail !== d.displayName ? `<div class="library-meta">${d.authorEmail}</div>` : ""}
        </div>
      </div>
      <div class="library-meta">Room: ${d.roomW}m × ${d.roomL}m</div>
      <div class="library-actions">
        <button class="header-btn" data-id="${d.id}">Import</button>
        ${d.createdBy === userId ? `<button class="header-btn" data-delete="${d.id}">Delete</button>` : ""}
      </div>
    `;
    const btn = card.querySelector("button[data-id]");
    btn.onclick = () => importDesignData(d);
    const del = card.querySelector("button[data-delete]");
    if (del) {
      del.onclick = async () => {
        const { error: delErr } = await client.from("designs").delete().eq("id", d.id);
        if (delErr) {
          showToast("Delete failed");
          return;
        }
        showToast("Design deleted");
        loadCommunityLibrary();
      };
    }
    libraryCommunity.appendChild(card);
  });
}

async function renderMyDesigns() {
  if (!libraryMine) return;
  libraryMine.innerHTML = "";
  const client = window.supabaseClient;
  if (!client) {
    libraryMine.innerHTML = `<div class="library-meta">Supabase not available.</div>`;
    return;
  }
  const { data: sessionData } = await client.auth.getSession();
  const session = sessionData?.session;
  if (!session) {
    libraryMine.innerHTML = `<div class="library-meta">Log in to view your designs.</div>`;
    return;
  }
  const query = (librarySearch?.value || "").toLowerCase();
  const minW = Number(libraryMinW?.value) || 0;
  const minL = Number(libraryMinL?.value) || 0;
  const { data, error } = await client
    .from("designs")
    .select("id, name, room_w, room_l, items")
    .eq("created_by", session.user.id)
    .order("created_at", { ascending: false });
  if (error) {
    libraryMine.innerHTML = `<div class="library-meta">Failed to load your published designs.</div>`;
    return;
  }
  const filtered = (data || [])
    .map((row) => ({
      id: row.id,
      name: row.name,
      roomW: Number(row.room_w),
      roomL: Number(row.room_l),
      items: row.items || []
    }))
    .filter((d) => d.roomW >= minW && d.roomL >= minL)
    .filter((d) => !query || `${d.name}`.toLowerCase().includes(query));
  if (!filtered.length) {
    libraryMine.innerHTML = `<div class="library-meta">No published designs match your filters.</div>`;
    return;
  }
  filtered.forEach((d) => {
    const card = document.createElement("div");
    card.className = "library-card";
    card.innerHTML = `
      <h4>${d.name}</h4>
      <div class="library-meta">Room: ${d.roomW}m × ${d.roomL}m</div>
      <div class="library-actions">
        <button class="header-btn" data-import="${d.id}">Import</button>
      </div>
    `;
    const importBtn = card.querySelector("button[data-import]");
    importBtn.onclick = () => importDesignData(d);
    libraryMine.appendChild(card);
  });
}
function importDesignData(data) {
  if (!data) return;
  const requiredW = Number(data.roomW) || 6;
  const requiredL = Number(data.roomL) || 4;
  if (roomW) roomW.value = requiredW;
  if (roomL) roomL.value = requiredL;
  syncGridScale();
  const id = generateId();
  const name = data.name ? `${data.name} (Imported)` : `Design ${designs.length + 1}`;
  const design = {
    id,
    name,
    roomW: requiredW,
    roomL: requiredL,
    items: data.items || []
  };
  designs.push(design);
  activeDesignId = id;
  applyDesign(design);
  renderTabs();
  renderDesignList();
  updateDesignExportSelect();
  saveDesigns();
  showToast("Design imported");
  closeLibraryModal();
}

function createThumbnailDataURL() {
  if (!grid) return "";
  const rect = grid.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  const gridStep = Math.max(20, gridSizePx * sx);

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  document.querySelectorAll(".equipment").forEach((el) => {
    const r = el.getBoundingClientRect();
    const x = (r.left - rect.left) * sx;
    const y = (r.top - rect.top) * sy;
    const w = r.width * sx;
    const h = r.height * sy;
    const layer = el.dataset.layer || "equipment";
    if (layer === "flooring") ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    else if (layer === "structure") ctx.fillStyle = "rgba(249, 115, 22, 0.18)";
    else ctx.fillStyle = "rgba(31, 157, 98, 0.18)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  });

  return canvas.toDataURL("image/jpeg", 0.82);
}

function hideDesignEditors() {
  designEditor?.classList.add("hidden");
  designExportBox?.classList.add("hidden");
  designImportBox?.classList.add("hidden");
  designDeleteConfirm?.classList.add("hidden");
  designPublishBox?.classList.add("hidden");
}

function showRenameEditor(isCreate) {
  hideDesignEditors();
  if (!designEditor || !designNameInput) return;
  const defaultName = `Design ${designs.length + 1}`;
  designNameInput.value = isCreate ? defaultName : (designs.find((d) => d.id === activeDesignId)?.name || defaultName);
  designEditor.classList.remove("hidden");
  designEditor.dataset.create = isCreate ? "true" : "false";
}

function handleSaveName() {
  const name = designNameInput?.value?.trim() || `Design ${designs.length + 1}`;
  const isCreate = designEditor?.dataset.create === "true";
  if (isCreate) {
    saveCurrentDesign();
    const id = generateId();
    const design = { id, name, roomW: Number(roomW?.value) || 6, roomL: Number(roomL?.value) || 4, items: [] };
    designs.push(design);
    activeDesignId = id;
    applyDesign(design);
    if (useSupabaseDesigns) upsertDesignSupabase(design);
  } else {
    const idx = designs.findIndex((d) => d.id === activeDesignId);
    if (idx !== -1) designs[idx].name = name;
    if (useSupabaseDesigns && idx !== -1) upsertDesignSupabase(designs[idx]);
  }
  renderTabs();
  renderDesignList();
  updateDesignExportSelect();
  saveDesigns();
  hideDesignEditors();
  if (isCreate) closeDesignModal();
}

function showExportBox() {
  hideDesignEditors();
  const targetId = designExportSelect?.value || activeDesignId;
  const design = designs.find((d) => d.id === targetId);
  if (!design || !designExportText) return;
  designExportText.value = JSON.stringify(design, null, 2);
  designExportBox.classList.remove("hidden");
}

function showImportBox() {
  hideDesignEditors();
  if (designImportText) designImportText.value = "";
  if (designImportFile) designImportFile.value = "";
  designImportBox.classList.remove("hidden");
}

function showDeleteConfirm() {
  hideDesignEditors();
  if (designs.length <= 1) {
    showToast("At least one design is required");
    return;
  }
  if (!pendingDeleteId) pendingDeleteId = activeDesignId;
  if (designModal && designModal.classList.contains("hidden")) {
    openDesignModal();
  }
  designDeleteConfirm.classList.remove("hidden");
}

function showPublishBox() {
  hideDesignEditors();
  if (designPublishTitle) {
    const current = designs.find((d) => d.id === activeDesignId);
    designPublishTitle.value = current?.name || "";
  }
  if (designPublishDesc) designPublishDesc.value = "";
  designPublishBox?.classList.remove("hidden");
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function publishDesign() {
  const title = designPublishTitle?.value?.trim();
  const desc = designPublishDesc?.value?.trim() || "";
  if (!title) {
    showToast("Title is required");
    return;
  }
  if (wordCount(desc) > 30) {
    showToast("Description must be 30 words or less");
    return;
  }

  const client = window.supabaseClient;
  if (!client) {
    showToast("Supabase not available");
    return;
  }
  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData?.session) {
    showToast("Log in to publish designs");
    return;
  }

  const current = designs.find((d) => d.id === activeDesignId);
  if (!current) {
    showToast("No design selected");
    return;
  }

  const user = sessionData.session.user;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Community";

  const payload = {
    name: title,
    description: desc,
    room_w: Number(current.roomW) || Number(roomW?.value) || 6,
    room_l: Number(current.roomL) || Number(roomL?.value) || 4,
    items: current.items || [],
    display_name: displayName,
    author_email: user?.email || null,
    author_avatar: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  };

  const { error } = await client.from("designs").insert(payload);
  if (error) {
    showToast("Publish failed");
    return;
  }

  showToast("Design published");
  hideDesignEditors();
  closeDesignModal();
}

function doDeleteDesign() {
  if (designs.length <= 1) return;
  const targetId = pendingDeleteId || activeDesignId;
  const idx = designs.findIndex((d) => d.id === targetId);
  if (idx === -1) return;
  designs.splice(idx, 1);
  if (activeDesignId === targetId) {
    activeDesignId = designs[0].id;
  }
  pendingDeleteId = null;
  applyDesign(designs[0]);
  renderTabs();
  renderDesignList();
  updateDesignExportSelect();
  saveDesigns();
  if (useSupabaseDesigns) deleteDesignSupabase(targetId);
  hideDesignEditors();
  closeDesignModal();
}

function downloadDesign() {
  const design = designs.find((d) => d.id === activeDesignId);
  if (!design) return;
  const blob = new Blob([JSON.stringify(design, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(design.name || "design").replace(/\\s+/g, "-").toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyExport() {
  if (!designExportText) return;
  try {
    await navigator.clipboard.writeText(designExportText.value);
    showToast("Export copied");
  } catch {
    showToast("Copy failed");
  }
}

function handleImportFile() {
  const file = designImportFile?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string" && designImportText) {
      designImportText.value = reader.result;
    }
  };
  reader.readAsText(file);
}

function doImportDesign() {
  const raw = designImportText?.value || "";
  if (!raw.trim()) {
    showToast("Paste JSON to import");
    return;
  }
  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.items)) {
      showToast("Invalid design JSON");
      return;
    }
    const id = generateId();
    const name = data.name ? `${data.name} (Imported)` : `Design ${designs.length + 1}`;
    const design = {
      id,
      name,
      roomW: Number(data.roomW) || 6,
      roomL: Number(data.roomL) || 4,
      items: data.items
    };
    designs.push(design);
    activeDesignId = id;
    applyDesign(design);
    renderTabs();
    renderDesignList();
    updateDesignExportSelect();
    saveDesigns();
    hideDesignEditors();
    showToast("Design imported");
  } catch {
    showToast("Invalid JSON");
  }
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
  const pxW = w / metersPerPixelX;
  const pxH = h / metersPerPixelY;
  if (pxW > grid.clientWidth || pxH > grid.clientHeight) {
    showToast("Item is too large for the current room size");
    return null;
  }
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
  saveCurrentDesign();
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
    saveCurrentDesign();
  };
}

function enableDrag(el) {
  el.onmousedown = (e) => {
    if (el.dataset.locked === "true") return;
    if (e.target.classList.contains("rotate")) return;
    if (e.target.classList.contains("lock")) return;

    if (e.shiftKey) {
      toggleSelection(el);
    } else {
      if (!selectedItems.has(el)) {
        clearSelection();
        addToSelection(el);
      }
    }

    const sx = e.clientX;
    const sy = e.clientY;
    const selectedArray = Array.from(selectedItems);
    const startPositions = selectedArray.map((item) => ({
      el: item,
      x: item.offsetLeft,
      y: item.offsetTop,
      w: item.offsetWidth,
      h: item.offsetHeight,
      locked: item.dataset.locked === "true"
    }));
    const ref = startPositions.find((item) => item.el === el) || startPositions[0];

    document.onmousemove = (ev) => {
      let dx = ev.clientX - sx;
      let dy = ev.clientY - sy;

      if (snapEnabled && ref) {
        const snappedX = Math.round((ref.x + dx) / gridSizePx) * gridSizePx;
        const snappedY = Math.round((ref.y + dy) / gridSizePx) * gridSizePx;
        dx = snappedX - ref.x;
        dy = snappedY - ref.y;
      }

      const maxW = grid.clientWidth;
      const maxH = grid.clientHeight;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      startPositions.forEach((item) => {
        if (item.locked) return;
        const x = item.x + dx;
        const y = item.y + dy;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + item.w);
        maxY = Math.max(maxY, y + item.h);
      });

      if (minX < 0) dx -= minX;
      if (minY < 0) dy -= minY;
      if (maxX > maxW) dx -= (maxX - maxW);
      if (maxY > maxH) dy -= (maxY - maxH);

      startPositions.forEach((item) => {
        if (item.locked) return;
        item.el.style.left = (item.x + dx) + "px";
        item.el.style.top = (item.y + dy) + "px";
      });
    };
    document.onmouseup = () => {
      document.onmousemove = null;
      saveCurrentDesign();
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
      saveCurrentDesign();
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
    saveCurrentDesign();
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

grid.addEventListener("mousedown", (e) => {
  const isGridClick = e.target === grid || e.target === drawLayer;
  if (!isGridClick) return;
  isSelecting = true;
  if (!e.shiftKey) clearSelection();
  const rect = grid.getBoundingClientRect();
  selectionStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  createSelectionBox();
  updateSelectionBox(selectionStart.x, selectionStart.y, selectionStart.x, selectionStart.y);

  const onMove = (ev) => {
    if (!isSelecting) return;
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    updateSelectionBox(selectionStart.x, selectionStart.y, x, y);
  };

  const onUp = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
    isSelecting = false;
    if (selectionBox) {
      const w = parseFloat(selectionBox.style.width) || 0;
      const h = parseFloat(selectionBox.style.height) || 0;
      if (w >= 4 && h >= 4) {
        selectInBox(e.shiftKey);
      } else if (!e.shiftKey) {
        clearSelection();
      }
    }
    removeSelectionBox();
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
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
  saveCurrentDesign();
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

document.addEventListener("keydown", (e) => {
  const target = e.target;
  const isTyping = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
  if (isTyping) return;
  if (e.key.toLowerCase() === "d" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    duplicateSelected();
  }
});

// Design modal interactions
designRenameBtn?.addEventListener("click", () => showRenameEditor(false));
designCreateBtn?.addEventListener("click", () => showRenameEditor(true));
designSaveName?.addEventListener("click", handleSaveName);
designCancelName?.addEventListener("click", hideDesignEditors);
designExportOpen?.addEventListener("click", showExportBox);
designImportOpen?.addEventListener("click", showImportBox);
designDeleteBtn?.addEventListener("click", showDeleteConfirm);
designPublishBtn?.addEventListener("click", showPublishBox);
designConfirmPublish?.addEventListener("click", publishDesign);
designCancelPublish?.addEventListener("click", hideDesignEditors);
designConfirmDelete?.addEventListener("click", doDeleteDesign);
designCancelDelete?.addEventListener("click", hideDesignEditors);
designDownload?.addEventListener("click", downloadDesign);
designCopy?.addEventListener("click", copyExport);
designCloseExport?.addEventListener("click", hideDesignEditors);
designDoImport?.addEventListener("click", doImportDesign);
designCloseImport?.addEventListener("click", hideDesignEditors);
designImportFile?.addEventListener("change", handleImportFile);
designExportSelect?.addEventListener("change", () => {
  if (designExportBox && !designExportBox.classList.contains("hidden")) {
    showExportBox();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLibraryModal();
  }
});
designModal?.addEventListener("click", (e) => {
  if (e.target === designModal) closeDesignModal();
});

libraryBtn?.addEventListener("click", openLibraryModal);
libraryModal?.addEventListener("click", (e) => {
  if (e.target === libraryModal) closeLibraryModal();
});
libraryTabs?.forEach((tab) => {
  tab.addEventListener("click", () => {
    libraryTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    if (target === "presets") {
      libraryPresets?.classList.remove("hidden");
      libraryCommunity?.classList.add("hidden");
      libraryMine?.classList.add("hidden");
    } else {
      libraryPresets?.classList.add("hidden");
      if (target === "community") {
        libraryCommunity?.classList.remove("hidden");
        libraryMine?.classList.add("hidden");
      } else {
        libraryMine?.classList.remove("hidden");
        libraryCommunity?.classList.add("hidden");
      }
    }
  });
});

[librarySearch, libraryMinW, libraryMinL].forEach((el) => {
  el?.addEventListener("input", () => {
    renderPresetLibrary();
    loadCommunityLibrary();
    renderMyDesigns();
  });
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
  saveCurrentDesign();
});

confirmNo?.addEventListener("click", () => {
  confirmToast.classList.add("hidden");
});

// Export
exportBtn?.addEventListener("click", () => {
  exportModal.classList.remove("hidden");
  exportModal.setAttribute("aria-hidden", "false");
  updateDesignExportSelect();
});

exportCancel?.addEventListener("click", () => {
  exportModal.classList.add("hidden");
  exportModal.setAttribute("aria-hidden", "true");
  hideDesignEditors();
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
  hideDesignEditors();
  runExport(selected);
});

function runExport(selectedLayers) {
  const canvas = document.createElement("canvas");
  canvas.width = 3600;
  canvas.height = 2400;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const margin = 220;
  const titleH = 260;
  const gx = margin;
  const gy = margin;
  const gw = canvas.width - margin * 2;
  const gh = canvas.height - margin * 2 - titleH;

  // Grid
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

  // Room frame
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;
  ctx.strokeRect(gx, gy, gw, gh);

  const rect = grid.getBoundingClientRect();
  const sx = gw / rect.width;
  const sy = gh / rect.height;
  const pxPerMeterX = gw / roomW.value;
  const pxPerMeterY = gh / roomL.value;

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
    ctx.font = "14px monospace";
    ctx.fillStyle = "#000";
    ctx.fillText(it.name, it.x + 6, it.y + 18);
  });

  // Dimension helpers
  function drawDimLine(x1, y1, x2, y2, label) {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.font = "12px monospace";
    const tx = (x1 + x2) / 2;
    const ty = (y1 + y2) / 2 - 4;
    ctx.fillText(label, tx + 4, ty);
  }

  function fmt(m) {
    return `${m.toFixed(2)} m`;
  }

  // Wall distances + nearest neighbor distances
  items.forEach((it, idx) => {
    // Wall distances
    const leftGap = (it.x - gx) / pxPerMeterX;
    const rightGap = (gx + gw - (it.x + it.w)) / pxPerMeterX;
    const topGap = (it.y - gy) / pxPerMeterY;
    const bottomGap = (gy + gh - (it.y + it.h)) / pxPerMeterY;

    // Horizontal wall dims (centered on item height)
    const cy = it.y + it.h / 2;
    drawDimLine(gx, cy, it.x, cy, fmt(leftGap));
    drawDimLine(it.x + it.w, cy, gx + gw, cy, fmt(rightGap));

    // Vertical wall dims (centered on item width)
    const cx = it.x + it.w / 2;
    drawDimLine(cx, gy, cx, it.y, fmt(topGap));
    drawDimLine(cx, it.y + it.h, cx, gy + gh, fmt(bottomGap));

    // Nearest neighbors: right + bottom to avoid duplicates
    let nearestRight = null;
    let nearestRightGap = Infinity;
    let nearestBottom = null;
    let nearestBottomGap = Infinity;

    items.forEach((other, j) => {
      if (j === idx) return;
      const gapRight = other.x - (it.x + it.w);
      if (gapRight >= 0 && gapRight < nearestRightGap) {
        nearestRightGap = gapRight;
        nearestRight = other;
      }
      const gapBottom = other.y - (it.y + it.h);
      if (gapBottom >= 0 && gapBottom < nearestBottomGap) {
        nearestBottomGap = gapBottom;
        nearestBottom = other;
      }
    });

    if (nearestRight && nearestRightGap < Infinity) {
      const y = it.y + it.h + 18;
      drawDimLine(it.x + it.w, y, nearestRight.x, y, fmt(nearestRightGap / pxPerMeterX));
    }

    if (nearestBottom && nearestBottomGap < Infinity) {
      const x = it.x + it.w + 18;
      drawDimLine(x, it.y + it.h, x, nearestBottom.y, fmt(nearestBottomGap / pxPerMeterY));
    }
  });

  // Dimension lines
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;

  // Width dimension
  ctx.beginPath();
  ctx.moveTo(gx, gy - 40);
  ctx.lineTo(gx + gw, gy - 40);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(gx, gy - 50);
  ctx.lineTo(gx, gy - 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(gx + gw, gy - 50);
  ctx.lineTo(gx + gw, gy - 30);
  ctx.stroke();

  // Height dimension
  ctx.beginPath();
  ctx.moveTo(gx - 40, gy);
  ctx.lineTo(gx - 40, gy + gh);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(gx - 50, gy);
  ctx.lineTo(gx - 30, gy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(gx - 50, gy + gh);
  ctx.lineTo(gx - 30, gy + gh);
  ctx.stroke();

  ctx.font = "14px monospace";
  ctx.fillStyle = "#000";
  ctx.fillText(`${roomW.value} m`, gx + gw / 2 - 20, gy - 55);
  ctx.save();
  ctx.translate(gx - 65, gy + gh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${roomL.value} m`, 0, 0);
  ctx.restore();

  // Title block
  const tx = gx;
  const ty = gy + gh + 40;
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  ctx.strokeRect(tx, ty, gw, titleH);
  ctx.font = "16px monospace";
  ctx.fillText("Primal Lab Planner – Technical Layout", tx + 20, ty + 35);
  ctx.font = "14px monospace";
  ctx.fillText(`Room Size: ${roomW.value} m × ${roomL.value} m`, tx + 20, ty + 65);
  ctx.fillText(`Scale: 1 unit = 1 m`, tx + 20, ty + 90);
  ctx.fillText(`Exported: ${new Date().toLocaleString()}`, tx + 20, ty + 115);

  // Scale bar
  const scaleMeters = 1;
  const pixelsPerMeter = gw / roomW.value;
  const barPx = scaleMeters * pixelsPerMeter;
  ctx.beginPath();
  ctx.moveTo(tx + 20, ty + 145);
  ctx.lineTo(tx + 20 + barPx, ty + 145);
  ctx.stroke();
  ctx.fillText("1 m", tx + 20 + barPx + 8, ty + 150);

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "primal-lab-technical-layout.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Init
syncGridScale();
initDesignTabs();
setupFreeDraw();
window.addEventListener("resize", () => {
  syncGridScale();
  setupFreeDraw();
});
