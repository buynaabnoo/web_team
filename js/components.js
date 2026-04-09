// components.js

// ── Movie класс ──
export class Movie {
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

// ── Өгөгдөл татах ──
export async function fetchMovies() {
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

// ── Toggle функцүүд ──
export function toggleWatched(btn) {
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

export function toggleAdd(btn) {
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

export function toggleAdd_movie_details(btn) {
  if (btn.innerHTML === 'Add to watchlist') {
    btn.innerHTML = '&#10003; Added';
    btn.style.background = 'var(--accent)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'var(--accent)';
  } else {
    btn.innerHTML = 'Add to watchlist';
    btn.style.background = '';
    btn.style.color = '';
    btn.style.borderColor = '';
  }
}

export function toggleLike(btn) {
  const current = parseInt(btn.innerHTML) || 0;
  const isLiked = btn.dataset.liked === 'true';
  if (isLiked) {
    btn.dataset.liked = 'false';
    btn.innerHTML = (current - 1).toString();
    btn.style.color = '';
  } else {
    btn.dataset.liked = 'true';
    btn.innerHTML = (current + 1).toString();
    btn.style.color = 'var(--heart)';
  }
}