const supabase = window.supabaseClient;

const loginBtn = document.getElementById("loginBtn");
const accountBtn = document.getElementById("accountBtn");
const logoutBtn = document.getElementById("logoutBtn");

const createListingBtn = document.getElementById("createListingBtn");
const openInboxBtn = document.getElementById("openInboxBtn");
const inboxBadge = document.getElementById("inboxBadge");
const listingGrid = document.getElementById("listingGrid");

const listingModal = document.getElementById("listingModal");
const listingTitle = document.getElementById("listingTitle");
const listingDescription = document.getElementById("listingDescription");
const listingPrice = document.getElementById("listingPrice");
const listingCategory = document.getElementById("listingCategory");
const listingCondition = document.getElementById("listingCondition");
const listingImage = document.getElementById("listingImage");
const listingSave = document.getElementById("listingSave");
const listingCancel = document.getElementById("listingCancel");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const conditionFilter = document.getElementById("conditionFilter");
const sortFilter = document.getElementById("sortFilter");
const myListingsToggle = document.getElementById("myListingsToggle");

const inboxDrawer = document.getElementById("inboxDrawer");
const inboxList = document.getElementById("inboxList");
const closeInbox = document.getElementById("closeInbox");

const chatModal = document.getElementById("chatModal");
const chatTitle = document.getElementById("chatTitle");
const chatMeta = document.getElementById("chatMeta");
const chatMessages = document.getElementById("chatMessages");
const typingIndicator = document.getElementById("typingIndicator");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
const closeChatBtn = document.getElementById("closeChatBtn");
const exitChatBtn = document.getElementById("exitChatBtn");

const toast = document.getElementById("toast");

let currentUser = null;
let activeThread = null;
let inboxChannel = null;
let threadChannel = null;
let typingSendTimeout = null;
let typingHideTimeout = null;

function showToast(message, type = "info") {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("info", "error", "success");
  toast.classList.add(type);
  toast.classList.remove("hidden");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add("hidden"), 2000);
}

if (!supabase) {
  console.error("Supabase client not available");
  if (listingGrid) {
    listingGrid.innerHTML = '<div class="loading">Supabase client not available.</div>';
  }
}

async function refreshAuth() {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  currentUser = data?.user || null;
  if (currentUser) {
    loginBtn.style.display = "none";
    accountBtn.style.display = "inline-flex";
    logoutBtn.style.display = "inline-flex";
  } else {
    loginBtn.style.display = "inline-flex";
    accountBtn.style.display = "none";
    logoutBtn.style.display = "none";
  }
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
  showToast("Logged out", "success");
  loadListings();
});

function openListingModal() {
  if (!currentUser) {
    showToast("Log in to create a listing", "info");
    return;
  }
  listingModal.classList.remove("hidden");
  listingModal.setAttribute("aria-hidden", "false");
}

function closeListingModal() {
  listingModal.classList.add("hidden");
  listingModal.setAttribute("aria-hidden", "true");
}

createListingBtn?.addEventListener("click", openListingModal);
listingCancel?.addEventListener("click", closeListingModal);
listingModal?.addEventListener("click", (e) => {
  if (e.target === listingModal) closeListingModal();
});

listingSave?.addEventListener("click", async () => {
  if (!currentUser) {
    showToast("Log in to create a listing", "info");
    return;
  }
  const title = listingTitle.value.trim();
  const description = listingDescription.value.trim();
  if (!title || !description) {
    showToast("Title and description are required", "error");
    return;
  }

  const payload = {
    title,
    description,
    price: listingPrice.value ? Number(listingPrice.value) : null,
    category: listingCategory.value,
    condition: listingCondition.value,
    image_url: listingImage.value.trim() || null,
    created_by: currentUser.id,
    seller_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email,
    seller_email: currentUser.email,
    seller_avatar: currentUser.user_metadata?.avatar_url || null,
    status: "active"
  };

  const { error } = await supabase.from("marketplace_listings").insert(payload);
  if (error) {
    console.error(error);
    showToast("Failed to publish listing", "error");
    return;
  }

  listingTitle.value = "";
  listingDescription.value = "";
  listingPrice.value = "";
  listingImage.value = "";
  closeListingModal();
  showToast("Listing published", "success");
  loadListings();
});

async function loadListings() {
  if (!supabase) return;
  listingGrid.innerHTML = '<div class="loading">Loading listings...</div>';

  let query = supabase.from("marketplace_listings").select("*");
  query = query.eq("status", "active");

  if (myListingsToggle.checked) {
    if (!currentUser) {
      listingGrid.innerHTML = '<div class="loading">Log in to view your listings.</div>';
      return;
    }
    query = query.eq("created_by", currentUser.id);
  }

  if (categoryFilter.value) query = query.eq("category", categoryFilter.value);
  if (conditionFilter.value) query = query.eq("condition", conditionFilter.value);

  if (searchInput.value.trim()) {
    const q = searchInput.value.trim();
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  query = query.order("created_at", { ascending: sortFilter.value === "oldest" });

  const { data, error } = await query;
  if (error) {
    console.error(error);
    listingGrid.innerHTML = '<div class="loading">Failed to load listings.</div>';
    return;
  }

  if (!data || data.length === 0) {
    listingGrid.innerHTML = '<div class="loading">No listings yet.</div>';
    return;
  }

  listingGrid.innerHTML = data.map((item) => {
    const price = item.price ? `$${Number(item.price).toFixed(2)}` : "Offer";
    const img = item.image_url
      ? `<img class="listing-image" src="${item.image_url}" alt="${item.title}" onerror="this.style.display='none'">`
      : `<div class="listing-image"></div>`;

    const owner = currentUser && item.created_by === currentUser.id;

    return `
      <div class="listing-card" data-id="${item.id}">
        ${img}
        <h3 class="listing-title">${item.title}</h3>
        <p class="listing-desc">${item.description}</p>
        <div class="listing-meta">
          <span>${price}</span>
          <span>${item.category}</span>
          <span>${item.condition}</span>
        </div>
        <div class="listing-meta">Seller: ${item.seller_name || "Primal Lab user"}</div>
        <div class="listing-actions">
          ${owner ? `<button class="header-btn remove-listing" data-id="${item.id}">Remove</button>` : ``}
          ${owner ? `` : `<button class="header-btn primary inquire-btn" data-id="${item.id}">Inquire</button>`}
        </div>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".inquire-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const listing = data.find((l) => l.id === id);
      if (listing) handleInquiry(listing);
    });
  });

  document.querySelectorAll(".remove-listing").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const { error: delErr } = await supabase
        .from("marketplace_listings")
        .update({ status: "removed" })
        .eq("id", id);
      if (delErr) {
        console.error("Remove listing error:", delErr);
        // Fallback to delete if update blocked
        const { error: hardErr } = await supabase
          .from("marketplace_listings")
          .delete()
          .eq("id", id);
        if (hardErr) {
          console.error("Hard delete error:", hardErr);
          showToast("Failed to remove listing", "error");
          return;
        }
      }
      showToast("Listing removed", "success");
      loadListings();
    });
  });
}

async function handleInquiry(listing) {
  if (!currentUser) {
    showToast("Log in to send an inquiry", "info");
    return;
  }
  if (listing.created_by === currentUser.id) {
    showToast("You can’t message your own listing", "error");
    return;
  }

  const { data: existing, error } = await supabase
    .from("marketplace_threads")
    .select("*")
    .eq("listing_id", listing.id)
    .eq("buyer_id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    showToast("Couldn’t start chat", "error");
    return;
  }

  if (existing) {
    openChat(existing, listing);
    return;
  }

  const { data: created, error: createErr } = await supabase
    .from("marketplace_threads")
    .insert({
      listing_id: listing.id,
      buyer_id: currentUser.id,
      seller_id: listing.created_by,
      status: "open"
    })
    .select()
    .single();

  if (createErr) {
    console.error(createErr);
    showToast("Couldn’t start chat", "error");
    return;
  }

  openChat(created, listing);
}

async function loadInbox() {
  if (!currentUser) {
    showToast("Log in to view inbox", "info");
    return;
  }

  inboxList.innerHTML = '<div class="loading">Loading chats...</div>';

  const { data: pinRows } = await supabase
    .from("marketplace_pins")
    .select("thread_id")
    .eq("user_id", currentUser.id);
  const pinnedSet = new Set((pinRows || []).map((p) => p.thread_id));

  const { data, error } = await supabase
    .from("marketplace_threads")
    .select("id, listing_id, buyer_id, seller_id, status, created_at, last_message_at, buyer_last_read_at, seller_last_read_at, buyer_closed_at, seller_closed_at, listing:marketplace_listings(title, price, seller_name)")
    .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error(error);
    inboxList.innerHTML = '<div class="loading">Couldn\'t load inbox.</div>';
    return;
  }

  if (!data || !data.length) {
    inboxList.innerHTML = '<div class="loading">No chats yet.</div>';
    updateInboxBadge(0);
    return;
  }

  const visibleThreads = data.filter((t) => !isClosedForUser(t));
  visibleThreads.sort((a, b) => {
    const ap = pinnedSet.has(a.id) ? 1 : 0;
    const bp = pinnedSet.has(b.id) ? 1 : 0;
    if (ap !== bp) return bp - ap;
    const at = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const bt = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return bt - at;
  });

  updateInboxBadge(countUnreadThreads(visibleThreads));

  inboxList.innerHTML = visibleThreads.map((thread) => {
    const listing = thread.listing || {};
    const otherClosed = isClosedByOther(thread);
    const pinned = pinnedSet.has(thread.id);
    return `
      <div class="inbox-item ${pinned ? "pinned" : ""}" data-id="${thread.id}" data-listing="${thread.listing_id}">
        <h4>${listing.title || "Listing"}</h4>
        <p>${listing.price ? `$${Number(listing.price).toFixed(2)}` : "Offer"} · ${listing.seller_name || "Seller"}</p>
        <div class="inbox-row">
          <span class="pill ${otherClosed ? "pill-muted" : ""}">${otherClosed ? "Closed by other" : "Open"}</span>
          <button class="pin-btn ${pinned ? "active" : ""}" data-id="${thread.id}" type="button">${pinned ? "Pinned" : "Pin"}</button>
        </div>
      </div>
    `;
  }).join("");

  inboxList.querySelectorAll(".inbox-item").forEach((item) => {
    item.addEventListener("click", () => {
      const threadId = item.dataset.id;
      const listingId = item.dataset.listing;
      const thread = visibleThreads.find((t) => t.id === threadId);
      const listing = thread?.listing || {};
      openChat(thread, { id: listingId, title: listing.title, seller_name: listing.seller_name });
    });
  });

  inboxList.querySelectorAll(".pin-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!id) return;
      if (btn.classList.contains("active")) {
        await supabase.from("marketplace_pins").delete().eq("thread_id", id).eq("user_id", currentUser.id);
      } else {
        await supabase.from("marketplace_pins").insert({ thread_id: id, user_id: currentUser.id });
      }
      loadInbox();
    });
  });
}

function countUnreadThreads(threads) {
  const now = Date.now();
  let count = 0;
  threads.forEach((t) => {
    if (isClosedForUser(t)) return;
    if (t.status !== "open") return;
    if (!t.last_message_at) return;
    const last = new Date(t.last_message_at).getTime();
    const lastRead = currentUser?.id === t.buyer_id
      ? (t.buyer_last_read_at ? new Date(t.buyer_last_read_at).getTime() : 0)
      : (t.seller_last_read_at ? new Date(t.seller_last_read_at).getTime() : 0);
    if (last > lastRead) count += 1;
  });
  return count;
}

function updateInboxBadge(count) {
  if (!inboxBadge) return;
  if (!count) {
    inboxBadge.classList.add("hidden");
    inboxBadge.textContent = "";
    return;
  }
  inboxBadge.textContent = count > 9 ? "9+" : String(count);
  inboxBadge.classList.remove("hidden");
}

async function refreshInboxBadge() {
  if (!currentUser) return updateInboxBadge(0);
  const { data } = await supabase
    .from("marketplace_threads")
    .select("buyer_id, seller_id, status, last_message_at, buyer_last_read_at, seller_last_read_at, buyer_closed_at, seller_closed_at")
    .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (!data) return;
  updateInboxBadge(countUnreadThreads(data));
}

openInboxBtn?.addEventListener("click", () => {
  const isOpen = !inboxDrawer.classList.contains("hidden");
  if (isOpen) {
    inboxDrawer.classList.add("hidden");
    return;
  }
  inboxDrawer.classList.remove("hidden");
  loadInbox();
});

closeInbox?.addEventListener("click", () => {
  inboxDrawer.classList.add("hidden");
});

async function openChat(thread, listing) {
  activeThread = thread;
  if (isClosedForUser(thread)) {
    showToast("Chat closed on your end", "info");
    return;
  }
  if (typingIndicator) typingIndicator.classList.add("hidden");
  chatTitle.textContent = listing?.title || "Chat";
  chatMeta.textContent = listing?.seller_name ? `Seller: ${listing.seller_name}` : "";
  chatModal.classList.remove("hidden");
  chatModal.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    chatInput?.focus();
  }, 60);
  setupThreadRealtime(thread.id);
  await loadMessages(thread.id);
  await markThreadRead(thread);
  await markMessagesRead(thread.id);
  refreshInboxBadge();
  const closed = thread.status === "closed";
  const otherClosed = isClosedByOther(thread);
  chatInput.disabled = closed;
  sendChatBtn.disabled = closed;
  chatInput.placeholder = closed ? "Chat closed" : (otherClosed ? "Other user closed the chat" : "Type a message...");
}

function closeChatModal() {
  chatModal.classList.add("hidden");
  chatModal.setAttribute("aria-hidden", "true");
  activeThread = null;
  teardownThreadRealtime();
  clearTimeout(typingSendTimeout);
  clearTimeout(typingHideTimeout);
  if (typingIndicator) typingIndicator.classList.add("hidden");
}

exitChatBtn?.addEventListener("click", closeChatModal);
chatModal?.addEventListener("click", (e) => {
  if (e.target === chatModal) closeChatModal();
});

async function loadMessages(threadId) {
  chatMessages.innerHTML = '<div class="loading">Loading messages...</div>';
  const { data, error } = await supabase
    .from("marketplace_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    chatMessages.innerHTML = '<div class="loading">Couldn\'t load messages.</div>';
    return;
  }

  if (!data || !data.length) {
    chatMessages.innerHTML = '<div class="loading">No messages yet. Say hello.</div>';
    return;
  }

  chatMessages.innerHTML = data.map((msg) => {
    const isSelf = msg.sender_id === currentUser?.id;
    const cls = isSelf ? "self" : "other";
    const status = isSelf
      ? (msg.read_at ? "Read" : msg.delivered_at ? "Delivered" : "Sent")
      : "";
    return `
      <div class="chat-bubble ${cls}">
        <div>${msg.body}</div>
        ${isSelf ? `<div class="chat-status">${status}</div>` : ""}
      </div>
    `;
  }).join("");

  chatMessages.scrollTop = chatMessages.scrollHeight;

  await markMessagesDelivered(threadId);
}

async function markMessagesDelivered(threadId) {
  if (!currentUser) return;
  await supabase
    .from("marketplace_messages")
    .update({ delivered_at: new Date().toISOString() })
    .eq("thread_id", threadId)
    .neq("sender_id", currentUser.id)
    .is("delivered_at", null);
}

async function markMessagesRead(threadId) {
  if (!currentUser) return;
  await supabase
    .from("marketplace_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_id", threadId)
    .neq("sender_id", currentUser.id)
    .is("read_at", null);
}

sendChatBtn?.addEventListener("click", async () => {
  if (!activeThread || !currentUser) return;
  if (activeThread.status === "closed") {
    showToast("This chat is closed", "info");
    return;
  }
  const body = chatInput.value.trim();
  if (!body) return;

  const { error } = await supabase.from("marketplace_messages").insert({
    thread_id: activeThread.id,
    sender_id: currentUser.id,
    body
  });

  if (error) {
    console.error(error);
    showToast("Failed to send message", "error");
    return;
  }

  chatInput.value = "";
  await supabase.from("marketplace_threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", activeThread.id);
  loadMessages(activeThread.id);
  refreshInboxBadge();
});

chatInput?.addEventListener("input", () => {
  if (!activeThread || !threadChannel) return;
  if (activeThread.status === "closed") return;
  broadcastTyping(true);
  clearTimeout(typingSendTimeout);
  typingSendTimeout = setTimeout(() => broadcastTyping(false), 1500);
});

closeChatBtn?.addEventListener("click", async () => {
  if (!activeThread) return;
  const payload = currentUser?.id === activeThread.buyer_id
    ? { buyer_closed_at: new Date().toISOString() }
    : { seller_closed_at: new Date().toISOString() };
  const { error } = await supabase
    .from("marketplace_threads")
    .update(payload)
    .eq("id", activeThread.id);
  if (error) {
    showToast("Couldn’t close chat", "error");
    return;
  }
  showToast("Chat closed on your end", "success");
  closeChatModal();
  loadInbox();
  refreshInboxBadge();
});

[searchInput, categoryFilter, conditionFilter, sortFilter, myListingsToggle].forEach((el) => {
  el?.addEventListener("input", loadListings);
  el?.addEventListener("change", loadListings);
});

if (supabase) {
  supabase.auth.onAuthStateChange(() => {
    refreshAuth().then(() => loadListings());
    refreshInboxBadge();
    setupInboxRealtime();
  });
  refreshAuth().then(() => loadListings());
  refreshInboxBadge();
  setupInboxRealtime();
}

const params = new URLSearchParams(window.location.search);
if (params.get("create") === "1") {
  refreshAuth().then(() => {
    if (currentUser) {
      openListingModal();
    } else {
      showToast("Log in to create a listing", "info");
    }
  });
}

async function markThreadRead(thread) {
  if (!thread || !currentUser) return;
  const payload = currentUser.id === thread.buyer_id
    ? { buyer_last_read_at: new Date().toISOString() }
    : { seller_last_read_at: new Date().toISOString() };
  await supabase.from("marketplace_threads").update(payload).eq("id", thread.id);
}

function setupInboxRealtime() {
  if (!currentUser || inboxChannel) return;
  inboxChannel = supabase.channel(`marketplace-inbox-${currentUser.id}`);
  inboxChannel
    .on("postgres_changes", { event: "*", schema: "public", table: "marketplace_threads" }, () => {
      refreshInboxBadge();
      if (!inboxDrawer.classList.contains("hidden")) loadInbox();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "marketplace_messages" }, () => {
      refreshInboxBadge();
      if (!inboxDrawer.classList.contains("hidden")) loadInbox();
    })
    .subscribe();
}

function setupThreadRealtime(threadId) {
  teardownThreadRealtime();
  threadChannel = supabase.channel(`marketplace-thread-${threadId}`);

  threadChannel
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "marketplace_messages", filter: `thread_id=eq.${threadId}` }, async (payload) => {
      if (payload?.new?.sender_id && payload.new.sender_id !== currentUser?.id) {
        await markMessagesDelivered(threadId);
      }
      if (chatModal && !chatModal.classList.contains("hidden")) {
        await markMessagesRead(threadId);
      }
      loadMessages(threadId);
      refreshInboxBadge();
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "marketplace_messages", filter: `thread_id=eq.${threadId}` }, () => {
      loadMessages(threadId);
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "marketplace_threads", filter: `id=eq.${threadId}` }, (payload) => {
      if (payload?.new) {
        activeThread = { ...activeThread, ...payload.new };
        loadInbox();
      }
    })
    .on("broadcast", { event: "typing" }, ({ payload }) => {
      if (!payload || payload.user_id === currentUser?.id) return;
      if (typingIndicator) {
        typingIndicator.classList.toggle("hidden", !payload.typing);
        clearTimeout(typingHideTimeout);
        typingHideTimeout = setTimeout(() => typingIndicator.classList.add("hidden"), 1200);
      }
    })
    .subscribe();
}

function teardownThreadRealtime() {
  if (!threadChannel) return;
  supabase.removeChannel(threadChannel);
  threadChannel = null;
}

function broadcastTyping(typing) {
  if (!threadChannel || !activeThread) return;
  threadChannel.send({
    type: "broadcast",
    event: "typing",
    payload: { thread_id: activeThread.id, user_id: currentUser?.id, typing }
  });
}

function isClosedForUser(thread) {
  if (!thread || !currentUser) return false;
  return currentUser.id === thread.buyer_id
    ? Boolean(thread.buyer_closed_at)
    : Boolean(thread.seller_closed_at);
}

function isClosedByOther(thread) {
  if (!thread || !currentUser) return false;
  return currentUser.id === thread.buyer_id
    ? Boolean(thread.seller_closed_at)
    : Boolean(thread.buyer_closed_at);
}
