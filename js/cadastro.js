/* cadastro.js — CRUD de Desenhos */
document.addEventListener('DOMContentLoaded', () => {
  const tableBody   = document.getElementById('tableBody');
  const emptyState  = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterProd  = document.getElementById('filterProdutora');
  const addBtn      = document.getElementById('addBtn');

  // Form modal
  const formModal   = document.getElementById('formModal');
  const formTitle   = document.getElementById('formTitle');
  const modalClose  = document.getElementById('modalClose');
  const cancelBtn   = document.getElementById('cancelBtn');
  const form        = document.getElementById('cartoonForm');
  const idField     = document.getElementById('cartoonId');
  const nomeField   = document.getElementById('nome');
  const prodField   = document.getElementById('produtora');
  const tempField   = document.getElementById('temporadas');
  const capaField   = document.getElementById('capa');
  const capaPreview = document.getElementById('capaPreview');
  const capaImg     = document.getElementById('capaImg');

  // Delete modal
  const deleteModal   = document.getElementById('deleteModal');
  const deleteClose   = document.getElementById('deleteClose');
  const deleteCancelBtn   = document.getElementById('deleteCancelBtn');
  const deleteConfirmBtn  = document.getElementById('deleteConfirmBtn');
  const deleteCartoonName = document.getElementById('deleteCartoonName');
  let pendingDeleteId = null;

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function buildFilterOptions(cartoons) {
    const prods = [...new Set(cartoons.map(c => c.produtora).filter(Boolean))].sort();
    const cur = filterProd.value;
    filterProd.innerHTML = '<option value="">Todas as produtoras</option>' +
      prods.map(p => `<option value="${p}" ${p===cur?'selected':''}>${escHtml(p)}</option>`).join('');
  }

  function render() {
    const cartoons = DB.getCartoons();
    const query    = searchInput.value.trim().toLowerCase();
    const prod     = filterProd.value;

    buildFilterOptions(cartoons);

    const filtered = cartoons.filter(c => {
      const matchQ = !query || c.nome.toLowerCase().includes(query) || (c.produtora||'').toLowerCase().includes(query);
      const matchP = !prod  || c.produtora === prod;
      return matchQ && matchP;
    });

    tableBody.innerHTML = '';

    if (filtered.length === 0) { emptyState.style.display = 'block'; return; }
    emptyState.style.display = 'none';

    filtered.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          ${c.capa
            ? `<img class="td-cover" src="${escHtml(c.capa)}" alt="${escHtml(c.nome)}" onerror="this.outerHTML='<div style=\'width:48px;height:64px;border-radius:6px;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;\'>🎬</div>'" />`
            : `<div style="width:48px;height:64px;border-radius:6px;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;">🎬</div>`}
        </td>
        <td><strong>${escHtml(c.nome)}</strong></td>
        <td>${escHtml(c.produtora || '—')}</td>
        <td><span class="badge-pill badge-accent">${c.temporadas || 1}T</span></td>
        <td>
          <div style="display:flex;gap:.4rem;">
            <button class="btn btn-ghost btn-sm edit-btn" data-id="${c.id}" title="Editar">✏️ Editar</button>
            <button class="btn btn-danger btn-sm del-btn" data-id="${c.id}" title="Excluir">🗑️</button>
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
    formTitle.textContent = 'Novo Desenho';
    formModal.classList.add('open');
    nomeField.focus();
  }

  function openEdit(id) {
    const c = DB.getCartoonById(id);
    if (!c) return;
    idField.value   = c.id;
    nomeField.value = c.nome || '';
    prodField.value = c.produtora || '';
    tempField.value = c.temporadas || 1;
    capaField.value = c.capa || '';
    if (c.capa) { capaImg.src = c.capa; capaPreview.style.display = 'block'; }
    else { capaPreview.style.display = 'none'; }
    formTitle.textContent = 'Editar Desenho';
    formModal.classList.add('open');
  }

  function openDelete(id) {
    const c = DB.getCartoonById(id);
    if (!c) return;
    pendingDeleteId = id;
    deleteCartoonName.textContent = c.nome;
    deleteModal.classList.add('open');
  }

  function closeFormModal()   { formModal.classList.remove('open'); }
  function closeDeleteModal() { deleteModal.classList.remove('open'); pendingDeleteId = null; }

  // Capa preview ao digitar URL
  capaField.addEventListener('input', () => {
    const val = capaField.value.trim();
    if (val) { capaImg.src = val; capaPreview.style.display = 'block'; }
    else      { capaPreview.style.display = 'none'; }
  });
  capaImg.addEventListener('error', () => { capaPreview.style.display = 'none'; });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!nomeField.value.trim() || !prodField.value.trim()) {
      showToast('Preencha nome e produtora.', 'error'); return;
    }
    const data = {
      nome:       nomeField.value.trim(),
      produtora:  prodField.value.trim(),
      temporadas: parseInt(tempField.value) || 1,
      capa:       capaField.value.trim()
    };
    if (idField.value) {
      DB.updateCartoon(idField.value, data);
      showToast('Desenho atualizado!');
    } else {
      DB.addCartoon(data);
      showToast('Desenho cadastrado!');
    }
    closeFormModal();
    render();
  });

  deleteConfirmBtn.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    DB.deleteCartoon(pendingDeleteId);
    showToast('Desenho excluído.', 'error');
    closeDeleteModal();
    render();
  });

  addBtn.addEventListener('click', openAdd);
  modalClose.addEventListener('click', closeFormModal);
  cancelBtn.addEventListener('click', closeFormModal);
  formModal.addEventListener('click', e => { if (e.target === formModal) closeFormModal(); });

  deleteClose.addEventListener('click', closeDeleteModal);
  deleteCancelBtn.addEventListener('click', closeDeleteModal);
  deleteModal.addEventListener('click', e => { if (e.target === deleteModal) closeDeleteModal(); });

  searchInput.addEventListener('input', render);
  filterProd.addEventListener('change', render);

  render();
});
