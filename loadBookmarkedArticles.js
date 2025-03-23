import { collection, doc, getDoc, getDocs, getFirestore, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth } from "./firebase-config.js";

const db = getFirestore();
const bookmarkedArticlesList = document.getElementById("bookmarked-articles-list");

auth.onAuthStateChanged(async (user) => {
  if (user) {
    loadBookmarkedArticles(user.uid);
  } else {
    bookmarkedArticlesList.innerHTML = "<p>Please log in to see your bookmarks.</p>";
  }
});

async function loadBookmarkedArticles(userId) {
  const bookmarksRef = collection(db, `users/${userId}/bookmarks`);
  const querySnapshot = await getDocs(bookmarksRef);

  if (querySnapshot.empty) {
    bookmarkedArticlesList.innerHTML = "<p>No bookmarked articles yet.</p>";
    return;
  }

  let html = "";

  querySnapshot.forEach((docData) => {
    const data = docData.data();
    const articleId = docData.id;
    const tags = data.tags && data.tags.length > 0 ? data.tags.join(", ") : "No tags";

    // Check if tags exist. If yes, hide tag input and button
    const tagInputHTML = data.tags && data.tags.length > 0
      ? `<p>Tags: <span id="tags-${articleId}">${tags}</span></p>`
      : `
        <p>Tags: <span id="tags-${articleId}">${tags}</span></p>
        <input type="text" id="tagInput-${articleId}" placeholder="Add tag" />
        <button class="add-tag" data-id="${articleId}">Add Tag</button>
      `;

    html += `
      <li>
        <a href="#" class="news-link" data-url="${data.url}" data-title="${data.title}" data-content="${data.content}" data-id="${articleId}">
          ${data.title}
        </a>
        ${tagInputHTML}
        <button class="remove-bookmark" data-id="${articleId}">Remove Bookmark</button>
      </li>
    `;
  });

  bookmarkedArticlesList.innerHTML = html;

  // Handle redirection to news page
  document.querySelectorAll(".news-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const newsUrl = event.target.getAttribute("data-url");
      const newsTitle = event.target.getAttribute("data-title");
      const newsContent = event.target.getAttribute("data-content");

      localStorage.setItem("selectedNewsUrl", newsUrl);
      localStorage.setItem("selectedNewsTitle", newsTitle);
      localStorage.setItem("selectedNewsContent", newsContent);

      window.location.href = "newsDetail.html";
    });
  });

  // Handle adding a tag
  document.querySelectorAll(".add-tag").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const articleId = event.target.getAttribute("data-id");
      const tagInput = document.getElementById(`tagInput-${articleId}`);
      const tagValue = tagInput.value.trim();

      if (tagValue) {
        const articleRef = doc(db, `users/${auth.currentUser.uid}/bookmarks`, articleId);
        const docSnap = await getDoc(articleRef);

        if (docSnap.exists()) {
          let existingTags = docSnap.data().tags || [];

          if (!existingTags.includes(tagValue)) {
            existingTags.push(tagValue);
            await updateDoc(articleRef, { tags: existingTags });

            // Update UI to show tags and remove input field & button
            document.getElementById(`tags-${articleId}`).innerText = existingTags.join(", ");
            tagInput.remove();
            event.target.remove();
          }
        }
      }
    });
  });

  // Handle removing bookmarks
  document.querySelectorAll(".remove-bookmark").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const articleId = event.target.getAttribute("data-id");
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/bookmarks`, articleId));
      event.target.parentElement.remove();
    });
  });
}
