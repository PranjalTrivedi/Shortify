import {
  deleteUser,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Default news preferences
const DEFAULT_PREFERENCES = {
  technology: true,
  science: true,
  business: true,
  health: true,
  entertainment: true,
  sports: true
};
console.log("Profile.js script loading...");
import { auth, db } from "./firebase-config.js";

// Verify DOM elements exist
console.log("Checking required DOM elements...");
const requiredElements = [
  'save-preferences-btn',
  'cancel-preferences-btn',
  'pref-technology',
  'pref-science',
  'pref-business', 
  'pref-health',
  'pref-entertainment',
  'pref-sports'
];

requiredElements.forEach(id => {
  const el = document.getElementById(id);
  if (!el) {
    console.error(`Missing required element: #${id}`);
  } else {
    console.log(`Found element: #${id}`);
  }
});

// Verify Firebase
console.log("Checking Firebase initialization...");
if (!db) {
  console.error("Firestore not initialized");
}
if (!auth) {
  console.error("Auth not initialized");
}

const logoutBtn = document.getElementById("logout-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");
const badgeList = document.getElementById("badge-list");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User logged in:", user.uid);

    document.getElementById("profile-name").textContent = user.displayName || "N/A";
    document.getElementById("profile-email").textContent = user.email || "N/A";
    document.getElementById("profile-uid").textContent = user.uid || "N/A";
    document.getElementById("profile-badge").textContent = user.badge || "N/A";

    // Load user preferences
    await loadPreferences(user.uid);

    await ensureUserExists(user.uid, user.email, user.displayName);
    await displayUserDetails(user.uid);
    await displayUserBadges(user.uid);
  } else {
    console.log("No user logged in.");
    document.getElementById("profile-name").textContent = "Not logged in";
    document.getElementById("profile-email").textContent = "";
    document.getElementById("profile-uid").textContent = "";
    document.getElementById("profile-badge").textContent = "";
    badgeList.innerHTML = "";
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

deleteAccountBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("No user logged in.");
    return;
  }

  const userId = user.uid;
  const userDocRef = doc(db, "users", userId);
  const userArticlesRef = collection(db, "users", userId, "savedArticles");

  try {
    const querySnapshot = await getDocs(userArticlesRef);
    const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);

    await deleteDoc(userDocRef);
    await deleteUser(user);

    alert("All your data has been deleted.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error deleting user data:", error);
    alert("Error deleting user data: " + error.message);
  }
});

async function ensureUserExists(userId, email, displayName) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    try {
      await setDoc(userRef, {
        email: email || "N/A",
        displayName: displayName || "N/A",
        totalReadCount: 0,
        createdAt: new Date()
      });
      console.log("User added to Firestore:", userId);
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  }
}

async function displayUserDetails(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    document.getElementById("profile-name").textContent = userData.displayName || "N/A";
    document.getElementById("profile-email").textContent = userData.email || "N/A";
  } else {
    console.log("User details not found in Firestore!");
  }
}

async function increaseReadCount(articleId) {
  if (!auth.currentUser) {
    console.error("User not authenticated.");
    return;
  }

  const userId = auth.currentUser.uid;
  const articleRef = doc(db, "users", userId, "readCounts", articleId);

  try {
    const articleSnap = await getDoc(articleRef);

    if (!articleSnap.exists()) {
      await setDoc(articleRef, { readCount: 1 });
    } else {
      await updateDoc(articleRef, { readCount: increment(1) });
    }

    console.log(`Read count updated for article: ${articleId}`);
    await updateUserReadCount(userId);
    await updateBadge(userId);
    await displayUserBadges(userId);
  } catch (error) {
    console.error("Error updating read count:", error);
  }
}

async function updateUserReadCount(userId) {
  const userRef = doc(db, "users", userId);
  const userArticlesRef = collection(db, "users", userId, "readCounts");
  const querySnapshot = await getDocs(userArticlesRef);
  let totalReadCount = 0;

  querySnapshot.forEach((docSnap) => {
    const articleData = docSnap.data();
    totalReadCount += articleData.readCount || 0;
  });

  try {
    await updateDoc(userRef, { totalReadCount });
    console.log(`User ${userId} total read count updated: ${totalReadCount}`);
  } catch (error) {
    console.error("Error updating user read count:", error);
  }
}

async function updateBadge(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const readCount = userSnap.data().totalReadCount || 0;
  const badge = readCount >= 10 ? "Bookworm" : readCount >= 5 ? "Reader" : null;

  if (badge) {
    const badgeRef = doc(db, "users", userId, "badges", badge);
    try {
      await setDoc(badgeRef, { name: badge, earnedAt: new Date() });
      alert(`Congrats! You've earned the '${badge}' badge!`);
    } catch (error) {
      console.error("Error updating badge:", error);
    }
  }
}

async function displayUserBadges(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    document.getElementById("profile-badge").innerText = userData.badge || "No badges earned";
  } else {
    console.log("User data not found in Firestore!");
    document.getElementById("profile-badge").innerText = "No badges earned";
  }
}

// Save user preferences to Firestore
async function savePreferences(userId) {
  try {
    if (!userId) {
      throw new Error("No user ID - user must be logged in");
    }

    console.log("Current auth state:", auth.currentUser);
    
    const prefsRef = doc(db, "users", userId, "preferences", "news");
    console.log("Firestore reference path:", prefsRef.path);
    
    const preferences = {
      technology: document.getElementById("pref-technology").checked,
      science: document.getElementById("pref-science").checked,
      business: document.getElementById("pref-business").checked,
      health: document.getElementById("pref-health").checked,
      entertainment: document.getElementById("pref-entertainment").checked,
      sports: document.getElementById("pref-sports").checked,
      lastUpdated: new Date()
    };
    console.log("Preferences to save:", preferences);

    // Verify Firestore connection
    const testDoc = doc(db, "users", userId);
    const testSnap = await getDoc(testDoc);
    if (!testSnap.exists()) {
      throw new Error("User document doesn't exist in Firestore");
    }

    // Save preferences
    await setDoc(prefsRef, preferences, { merge: true });
    console.log("Preferences saved to Firestore");

    // Immediate verification
    const savedPrefs = await getDoc(prefsRef);
    if (!savedPrefs.exists()) {
      throw new Error("Failed to verify saved preferences");
    }

    console.log("Verified saved preferences:", savedPrefs.data());
    alert("Preferences saved successfully!");
    
    // Update UI
    loadPreferences(userId);
    
  } catch (error) {
    console.error("SAVE PREFERENCES ERROR:", error);
    console.trace();
    alert(`Failed to save preferences: ${error.message}\nCheck console for details`);
  }
}

// Load user preferences from Firestore
async function loadPreferences(userId) {
  try {
    if (!userId) {
      console.warn("No user ID - loading default preferences");
      throw new Error("User not authenticated");
    }

    console.log("Current auth state:", auth.currentUser);
    const prefsRef = doc(db, "users", userId, "preferences", "news");
    console.log("Loading preferences from:", prefsRef.path);

    // Verify Firestore connection
    const testDoc = doc(db, "users", userId);
    const testSnap = await getDoc(testDoc);
    if (!testSnap.exists()) {
      throw new Error("User document doesn't exist in Firestore");
    }

    const prefsSnap = await getDoc(prefsRef);
    
    if (prefsSnap.exists()) {
      const preferences = prefsSnap.data();
      console.log("Loaded preferences:", preferences);
      
      // Update UI
      document.getElementById("pref-technology").checked = preferences.technology ?? DEFAULT_PREFERENCES.technology;
      document.getElementById("pref-science").checked = preferences.science ?? DEFAULT_PREFERENCES.science;
      document.getElementById("pref-business").checked = preferences.business ?? DEFAULT_PREFERENCES.business;
      document.getElementById("pref-health").checked = preferences.health ?? DEFAULT_PREFERENCES.health;
      document.getElementById("pref-entertainment").checked = preferences.entertainment ?? DEFAULT_PREFERENCES.entertainment;
      document.getElementById("pref-sports").checked = preferences.sports ?? DEFAULT_PREFERENCES.sports;
    } else {
      console.log("No preferences found - using defaults");
      Object.entries(DEFAULT_PREFERENCES).forEach(([key, value]) => {
        document.getElementById(`pref-${key}`).checked = value;
      });
    }

    // Setup event listeners
    console.log("Setting up event listeners...");
    const saveBtn = document.getElementById("save-preferences-btn");
    const cancelBtn = document.getElementById("cancel-preferences-btn");
    
    if (!saveBtn || !cancelBtn) {
      throw new Error("Could not find preference buttons in DOM");
    }

    saveBtn.onclick = () => {
      console.log("Save button clicked");
      savePreferences(userId);
    };
    cancelBtn.onclick = () => {
      console.log("Cancel button clicked"); 
      loadPreferences(userId);
    };
    
  } catch (error) {
    console.error("LOAD PREFERENCES ERROR:", error);
    console.trace();
    console.log("Falling back to default preferences");
    Object.entries(DEFAULT_PREFERENCES).forEach(([key, value]) => {
      document.getElementById(`pref-${key}`).checked = value;
    });
  }
}


async function onReadArticle(articleId) {
  console.log("Updating read count for article:", articleId);
  await increaseReadCount(articleId);
}

document.querySelectorAll(".article-link").forEach(article => {
  article.addEventListener("click", (event) => {
    const articleId = event.target.getAttribute("data-article-id");
    if (articleId) {
      onReadArticle(articleId);
    }
  });
});
