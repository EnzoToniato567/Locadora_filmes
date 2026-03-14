/* cadastro-animes.js — CRUD de Animes */
document.addEventListener('DOMContentLoaded', () => {
  const tableBody   = document.getElementById('tableBody');
  const emptyState  = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterEs    = document.getElementById('filterEstudio');
  const addBtn      = document.getElementById('addBtn');

  // Form modal
  const formModal   = document.getElementById('formModal');
  const formTitle   = document.getElementById('formTitle');
  const modalClose  = document.getElementById('modalClose');
  const cancelBtn   = document.getElementById('cancelBtn');
  const form        = document.getElementById('animeForm');
  const idField     = document.getElementById('animeId');
  const nomeField   = document.getElementById('nome');
  const estField    = document.getElementById('estudio');
  const genField    = document.getElementById('genero');
  const tempField   = document.getElementById('temporadas');
  const capaField   = document.getElementById('capa');
  const capaPreview = document.getElementById('capaPreview');
  const capaImg     = document.getElementById('capaImg');

  // Delete modal
  const deleteModal      = document.getElementById('deleteModal');
  const deleteClose      = document.getElementById('deleteClose');
  const deleteCancelBtn  = document.getElementById('deleteCancelBtn');
  const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
  const deleteAnimeName  = document.getElementById('deleteAnimeName');
  let pendingDeleteId = null;

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
    const animes = DB.getAnimes();
    const query  = searchInput.value.trim().toLowerCase();
    const es     = filterEs.value;

    buildFilterOptions(animes);

    const filtered = animes.filter(a => {
      const matchQ = !query || a.nome.toLowerCase().includes(query) || (a.estudio||'').toLowerCase().includes(query) || (a.genero||'').toLowerCase().includes(query);
      const matchE = !es  || a.estudio === es;
      return matchQ && matchE;
    });

    tableBody.innerHTML = '';

    if (filtered.length === 0) { emptyState.style.display = 'block'; return; }
    emptyState.style.display = 'none';

    filtered.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          ${a.capa
            ? `<img class="td-cover" src="${escHtml(a.capa)}" alt="${escHtml(a.nome)}" onerror="this.outerHTML='<div style=\'width:48px;height:64px;border-radius:6px;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;\'>🌸</div>'" />`
            : `<div style="width:48px;height:64px;border-radius:6px;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;">🌸</div>`}
        </td>
        <td><strong>${escHtml(a.nome)}</strong></td>
        <td>${escHtml(a.estudio || '—')}</td>
        <td><span class="badge-pill badge-purple">${escHtml(a.genero || '—')}</span></td>
        <td><span class="badge-pill badge-accent">${a.temporadas || 1}T</span></td>
        <td>
          <div style="display:flex;gap:.4rem;">
            <button class="btn btn-ghost btn-sm edit-btn" data-id="${a.id}">✏️ Editar</button>
            <button class="btn btn-danger btn-sm del-btn" data-id="${a.id}">🗑️</button>
          </div>
        </td>`;
      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => openEdit(btn.dataset.id)));
    tableBody.querySelectorAll('.del-btn').forEach(btn  => btn.addEventListener('click', () => openDelete(btn.dataset.id)));
  }

  function openAdd() {
    idField.value = '';
    form.reset();
    capaPreview.style.display = 'none';
    formTitle.textContent = 'Novo Anime';
    formModal.classList.add('open');
    nomeField.focus();
  }

  function openEdit(id) {
    const a = DB.getAnimeById(id);
    if (!a) return;
    idField.value   = a.id;
    nomeField.value = a.nome || '';
    estField.value  = a.estudio || '';
    genField.value  = a.genero || '';
    tempField.value = a.temporadas || 1;
    capaField.value = a.capa || '';
    if (a.capa) { capaImg.src = a.capa; capaPreview.style.display = 'block'; }
    else { capaPreview.style.display = 'none'; }
    formTitle.textContent = 'Editar Anime';
    formModal.classList.add('open');
  }

  function openDelete(id) {
    const a = DB.getAnimeById(id);
    if (!a) return;
    pendingDeleteId = id;
    deleteAnimeName.textContent = a.nome;
    deleteModal.classList.add('open');
  }

  capaField.addEventListener('input', () => {
    const val = capaField.value.trim();
    if (val) { capaImg.src = val; capaPreview.style.display = 'block'; }
    else { capaPreview.style.display = 'none'; }
  });
  capaImg.addEventListener('error', () => { capaPreview.style.display = 'none'; });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!nomeField.value.trim() || !estField.value.trim()) {
      showToast('Preencha nome e estúdio.', 'error'); return;
    }
    const data = {
      nome:       nomeField.value.trim(),
      estudio:    estField.value.trim(),
      genero:     genField.value.trim(),
      temporadas: parseInt(tempField.value) || 1,
      capa:       capaField.value.trim()
    };
    if (idField.value) {
      DB.updateAnime(idField.value, data);
      showToast('Anime atualizado!');
    } else {
      DB.addAnime(data);
      showToast('Anime cadastrado!');
    }
    formModal.classList.remove('open');
    render();
  });

  deleteConfirmBtn.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    DB.deleteAnime(pendingDeleteId);
    showToast('Anime excluído.', 'error');
    deleteModal.classList.remove('open');
    pendingDeleteId = null;
    render();
  });

  addBtn.addEventListener('click', openAdd);
  modalClose.addEventListener('click', () => formModal.classList.remove('open'));
  cancelBtn.addEventListener('click',  () => formModal.classList.remove('open'));
  formModal.addEventListener('click', e => { if (e.target === formModal) formModal.classList.remove('open'); });
  deleteClose.addEventListener('click',     () => deleteModal.classList.remove('open'));
  deleteCancelBtn.addEventListener('click', () => deleteModal.classList.remove('open'));
  deleteModal.addEventListener('click', e => { if (e.target === deleteModal) deleteModal.classList.remove('open'); });
  searchInput.addEventListener('input', render);
  filterEs.addEventListener('change', render);

  render();
});
