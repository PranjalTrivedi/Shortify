import { db, auth } from "./firebase-config.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const profileUid = document.getElementById("profile-uid");

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      profileName.textContent = user.displayName || "N/A";
      profileEmail.textContent = user.email || "N/A";
      profileUid.textContent = user.uid || "N/A";
    } else {
      window.location.href = "login.html";
    }
  });
});
