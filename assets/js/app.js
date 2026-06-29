const CATALOG_URL = 'data/catalog.json';

const state = { items: [], query: '', genre: 'all', sort: 'featured' };

const $ = (selector) => document.querySelector(selector);
const ui = {
  header: $('[data-header]'),
  navToggle: $('[data-nav-toggle]'),
  navMenu: $('[data-nav-menu]'),
  themeToggle: $('[data-theme-toggle]'),
  themeIcon: $('[data-theme-icon]'),
  themeLabel: $('[data-theme-label]'),
  search: $('#search-input'),
  genre: $('#genre-filter'),
  sort: $('#sort-filter'),
  grid: $('#movie-grid'),
  count: $('#result-count'),
  empty: $('#empty-state'),
  poster: $('#featured-poster'),
  title: $('#featured-title'),
  meta: $('#featured-meta'),
  year: $('#year'),
  modal: $('#movie-modal'),
  modalClose: $('[data-close-modal]'),
  video: $('#modal-video'),
  modalQuality: $('#modal-quality'),
  modalTitle: $('#modal-title'),
  modalMeta: $('#modal-meta'),
  modalSynopsis: $('#modal-synopsis'),
  modalTags: $('#modal-tags'),
  modalSource: $('#modal-source')
};

function init() {
  ui.year.textContent = new Date().getFullYear();
  restoreTheme();
  bindEvents();
  loadCatalog();
}

function bindEvents() {
  window.addEventListener('scroll', () => ui.header.classList.toggle('is-scrolled', window.scrollY > 12));

  ui.navToggle.addEventListener('click', () => {
    const open = ui.navMenu.classList.toggle('is-open');
    ui.navToggle.setAttribute('aria-expanded', String(open));
  });

  ui.navMenu.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      ui.navMenu.classList.remove('is-open');
      ui.navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  ui.themeToggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  ui.search.addEventListener('input', debounce((event) => {
    state.query = event.target.value.trim().toLowerCase();
    render();
  }, 120));

  ui.genre.addEventListener('change', (event) => { state.genre = event.target.value; render(); });
  ui.sort.addEventListener('change', (event) => { state.sort = event.target.value; render(); });
  ui.modalClose.addEventListener('click', closeModal);
  ui.modal.addEventListener('click', (event) => { if (event.target === ui.modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && ui.modal.open) closeModal(); });
}

async function loadCatalog() {
  renderLoading();
  try {
    const response = await fetch(CATALOG_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Katalog gagal dimuat: ${response.status}`);
    const data = await response.json();
    state.items = normalize(data);
    fillGenres();
    renderFeatured();
    render();
  } catch (error) {
    console.error(error);
    ui.grid.innerHTML = '';
    ui.count.textContent = 'Katalog gagal dimuat';
    ui.empty.hidden = false;
    ui.empty.querySelector('h3').textContent = 'Gagal memuat katalog';
    ui.empty.querySelector('p').textContent = 'Pastikan data/catalog.json ikut ter-upload ke hosting.';
  }
}

function normalize(data) {
  return Array.isArray(data) ? data.map((item, index) => ({
    id: item.id || `item-${index + 1}`,
    title: item.title || 'Untitled',
    year: Number(item.year) || 0,
    rating: Number(item.rating) || 0,
    duration: item.duration || 'N/A',
    quality: item.quality || 'HD',
    country: item.country || 'N/A',
    genres: Array.isArray(item.genres) ? item.genres : [],
    poster: item.poster || '',
    mediaUrl: item.mediaUrl || '',
    sourceUrl: item.sourceUrl || '#',
    synopsis: item.synopsis || 'Sinopsis belum tersedia.'
  })) : [];
}

function fillGenres() {
  const genres = [...new Set(state.items.flatMap((item) => item.genres))].sort();
  ui.genre.innerHTML = '<option value="all">Semua genre</option>' + genres.map((genre) => `<option value="${safe(genre)}">${safe(genre)}</option>`).join('');
}

function renderFeatured() {
  const featured = [...state.items].sort((a, b) => b.rating - a.rating)[0];
  if (!featured) return;
  ui.poster.src = featured.poster;
  ui.poster.alt = `Poster ${featured.title}`;
  ui.title.textContent = featured.title;
  ui.meta.textContent = `${featured.year} • ${featured.duration} • ⭐ ${featured.rating.toFixed(1)}`;
}

function render() {
  const items = filteredItems();
  ui.count.textContent = `${items.length} video tersedia`;
  ui.empty.hidden = items.length > 0;
  ui.grid.innerHTML = items.map((item) => `
    <article class="movie-card">
      <img src="${safe(item.poster)}" alt="Poster ${safe(item.title)}" loading="lazy">
      <div class="movie-card-body">
        <div class="card-meta"><span>${safe(item.quality)}</span><span>${safe(String(item.year))}</span><span>⭐ ${safe(item.rating.toFixed(1))}</span></div>
        <h3>${safe(item.title)}</h3>
        <p>${safe(item.genres.slice(0, 3).join(' • ') || item.country)}</p>
        <button class="btn btn-primary watch-button" type="button" data-open="${safe(item.id)}">Putar demo</button>
      </div>
    </article>`).join('');

  ui.grid.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => openItem(button.dataset.open)));
}

function filteredItems() {
  const result = state.items.filter((item) => {
    const haystack = [item.title, item.country, item.year, ...item.genres].join(' ').toLowerCase();
    return (!state.query || haystack.includes(state.query)) && (state.genre === 'all' || item.genres.includes(state.genre));
  });

  return result.sort((a, b) => {
    if (state.sort === 'rating') return b.rating - a.rating;
    if (state.sort === 'year') return b.year - a.year;
    if (state.sort === 'title') return a.title.localeCompare(b.title);
    return (b.rating + b.year / 10000) - (a.rating + a.year / 10000);
  });
}

function openItem(id) {
  const item = state.items.find((entry) => entry.id === id);
  if (!item) return;
  ui.modalQuality.textContent = item.quality;
  ui.modalTitle.textContent = item.title;
  ui.modalMeta.textContent = `${item.year} • ${item.duration} • ${item.country} • ⭐ ${item.rating.toFixed(1)}`;
  ui.modalSynopsis.textContent = item.synopsis;
  ui.modalTags.innerHTML = item.genres.map((genre) => `<span>${safe(genre)}</span>`).join('');
  ui.modalSource.href = item.sourceUrl || '#';
  ui.video.poster = item.poster;
  ui.video.src = item.mediaUrl;

  if (typeof ui.modal.showModal === 'function') ui.modal.showModal();
  else window.open(item.mediaUrl, '_blank', 'noopener');
}

function closeModal() {
  ui.video.pause();
  ui.video.removeAttribute('src');
  ui.video.load();
  ui.modal.close();
}

function renderLoading() {
  ui.grid.innerHTML = Array.from({ length: 8 }, (_, index) => `<article class="movie-card"><div style="aspect-ratio:2/3;background:var(--soft)"></div><div class="movie-card-body"><h3>Memuat ${index + 1}</h3><p>Mohon tunggu...</p></div></article>`).join('');
}

function restoreTheme() {
  const stored = localStorage.getItem('film21-theme');
  const preferLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  setTheme(stored || (preferLight ? 'light' : 'dark'));
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('film21-theme', theme);
  ui.themeIcon.textContent = theme === 'dark' ? '☾' : '☀';
  ui.themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
}

function debounce(callback, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

function safe(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

init();
