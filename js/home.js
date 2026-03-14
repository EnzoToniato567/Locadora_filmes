/* home.js — Lógica da página inicial */
document.addEventListener('DOMContentLoaded', () => {
  const grid        = document.getElementById('cardsGrid');
  const emptyState  = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterProd  = document.getElementById('filterProdutora');
  const filterTemp  = document.getElementById('filterTemporadas');

  // Modal detalhes
  const modal        = document.getElementById('detailModal');
  const modalClose   = document.getElementById('detailClose');
  const detailTitle  = document.getElementById('detailTitle');
  const detailCover  = document.getElementById('detailCover');
  const detailCoverPH= document.getElementById('detailCoverPlaceholder');
  const detailProd   = document.getElementById('detailProdutora');
  const detailTemp   = document.getElementById('detailTemporadas');
  const watchBtn     = document.getElementById('detailWatchBtn');

  let currentCartoon = null;

  function buildFilterOptions(cartoons) {
    const prods = [...new Set(cartoons.map(c => c.produtora).filter(Boolean))].sort();
    filterProd.innerHTML = '<option value="">Todas as produtoras</option>' +
      prods.map(p => `<option value="${p}">${p}</option>`).join('');
  }

  function render() {
    const cartoons  = DB.getCartoons();
    const query     = searchInput.value.trim().toLowerCase();
    const prodFilt  = filterProd.value;
    const tempFilt  = filterTemp.value;

    buildFilterOptions(cartoons);

    let filtered = cartoons.filter(c => {
      const matchQ = !query || c.nome.toLowerCase().includes(query) || (c.produtora||'').toLowerCase().includes(query);
      const matchP = !prodFilt || c.produtora === prodFilt;
      const matchT = !tempFilt || (tempFilt === '4' ? c.temporadas >= 4 : c.temporadas == tempFilt);
      return matchQ && matchP && matchT;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.id = c.id;

      const coverHtml = c.capa
        ? `<img class="card-cover" src="${escHtml(c.capa)}" alt="${escHtml(c.nome)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="card-cover-placeholder" style="display:none;">🎬</div>`
        : `<div class="card-cover-placeholder">🎬</div>`;

      card.innerHTML = `
        ${coverHtml}
        <div class="card-body">
          <div class="card-title">${escHtml(c.nome)}</div>
          <div class="card-meta">
            <span>🏭 ${escHtml(c.produtora || '—')}</span>
            <span>📺 ${c.temporadas || 1} temporada${(c.temporadas||1) > 1 ? 's' : ''}</span>
          </div>
          <span class="card-badge">Assistir ▶</span>
        </div>`;

      card.addEventListener('click', () => openDetail(c));
      grid.appendChild(card);
    });
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function openDetail(cartoon) {
    currentCartoon = cartoon;
    detailTitle.textContent = cartoon.nome;
    detailProd.textContent  = cartoon.produtora || '—';
    detailTemp.textContent  = `${cartoon.temporadas || 1} temporada(s)`;

    if (cartoon.capa) {
      detailCover.src = cartoon.capa;
      detailCover.style.display = 'block';
      detailCoverPH.style.display = 'none';
    } else {
      detailCover.style.display = 'none';
      detailCoverPH.style.display = 'flex';
    }

    watchBtn.href = `desenhos.html?id=${cartoon.id}`;
    modal.classList.add('open');
  }

  // Events
  modalClose.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  searchInput.addEventListener('input', render);
  filterProd.addEventListener('change', render);
  filterTemp.addEventListener('change', render);

  render();
});
