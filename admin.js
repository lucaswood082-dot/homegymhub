import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_UUID = "b4cb6833-f4ea-4dcd-8443-229a7767a041";

const supabase = createClient(
  "https://nqomiajgtmxxsupjgvvu.supabase.co",
  "sb_publishable_b8tpSFMffPkoDRqehct7nQ_g5HjWpxA",
  {
    auth: {
      persistSession: true,
      storageKey: "sb-nqomiajgtmxxsupjgvvu-auth-token"
    }
  }
);

const loginBtn = document.getElementById("loginBtn");
const accountBtn = document.getElementById("accountBtn");
const logoutBtn = document.getElementById("logoutBtn");

const gateLoginBtn = document.getElementById("gateLoginBtn");
const gateHomeBtn = document.getElementById("gateHomeBtn");
const adminGate = document.getElementById("adminGate");
const adminContent = document.getElementById("adminContent");
const adminOverview = document.getElementById("adminOverview");
const adminVerify = document.getElementById("adminVerify");
const adminListings = document.getElementById("adminListings");
const adminThreads = document.getElementById("adminThreads");
const adminStatus = document.getElementById("adminStatus");
const adminMessage = document.getElementById("adminMessage");
const adminToast = document.getElementById("adminToast");

window.__adminReady = true;

const statListings = document.getElementById("statListings");
const statListingsActive = document.getElementById("statListingsActive");
const statThreads = document.getElementById("statThreads");
const statMessages = document.getElementById("statMessages");

const verifyUserId = document.getElementById("verifyUserId");
const verifyListingId = document.getElementById("verifyListingId");
const verifyToggleBtn = document.getElementById("verifyToggleBtn");
const verifyFromListingBtn = document.getElementById("verifyFromListingBtn");

const listingSearch = document.getElementById("listingSearch");
const listingStatusFilter = document.getElementById("listingStatusFilter");
const adminListingsTable = document.getElementById("adminListingsTable");
const refreshListingsBtn = document.getElementById("refreshListingsBtn");

const adminThreadsList = document.getElementById("adminThreadsList");
const refreshThreadsBtn = document.getElementById("refreshThreadsBtn");

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

function showToast(message, type = "info") {
  if (!adminToast) return;
  adminToast.textContent = message;
  adminToast.style.background =
    type === "error" ? "rgba(239, 68, 68, 0.9)" : "rgba(15, 23, 42, 0.92)";
  adminToast.classList.remove("hidden");
  clearTimeout(adminToast._timer);
  adminToast._timer = setTimeout(() => adminToast.classList.add("hidden"), 2200);
}

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
  adminOverview?.classList.add("hidden");
  adminVerify?.classList.add("hidden");
  adminListings?.classList.add("hidden");
  adminThreads?.classList.add("hidden");
  adminMessage.textContent = message;
}

function showContent() {
  adminGate.classList.add("hidden");
  adminContent.classList.remove("hidden");
  adminOverview?.classList.remove("hidden");
  adminVerify?.classList.remove("hidden");
  adminListings?.classList.remove("hidden");
  adminThreads?.classList.remove("hidden");
}

async function refreshAuth() {
  let { data } = await supabase.auth.getUser();
  let user = data?.user || null;

  if (!user) {
    const cached = localStorage.getItem("sb-nqomiajgtmxxsupjgvvu-auth-token");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const accessToken = parsed?.access_token;
        const refreshToken = parsed?.refresh_token;
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          const retry = await supabase.auth.getUser();
          user = retry?.data?.user || null;
        }
      } catch (err) {
        console.warn("Admin auth cache parse failed", err);
      }
    }
  }

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

async function loadOverview() {
  const [{ count: listingCount }, { count: activeCount }, { count: threadCount }, { count: messageCount }] =
    await Promise.all([
      supabase.from("marketplace_listings").select("id", { count: "exact", head: true }),
      supabase
        .from("marketplace_listings")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase.from("main_threads").select("id", { count: "exact", head: true }),
      supabase.from("marketplace_messages").select("id", { count: "exact", head: true })
    ]);

  if (statListings) statListings.textContent = listingCount || 0;
  if (statListingsActive) statListingsActive.textContent = activeCount || 0;
  if (statThreads) statThreads.textContent = threadCount || 0;
  if (statMessages) statMessages.textContent = messageCount || 0;
}

function renderListingRow(listing) {
  const row = document.createElement("div");
  row.className = "admin-row";

  const info = document.createElement("div");
  info.innerHTML = `
    <strong>${listing.title || "Untitled"}</strong>
    <small>${listing.seller_name || "Unknown Seller"} • ${listing.seller_email || "No email"}</small>
    <small>${listing.id}</small>
  `;

  const status = document.createElement("div");
  const pill = document.createElement("span");
  pill.className = `admin-pill ${listing.status === "active" ? "" : "offline"}`;
  pill.textContent = listing.status || "unknown";
  status.appendChild(pill);

  const meta = document.createElement("div");
  meta.innerHTML = `
    <small>${listing.price ? `$${Number(listing.price).toFixed(2)}` : "No price"}</small>
    <small>${new Date(listing.created_at).toLocaleString()}</small>
  `;

  const actions = document.createElement("div");
  actions.className = "admin-actions-inline";
  const verifyBtn = document.createElement("button");
  verifyBtn.className = "btn secondary";
  verifyBtn.textContent = listing.seller_verified ? "Unverify" : "Verify";
  verifyBtn.addEventListener("click", () => toggleVerifyFromListing(listing));

  const removeBtn = document.createElement("button");
  removeBtn.className = "btn ghost";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => removeListing(listing.id));

  actions.appendChild(verifyBtn);
  actions.appendChild(removeBtn);

  row.appendChild(info);
  row.appendChild(status);
  row.appendChild(meta);
  row.appendChild(actions);
  return row;
}

async function loadListings() {
  if (!adminListingsTable) return;
  adminListingsTable.innerHTML = "<div class='admin-row'>Loading listings…</div>";

  let query = supabase
    .from("marketplace_listings")
    .select("id,title,price,status,created_at,created_by,seller_name,seller_email,seller_verified")
    .order("created_at", { ascending: false })
    .limit(50);

  const searchTerm = listingSearch?.value?.trim();
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,seller_email.ilike.%${searchTerm}%`);
  }
  const statusFilter = listingStatusFilter?.value;
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Admin listings error:", error);
    adminListingsTable.innerHTML = "<div class='admin-row'>Failed to load listings.</div>";
    showToast("Failed to load listings", "error");
    return;
  }

  if (!data || data.length === 0) {
    adminListingsTable.innerHTML = "<div class='admin-row'>No listings found.</div>";
    return;
  }

  adminListingsTable.innerHTML = "";
  data.forEach((listing) => adminListingsTable.appendChild(renderListingRow(listing)));
}

async function removeListing(listingId) {
  if (!listingId) return;
  const { error } = await supabase.from("marketplace_listings").delete().eq("id", listingId);
  if (error) {
    console.error("Remove listing error:", error);
    showToast("Failed to remove listing", "error");
    return;
  }
  showToast("Listing removed");
  loadListings();
  loadOverview();
}

async function toggleVerifyForUser(userId) {
  if (!userId) {
    showToast("Enter a seller UUID", "error");
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, verified_seller")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Verify load error:", profileError);
    showToast("Unable to find that user", "error");
    return;
  }

  const nextValue = !profile.verified_seller;
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ verified_seller: nextValue })
    .eq("id", userId);

  if (updateError) {
    console.error("Verify update error:", updateError);
    showToast("Failed to update verified status", "error");
    return;
  }

  await supabase
    .from("marketplace_listings")
    .update({ seller_verified: nextValue })
    .eq("created_by", userId);

  showToast(nextValue ? "Seller verified" : "Seller unverified");
  loadListings();
}

async function toggleVerifyFromListing(listing) {
  if (!listing?.created_by) return;
  await toggleVerifyForUser(listing.created_by);
}

async function handleVerifyFromListingId() {
  const listingId = verifyListingId?.value?.trim();
  if (!listingId) {
    showToast("Enter a listing ID", "error");
    return;
  }
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("created_by")
    .eq("id", listingId)
    .single();

  if (error || !data?.created_by) {
    console.error("Listing lookup error:", error);
    showToast("Listing not found", "error");
    return;
  }
  verifyUserId.value = data.created_by;
  toggleVerifyForUser(data.created_by);
}

async function loadThreads() {
  if (!adminThreadsList) return;
  adminThreadsList.innerHTML = "<div class='admin-row'>Loading threads…</div>";
  const { data, error } = await supabase
    .from("main_threads")
    .select("id,title,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Admin threads error:", error);
    adminThreadsList.innerHTML = "<div class='admin-row'>Failed to load threads.</div>";
    showToast("Failed to load threads", "error");
    return;
  }

  if (!data || data.length === 0) {
    adminThreadsList.innerHTML = "<div class='admin-row'>No threads found.</div>";
    return;
  }

  adminThreadsList.innerHTML = "";
  data.forEach((thread) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <div>
        <strong>${thread.title || "Untitled Thread"}</strong>
        <small>${thread.id}</small>
      </div>
      <div></div>
      <div><small>${new Date(thread.created_at).toLocaleString()}</small></div>
    `;

    const actions = document.createElement("div");
    actions.className = "admin-actions-inline";
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn ghost";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", async () => {
      const { error: deleteError } = await supabase
        .from("main_threads")
        .delete()
        .eq("id", thread.id);

      if (deleteError) {
        console.error("Delete thread error:", deleteError);
        showToast("Failed to remove thread", "error");
        return;
      }
      showToast("Thread removed");
      loadThreads();
      loadOverview();
    });

    actions.appendChild(removeBtn);
    row.appendChild(actions);
    adminThreadsList.appendChild(row);
  });
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
  loadOverview();
  loadListings();
  loadThreads();
}

loginBtn?.addEventListener("click", () => {
  window.location.href = "auth.html?redirect=admin.html";
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
  window.location.href = "auth.html?redirect=admin.html";
});

gateHomeBtn?.addEventListener("click", () => {
  window.location.href = "index.html";
});

refreshListingsBtn?.addEventListener("click", loadListings);
refreshThreadsBtn?.addEventListener("click", loadThreads);
listingSearch?.addEventListener("input", () => {
  clearTimeout(listingSearch._timer);
  listingSearch._timer = setTimeout(loadListings, 250);
});
listingStatusFilter?.addEventListener("change", loadListings);

verifyToggleBtn?.addEventListener("click", () => toggleVerifyForUser(verifyUserId?.value?.trim()));
verifyFromListingBtn?.addEventListener("click", handleVerifyFromListingId);

supabase.auth.onAuthStateChange(() => init());

init();
