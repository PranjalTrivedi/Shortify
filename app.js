// Function to load language JSON file based on the selected language
function loadLanguage(language) {
  fetch(`src/locales/${language}.json`)
    .then(response => response.json())
    .then(data => {
      // Update all page text with the translations
      document.getElementById('welcome').innerText = data.welcome;
      document.getElementById('news').innerText = data.news;
      document.getElementById('newsDescription').innerText = data.newsDescription;
      document.getElementById('newsResults').innerText = data.newsResults;

      // Update news section with new language data
      displayNews(data.newsResults);
    })
    .catch(error => {
      console.error("Error loading language file:", error);
    });
}

// Function to display news
function displayNews(news) {
  const newsResults = document.getElementById('newsResults');
  newsResults.innerHTML = ''; // Clear previous results

  if (news.length === 0) {
    newsResults.innerHTML = '<p>No news found.</p>';
    return;
  }

  news.forEach((item, index) => {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <button class="read-button" data-index="${index}">Read</button>
    `;
    newsResults.appendChild(newsItem);

    // Attach event listener to each "Read" button
    newsItem.querySelector('.read-button').addEventListener('click', (e) => {
      const newsIndex = e.target.getAttribute('data-index');
      // Store the news data in localStorage before navigating to the detail page
      localStorage.setItem('selectedNews', JSON.stringify(newsData[newsIndex]));
      // Navigate to the detailed news page
      markAsRead(userId);
      window.location.href = 'newsDetail.html';
    });
  });
}


// Sample news data (this will be replaced by data from language files)
const newsData = [
  { 
    title: "Breaking News: AI Takes Over", 
    summary: "AI is now dominating the tech industry.", 
    news: "AI technology is advancing rapidly, taking over industries from healthcare to finance. Experts predict that AI will continue to disrupt various sectors, revolutionizing the way we work and live." 
  },
  { 
    title: "Climate Change Summit", 
    summary: "World leaders gather to discuss climate change.", 
    news: "World leaders have come together to discuss climate change at the annual summit. The discussions include solutions to reduce carbon emissions and address the global warming crisis." 
  },
  { 
    title: "New Smartphone Released", 
    summary: "The latest smartphone with advanced features is now available.", 
    news: "The new smartphone boasts cutting-edge technology, including a foldable screen, improved camera, and a 5G chipset that enhances performance and speed." 
  },
  { 
    title: "Stock Market Update", 
    summary: "The stock market sees a significant rise today.", 
    news: "The stock market experienced a significant increase, driven by strong performances in the tech and energy sectors. Analysts predict continued growth for the market." 
  },
  { 
    title: "Health Tips for 2023", 
    summary: "Top health tips to keep you fit this year.", 
    news: "This year, experts recommend prioritizing mental health, getting regular exercise, eating balanced meals, and practicing mindfulness to improve overall well-being." 
  }
];


// Initial display of all news
displayNews(newsData);

// Search functionality
document.getElementById('searchButton').addEventListener('click', () => {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filteredNews = newsData.filter(item => 
    item.title.toLowerCase().includes(searchTerm) || 
    item.summary.toLowerCase().includes(searchTerm)
  );
  displayNews(filteredNews);
});

// Optional: Allow pressing Enter to search
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('searchButton').click();
  }
});

// Change language based on selection
document.getElementById('languageSelector').addEventListener('change', (e) => {
  const selectedLanguage = e.target.value;
  loadLanguage(selectedLanguage);
});
// Function to fetch user data from the backend
function getUserData(userId) {
  return fetch(`http://localhost:3000/users`)
    .then(response => response.json())
    .then(users => {
      return users.find(user => user.userId === userId) || { userId, readCount: 0, badge: '' };
    });
}

// Function to save user badge data to backend
async function saveUserData(userId, readCount, badge) {
  const userData = { userId, readCount, badge };
  
  try {
    const response = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// Function to update the badge based on the read count
function updateBadge(userId, readCount) {
  console.log("called updatyebadge");
  
  let badge = '';

  if (readCount >= 75) {
    badge = 'Platinum';
  } else if (readCount >= 50) {
    badge = 'Gold';
  } else if (readCount >= 15) {
    badge = 'Silver';
  } else if (readCount >= 5) {
    badge = 'Bronze';
  }

  saveUserData(userId, readCount, badge);

  // Display the badge
  const badgeElement = document.getElementById('badge');
  if (badgeElement) {
    badgeElement.innerText = `Badge: ${badge}`;
  } else {
    const badgeContainer = document.createElement('div');
    badgeContainer.id = 'badge';
    badgeContainer.innerText = `Badge: ${badge}`;
    document.body.appendChild(badgeContainer);
  }
}

// Function to handle the news read action
function markAsRead(userId) {
  getUserData(userId)
    .then(userData => {
      userData.readCount++;
      updateBadge(userId, userData.readCount);
    });
}

// Sample user ID (in a real app, this would be dynamically fetched)
const userId = 'user456'; // This can be dynamic, based on logged-in user

// Initialize the page with the user's current badge and read count
getUserData(userId)
  .then(userData => updateBadge(userId, userData.readCount));