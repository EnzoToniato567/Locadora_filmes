/* mangas.js — Lógica da página de Mangás */
document.addEventListener('DOMContentLoaded', () => {
  const list        = document.getElementById('mangaList');
  const emptyState  = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterGen   = document.getElementById('filterGenero');
  const addBtn      = document.getElementById('addMangaBtn');

  // Modal
  const modal       = document.getElementById('mangaModal');
  const formTitle   = document.getElementById('mangaFormTitle');
  const closeBtn    = document.getElementById('mangaClose');
  const cancelBtn   = document.getElementById('mangaCancelBtn');
  const form        = document.getElementById('mangaForm');
  const idField     = document.getElementById('mangaId');
  const nomeField   = document.getElementById('mangaNome');
  const autorField  = document.getElementById('mangaAutor');
  const generoField = document.getElementById('mangaGenero');
  const linkField   = document.getElementById('mangaLink');
  const notaField   = document.getElementById('mangaNota');

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function buildGeneros(mangas) {
    const generos = [...new Set(mangas.flatMap(m => (m.genero||'').split(',').map(g=>g.trim())).filter(Boolean))].sort();
    const cur = filterGen.value;
    filterGen.innerHTML = '<option value="">Todos os gêneros</option>' +
      generos.map(g => `<option value="${g}" ${g===cur?'selected':''}>${escHtml(g)}</option>`).join('');
  }

  function render() {
    const mangas = DB.getMangas();
    const query  = searchInput.value.trim().toLowerCase();
    const gen    = filterGen.value;

    buildGeneros(mangas);

    const filtered = mangas.filter(m => {
      const matchQ = !query || m.nome.toLowerCase().includes(query) || (m.autor||'').toLowerCase().includes(query);
      const matchG = !gen   || (m.genero||'').toLowerCase().includes(gen.toLowerCase());
      return matchQ && matchG;
    });

    list.innerHTML = '';

    if (filtered.length === 0) { emptyState.style.display = 'block'; return; }
    emptyState.style.display = 'none';

    filtered.forEach(m => {
      const item = document.createElement('div');
      item.className = 'manga-item';
      item.innerHTML = `
        <div style="font-size:2rem;flex-shrink:0;">📖</div>
        <div class="manga-info">
          <h3>${escHtml(m.nome)}</h3>
          <p>${m.autor ? '✍️ ' + escHtml(m.autor) : ''}${m.autor && m.genero ? ' · ' : ''}${m.genero ? '🏷️ ' + escHtml(m.genero) : ''}</p>
          ${m.nota ? `<p style="margin-top:4px;font-style:italic;">${escHtml(m.nota)}</p>` : ''}
        </div>
        <div class="manga-actions">
          <a href="${escHtml(m.link)}" target="_blank" rel="noopener" class="btn btn-accent btn-sm">⬇️ Download</a>
          <button class="btn btn-ghost btn-sm edit-btn" data-id="${m.id}">✏️</button>
          <button class="btn btn-danger btn-sm del-btn" data-id="${m.id}">🗑️</button>
        </div>`;
      list.appendChild(item);
    });

    list.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => openEdit(btn.dataset.id)));
    list.querySelectorAll('.del-btn').forEach(btn => btn.addEventListener('click', () => deleteManga(btn.dataset.id)));
  }

  function openAdd() {
    idField.value = '';
    form.reset();
    formTitle.textContent = 'Adicionar Mangá';
    modal.classList.add('open');
  }

  function openEdit(id) {
    const m = DB.getMangas().find(x => x.id === id);
    if (!m) return;
    idField.value     = m.id;
    nomeField.value   = m.nome || '';
    autorField.value  = m.autor || '';
    generoField.value = m.genero || '';
    linkField.value   = m.link || '';
    notaField.value   = m.nota || '';
    formTitle.textContent = 'Editar Mangá';
    modal.classList.add('open');
  }

  function closeModal() { modal.classList.remove('open'); }

  function deleteManga(id) {
    const m = DB.getMangas().find(x => x.id === id);
    if (!m) return;
    if (!confirm(`Excluir "${m.nome}"?`)) return;
    DB.deleteManga(id);
    showToast('Mangá removido.', 'error');
    render();
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!nomeField.value.trim() || !linkField.value.trim()) {
      showToast('Preencha nome e link.', 'error'); return;
    }
    const data = {
      nome:   nomeField.value.trim(),
      autor:  autorField.value.trim(),
      genero: generoField.value.trim(),
      link:   linkField.value.trim(),
      nota:   notaField.value.trim()
    };
    if (idField.value) {
      DB.updateManga(idField.value, data);
      showToast('Mangá atualizado!');
    } else {
      DB.addManga(data);
      showToast('Mangá adicionado!');
    }
    closeModal();
    render();
  });

  addBtn.addEventListener('click', openAdd);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  searchInput.addEventListener('input', render);
  filterGen.addEventListener('change', render);

  render();
});
