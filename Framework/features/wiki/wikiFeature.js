export function createWikiFeature(ctx) {
  const root = document.createElement('div');
  root.className = 'pm-wiki';

  const toolbar = document.createElement('div');
  toolbar.className = 'pm-toolbar';

  const pageSelect = document.createElement('select');
  pageSelect.className = 'pm-select';
  pageSelect.style.maxWidth = '260px';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'pm-btn';
  addBtn.textContent = 'New page';
  addBtn.hidden = !ctx.permissions.canEditWiki();

  toolbar.append(pageSelect);
  toolbar.append(addBtn);

  const title = document.createElement('input');
  title.className = 'pm-input';
  title.placeholder = 'Page title';

  const body = document.createElement('textarea');
  body.className = 'pm-textarea';
  body.style.minHeight = '360px';

  root.append(toolbar, title, body);

  let selectedPageId = null;
  let saveTimer = null;

  function pages() {
    const w = ctx.store.getState().wiki;
    return Array.isArray(w.pages) ? w.pages : [];
  }

  function md(id) {
    const w = ctx.store.getState().wiki;
    return w.markdownByPageId?.[id] ?? '';
  }

  function newId() {
    return `p-${Math.random().toString(36).slice(2, 8)}`;
  }

  function flushInputs() {
    if (!selectedPageId || !ctx.permissions.canEditWiki()) return;
    ctx.store.updateWiki((w) => {
      const list = [...(w.pages || [])];
      const i = list.findIndex((x) => x.id === selectedPageId);
      if (i < 0) return;
      list[i] = {
        ...list[i],
        title: title.value.trim() || list[i].title,
        description: body.value.replace(/\s+/g, ' ').trim().slice(0, 180),
      };
      const by = { ...(w.markdownByPageId || {}), [selectedPageId]: body.value };
      w.pages = list;
      w.markdownByPageId = by;
    });
  }

  function scheduleFlush() {
    if (!ctx.permissions.canEditWiki()) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      flushInputs();
    }, 400);
  }

  function rerender(pref) {
    const list = pages();
    pageSelect.replaceChildren();
    list.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.title || p.id;
      pageSelect.append(opt);
    });
    const cand = pref && list.some((x) => x.id === pref) ? pref : selectedPageId;
    if (!cand || !list.some((x) => x.id === cand)) {
      selectedPageId = list[0]?.id ?? null;
    } else {
      selectedPageId = cand;
    }
    if (selectedPageId) pageSelect.value = selectedPageId;

    title.disabled = !ctx.permissions.canEditWiki() || list.length === 0;
    body.disabled = list.length === 0;
    body.readOnly = !ctx.permissions.canEditWiki();
    if (!selectedPageId) {
      title.value = '';
      body.value = '';
      return;
    }
    const meta = list.find((x) => x.id === selectedPageId);
    title.value = meta?.title ?? '';
    body.value = md(selectedPageId);
  }

  pageSelect.addEventListener('change', () => {
    flushInputs();
    selectedPageId = pageSelect.value;
    rerender();
  });

  title.addEventListener('input', scheduleFlush);
  body.addEventListener('input', scheduleFlush);

  addBtn.addEventListener('click', () => {
    if (!ctx.permissions.canEditWiki()) return;
    flushInputs();
    const id = newId();
    ctx.store.updateWiki((w) => {
      const nextPages = [...(w.pages || [])];
      nextPages.push({
        id,
        title: 'New page',
        description: '',
        icon: '📄',
      });
      w.pages = nextPages;
      w.markdownByPageId = { ...(w.markdownByPageId || {}), [id]: '# New page\n' };
    });
    rerender(id);
  });

  rerender();

  return {
    root,
    setPage(prefId) {
      rerender(prefId);
    },
    unmount() {
      if (saveTimer) clearTimeout(saveTimer);
    },
  };
}
