import {
  deleteUser,
  onAuthStateChanged,
  signOut,
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

const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");
const badgeList = document.getElementById("badge-list");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    document.getElementById("profile-name").textContent =
      user.displayName || "N/A";
    document.getElementById("profile-email").textContent =
      user.email || "N/A";
    document.getElementById("profile-uid").textContent =
      user.uid || "N/A";

    // Display user badges when logged in
    displayUserBadges(user.uid);
    displayUserDetails(user.uid);
  } else {
    loginBtn.style.display = "block";
    logoutBtn.style.display = "none";
  }
});

loginBtn.addEventListener("click", () => {
  window.location.href = "login.html";
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// Delete all user data function
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
    // Delete user's saved articles
    const querySnapshot = await getDocs(userArticlesRef);
    const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);

    // Delete user document
    await deleteDoc(userDocRef);

    // Delete Firebase authentication account
    await deleteUser(user);

    alert("All your data has been deleted.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error deleting user data:", error);
    alert("Error deleting user data: " + error.message);
  }
});

// Function to increase the read count of an article
async function increaseReadCount(articleId) {
  const user = auth.currentUser;
  if (!user) return alert("Please log in first.");

  const userId = user.uid;
  const articleRef = doc(db, "users", userId, "savedArticles", articleId);

  try {
    // Increment the read count for the article
    await updateDoc(articleRef, {
      readCount: increment(1),
    });

    // Fetch the updated read count
    const articleSnap = await getDoc(articleRef);
    const articleData = articleSnap.data();
    const readCount = articleData.readCount || 0;

    // Log the updated read count to the console
    console.log(`Article ${articleId} read count: ${readCount}`);

    // Update the user's total read count
    await updateUserReadCount(userId, readCount);

    // Call updateBadge to check and award badges
    await updateBadge(userId, readCount);

    // Check and display user badges
    await displayUserBadges(userId);

  } catch (error) {
    console.error("Error increasing read count:", error);
  }
}

// Function to update the user's total read count in the user document
async function updateUserReadCount(userId, readCount) {
  const userRef = doc(db, "users", userId);

  try {
    // Update the total read count in the user's document
    await updateDoc(userRef, {
      totalReadCount: readCount,
    });

    console.log(`User ${userId} total read count updated: ${readCount}`);
  } catch (error) {
    console.error("Error updating user read count:", error);
  }
}

// Function to update badges based on the read count
async function updateBadge(userId, readCount) {
  let badge = "";
  if (readCount >= 75) {
    badge = "Platinum";
  } else if (readCount >= 50) {
    badge = "Gold";
  } else if (readCount >= 15) {
    badge = "Silver";
  } else if (readCount >= 5) {
    badge = "Bronze";
  }

  if (badge) {
    const badgeRef = doc(db, "users", userId, "badges", badge);
    await setDoc(badgeRef, { name: badge, earnedAt: new Date() });
    alert(`Congrats! You've earned the '${badge}' badge!`);
  }
}

// Fetch and display user badges
async function displayUserBadges(userId) {
  const badgesRef = collection(db, "users", userId, "badges");
  const querySnapshot = await getDocs(badgesRef);

  badgeList.innerHTML = ""; // Clear previous badges
  querySnapshot.forEach((doc) => {
    const badge = doc.data();
    const badgeElement = document.createElement("li");
    badgeElement.textContent = badge.name; // Display badge name
    badgeList.appendChild(badgeElement);
  });
}

// Fetch and display user details
async function displayUserDetails(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    console.log('User details:', userData);
    document.getElementById("total-read-count").textContent = `Total Read Count: ${userData.totalReadCount || 0}`;
  } else {
    console.log("No user details found!");
  }
}

// Call this function when the user reads an article
async function onReadArticle(articleId) {
  await increaseReadCount(articleId);
}
