// ============================================
// movies-page.js — movies page logic
// ============================================
import { Movie, fetchMovies } from './components.js';


// ── URL параметр авах ──
function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get('search') ? params.get('search').toLowerCase() : null,
    genre: params.get('genre') ? params.get('genre').toLowerCase() : null
  };
}

// ── Шүүлт хийх ──
function filterMovies(movies, params) {
  let filtered = movies;

  if (params.search) {
    filtered = filtered.filter(function(m) {
      return m.title.toLowerCase().includes(params.search) ||
             m.genre.toLowerCase().includes(params.search);
    });
  }

  if (params.genre) {
    filtered = filtered.filter(function(m) {
      return m.genre.toLowerCase() === params.genre;
    });
  }

  return filtered;
}

// ── Карт үүсгэх ──
function createMovieCard(movie) {
  return '<a href="/html/movie_details.html?id=' + movie.id + '" style="text-decoration: none;">' +
    '<div class="movie-card">' +
      '<div class="movie-card-poster">' +
        '<img src="' + movie.poster + '" alt="' + movie.title + '" />' +
      '</div>' +
      '<div class="movie-card-body">' +
        '<div class="movie-card-title">' + movie.title + '</div>' +
        '<div class="movie-card-rating">' +
          '<span class="star">&#9733;</span>' +
          '<span>' + movie.rating + '</span>' +
          '<span class="count">(' + movie.comments + ')</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</a>';
}

// ── Filter товчнуудыг үүсгэх ──
function buildFilterButtons(movies, currentGenre) {
  const genres = [...new Set(movies.map(function(m) { return m.genre; }))];
  const container = document.getElementById('filter-bar');
  if (!container) return;

  let html = '';

  // All товч
  html += '<a href="/html/movies.html" class="hashtag' + (!currentGenre ? ' active' : '') + '">#all</a>';

  // Жанр бүрийн hashtag
  genres.forEach(function(genre) {
    const isActive = currentGenre === genre ? ' active' : '';
    html += '<a href="/html/movies.html?genre=' + genre + '" class="hashtag' + isActive + '">#' + genre + '</a>';
  });

  container.innerHTML = html;
}

// ── Genre-р шүүх товч дарахад ──
function filterByGenre(genre) {
  const params = new URLSearchParams(window.location.search);
  if (genre) {
    params.set('genre', genre);
  } else {
    params.delete('genre');
  }
  window.location.search = params.toString();
}

// ── Хуудас үүсгэх ──
async function buildPage() {
  const movies = await fetchMovies();
  const params = getParams();
  const filtered = filterMovies(movies, params);

  // Filter товчнууд
  buildFilterButtons(movies, params.genre);

  // Хайлтын үр дүн
  const resultInfo = document.getElementById('result-info');
  if (resultInfo) {
    if (params.search) {
      resultInfo.innerHTML = '<span>' + filtered.length + '</span> result' +
        (filtered.length !== 1 ? 's' : '') + ' for "' + params.search + '"';
    } else if (params.genre) {
      resultInfo.innerHTML = 'Showing <span>' + params.genre + '</span> movies';
    } else {
      resultInfo.innerHTML = 'Showing all <span>' + filtered.length + '</span> movies';
    }
  }

  // Кино карт үүсгэх
  const grid = document.getElementById('movies-grid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-results">' +
      '<span>&#128247;</span>' +
      'No movies found. Try a different search.' +
      '</div>';
  } else {
    grid.innerHTML = filtered.map(createMovieCard).join('');
  }
}

// ── Хуудас ачаалагдахад ажиллуулна ──
buildPage();
