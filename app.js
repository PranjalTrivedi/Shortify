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

  news.forEach(item => {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
    `;
    newsResults.appendChild(newsItem);
  });
}

// Sample news data (this will be replaced by data from language files)
const newsData = [
  { title: "Breaking News: AI Takes Over", summary: "AI is now dominating the tech industry." },
  { title: "Climate Change Summit", summary: "World leaders gather to discuss climate change." },
  { title: "New Smartphone Released", summary: "The latest smartphone with advanced features is now available." },
  { title: "Stock Market Update", summary: "The stock market sees a significant rise today." },
  { title: "Health Tips for 2023", summary: "Top health tips to keep you fit this year." }
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
