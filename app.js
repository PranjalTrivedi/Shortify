console.log("Script loaded!");

const languageSelector = document.getElementById('languageSelector');
const elementsToTranslate = {
  welcome: document.getElementById('welcome'),
  news: document.getElementById('news'),
  tips: document.getElementById('tips'),
  stories: document.getElementById('stories'),
  polls: document.getElementById('polls'),
  newsDescription: document.getElementById('newsDescription'),
  tipsDescription: document.getElementById('tipsDescription'),
  storiesDescription: document.getElementById('storiesDescription'),
  quizzesDescription: document.getElementById('quizzesDescription'),
  pollsDescription: document.getElementById('pollsDescription'),
  pollQuestion: document.getElementById('pollQuestion'),
  option1: document.getElementById('option1'),
  option2: document.getElementById('option2'),
  option3: document.getElementById('option3'),
  option4: document.getElementById('option4'),
  option5: document.getElementById('option5'),
};

document.getElementById("polls").addEventListener("click", function() {
        window.location.href = "pollsdiscussions.html";
    });

    document.addEventListener("DOMContentLoaded", function() {
      document.getElementById("polls").classList.add("highlight");
  });
  
console.log("Elements to translate:", elementsToTranslate);

const loadTranslations = async (language) => {
  console.log(`Loading translations for ${language}...`);
  try {
    const response = await fetch(`src/locales/${language}.json`);
    const translations = await response.json();
    console.log("Translations loaded:", translations);

    for (const [key, element] of Object.entries(elementsToTranslate)) {
      if (element) {
        element.textContent = translations[key];
      } else {
        console.error(`Element with id "${key}" not found.`);
      }
    }
  } catch (error) {
    console.error("Error loading translations:", error);
  }
};

let currentLanguage = localStorage.getItem('language') || 'en';
languageSelector.value = currentLanguage;
loadTranslations(currentLanguage);

languageSelector.addEventListener('change', (event) => {
  const newLanguage = event.target.value;
  localStorage.setItem('language', newLanguage);
  loadTranslations(newLanguage);
});