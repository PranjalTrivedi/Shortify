import { db, auth } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  const articlesList = document.getElementById("saved-articles-list");

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      articlesList.innerHTML =
        "<p>You need to log in to view saved articles.</p>";
      return;
    }

    const q = query(collection(db, "users", user.uid, "savedArticles"));
    const querySnapshot = await getDocs(q);

    articlesList.innerHTML = ""; // Clear list
    querySnapshot.forEach((doc) => {
      const article = doc.data();
      const listItem = document.createElement("li");
      listItem.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a>`;
      articlesList.appendChild(listItem);
    });
  });
});
