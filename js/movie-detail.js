
import { Movie, fetchMovies, toggleWatched, toggleAdd_movie_details, toggleLike } from '/js/components.js';

window.toggleWatched = toggleWatched;
window.toggleAdd_movie_details = toggleAdd_movie_details;
window.toggleLike = toggleLike;

function getMovieId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}

async function buildPage() {
  const movies = await fetchMovies();
  const id = getMovieId();

  const movie = movies.find(function(m) { return m.id === id; }); //

  if (!movie) {
    document.getElementById('movie-title').innerHTML = 'Movie not found';
    return;
  }

  document.title = movie.title + ' — Rately';

  const titleEl = document.getElementById('movie-title');
  if (titleEl) titleEl.innerHTML = movie.title;

  const metaEl = document.getElementById('movie-meta');
  if (metaEl) {
    metaEl.innerHTML =
      '<span>' + movie.year + '</span>' +
      '<span>' + movie.type + '</span>' ;
  }

  const ratingEl = document.getElementById('movie-rating');
  if (ratingEl) {
    ratingEl.innerHTML =
      '<span class="star">&#9733;</span>' +
      '<span>' + movie.rating + '</span>' +
      '<span class="count">(' + movie.comments + ')</span>';
  }

  const posterEl = document.getElementById('movie-poster');
  if (posterEl) {
    posterEl.innerHTML = '<img src="' + movie.poster + '" alt="' + movie.title + '" />';
  }

  const genreEl = document.getElementById('genre');
  if (genreEl) {
    genreEl.innerHTML = '<button class="genre-pill" id="genre">' + movie.genre + '</button>';
  }

  const descEl = document.getElementById('movie-description');
  if (descEl) descEl.innerHTML = movie.description;

  const creatorsEl = document.getElementById('movie-creators');
  if (creatorsEl) creatorsEl.innerHTML = movie.creators || 'N/A';

  const castEl = document.getElementById('movie-cast');
  if (castEl) castEl.innerHTML = movie.cast || 'N/A';

const reviewsGrid = document.getElementById('reviews-grid');
if (reviewsGrid) {
  reviewsGrid.innerHTML =
    '<div class="review-card">' +
      '<div class="review-card-header">' +
        '<span class="badge badge-top">Top - Rated</span>' +
        '<span class="review-date">2026 : 12 : 31</span>' +
      '</div>' +
      '<div class="review-movie-name">' + movie.title + '</div>' +
      '<p class="review-comment">comment... A thoughtful take on what makes this film special and worth watching.</p>' +
      '<button class="review-likes" onclick="toggleLike(this)">0</button>' +
    '</div>' +
    '<div class="review-card">' +
      '<div class="review-card-header">' +
        '<span class="badge badge-recent">Most-Recent</span>' +
        '<span class="review-date">2026 : 12 : 31</span>' +
      '</div>' +
      '<div class="review-movie-name">' + movie.title + '</div>' +
      '<p class="review-comment">comment... A thoughtful take on what makes this film special and worth watching.</p>' +
      '<button class="review-likes" onclick="toggleLike(this)">0</button>' +
    '</div>';
}
}

buildPage();
