const apiUrl = "https://api.news-headlines.co/v1.1/TECT35NT0/document/get?type=organic&layout_type=1&user_ip=69.167.20.232";
const container = document.getElementById('news-container');
const loadingIndicator = document.getElementById('loading-indicator');

let newsData = [];
let nextItemIndex = 0;
const firstLoadItems = 11;
const itemsPerPage = 9;
let isLoading = false;
let allDataLoaded = false;

async function fetchData() {
  try {
    if (isLoading) return;
    isLoading = true;
    loadingIndicator.style.display = 'block';

    // Fetch primary news data
    const response1 = await fetch(apiUrl);
    const data1 = await response1.json();

    // Fetch additional 2 news items
    const response2 = await fetch(apiUrl);
    const data2 = await response2.json();
    
    // Merge both responses
    if (data1 && data1.length > 0 && data2 && data2.length > 0) {
      newsData = [...data1, ...data2.slice(0, 2)];
      nextItemIndex = 0;
      container.innerHTML = '';
      renderNewsItems(firstLoadItems);
    }

    loadingIndicator.style.display = 'none';
    isLoading = false;
  } catch (error) {
    console.error("Failed to fetch news", error);
    loadingIndicator.style.display = 'none';
    isLoading = false;
  }
}

// Convert time to relative format based on user's language
function formatRelativeTime(publishedTime) {
  const now = new Date();
  const publishedDate = new Date(publishedTime);
  const diffMs = now - publishedDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) {
    return new Intl.RelativeTimeFormat(navigator.language, { numeric: "auto" }).format(-diffHours, "hour");
  } else {
    return new Intl.RelativeTimeFormat(navigator.language, { numeric: "auto" }).format(-diffDays, "day");
  }
}

// Render News Items
function renderNewsItems(count) {
  if (allDataLoaded) return;
  const endIndex = Math.min(nextItemIndex + count, newsData.length);
  for (let i = nextItemIndex; i < endIndex; i++) {
    const item = newsData[i];

    const card = document.createElement('div');
    card.className = 'news-item fade-in';

    card.innerHTML = `
      <img class="cover" src="${item.imageUrl}" alt="${item.title}">
      <div class="news-content">
        <h3 class="news-title"><a href="${item.originalUrl}" target="_blank">${item.title}</a></h3>
        <div class="news-meta">
          <img class="source-logo" src="${item.authorLogo}">
          <span class="source-name">${item.author}</span>
          <span class="time">${formatRelativeTime(item.publishedTime)}</span>
        </div>
      </div>`;
      
    container.appendChild(card);
  }
  nextItemIndex += count;
  if (nextItemIndex >= newsData.length) allDataLoaded = true;
}

// Auto-load when scrolling to bottom
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    renderNewsItems(itemsPerPage);
  }
});

// Initialize
fetchData();
