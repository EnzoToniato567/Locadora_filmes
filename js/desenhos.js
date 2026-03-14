/* desenhos.js — Episódios por temporada com iframes */
document.addEventListener('DOMContentLoaded', () => {
  const pillsContainer   = document.getElementById('cartoonPills');
  const noCartoonMsg     = document.getElementById('noCartoonMsg');
  const noCartoonReg     = document.getElementById('noCartoonRegistered');
  const episodePanel     = document.getElementById('episodePanel');
  const seasonsContainer = document.getElementById('seasonsContainer');

  // Add episode form
  const addEpBtn  = document.getElementById('addEpBtn');
  const epSeason  = document.getElementById('epSeason');
  const epNumber  = document.getElementById('epNumber');
  const epTitle   = document.getElementById('epTitle');
  const epIframe  = document.getElementById('epIframe');

  // Watch modal
  const watchModal    = document.getElementById('watchModal');
  const watchClose    = document.getElementById('watchClose');
  const watchTitle    = document.getElementById('watchTitle');
  const watchFrame    = document.getElementById('watchFrame');
  const watchDeleteBtn= document.getElementById('watchDeleteBtn');

  let selectedCartoonId = null;
  let currentWatch = null; // { season, epId }

  // ---- helpers ----
  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /**
   * Converte qualquer input (URL ou código iframe completo) em um HTML iframe seguro.
   */
  function buildIframeHtml(raw) {
    raw = (raw || '').trim();
    // Se já contém <iframe, retornar diretamente (mas garantir allow e allowfullscreen)
    if (/^<iframe/i.test(raw)) {
      // Inject allow & allowfullscreen if missing
      if (!raw.includes('allowfullscreen')) raw = raw.replace('>', ' allowfullscreen>');
      if (!raw.includes('allow="')) raw = raw.replace('>', ' allow="autoplay; encrypted-media; fullscreen">');
      return raw;
    }
    // Tratar como URL simples
    return `<iframe src="${escHtml(raw)}" allowfullscreen allow="autoplay; encrypted-media; fullscreen" style="width:100%;aspect-ratio:16/9;border:none;"></iframe>`;
  }

  // ---- init ----
  function init() {
    const cartoons = DB.getCartoons();
    pillsContainer.innerHTML = '';

    if (cartoons.length === 0) {
      noCartoonReg.style.display = 'block';
      noCartoonMsg.style.display = 'none';
      episodePanel.style.display  = 'none';
      return;
    }
    noCartoonReg.style.display = 'none';

    // Check ?id= param
    const params = new URLSearchParams(location.search);
    const preselect = params.get('id');

    cartoons.forEach(c => {
      const pill = document.createElement('button');
      pill.className = 'cartoon-pill';
      pill.dataset.id = c.id;
      pill.innerHTML = c.capa
        ? `<img src="${escHtml(c.capa)}" alt="" onerror="this.remove();" />${escHtml(c.nome)}`
        : `🎬 ${escHtml(c.nome)}`;
      pill.addEventListener('click', () => selectCartoon(c.id));
      pillsContainer.appendChild(pill);
    });

    if (preselect && DB.getCartoonById(preselect)) {
      selectCartoon(preselect);
    } else if (cartoons.length > 0) {
      // Show prompt
      noCartoonMsg.style.display = 'block';
      episodePanel.style.display  = 'none';
    }
  }

  function selectCartoon(id) {
    selectedCartoonId = id;
    // update pills
    document.querySelectorAll('.cartoon-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.id === id);
    });
    noCartoonMsg.style.display = 'none';
    episodePanel.style.display  = 'block';
    renderSeasons();
  }

  function renderSeasons() {
    seasonsContainer.innerHTML = '';
    if (!selectedCartoonId) return;

    const eps = DB.getEpisodesFor(selectedCartoonId);
    const seasons = Object.keys(eps).map(Number).sort((a,b)=>a-b);

    if (seasons.length === 0) {
      seasonsContainer.innerHTML = `<div class="empty-state"><div class="empty-icon">📺</div><p>Nenhum episódio adicionado ainda.</p></div>`;
      return;
    }

    seasons.forEach(season => {
      const episodes = eps[season] || [];
      const section = document.createElement('div');
      section.className = 'season-section';

      const header = document.createElement('div');
      header.className = 'season-header open';
      header.innerHTML = `
        <h3>🌸 Temporada ${season}</h3>
        <div style="display:flex;align-items:center;gap:.8rem;">
          <span class="badge-pill badge-accent">${episodes.length} ep${episodes.length !== 1 ? 's' : ''}</span>
          <button class="btn btn-danger btn-sm del-season-btn" data-season="${season}" style="padding:4px 8px;">🗑️ Remover Temporada</button>
          <span class="season-chevron">▲</span>
        </div>`;

      const grid = document.createElement('div');
      grid.className = 'episodes-grid open';

      episodes.forEach(ep => {
        const card = document.createElement('div');
        card.className = 'episode-card';
        card.dataset.epId = ep.id;
        card.dataset.season = season;
        card.innerHTML = `
          <div style="position:relative;aspect-ratio:16/9;background:#111;cursor:pointer;display:flex;align-items:center;justify-content:center;" class="ep-thumb" data-ep-id="${ep.id}" data-season="${season}">
            <div style="font-size:2.5rem;">▶️</div>
          </div>
          <div class="episode-label">
            <span>📺 Ep. ${ep.epNumber || ep.id.slice(-3)}</span>
            ${ep.title ? `<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(ep.title)}</span>` : ''}
          </div>`;
        grid.appendChild(card);
      });

      header.addEventListener('click', e => {
        if (e.target.closest('.del-season-btn')) return;
        header.classList.toggle('open');
        grid.classList.toggle('open');
      });

      header.querySelector('.del-season-btn').addEventListener('click', e => {
        e.stopPropagation();
        if (!confirm(`Remover toda a Temporada ${season}?`)) return;
        DB.deleteSeason(selectedCartoonId, season);
        showToast(`Temporada ${season} removida.`, 'error');
        renderSeasons();
      });

      section.appendChild(header);
      section.appendChild(grid);
      seasonsContainer.appendChild(section);
    });

    // Click on episode thumbnail → watch modal
    seasonsContainer.querySelectorAll('.ep-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const season = thumb.dataset.season;
        const epId   = thumb.dataset.epId;
        const eps    = DB.getEpisodesFor(selectedCartoonId);
        const ep     = (eps[season]||[]).find(e => e.id === epId);
        if (!ep) return;
        openWatch(ep, season, epId);
      });
    });
  }

  function openWatch(ep, season, epId) {
    currentWatch = { season, epId };
    const cartoon = DB.getCartoonById(selectedCartoonId);
    watchTitle.textContent = `${cartoon ? cartoon.nome + ' · ' : ''}T${season} Ep.${ep.epNumber || '?'}${ep.title ? ' — ' + ep.title : ''}`;
    watchFrame.innerHTML = buildIframeHtml(ep.iframe);
    watchModal.classList.add('open');
  }

  function closeWatchModal() {
    watchModal.classList.remove('open');
    watchFrame.innerHTML = ''; // stop video
    currentWatch = null;
  }

  // Add episode
  addEpBtn.addEventListener('click', () => {
    if (!selectedCartoonId) { showToast('Selecione um desenho primeiro.', 'error'); return; }
    const season    = parseInt(epSeason.value) || 1;
    const epNum     = parseInt(epNumber.value) || 1;
    const title     = epTitle.value.trim();
    const iframeVal = epIframe.value.trim();

    if (!iframeVal) { showToast('Coloque o código ou URL do episódio.', 'error'); return; }

    DB.addEpisode(selectedCartoonId, season, { epNumber: epNum, title, iframe: iframeVal });
    showToast(`Ep.${epNum} (T${season}) adicionado!`);

    // increment episode number
    epNumber.value = epNum + 1;
    epTitle.value  = '';
    epIframe.value = '';

    renderSeasons();
  });

  // Delete from watch modal
  watchDeleteBtn.addEventListener('click', () => {
    if (!currentWatch) return;
    const { season, epId } = currentWatch;
    if (!confirm('Remover este episódio?')) return;
    closeWatchModal();
    DB.deleteEpisode(selectedCartoonId, season, epId);
    showToast('Episódio removido.', 'error');
    renderSeasons();
  });

  watchClose.addEventListener('click', closeWatchModal);
  watchModal.addEventListener('click', e => { if (e.target === watchModal) closeWatchModal(); });

  init();
});
