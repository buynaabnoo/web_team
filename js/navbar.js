// navbar.js — shared navbar behaviour

(function () {
  // ── Scroll shadow ──────────────────────────────────
  var nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  // ── Active page highlight ──────────────────────────
  var path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(function (el) {
    var href = el.getAttribute('href');
    if (!href) return;
    // strip query string and leading slashes for comparison
    var linkPath = href.split('?')[0].replace(/^\//, '');
    var current  = path.replace(/^\//, '');
    if (linkPath && current.endsWith(linkPath)) {
      el.classList.add('active');
    }
  });

  // Sidebar active item
  document.querySelectorAll('.sidebar-item').forEach(function (el) {
    var href = el.getAttribute('href');
    if (!href) return;
    var linkPath = href.split('?')[0].replace(/^\//, '');
    var current  = path.replace(/^\//, '');
    if (linkPath && current.endsWith(linkPath)) {
      el.classList.add('active');
    }
  });

  // ── Watchlist badge ────────────────────────────────
  function updateBadge() {
    try {
      var wl    = JSON.parse(localStorage.getItem('rately_watchlist')) || [];
      var badge = document.getElementById('navWlBadge');
      if (badge) badge.textContent = wl.length > 0 ? wl.length : '';
    } catch (e) {}
  }

  updateBadge();

  // Re-check badge on storage changes (syncs across tabs)
  window.addEventListener('storage', function (e) {
    if (e.key === 'rately_watchlist') updateBadge();
  });

  // ── Profile avatar initials ────────────────────────
  try {
    var profile = JSON.parse(localStorage.getItem('rately_profile'));
    var avatar  = document.getElementById('navAvatar');
    if (avatar && profile && profile.name) {
      avatar.textContent = profile.name.charAt(0).toUpperCase();
    }
  } catch (e) {}
})();
