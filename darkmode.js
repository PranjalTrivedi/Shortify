// darkmode.js
export function initDarkModeToggle() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;
  
    // Apply dark mode if it's already enabled
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }
  
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDark);
    });
  }
  