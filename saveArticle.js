import { db, auth } from "./firebase-config.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  const saveBtn = document.getElementById("save-article-btn");

  if (!saveBtn) {
    console.error("Save button not found!");
    return;
  }

  saveBtn.addEventListener("click", async () => {
    console.log("Save button clicked!");

    // Check if article elements exist
    const articleTitle = document.getElementById("article-title");
    const articleContent = document.getElementById("article-content");

    if (!articleTitle || !articleContent) {
      console.error("Article title or content element not found!");
      return;
    }

    const article = {
      title: articleTitle.innerText,
      content: articleContent.innerText,
      url: window.location.href,
    };

    console.log("Article data:", article);

    const user = auth.currentUser;
    if (!user) {
      alert("You need to log in to save articles.");
      console.error("User not logged in.");
      return;
    }

    console.log("User UID:", user.uid);

    try {
      const articleRef = doc(
        db,
        "users",
        user.uid,
        "savedArticles",
        `${Date.now()}`
      );
      console.log("Firestore path:", articleRef.path);

      await setDoc(articleRef, {
        ...article,
        savedAt: new Date(),
      });
      console.log("Article saved successfully!");
      alert("Article saved successfully!");
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Failed to save article. Please try again.");
    }
  });
});
