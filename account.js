import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://nqomiajgtmxxsupjgvvu.supabase.co",
  "sb_publishable_b8tpSFMffPkoDRqehct7nQ_g5HjWpxA"
);

// DOM Elements
const editBtn = document.getElementById("editBtn");
const editPanel = document.getElementById("editPanel");
const changePicBtn = document.getElementById("changePicBtn");
const imgInput = document.getElementById("imgInput");
const profileImg = document.getElementById("profileImg");
const doneBtn = document.getElementById("doneBtn");
const displayNameEl = document.getElementById("displayName");
const displayNameInput = document.getElementById("displayNameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const emailEl = document.querySelector(".email");
const toast = document.getElementById("toast");

// Avatar
const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'><path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/></svg>";

let currentUser = null;
let currentProfile = null;

// Toast function
function showToast(msg, isError = false) {
  toast.textContent = msg;
  toast.style.background = isError 
    ? "linear-gradient(135deg, #ef4444, #dc2626)" 
    : "linear-gradient(135deg, #0f2d57, #f97316)";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Load user data from Supabase
async function loadUserData() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      showToast("Please log in to view your account", true);
      setTimeout(() => window.location.href = "auth.html", 2000);
      return;
    }

    currentUser = user;
    emailEl.textContent = user.email;

    // Load profile from database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Profile load error:", profileError);
      showToast("Error loading profile", true);
      return;
    }

    if (profile) {
      currentProfile = profile;
      displayNameEl.textContent = profile.display_name || "Your Name";
      
      // Load profile image from localStorage (since we're storing it there)
      const savedImage = localStorage.getItem(`profileImage_${user.id}`);
      profileImg.src = savedImage || defaultAvatar;
    } else {
      // Create initial profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert([{ id: user.id, display_name: "Your Name" }])
        .select()
        .single();

      if (createError) {
        console.error("Profile creation error:", createError);
        showToast("Error creating profile", true);
        return;
      }

      currentProfile = newProfile;
      displayNameEl.textContent = "Your Name";
      profileImg.src = defaultAvatar;
    }

  } catch (err) {
    console.error("Load user data error:", err);
    showToast("Error loading account data", true);
  }
}

// Check if display name is available
async function isDisplayNameAvailable(displayName) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("display_name", displayName)
      .neq("id", currentUser.id); // Exclude current user

    if (error) throw error;
    
    return !data || data.length === 0;
  } catch (err) {
    console.error("Display name check error:", err);
    return false;
  }
}

// Validate display name
function validateDisplayName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Display name cannot be empty" };
  }

  if (name.length < 3) {
    return { valid: false, error: "Display name must be at least 3 characters" };
  }

  if (name.length > 30) {
    return { valid: false, error: "Display name must be less than 30 characters" };
  }

  // Allow letters, numbers, spaces, underscores, hyphens
  const validPattern = /^[a-zA-Z0-9_\- ]+$/;
  if (!validPattern.test(name)) {
    return { valid: false, error: "Display name can only contain letters, numbers, spaces, underscores, and hyphens" };
  }

  return { valid: true };
}

// Open edit panel
editBtn.addEventListener("click", () => {
  editPanel.classList.remove("hidden");
  editBtn.classList.add("hidden");
  displayNameInput.value = displayNameEl.textContent;
});

// Save display name
saveNameBtn.addEventListener("click", async () => {
  if (!currentUser) {
    showToast("Please log in first", true);
    return;
  }

  const newName = displayNameInput.value.trim();
  
  // Validate name
  const validation = validateDisplayName(newName);
  if (!validation.valid) {
    showToast(validation.error, true);
    return;
  }

  // Check if name is the same as current
  if (newName === currentProfile?.display_name) {
    showToast("That's already your display name!");
    return;
  }

  // Disable button during check
  saveNameBtn.disabled = true;
  saveNameBtn.textContent = "Checking...";

  try {
    // Check if name is available
    const isAvailable = await isDisplayNameAvailable(newName);
    
    if (!isAvailable) {
      showToast("This display name is already taken!", true);
      saveNameBtn.disabled = false;
      saveNameBtn.textContent = "Save Name";
      return;
    }

    // Update in database
    const { data, error } = await supabase
      .from("profiles")
      .update({ display_name: newName })
      .eq("id", currentUser.id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      
      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        showToast("This display name is already taken!", true);
      } else {
        showToast("Error saving display name", true);
      }
      
      saveNameBtn.disabled = false;
      saveNameBtn.textContent = "Save Name";
      return;
    }

    // Success!
    currentProfile = data;
    displayNameEl.textContent = newName;
    showToast("Display name saved successfully!");
    
  } catch (err) {
    console.error("Save error:", err);
    showToast("Error saving display name", true);
  } finally {
    saveNameBtn.disabled = false;
    saveNameBtn.textContent = "Save Name";
  }
});

// Avatar change
changePicBtn.addEventListener("click", () => imgInput.click());

imgInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    showToast("Please select an image file", true);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    profileImg.src = reader.result;
  };
  reader.readAsDataURL(file);
  imgInput.value = "";
});

// Done editing
doneBtn.addEventListener("click", () => {
  if (currentUser) {
    // Save profile image to localStorage with user ID
    localStorage.setItem(`profileImage_${currentUser.id}`, profileImg.src);
  }
  
  editPanel.classList.add("hidden");
  editBtn.classList.remove("hidden");
  showToast("Changes saved!");
});

// Load data on page load
loadUserData();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    window.location.href = 'auth.html';
  } else if (event === 'SIGNED_IN') {
    loadUserData();
  }
});