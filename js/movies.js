// movies.js — homepage logic
import { Movie, fetchMovies, toggleWatched, toggleAdd, getYouTubeEmbedUrl } from '/js/components.js';

window.toggleWatched = toggleWatched;
window.toggleAdd = toggleAdd;

//  URL параметр авах 
function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    genre: params.get('genre') ? params.get('genre').toLowerCase() : null,
    top: params.get('top')
  };
}

//  Шүүлт хийх 
function filterMovies(movies, params) {
  let filtered = movies;

  if (params.genre) {
    filtered = filtered.filter(function(m) {
      return m.genre.toLowerCase() === params.genre;
    });
  }

  if (params.top) {
    filtered = filtered.filter(function(m) {
      return m.top === true;
    });
  }

  return filtered;
}

//  Top 3 карт үүсгэх 
function createTopCard(movie) {
  return '<div class="top-card">' +
    '<div class="top-card-poster">' +
      '<a href="/html/movie_details.html?id=' + movie.id + '">' +
        '<img src="' + movie.poster + '" alt="' + movie.title + '" />' +
      '</a>' +
    '</div>' +
    '<div class="top-card-body">' +
      '<div class="top-card-rank">#' + movie.rank + '</div>' +
      '<div class="top-card-title">' + movie.title + '</div>' +
      '<div class="top-card-meta">' + movie.year + ' &mdash; ' +
        (movie.episodes ? movie.episodes + ' eps &mdash; ' : '') + movie.type +
      '</div>' +
      '<div class="top-card-rating">' +
        '<span class="star">&#9733;</span>' +
        '<span>' + movie.rating + '</span>' +
        '<span class="count">(' + movie.comments + ')</span>' +
      '</div>' +
      '<div class="top-card-actions">' +
        '<button class="btn-mark-watched" onclick="toggleWatched(this)">Mark as watched</button>' +
        '<button class="btn-add" onclick="toggleAdd(this)">+</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

//  #4-#10 карт үүсгэх 
function createRestCard(movie) {
  return '<div class="top-rest-card">' +
    '<a href="/html/movie_details.html?id=' + movie.id + '">' +
      '<img src="' + movie.poster + '" alt="' + movie.title + '" />' +
    '</a>' +
    '<span class="top-rest-rank">#' + movie.rank + '</span>' +
  '</div>';
}

//  Poster карт үүсгэх 
function createPosterCard(movie) {
  return '<div class="poster-item">' +
    '<a href="/html/movie_details.html?id=' + movie.id + '">' +
      '<img src="' + movie.poster + '" alt="' + movie.title + '" />' +
    '</a>' +
  '</div>';
}

function createHeroQueueItem(movie, index, activeIndex) {
  const isActive = index === activeIndex;
  return '<button class="next-item' + (isActive ? ' active' : '') + '" type="button" data-hero-index="' + index + '">' +
    '<div class="next-thumb">' +
      '<img src="' + movie.poster + '" alt="' + movie.title + '" />' +
      '<span class="next-play-icon">&#9654;</span>' +
    '</div>' +
    '<div class="next-info">' +
      '<div class="next-movie-title">&#8220;' + movie.title + '&#8221;</div>' +
      '<span class="next-trailer-link">Select trailer</span>' +
      '<div class="next-meta">' +
        '<span class="star">&#9733;</span>' +
        '<span>' + movie.rating + ' &#8212; ' + movie.comments + ' comments</span>' +
      '</div>' +
    '</div>' +
  '</button>';
}

function setupHero(movies) {
  const heroPlayer = document.getElementById('heroPlayer');
  const heroTitle = document.getElementById('heroTitle');
  const heroRating = document.getElementById('heroRating');
  const heroMetaText = document.getElementById('heroMetaText');
  const heroThumbImage = document.getElementById('heroThumbImage');
  const heroThumbLink = document.getElementById('heroThumbLink');
  const heroDetailLink = document.getElementById('heroDetailLink');
  const heroPlayBtn = document.getElementById('heroPlayBtn');
  const heroNextList = document.getElementById('heroNextList');
  const heroPrevBtn = document.getElementById('heroPrevBtn');
  const heroNextBtn = document.getElementById('heroNextBtn');
  const heroTrailerModal = document.getElementById('heroTrailerModal');
  const heroTrailerFrame = document.getElementById('heroTrailerFrame');
  const heroModalTitle = document.getElementById('heroModalTitle');
  const heroModalClose = document.getElementById('heroModalClose');
  const heroModalBackdrop = document.getElementById('heroModalBackdrop');

  if (!heroPlayer || !heroTitle || !heroNextList || movies.length === 0) return;

  const featured = movies
    .filter(function(movie) { return movie.top || movie.new; })
    .sort(function(a, b) {
      const rankA = typeof a.rank === 'number' ? a.rank : Number.MAX_SAFE_INTEGER;
      const rankB = typeof b.rank === 'number' ? b.rank : Number.MAX_SAFE_INTEGER;
      return rankA - rankB;
    })
    .slice(0, 6);

  if (featured.length === 0) return;

  let activeIndex = 0;

  function movieHref(movie) {
    return '/html/movie_details.html?id=' + movie.id;
  }

  function renderHero() {
    const activeMovie = featured[activeIndex];

    heroPlayer.style.backgroundImage =
      'linear-gradient(180deg, rgba(8,8,8,0.24) 0%, rgba(8,8,8,0.7) 100%), url("' + activeMovie.poster + '")';
    heroTitle.innerHTML = '&#8220;' + activeMovie.title + '&#8221;';
    heroRating.textContent = activeMovie.rating;
    heroMetaText.textContent =
      activeMovie.year + ' ' + activeMovie.type + ' \u2022 ' + activeMovie.comments + ' comments';
    heroThumbImage.src = activeMovie.poster;
    heroThumbImage.alt = activeMovie.title + ' thumbnail';
    heroThumbLink.href = movieHref(activeMovie);
    heroDetailLink.href = movieHref(activeMovie);
    heroPlayBtn.setAttribute('aria-label', 'Play trailer for ' + activeMovie.title);

    heroNextList.innerHTML = featured.map(function(movie, index) {
      return createHeroQueueItem(movie, index, activeIndex);
    }).join('');
  }

  function openTrailer(movie) {
    if (!movie || !movie.trailerUrl || !heroTrailerModal || !heroTrailerFrame) return;

    heroTrailerFrame.src = getYouTubeEmbedUrl(movie.trailerUrl, true);
    if (heroModalTitle) heroModalTitle.textContent = movie.title + ' Trailer';
    heroTrailerModal.classList.add('open');
    heroTrailerModal.setAttribute('aria-hidden', 'false');
  }

  function closeTrailer() {
    if (!heroTrailerModal || !heroTrailerFrame) return;
    heroTrailerFrame.src = '';
    heroTrailerModal.classList.remove('open');
    heroTrailerModal.setAttribute('aria-hidden', 'true');
  }

  function goToIndex(nextIndex) {
    activeIndex = (nextIndex + featured.length) % featured.length;
    renderHero();
  }

  heroPrevBtn.addEventListener('click', function() {
    goToIndex(activeIndex - 1);
  });

  heroNextBtn.addEventListener('click', function() {
    goToIndex(activeIndex + 1);
  });

  heroPlayBtn.addEventListener('click', function() {
    openTrailer(featured[activeIndex]);
  });

  heroNextList.addEventListener('click', function(event) {
    const item = event.target.closest('[data-hero-index]');
    if (!item) return;
    goToIndex(parseInt(item.getAttribute('data-hero-index'), 10));
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') goToIndex(activeIndex - 1);
    if (event.key === 'ArrowRight') goToIndex(activeIndex + 1);
    if (event.key === 'Escape') closeTrailer();
  });

  if (heroModalClose) {
    heroModalClose.addEventListener('click', closeTrailer);
  }

  if (heroModalBackdrop) {
    heroModalBackdrop.addEventListener('click', closeTrailer);
  }

  renderHero();
}

//  Хуудас үүсгэх 
async function buildPage() {
  const movies = await fetchMovies();
  const params = getParams();
  const filtered = filterMovies(movies, params);

  setupHero(movies);

  // Top 3
  const top3 = filtered.filter(function(m) { return m.top && m.rank <= 3; });
  const top3Container = document.getElementById('top3-grid');
  if (top3Container) {
    top3Container.innerHTML = top3.map(createTopCard).join('');
  }

  // #4-#10
  const rest = filtered.filter(function(m) { return m.top && m.rank > 3; });
  const restContainer = document.getElementById('top-rest-grid');
  if (restContainer) {
    restContainer.innerHTML = rest.map(createRestCard).join('');
  }

  // New to Movies
  const newMovies = filtered.filter(function(m) { return m.new === true; }).slice(0, 6);
  const newContainer = document.getElementById('new-movies-grid');
  if (newContainer) {
    newContainer.innerHTML = newMovies.map(createPosterCard).join('');
  }

  // From Your Watchlist
  const watchlistContainer = document.getElementById('watchlist-grid');
  if (watchlistContainer) {
    watchlistContainer.innerHTML = movies.slice(0, 6).map(createPosterCard).join('');
  }
}

//  Хуудас ачаалагдахад ажиллуулна 
buildPage();
