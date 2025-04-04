if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('firebase-messaging-sw.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    });
}

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from "./firebase-config.js";

// Initialize Firebase Auth and Firestore
export const auth = getAuth(app);
const db = getFirestore(app);


const newsData = [
  {
    title: "Breaking News: AI Takes Over",
    summary: "AI is now dominating the tech industry.",
    news: "AI technology is advancing rapidly, taking over industries from healthcare to finance...",
    category: "technology"
  },
  {
    title: "Climate Change Summit",
    summary: "World leaders gather to discuss climate change.",
    news: "World leaders have come together to discuss climate change at the annual summit...",
    category: "science"
  },
  {
    title: "New Smartphone Released",
    summary: "The latest smartphone with advanced features is now available.",
    news: "The new smartphone boasts cutting-edge technology, including a foldable screen...",
    category: "technology"
  },
  {
    title: "Stock Market Hits Record High",
    summary: "Major indices reach all-time highs.",
    news: "The stock market surged today as investors reacted positively to economic data...",
    category: "business"
  },
  {
    title: "New Cancer Treatment Breakthrough",
    summary: "Researchers announce promising results.",
    news: "A new treatment approach shows 80% success rate in early trials...",
    category: "health"
  },
  {
    title: "Oscar Nominations Announced",
    summary: "See the full list of nominees.",
    news: "The Academy has revealed this year's Oscar nominations with several surprises...",
    category: "entertainment"
  },
  {
    title: "World Cup Finals Set",
    summary: "Top teams advance to championship.",
    news: "After intense semifinal matches, the stage is set for an exciting final...",
    category: "sports"
  }
];

// Get user's news preferences from Firestore
async function getNewsPreferences(userId) {
  try {
    console.log("Fetching preferences for user:", userId);
    const prefsRef = doc(db, "users", userId, "preferences", "news");
    const prefsSnap = await getDoc(prefsRef);
    
    if (prefsSnap.exists()) {
      const prefsData = prefsSnap.data();
      console.log("Retrieved preferences:", prefsData);
      return prefsData;
    } else {
      console.log("No preferences found for user");
      return null;
    }
  } catch (error) {
    console.error("Error getting preferences:", error);
    return null;
  }
}

// Filter news based on user preferences
function filterNewsByPreferences(news, preferences) {
  console.log("Current preferences:", preferences);
  
  if (!preferences) {
    console.log("No preferences - showing all news");
    return news;
  }

  const filteredNews = news.filter(item => {
    const category = item.category;
    const shouldShow = preferences[category] === true;
    console.log(`Checking ${item.title} (${category}): ${shouldShow ? 'SHOW' : 'HIDE'}`);
    return shouldShow;
  });

  console.log("Filtered news count:", filteredNews.length);
  return filteredNews;
}

export async function displayNews(news) {
  const newsResults = document.getElementById("newsResults");
  newsResults.innerHTML = "";


  const user = auth.currentUser;
  const preferences = user ? await getNewsPreferences(user.uid) : null;

  const filteredNews = filterNewsByPreferences(news, preferences);

  if (filteredNews.length === 0) {
    newsResults.innerHTML = "<p>No news found matching your preferences.</p>";
    return;
  }

  const bookmarks = user ? await getBookmarks(user.uid) : [];

  news.forEach((item, index) => {
    const newsItem = document.createElement("div");
    newsItem.className = "news-item"; 


    const isBookmarked = bookmarks.some(
      (bookmark) => bookmark.articleId === item.title
    );

    newsItem.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <button class="read-button" data-index="${index}">Read</button>
      <button class="bookmark-button" data-index="${index}">
        ${isBookmarked ? "🔖 Remove Bookmark" : "⭐ Bookmark"}
      </button>
    `;

    newsResults.appendChild(newsItem);

    // Handle "Read" button click
    newsItem.querySelector(".read-button").addEventListener("click", () => {
      localStorage.setItem("selectedNews", JSON.stringify(newsData[index]));
      onReadArticle(index);
  
      setTimeout(() => {
        window.location.href = "newsDetail.html";
      }, 3000);
    });


    newsItem
      .querySelector(".bookmark-button")
      .addEventListener("click", function () {
        toggleBookmark(index, this);
      });
  });
}

// Toggle bookmarks in Firestore
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

      await deleteDoc(bookmarkRef);
      button.textContent = "⭐ Bookmark";
    } else {
      // Add bookmark
      await setDoc(bookmarkRef, {
        articleId: article.title,
        title: article.title,
        summary: article.summary,
        timestamp: new Date(),
      });
      button.textContent = "🔖 Remove Bookmark";
    }
  } catch (error) {
    console.error("Error updating bookmark:", error);
  }
}

// Get user bookmarks from Firestore
async function getBookmarks(userId) {
  const bookmarksRef = collection(db, `users/${userId}/bookmarks`);
  const querySnapshot = await getDocs(bookmarksRef);
  return querySnapshot.docs.map((doc) => doc.data());
}

// Increase read count and save article to history
async function onReadArticle(index) {
  console.log("User read an article");
  await increaseReadCount();

  const user = auth.currentUser;
  if (!user) {
    alert("You need to log in to save articles to history.");
    return;
  }

  const article = newsData[index];
  const articleRef = doc(
    db,
    "users",
    user.uid,
    "history",
    `${article.title}-${Date.now()}`
  );

  await setDoc(articleRef, {
    title: article.title,
    content: article.news,
    url: article.title,
    readAt: Timestamp.now(),
  });
  console.log("Article saved to history successfully!");
}

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

// Assign badges based on total read count
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

function filterNews() {
  const filterInput = document.getElementById("newsFilter").value.toLowerCase();
  const newsItems = document.querySelectorAll(".news-item");

  newsItems.forEach((item) => {
    const title = item.querySelector("h3").innerText.toLowerCase();
    const summary = item.querySelector("p").innerText.toLowerCase();

    if (title.includes(filterInput) || summary.includes(filterInput)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

window.filterNews = filterNews;

// Load and display news on page load
async function loadAndDisplayNews() {
  try {
    const user = auth.currentUser;
    const preferences = user ? await getNewsPreferences(user.uid) : null;
    
    // Filter sample news based on preferences
    const filteredNews = newsData.filter(article => {
      if (!preferences) return true; // Show all if no preferences
      return preferences[article.category] !== false; 
    });

    displayNews(filteredNews);
  } catch (error) {
    console.error('Error loading news:', error);
    // Fall back to all sample data if error occurs
    displayNews(newsData);
  }
}

// Handle authentication state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('User authenticated:', user.uid);
    try {
      await loadAndDisplayNews();
    } catch (error) {
      console.error('Error loading news:', error);
      displayNews(newsData);
    }
  } else {
    console.log('User not authenticated - redirecting to login');
    window.location.href = 'login.html';
  }
});


document.getElementById("searchButton").addEventListener("click", () => {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredNews = newsData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.summary.toLowerCase().includes(searchTerm)
  );
  displayNews(filteredNews);
});

// Also handle pressing Enter in the search field
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchButton").click();
  }
});


document.getElementById("languageSelector").addEventListener("change", (e) => {
  const selectedLanguage = e.target.value;
  loadLanguage(selectedLanguage);
});

// Load language-specific text
function loadLanguage(language) {
  fetch(`src/locales/${language}.json`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("welcome").innerText = data.welcome;
      document.getElementById("newsDescription").innerText =
        data.newsDescription;
      // You can also localize other elements if needed
    })
    .catch((error) => {
      console.error("Error loading language file:", error);
    });
}
