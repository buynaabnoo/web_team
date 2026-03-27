class Movie {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.genre = data.genre;
    this.rating = data.rating;
    this.year = data.year;
    this.type = data.type;
    this.episodes = data.episodes;
    this.poster = data.poster;
    this.top = data.top;
    this.rank = data.rank;
    this.new = data.new;
    this.comments = data.comments;
    this.description = data.description;
    this.creators = data.creators;
    this.cast = data.cast;
  }
}

async function fetchMovies() {
  const response = await fetch('https://api.jsonbin.io/v3/b/69ba5dd4b7ec241ddc7bb495', {
    headers: {
      'X-Master-Key': '$2a$10$j8mQ6fTM0HG02NPIMVU24.pTUA/Z2C4dmJzFHI9KIMpCav9lhVxkS'
    }
  });
  const data = await response.json();
  return data.record.movies.map(function(m) { //
    return new Movie(m);
  });
}

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

  document.title = movie.title + ' — Cinema Production';

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
      '<button class="review-likes">0</button>' +
    '</div>' +
    '<div class="review-card">' +
      '<div class="review-card-header">' +
        '<span class="badge badge-recent">Most-Recent</span>' +
        '<span class="review-date">2026 : 12 : 31</span>' +
      '</div>' +
      '<div class="review-movie-name">' + movie.title + '</div>' +
      '<p class="review-comment">comment... A thoughtful take on what makes this film special and worth watching.</p>' +
      '<button class="review-likes">0</button>' +
    '</div>';
}
}
buildPage();
