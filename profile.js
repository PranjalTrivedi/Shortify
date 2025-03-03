import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");

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
