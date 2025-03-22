import { db, auth } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  const articlesList = document.getElementById("history-list");

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      articlesList.innerHTML = "<p>You need to log in to see history.</p>";
      return;
    }

    const q = query(collection(db, "users", user.uid, "history"));
    const readBtn = document.getElementById("read-article-btn");

    if (readBtn) {
      readBtn.addEventListener("click", async () => {
        const articleTitle = document.getElementById("article-title").innerText;
        const articleContent = document.getElementById("article-content").innerText;
        const article = {
          title: articleTitle,
          content: articleContent,
          url: window.location.href,
          readAt: new Date(), 
        };

        const articleRef = doc(db, "users", user.uid, "history", `${article.title}-${Date.now()}`);
        await setDoc(articleRef, article);
        console.log("Article saved to history successfully!");
      });
    }

    const querySnapshot = await getDocs(q);

    articlesList.innerHTML = ""; 
    querySnapshot.forEach((doc) => {
      const article = doc.data();
      let formattedDate = "Unknown date";

      if (article.readAt && article.readAt.toDate) {
        formattedDate = article.readAt.toDate().toLocaleString();
      }

      const listItem = document.createElement("li");
      listItem.innerHTML = `<a href="newsDetail.html?title=${encodeURIComponent(article.title)}" target="_blank">${article.title}</a> - Read on: ${formattedDate}`;
      articlesList.appendChild(listItem);
    });
  });
});
