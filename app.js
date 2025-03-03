function loadLanguage(language) {
  fetch(`src/locales/${language}.json`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("welcome").innerText = data.welcome;
      document.getElementById("news").innerText = data.news;
      document.getElementById("newsDescription").innerText =
        data.newsDescription;
      document.getElementById("newsResults").innerText = data.newsResults;
      displayNews(data.newsResults);
    })
    .catch((error) => {
      console.error("Error loading language file:", error);
    });
}

function displayNews(news) {
  const newsResults = document.getElementById("newsResults");
  newsResults.innerHTML = "";

  if (news.length === 0) {
    newsResults.innerHTML = "<p>No news found.</p>";
    return;
  }

  news.forEach((item, index) => {
    const newsItem = document.createElement("div");
    newsItem.className = "news-item";
    newsItem.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <button class="read-button" data-index="${index}">Read</button>
    `;
    newsResults.appendChild(newsItem);

    newsItem.querySelector(".read-button").addEventListener("click", (e) => {
      const newsIndex = e.target.getAttribute("data-index");
      localStorage.setItem("selectedNews", JSON.stringify(newsData[newsIndex]));
      markAsRead(userId);
      window.location.href = "newsDetail.html";
    });
  });
}

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

async function getUserData() {
  try {
    const response = await fetch("http://localhost:3000/users");
    const text = await response.text();
    console.log("Raw response:", text);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = JSON.parse(text);
    console.log("User data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

getUserData();

async function saveUserData(userId, readCount, badge) {
  const userData = { userId, readCount, badge };
  try {
    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error("Error saving user data:", error);
  }
}

function updateBadge(userId, readCount) {
  console.log("called updatyebadge");
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
  saveUserData(userId, readCount, badge);
  const badgeElement = document.getElementById("badge");
  if (badgeElement) {
    badgeElement.innerText = `Badge: ${badge}`;
  } else {
    const badgeContainer = document.createElement("div");
    badgeContainer.id = "badge";
    badgeContainer.innerText = `Badge: ${badge}`;
    document.body.appendChild(badgeContainer);
  }
}

function markAsRead(userId) {
  getUserData(userId).then((userData) => {
    userData.readCount++;
    updateBadge(userId, userData.readCount);
  });
}

const userId = "user456";
getUserData(userId).then((userData) => updateBadge(userId, userData.readCount));
