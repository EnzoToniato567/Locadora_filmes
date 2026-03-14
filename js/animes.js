/* animes.js — Lógica da página de catálogo de animes */
document.addEventListener('DOMContentLoaded', () => {
  const grid        = document.getElementById('cardsGrid');
  const emptyState  = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterEs    = document.getElementById('filterEstudio');
  const filterTemp  = document.getElementById('filterTemporadas');

  // Modal detalhes
  const modal        = document.getElementById('detailModal');
  const modalClose   = document.getElementById('detailClose');
  const detailTitle  = document.getElementById('detailTitle');
  const detailCover  = document.getElementById('detailCover');
  const detailCoverPH= document.getElementById('detailCoverPlaceholder');
  const detailEs     = document.getElementById('detailEstudio');
  const detailTemp   = document.getElementById('detailTemporadas');
  const detailGen    = document.getElementById('detailGenero');
  const watchBtn     = document.getElementById('detailWatchBtn');

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function buildFilterOptions(animes) {
    const estudios = [...new Set(animes.map(a => a.estudio).filter(Boolean))].sort();
    const cur = filterEs.value;
    filterEs.innerHTML = '<option value="">Todos os estúdios</option>' +
      estudios.map(e => `<option value="${e}" ${e===cur?'selected':''}>${escHtml(e)}</option>`).join('');
  }

  function render() {
    const animes   = DB.getAnimes();
    const query    = searchInput.value.trim().toLowerCase();
    const esFilt   = filterEs.value;
    const tempFilt = filterTemp.value;

    buildFilterOptions(animes);

    let filtered = animes.filter(a => {
      const matchQ = !query || a.nome.toLowerCase().includes(query) || (a.estudio||'').toLowerCase().includes(query) || (a.genero||'').toLowerCase().includes(query);
      const matchE = !esFilt || a.estudio === esFilt;
      const matchT = !tempFilt || (tempFilt === '4' ? a.temporadas >= 4 : a.temporadas == tempFilt);
      return matchQ && matchE && matchT;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    filtered.forEach(a => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.id = a.id;

      const coverHtml = a.capa
        ? `<img class="card-cover" src="${escHtml(a.capa)}" alt="${escHtml(a.nome)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="card-cover-placeholder" style="display:none;">🌸</div>`
        : `<div class="card-cover-placeholder">🌸</div>`;

      card.innerHTML = `
        ${coverHtml}
        <div class="card-body">
          <div class="card-title">${escHtml(a.nome)}</div>
          <div class="card-meta">
            <span>🏭 ${escHtml(a.estudio || '—')}</span>
            <span>📺 ${a.temporadas || 1} temporada${(a.temporadas||1) > 1 ? 's' : ''}</span>
            ${a.genero ? `<span>🏷️ ${escHtml(a.genero)}</span>` : ''}
          </div>
          <span class="card-badge" style="background:rgba(124,58,237,0.15);color:#a78bfa;">Assistir ▶</span>
        </div>`;

      card.addEventListener('click', () => openDetail(a));
      grid.appendChild(card);
    });
  }

  function openDetail(anime) {
    detailTitle.textContent = anime.nome;
    detailEs.textContent    = anime.estudio || '—';
    detailTemp.textContent  = `${anime.temporadas || 1} temporada(s)`;
    detailGen.textContent   = anime.genero || '—';

    if (anime.capa) {
      detailCover.src = anime.capa;
      detailCover.style.display = 'block';
      detailCoverPH.style.display = 'none';
    } else {
      detailCover.style.display = 'none';
      detailCoverPH.style.display = 'flex';
    }

    watchBtn.href = `anime-episodios.html?id=${anime.id}`;
    modal.classList.add('open');
  }

  modalClose.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  searchInput.addEventListener('input', render);
  filterEs.addEventListener('change', render);
  filterTemp.addEventListener('change', render);

  render();
});
