/**
 * db.js — Dados persistentes via servidor local (server.js)
 * ===========================================================
 * O servidor salva tudo em data.json — os dados ficam permanentes.
 *
 * COMO USAR:
 *   1. Abra um terminal na pasta do projeto
 *   2. Execute:  node server.js
 *   3. Acesse:   http://localhost:3000
 *
 * Dados padrão (fallback sem servidor):
 *   Os Jovens Titãs Clássico com T1E1 "Prova Final"
 */

const API_BASE = 'http://localhost:3000';

/* ── Dados padrão (usados se o servidor não estiver rodando) ── */
const _DEFAULT = {
  cartoons: [
    {
      id: 'c_teentitans',
      nome: 'Os Jovens Titãs Clássico',
      produtora: 'Warner Bros. Animation',
      temporadas: 5,
      capa: 'https://i.redd.it/rwxw5gxcjrne1.jpeg',
      createdAt: 2003
    }
  ],
  episodes: {
    'c_teentitans': {
      '1': [
        {
          id: 'e_teentitans_s1e1',
          epNumber: 1,
          title: 'Prova Final',
          iframe: '<iframe name="Player" src="//%72%65%64%65%63%61%6E%61%69%73%2E%6F%6F%6F/player3/server.php?server=RCServer10&subfolder=ondemand&vid=OSJVNSTASEP01" frameborder="0" height="400" scrolling="no" width="640" allow="encrypted-media" allowFullScreen></iframe>'
        }
      ]
    }
  },
  animes: [],
  animeEpisodes: {},
  mangas: []
};

/* ── Estado em memória (inicializado pelo carregamento abaixo) ── */
let _store = JSON.parse(JSON.stringify(_DEFAULT)); // deep clone

/* ── Carregamento síncrono ao iniciar (XHR síncrono, local apenas) ── */
(function loadFromServer() {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE + '/api/data', false); // síncrono
    xhr.send();
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      // Mescla: garante todas as chaves existam
      _store = {
        cartoons:      Array.isArray(data.cartoons)      ? data.cartoons      : _DEFAULT.cartoons,
        episodes:      data.episodes      || {},
        animes:        Array.isArray(data.animes)        ? data.animes        : [],
        animeEpisodes: data.animeEpisodes || {},
        mangas:        Array.isArray(data.mangas)        ? data.mangas        : []
      };
    }
  } catch {
    console.warn('[AnimeHouse] Servidor não encontrado — usando dados padrão. Inicie server.js para persistência.');
  }
})();

/* ── Salva state completo no servidor (não bloqueante) ── */
function _persist() {
  try {
    fetch(API_BASE + '/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(_store)
    }).catch(() => {}); // silencia erros de rede
  } catch { /* sem fetch disponível */ }
}

/* ========================================================
   OBJETO DB — Interface uniforme de acesso/modificação
   ======================================================== */
const DB = {

  /* ---- CARTOONS ---- */
  getCartoons()      { return [..._store.cartoons]; },
  getCartoonById(id) { return _store.cartoons.find(c => c.id === id) || null; },
  addCartoon(data) {
    const cartoon = { id: 'c_' + Date.now(), ...data, createdAt: Date.now() };
    _store.cartoons.push(cartoon);
    _persist();
    return cartoon;
  },
  updateCartoon(id, data) {
    _store.cartoons = _store.cartoons.map(c => c.id === id ? { ...c, ...data } : c);
    _persist();
  },
  deleteCartoon(id) {
    _store.cartoons = _store.cartoons.filter(c => c.id !== id);
    delete _store.episodes[id];
    _persist();
  },

  /* ---- EPISÓDIOS DE DESENHOS ---- */
  getAllEpisodes()           { return _store.episodes; },
  getEpisodesFor(cartoonId) { return _store.episodes[cartoonId] || {}; },
  addEpisode(cartoonId, season, episodeData) {
    if (!_store.episodes[cartoonId]) _store.episodes[cartoonId] = {};
    if (!_store.episodes[cartoonId][season]) _store.episodes[cartoonId][season] = [];
    const ep = { id: 'e_' + Date.now() + '_' + Math.random().toString(36).slice(2), ...episodeData };
    _store.episodes[cartoonId][season].push(ep);
    _persist();
    return ep;
  },
  deleteEpisode(cartoonId, season, epId) {
    const s = _store.episodes[cartoonId];
    if (!s?.[season]) return;
    s[season] = s[season].filter(e => e.id !== epId);
    if (s[season].length === 0) delete s[season];
    _persist();
  },
  deleteSeason(cartoonId, season) {
    if (_store.episodes[cartoonId]) { delete _store.episodes[cartoonId][season]; _persist(); }
  },

  /* ---- ANIMES ---- */
  getAnimes()      { return [..._store.animes]; },
  getAnimeById(id) { return _store.animes.find(a => a.id === id) || null; },
  addAnime(data) {
    const anime = { id: 'a_' + Date.now(), ...data, createdAt: Date.now() };
    _store.animes.push(anime);
    _persist();
    return anime;
  },
  updateAnime(id, data) {
    _store.animes = _store.animes.map(a => a.id === id ? { ...a, ...data } : a);
    _persist();
  },
  deleteAnime(id) {
    _store.animes = _store.animes.filter(a => a.id !== id);
    delete _store.animeEpisodes[id];
    _persist();
  },

  /* ---- EPISÓDIOS DE ANIMES ---- */
  getAllAnimeEpisodes()         { return _store.animeEpisodes; },
  getAnimeEpisodesFor(animeId) { return _store.animeEpisodes[animeId] || {}; },
  addAnimeEpisode(animeId, season, episodeData) {
    if (!_store.animeEpisodes[animeId]) _store.animeEpisodes[animeId] = {};
    if (!_store.animeEpisodes[animeId][season]) _store.animeEpisodes[animeId][season] = [];
    const ep = { id: 'ae_' + Date.now() + '_' + Math.random().toString(36).slice(2), ...episodeData };
    _store.animeEpisodes[animeId][season].push(ep);
    _persist();
    return ep;
  },
  deleteAnimeEpisode(animeId, season, epId) {
    const s = _store.animeEpisodes[animeId];
    if (!s?.[season]) return;
    s[season] = s[season].filter(e => e.id !== epId);
    if (s[season].length === 0) delete s[season];
    _persist();
  },
  deleteAnimeSeason(animeId, season) {
    if (_store.animeEpisodes[animeId]) { delete _store.animeEpisodes[animeId][season]; _persist(); }
  },

  /* ---- MANGÁS ---- */
  getMangas()    { return [..._store.mangas]; },
  addManga(data) {
    const manga = { id: 'm_' + Date.now(), ...data };
    _store.mangas.push(manga);
    _persist();
    return manga;
  },
  updateManga(id, data) {
    _store.mangas = _store.mangas.map(m => m.id === id ? { ...m, ...data } : m);
    _persist();
  },
  deleteManga(id) {
    _store.mangas = _store.mangas.filter(m => m.id !== id);
    _persist();
  }
};

/* ========================================================
   UTILITÁRIOS GLOBAIS
   ======================================================== */
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  // Marca link ativo na navbar
  const links = document.querySelectorAll('.navbar-links a');
  const path  = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // Burger menu
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('navLinks');
  if (burger && menu) burger.addEventListener('click', () => menu.classList.toggle('open'));
});
