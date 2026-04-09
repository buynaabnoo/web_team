import { fetchMovies } from '/js/components.js';

var LS_REVIEWS = 'rately_reviews';
var LS_WATCHLIST = 'rately_watchlist';
var LS_WATCHED = 'rately_watched';

function getParams() {
  var params = new URLSearchParams(window.location.search);
  return {
    id: parseInt(params.get('id'), 10)
  };
}

function lsGet(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
}

function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatReviewDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function reviewCardHTML(movie, review) {
  return '<div class="review-card">' +
    '<div class="review-card-header">' +
      '<span class="username-badge">' + review.author + '</span>' +
      '<span class="review-date">' + formatReviewDate(review.createdAt) + '</span>' +
    '</div>' +
    '<div class="review-movie-name">&#8220;' + movie.title + '&#8221;</div>' +
    (review.rating ? '<div class="review-user-rating">&#9733; ' + review.rating + '/5</div>' : '') +
    '<p class="review-comment">' + review.text + '</p>' +
    '<button class="review-likes" aria-label="Like review by ' + review.author + '">' + (review.likes || 0) + '</button>' +
  '</div>';
}

function updateReviewsSeo(movie, reviewCount) {
  var pageUrl = 'https://rately.example.com/html/reviews.html?id=' + movie.id;
  var description = 'Read ' + reviewCount + ' reviews for ' + movie.title + ' on Rately, including ratings and audience reactions.';

  var canonical = document.getElementById('reviewsCanonical');
  var ogTitle = document.getElementById('reviewsOgTitle');
  var ogDescription = document.getElementById('reviewsOgDescription');
  var ogUrl = document.getElementById('reviewsOgUrl');
  var ogImage = document.getElementById('reviewsOgImage');
  var twitterTitle = document.getElementById('reviewsTwitterTitle');
  var twitterDescription = document.getElementById('reviewsTwitterDescription');
  var twitterImage = document.getElementById('reviewsTwitterImage');

  document.title = movie.title + ' Reviews | Rately';

  if (canonical) canonical.setAttribute('href', pageUrl);
  if (ogTitle) ogTitle.setAttribute('content', movie.title + ' Reviews | Rately');
  if (ogDescription) ogDescription.setAttribute('content', description);
  if (ogUrl) ogUrl.setAttribute('content', pageUrl);
  if (ogImage) ogImage.setAttribute('content', movie.poster);
  if (twitterTitle) twitterTitle.setAttribute('content', movie.title + ' Reviews | Rately');
  if (twitterDescription) twitterDescription.setAttribute('content', description);
  if (twitterImage) twitterImage.setAttribute('content', movie.poster);
}

async function buildPage() {
  var params = getParams();
  var movies = await fetchMovies();
  var movie = movies.find(function(item) { return item.id === params.id; }) || movies[0];
  var reviews = lsGet(LS_REVIEWS, []).filter(function(review) {
    return review.movieId === movie.id;
  }).sort(function(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  updateReviewsSeo(movie, reviews.length);

  var pageTitle = document.getElementById('reviewsPageTitle');
  if (pageTitle) pageTitle.textContent = movie.title + ' Reviews';

  var poster = document.getElementById('reviewsPoster');
  if (poster) {
    poster.src = movie.poster;
    poster.alt = movie.title + ' poster';
  }

  var movieTitle = document.getElementById('reviewsMovieTitle');
  if (movieTitle) movieTitle.innerHTML = '&#8220;' + movie.title + '&#8221;';

  var movieRating = document.getElementById('reviewsMovieRating');
  if (movieRating) movieRating.textContent = movie.rating;

  var movieCount = document.getElementById('reviewsMovieCount');
  if (movieCount) movieCount.textContent = '(' + reviews.length + ' reviews)';

  var backToMovie = document.getElementById('reviewsBackToMovie');
  if (backToMovie) backToMovie.href = 'movie_details.html?id=' + movie.id + '#reviewComposer';

  var watchlistBtn = document.getElementById('reviewsWatchlistBtn');
  if (watchlistBtn) {
    var watchlist = lsGet(LS_WATCHLIST, []);
    function renderWatchlistState() {
      watchlistBtn.textContent = watchlist.indexOf(movie.id) !== -1 ? 'Remove from Your Watchlist' : 'Add to Your Watchlist';
    }
    renderWatchlistState();
    watchlistBtn.addEventListener('click', function() {
      if (watchlist.indexOf(movie.id) !== -1) {
        watchlist = watchlist.filter(function(id) { return id !== movie.id; });
      } else {
        watchlist = watchlist.concat(movie.id);
      }
      lsSet(LS_WATCHLIST, watchlist);
      renderWatchlistState();
    });
  }

  var watchedToggle = document.getElementById('reviewsWatchedToggle');
  if (watchedToggle) {
    var watched = lsGet(LS_WATCHED, []);
    watchedToggle.checked = watched.indexOf(movie.id) !== -1;
    watchedToggle.addEventListener('change', function() {
      watched = watchedToggle.checked
        ? watched.concat(movie.id).filter(function(id, index, array) { return array.indexOf(id) === index; })
        : watched.filter(function(id) { return id !== movie.id; });
      lsSet(LS_WATCHED, watched);
    });
  }

  var reviewsList = document.getElementById('reviewsList');
  if (!reviewsList) return;

  if (reviews.length === 0) {
    reviewsList.innerHTML = '<div class="reviews-empty">No reviews yet for this movie. Add one from the movie page.</div>';
    return;
  }

  reviewsList.innerHTML = reviews.map(function(review) {
    return reviewCardHTML(movie, review);
  }).join('');
}

buildPage();
