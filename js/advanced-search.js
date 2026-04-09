// ============================================
// advanced-search.js — advanced search logic
// ============================================
import { Movie, fetchMovies, toggleAdd_movie_details } from './components.js';
window.toggleAdd_movie_details = toggleAdd_movie_details;


// ── Шүүлт хийх ──
function filterMovies(movies) {
  let filtered = movies;

  // Нэрээр хайх
  const name = document.getElementById('search-name');
  if (name && name.value.trim() !== '') {
    const val = name.value.trim().toLowerCase();
    filtered = filtered.filter(function(m) {
      return m.title.toLowerCase().includes(val);
    });
  }

  // Жилээр шүүх
  const year = document.getElementById('search-year');
  if (year && year.value !== 'All Years') {
    if (year.value.includes('-')) {
      const parts = year.value.split('-');
      const from = parseInt(parts[0]);
      const to = parseInt(parts[1]);
      filtered = filtered.filter(function(m) {
        return m.year >= from && m.year <= to;
      });
    } else {
      filtered = filtered.filter(function(m) {
        return m.year === parseInt(year.value);
      });
    }
  }

  // Рейтингаар шүүх
  const rating = document.getElementById('search-rating');
  if (rating && rating.value !== 'All Ratings') {
    const minRating = parseFloat(rating.value.replace('+', '')) / 2;
    filtered = filtered.filter(function(m) {
      return m.rating >= minRating;
    });
  }

  // Жанраар шүүх — checkbox-уудаас авна
  const checkedGenres = [];
  const checkboxes = document.querySelectorAll('.genre-checkbox input:checked');
  checkboxes.forEach(function(cb) {
    const label = cb.parentElement.querySelector('span');
    if (label) checkedGenres.push(label.innerHTML.toLowerCase());
  });

  if (checkedGenres.length > 0) {
    filtered = filtered.filter(function(m) {
      return checkedGenres.some(function(g) {
        return m.genre.toLowerCase().includes(g) || g.includes(m.genre.toLowerCase());
      });
    });
  }

  // Эрэмбэлэх
  const sort = document.getElementById('search-sort');
  if (sort) {
    if (sort.value === 'Rating (Ascending)') {
      filtered.sort(function(a, b) { return a.rating - b.rating; });
    } else if (sort.value === 'Rating (Descending)') {
      filtered.sort(function(a, b) { return b.rating - a.rating; });
    } else if (sort.value === 'Newly Added') {
      filtered.sort(function(a, b) { return b.year - a.year; });
    } else if (sort.value === 'Oldest') {
      filtered.sort(function(a, b) { return a.year - b.year; });
    }
  }

  return filtered;
}

// ── Movie card үүсгэх ──
function createMovieCard(movie) {
  return '<div class="movie-card">' +
    '<div class="movie-poster">' +
      '<a href="/html/movie_details.html?id=' + movie.id + '">' +
        '<img src="' + (movie.poster || 'https://placehold.co/300x450') + '" alt="' + movie.title + '" />' +
      '</a>' +
      '<div class="movie-rating">' +
        '<span>&#9733;</span>' +
        '<span>' + movie.rating + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="movie-info">' +
      '<h3 class="movie-title">' + movie.title + '</h3>' +
      '<div class="movie-year">' + movie.year + '</div>' +
      '<div class="movie-genres">' +
        '<span class="movie-genre-tag">' + movie.genre + '</span>' +
        '<span class="movie-genre-tag">' + movie.type + '</span>' +
      '</div>' +
      '<div class="movie-actions">' +
        '<button class="movie-btn movie-btn-primary">Add to Watchlist</button>' +
        '<button class="movie-btn movie-btn-secondary">Rate</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// ── Үр дүн харуулах ──
function showResults(movies) {
  const grid = document.getElementById('results-grid');
  const count = document.getElementById('results-count');

  if (count) {
    count.innerHTML = movies.length + ' movies';
  }

  if (!grid) return;

  if (movies.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted);">No movies found. Try different filters.</div>';
  } else {
    grid.innerHTML = movies.map(createMovieCard).join('');
  }
}

// ── Хуудас үүсгэх ──
async function buildPage() {
  // Өгөгдөл татах
  window._allMovies = await fetchMovies();

  // Эхний үр дүн харуулах
  showResults(window._allMovies);

  // Search товч
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      const filtered = filterMovies(window._allMovies);
      showResults(filtered);
    });
  }

  // Clear товч
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      const nameInput = document.getElementById('search-name');
      if (nameInput) nameInput.value = '';

      const yearSelect = document.getElementById('search-year');
      if (yearSelect) yearSelect.selectedIndex = 0;

      const ratingSelect = document.getElementById('search-rating');
      if (ratingSelect) ratingSelect.selectedIndex = 0;

      const sortSelect = document.getElementById('search-sort');
      if (sortSelect) sortSelect.selectedIndex = 0;

      const checkboxes = document.querySelectorAll('.genre-checkbox input');
      checkboxes.forEach(function(cb) { cb.checked = false; });

      showResults(window._allMovies);
    });
  }
}

// ── Хуудас ачаалагдахад ажиллуулна ──
buildPage();