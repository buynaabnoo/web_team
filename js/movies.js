// movies.js — homepage logic

//  Movie класс 
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
  }
}

//  Өгөгдөл татах 
async function fetchMovies() {
  const response = await fetch('https://api.jsonbin.io/v3/b/69ba5dd4b7ec241ddc7bb495', {
    headers: {
      'X-Master-Key': '$2a$10$j8mQ6fTM0HG02NPIMVU24.pTUA/Z2C4dmJzFHI9KIMpCav9lhVxkS'
    }
  });
  const data = await response.json();
  return data.record.movies.map(function(m) {
    return new Movie(m);
  });
}

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

//  Хуудас үүсгэх 
async function buildPage() {
  const movies = await fetchMovies();
  const params = getParams();
  const filtered = filterMovies(movies, params);

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

//  Товч toggle функцүүд 
function toggleWatched(btn) {
  if (btn.innerHTML === 'Mark as watched') {
    btn.innerHTML = '&#10003; Watched';
    btn.style.borderColor = 'var(--accent)';
    btn.style.color = 'var(--accent)';
  } else {
    btn.innerHTML = 'Mark as watched';
    btn.style.borderColor = '';
    btn.style.color = '';
  }
}

function toggleAdd(btn) {
  if (btn.innerHTML === '+') {
    btn.innerHTML = '&#10003;';
    btn.style.background = 'var(--accent)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'var(--accent)';
  } else {
    btn.innerHTML = '+';
    btn.style.background = '';
    btn.style.color = '';
    btn.style.borderColor = '';
  }
}

//  Хуудас ачаалагдахад ажиллуулна 
buildPage();
