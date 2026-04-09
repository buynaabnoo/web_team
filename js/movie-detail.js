
import { Movie, fetchMovies, toggleWatched, toggleAdd_movie_details, toggleLike, getYouTubeEmbedUrl } from '/js/components.js';

window.toggleWatched = toggleWatched;
window.toggleAdd_movie_details = toggleAdd_movie_details;
window.toggleLike = toggleLike;

var LS_RATINGS = 'rately_ratings';
var LS_REVIEWS = 'rately_reviews';
var LS_PROFILE = 'rately_profile';

function getRatings() {
  try {
    return JSON.parse(localStorage.getItem(LS_RATINGS)) || {};
  } catch (error) {
    return {};
  }
}

function setRatings(ratings) {
  localStorage.setItem(LS_RATINGS, JSON.stringify(ratings));
}

function getReviews() {
  try {
    return JSON.parse(localStorage.getItem(LS_REVIEWS)) || [];
  } catch (error) {
    return [];
  }
}

function setReviews(reviews) {
  localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews));
}

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(LS_PROFILE)) || {};
  } catch (error) {
    return {};
  }
}

function formatReviewDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getMovieId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}

function updateMovieSeo(movie) {
  const pageUrl = 'https://rately.example.com/html/movie_details.html?id=' + movie.id;
  const description = (movie.description || ('Read reviews, ratings, and trailer info for ' + movie.title + ' on Rately.')).slice(0, 155);

  document.title = movie.title + ' | Rately';

  const descriptionMeta = document.getElementById('movieMetaDescription');
  const canonical = document.getElementById('movieCanonical');
  const ogTitle = document.getElementById('movieOgTitle');
  const ogDescription = document.getElementById('movieOgDescription');
  const ogUrl = document.getElementById('movieOgUrl');
  const ogImage = document.getElementById('movieOgImage');
  const twitterTitle = document.getElementById('movieTwitterTitle');
  const twitterDescription = document.getElementById('movieTwitterDescription');
  const twitterImage = document.getElementById('movieTwitterImage');

  if (descriptionMeta) descriptionMeta.setAttribute('content', description);
  if (canonical) canonical.setAttribute('href', pageUrl);
  if (ogTitle) ogTitle.setAttribute('content', movie.title + ' | Rately');
  if (ogDescription) ogDescription.setAttribute('content', description);
  if (ogUrl) ogUrl.setAttribute('content', pageUrl);
  if (ogImage) ogImage.setAttribute('content', movie.poster);
  if (twitterTitle) twitterTitle.setAttribute('content', movie.title + ' | Rately');
  if (twitterDescription) twitterDescription.setAttribute('content', description);
  if (twitterImage) twitterImage.setAttribute('content', movie.poster);
}

function renderUserRating(movieId) {
  const starRate = document.getElementById('detailStarRate');
  const ratingNote = document.getElementById('detailRatingNote');
  const toggleBtn = document.getElementById('toggleRatingBtn');

  if (!starRate || !ratingNote || !toggleBtn) return;

  const ratings = getRatings();
  const userRating = ratings[movieId] || 0;

  starRate.innerHTML = [1, 2, 3, 4, 5].map(function(value) {
    return '<button class="detail-star-btn' + (userRating >= value ? ' active' : '') + '" type="button" data-rating="' + value + '" role="radio" aria-checked="' + (userRating === value ? 'true' : 'false') + '" aria-label="Rate ' + value + ' out of 5">&#9733;</button>';
  }).join('');

  ratingNote.textContent = userRating ? 'Your rating: ' + userRating + '/5' : 'Tap a star to rate';
  ratingNote.classList.toggle('active', userRating > 0);
  toggleBtn.textContent = userRating ? 'Update rating' : 'Rate this title';
}

function bindUserRating(movieId) {
  const starRate = document.getElementById('detailStarRate');
  const toggleBtn = document.getElementById('toggleRatingBtn');

  if (!starRate || !toggleBtn) return;

  toggleBtn.addEventListener('click', function() {
    const firstStar = starRate.querySelector('.detail-star-btn');
    if (firstStar) firstStar.focus();
  });

  starRate.addEventListener('click', function(event) {
    const star = event.target.closest('[data-rating]');
    if (!star) return;

    const nextRating = parseInt(star.getAttribute('data-rating'), 10);
    const ratings = getRatings();

    if (ratings[movieId] === nextRating) {
      delete ratings[movieId];
    } else {
      ratings[movieId] = nextRating;
    }

    setRatings(ratings);
    renderUserRating(movieId);
  });

  starRate.addEventListener('keydown', function(event) {
    const activeButton = event.target.closest('[data-rating]');
    if (!activeButton) return;

    const currentValue = parseInt(activeButton.getAttribute('data-rating'), 10);
    let nextValue = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextValue = Math.min(5, currentValue + 1);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextValue = Math.max(1, currentValue - 1);
    if (event.key === 'Home') nextValue = 1;
    if (event.key === 'End') nextValue = 5;

    if (nextValue === null) return;

    event.preventDefault();
    const nextButton = starRate.querySelector('[data-rating="' + nextValue + '"]');
    if (nextButton) nextButton.focus();
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
    '<button class="review-likes" onclick="toggleLike(this)" aria-label="Like review by ' + review.author + '">' + (review.likes || 0) + '</button>' +
  '</div>';
}

function renderReviews(movie) {
  const reviewsGrid = document.getElementById('reviews-grid');
  if (!reviewsGrid) return;

  const movieReviews = getReviews()
    .filter(function(review) { return review.movieId === movie.id; })
    .sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

  if (movieReviews.length === 0) {
    reviewsGrid.innerHTML = '<div class="review-empty">No reviews yet. Be the first one to share your thoughts.</div>';
    return;
  }

  reviewsGrid.innerHTML = movieReviews.slice(0, 2).map(function(review) {
    return reviewCardHTML(movie, review);
  }).join('');
}

function bindReviewComposer(movie) {
  const submitBtn = document.getElementById('submitReviewBtn');
  const reviewText = document.getElementById('reviewText');
  const reviewComposeNote = document.getElementById('reviewComposeNote');
  const seeAllReviewsLink = document.getElementById('seeAllReviewsLink');

  if (seeAllReviewsLink) {
    seeAllReviewsLink.href = 'reviews.html?id=' + movie.id;
  }

  if (!submitBtn || !reviewText) return;

  submitBtn.addEventListener('click', function() {
    const text = reviewText.value.trim();

    if (!text) {
      if (reviewComposeNote) reviewComposeNote.textContent = 'Write a few words before posting your review.';
      return;
    }

    const profile = getProfile();
    const ratings = getRatings();
    const reviews = getReviews();

    reviews.unshift({
      id: 'review_' + Date.now(),
      movieId: movie.id,
      movieTitle: movie.title,
      author: profile.name || 'You',
      text: text,
      rating: ratings[movie.id] || null,
      likes: 0,
      createdAt: new Date().toISOString()
    });

    setReviews(reviews);
    reviewText.value = '';
    if (reviewComposeNote) reviewComposeNote.textContent = 'Your review was posted.';
    renderReviews(movie);
  });
}

async function buildPage() {
  const movies = await fetchMovies();
  const id = getMovieId();

  const movie = movies.find(function(m) { return m.id === id; }); //

  if (!movie) {
    document.getElementById('movie-title').innerHTML = 'Movie not found';
    return;
  }

  updateMovieSeo(movie);

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

  const trailerEl = document.querySelector('.trailer');
  if (trailerEl) {
    if (movie.trailerUrl) {
      trailerEl.innerHTML =
        '<iframe ' +
          'title="' + movie.title + ' trailer" ' +
          'src="' + getYouTubeEmbedUrl(movie.trailerUrl, false) + '" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
          'allowfullscreen="allowfullscreen"></iframe>';
      trailerEl.classList.add('trailer-embed');
    } else {
      trailerEl.innerHTML =
        '<div class="play-btn">&#9654;</div>' +
        '<span class="trailer-duration">Trailer unavailable</span>';
    }
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

  renderUserRating(movie.id);
  bindUserRating(movie.id);
  bindReviewComposer(movie);
  renderReviews(movie);
}

buildPage();
