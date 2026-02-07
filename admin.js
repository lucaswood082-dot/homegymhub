import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_UUID = "b4cb6833-f4ea-4dcd-8443-229a7767a041";

const supabase = createClient(
  "https://nqomiajgtmxxsupjgvvu.supabase.co",
  "sb_publishable_b8tpSFMffPkoDRqehct7nQ_g5HjWpxA"
);

const loginBtn = document.getElementById("loginBtn");
const accountBtn = document.getElementById("accountBtn");
const logoutBtn = document.getElementById("logoutBtn");

const gateLoginBtn = document.getElementById("gateLoginBtn");
const gateHomeBtn = document.getElementById("gateHomeBtn");
const adminGate = document.getElementById("adminGate");
const adminContent = document.getElementById("adminContent");
const adminStatus = document.getElementById("adminStatus");
const adminMessage = document.getElementById("adminMessage");

const particlesContainer = document.getElementById("particles");
if (particlesContainer) {
  for (let i = 0; i < 40; i += 1) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${Math.random() * 12 + 8}s`;
    p.style.animationDelay = `${Math.random() * 5}s`;
    p.style.setProperty("--drift", `${Math.random() * 200 - 100}px`);
    particlesContainer.appendChild(p);
  }
}

const actionButtons = document.querySelectorAll("[data-link]");

actionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-link");
    if (target) window.location.href = target;
  });
});

function setStatus(text, ok = false) {
  adminStatus.textContent = text;
  adminStatus.style.background = ok
    ? "rgba(31, 157, 98, 0.15)"
    : "rgba(239, 68, 68, 0.12)";
  adminStatus.style.borderColor = ok
    ? "rgba(31, 157, 98, 0.4)"
    : "rgba(239, 68, 68, 0.35)";
  adminStatus.style.color = ok ? "#0f7a45" : "#b91c1c";
}

function showGate(message) {
  adminGate.classList.remove("hidden");
  adminContent.classList.add("hidden");
  adminMessage.textContent = message;
}

function showContent() {
  adminGate.classList.add("hidden");
  adminContent.classList.remove("hidden");
}

async function refreshAuth() {
  const { data } = await supabase.auth.getUser();
  const user = data?.user || null;

  if (user) {
    loginBtn.style.display = "none";
    accountBtn.style.display = "inline-flex";
    logoutBtn.style.display = "inline-flex";
  } else {
    loginBtn.style.display = "inline-flex";
    accountBtn.style.display = "none";
    logoutBtn.style.display = "none";
  }

  return user;
}

async function init() {
  const user = await refreshAuth();

  if (!user) {
    setStatus("Access denied", false);
    showGate("Log in with the admin account to access this console.");
    return;
  }

  if (user.id !== ADMIN_UUID) {
    setStatus("Access denied", false);
    showGate("This account is not authorized for the admin console.");
    return;
  }

  setStatus("Admin access granted", true);
  showContent();
}

loginBtn?.addEventListener("click", () => {
  window.location.href = "auth.html";
});

accountBtn?.addEventListener("click", () => {
  window.location.href = "account.html";
});

logoutBtn?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  await refreshAuth();
  setStatus("Access denied", false);
  showGate("Log in with the admin account to access this console.");
});

gateLoginBtn?.addEventListener("click", () => {
  window.location.href = "auth.html";
});

gateHomeBtn?.addEventListener("click", () => {
  window.location.href = "index.html";
});

supabase.auth.onAuthStateChange(() => init());

init();
