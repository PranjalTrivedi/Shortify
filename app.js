import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  setDoc,
  updateDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from "./firebase-config.js";

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Load language-specific text
function loadLanguage(language) {
  fetch(`src/locales/${language}.json`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("welcome").innerText = data.welcome;
      document.getElementById("news").innerText = data.news;
      document.getElementById("newsDescription").innerText = data.newsDescription;
      document.getElementById("newsResults").innerText = data.newsResults;
      displayNews(data.newsResults);
    })
    .catch((error) => {
      console.error("Error loading language file:", error);
    });
}

// Function to display news articles
async function displayNews(news) {
  const newsResults = document.getElementById("newsResults");
  newsResults.innerHTML = "";

  if (news.length === 0) {
    newsResults.innerHTML = "<p>No news found.</p>";
    return;
  }

  // Retrieve bookmarks from Firestore if the user is logged in
  const user = auth.currentUser;
  const bookmarks = user ? await getBookmarks(user.uid) : [];

  news.forEach((item, index) => {
    const newsItem = document.createElement("div");
    newsItem.className = "news-item";

    // Check if the article is already bookmarked
    const isBookmarked = bookmarks.some(bookmark => bookmark.articleId === item.title);

    newsItem.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <button class="read-button" data-index="${index}">Read</button>
      <button class="bookmark-button" data-index="${index}">
        ${isBookmarked ? "🔖 Remove Bookmark" : "⭐ Bookmark"}
      </button>
    `;

    newsResults.appendChild(newsItem);

    // Handle Read button click
    newsItem.querySelector(".read-button").addEventListener("click", () => {
      localStorage.setItem("selectedNews", JSON.stringify(newsData[index]));
      onReadArticle();
      setTimeout(() => {
        window.location.href = "newsDetail.html";
      }, 3000);
    });

    // Handle Bookmark button click
    newsItem.querySelector(".bookmark-button").addEventListener("click", function () {
      toggleBookmark(index, this);
    });
  });
}

// Function to toggle bookmarks in Firestore
async function toggleBookmark(index, button) {
  const user = auth.currentUser;

  if (!user) {
    alert("You need to log in to bookmark articles.");
    return;
  }

  const userId = user.uid;
  const article = newsData[index];
  const bookmarkRef = doc(db, `users/${userId}/bookmarks`, article.title);

  try {
    const docSnap = await getDoc(bookmarkRef);

    if (docSnap.exists()) {
      // Remove bookmark
      await deleteDoc(bookmarkRef);
      button.textContent = "⭐ Bookmark";
    } else {
      // Add bookmark
      await setDoc(bookmarkRef, {
        articleId: article.title,
        title: article.title,
        summary: article.summary,
        timestamp: new Date()
      });
      button.textContent = "🔖 Remove Bookmark";
    }
  } catch (error) {
    console.error("Error updating bookmark:", error);
  }
}

// Function to get user bookmarks from Firestore
async function getBookmarks(userId) {
  const bookmarksRef = collection(db, `users/${userId}/bookmarks`);
  const querySnapshot = await getDocs(bookmarksRef);
  return querySnapshot.docs.map(doc => doc.data());
}

// Sample news data
const newsData = [
  {
    title: "Breaking News: AI Takes Over",
    summary: "AI is now dominating the tech industry.",
    news: "AI technology is advancing rapidly, taking over industries from healthcare to finance. Experts predict that AI will continue to disrupt various sectors, revolutionizing the way we work and live.",
  },
  {
    title: "Climate Change Summit",
    summary: "World leaders gather to discuss climate change.",
    news: "World leaders have come together to discuss climate change at the annual summit. The discussions include solutions to reduce carbon emissions and address the global warming crisis.",
  },
  {
    title: "New Smartphone Released",
    summary: "The latest smartphone with advanced features is now available.",
    news: "The new smartphone boasts cutting-edge technology, including a foldable screen, improved camera, and a 5G chipset that enhances performance and speed.",
  },
  {
    title: "Stock Market Update",
    summary: "The stock market sees a significant rise today.",
    news: "The stock market experienced a significant increase, driven by strong performances in the tech and energy sectors. Analysts predict continued growth for the market.",
  },
  {
    title: "Health Tips for 2023",
    summary: "Top health tips to keep you fit this year.",
    news: "This year, experts recommend prioritizing mental health, getting regular exercise, eating balanced meals, and practicing mindfulness to improve overall well-being.",
  },
];

// Display news on page load
displayNews(newsData);

document.getElementById("searchButton").addEventListener("click", () => {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredNews = newsData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.summary.toLowerCase().includes(searchTerm)
  );
  displayNews(filteredNews);
});

document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchButton").click();
  }
});

document.getElementById("languageSelector").addEventListener("change", (e) => {
  const selectedLanguage = e.target.value;
  loadLanguage(selectedLanguage);
});

// Function to increase read count for the user
async function increaseReadCount() {
  try {
    const user = auth.currentUser;

    if (!user) {
      alert("User is not logged in!");
      return;
    }

    const userId = user.uid;
    const userRef = doc(db, "users", userId);

    // Update the user's totalReadCount
    await updateDoc(userRef, { totalReadCount: increment(1) });

    // Confirm update
    const updatedSnap = await getDoc(userRef);
    console.log("Updated Data:", updatedSnap.data());

    await updateBadge(userId);
  } catch (error) {
    console.error("Error increasing read count:", error);
  }
}

// Function to assign badges based on total read count
async function updateBadge(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.error("User document does not exist!");
    return;
  }

  const userData = userSnap.data();
  const readCount = userData.totalReadCount || 0;
  let badge = "";

  if (readCount >= 75) badge = "Platinum";
  else if (readCount >= 50) badge = "Gold";
  else if (readCount >= 15) badge = "Silver";
  else if (readCount >= 5) badge = "Bronze";

  if (badge && userData.badge !== badge) {
    
    await updateDoc(userRef, { badge });
    alert(`Congrats! You've earned the '${badge}' badge!`);
  }
}


async function onReadArticle() {
  console.log("User read an article");
  await increaseReadCount();

  const user = auth.currentUser;
  if (!user) {
    alert("You need to log in to save articles to history.");
    return;
  }

  const article = JSON.parse(localStorage.getItem("selectedNews"));
  const articleRef = doc(db, "users", user.uid, "history", `${article.title}-${Date.now()}`); 

  await setDoc(articleRef, {
    title: article.title,
    content: article.news,
    url: article.title, 
    readAt: Timestamp.now(), 
  });
  console.log("Article saved to history successfully!");
}
