import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  deleteDoc,
  deleteUser,
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

// Handle user authentication state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    document.getElementById("profile-name").textContent = user.displayName || "N/A";
    document.getElementById("profile-email").textContent = user.email || "N/A";
    document.getElementById("profile-uid").textContent = user.uid || "N/A";

    // Ensure the user exists in Firestore before proceeding
    await ensureUserExists(user.uid, user.email, user.displayName);

    // Display user badges and details
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

// Ensure user exists in Firestore
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

// Function to increase the read count of an article in Firestore
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

        // Update the user's total read count
        await updateUserReadCount(userId);

        // Fetch the updated read count for badge awarding
        const articleData = (await getDoc(articleRef)).data();
        const readCount = articleData.readCount || 0;

        // Award badges
        await updateBadge(userId, readCount);

        // Refresh badge display
        await displayUserBadges(userId);

    } catch (error) {
        console.error("Error updating read count:", error);
    }
}

// Function to update the user's total read count
async function updateUserReadCount(userId) {
  const userRef = doc(db, "users", userId);

  try {
    const userArticlesRef = collection(db, "users", userId, "readCounts");
    const querySnapshot = await getDocs(userArticlesRef);
    let totalReadCount = 0;

    querySnapshot.forEach((docSnap) => {
      const articleData = docSnap.data();
      totalReadCount += articleData.readCount || 0;
    });

    await updateDoc(userRef, { totalReadCount });
    console.log(`User ${userId} total read count updated: ${totalReadCount}`);
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
    try {
      await setDoc(badgeRef, { name: badge, earnedAt: new Date() });
      alert(`Congrats! You've earned the '${badge}' badge!`);
    } catch (error) {
      console.error("Error updating badge:", error);
    }
  }
}

// Fetch and display user badges
async function displayUserBadges(userId) {
  const badgesRef = collection(db, "users", userId, "badges");
  const querySnapshot = await getDocs(badgesRef);

  badgeList.innerHTML = "";
  querySnapshot.forEach((docSnap) => {
    const badge = docSnap.data();
    const badgeElement = document.createElement("li");
    badgeElement.textContent = badge.name;
    badgeList.appendChild(badgeElement);
  });
}

// Fetch and display user details
async function displayUserDetails(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    console.log("User details:", userData);
    document.getElementById("profile-badge").textContent = userData.badge || "N/A";
  } else {
    console.log("No user details found!");
  }
}

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
  }});
  

// Call this function when the user reads an article
async function onReadArticle(articleId) {
  console.log("Updating read count for article:", articleId);
  await increaseReadCount(articleId);
}

// Attach event listener for articles
document.querySelectorAll(".article-link").forEach(article => {
    article.addEventListener("click", (event) => {
        const articleId = event.target.getAttribute("data-article-id");
        if (articleId) {
            onReadArticle(articleId);
        }
    });
});
