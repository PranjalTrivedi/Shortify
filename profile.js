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
import { auth, db } from "./firebase-config.js";

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
    // document.getElementById("total-read-count").textContent = `Total Read Count: ${userData.totalReadCount || 0}`;
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
