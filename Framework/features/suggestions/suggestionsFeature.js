import { BusEvents } from '../../core/EventBus.js';

const CATEGORIES = ['Art', 'Audio', 'Code', 'Design', 'Narrative', 'Production', 'Scope', 'UX'];
const PRIORITIES = ['Low', 'Medium', 'High'];

function uid() {
  return `sg-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function nowIso() {
  return new Date().toISOString();
}

/** @returns {{ type: string, id: string }[]} */
export function normalizeRefsList(refs) {
  const out = [];
  if (!refs) return [];
  const list = Array.isArray(refs) ? refs : [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const t = typeof item.type === 'string' ? item.type : '';
    const id = typeof item.id === 'string' ? item.id : '';
    if (!id) continue;
    if (t === 'mindmapNode' || t === 'kanbanCard' || t === 'wikiPage') {
      out.push({ type: t, id });
    }
  }
  return out;
}

function highlightState() {
  return {
    hoveredKey: /** @type {string | null} */ (null),
    highlightIds: /** @type {Set<string>} */ (new Set()),
  };
}

export function createSuggestionsFeature(ctx) {
  const hl = highlightState();

  const asideShell = ctx.layout.suggestionsAside;
  asideShell.replaceChildren();

  const asideLbl = document.createElement('div');
  asideLbl.className = 'pm-sidebar-title';
  asideLbl.style.display = 'flex';
  asideLbl.style.alignItems = 'center';
  asideLbl.style.justifyContent = 'space-between';
  asideLbl.appendChild(document.createTextNode('Suggestions'));

  const addBtnAside = document.createElement('button');
  addBtnAside.type = 'button';
  addBtnAside.className = 'pm-btn pm-btn-ghost';
  addBtnAside.style.padding = '0.15rem 0.45rem';
  addBtnAside.textContent = '+';
  addBtnAside.title = 'New suggestion';

  asideLbl.appendChild(addBtnAside);

  const scroll = document.createElement('div');
  scroll.className = 'pm-suggestions-scroll';
  scroll.id = 'pm-suggestions-scroll';

  asideShell.append(asideLbl, scroll);

  const mainRoot = document.createElement('div');
  mainRoot.className = 'pm-suggestions-main';

  const mainTitle = document.createElement('p');
  mainTitle.className = 'pm-pane-title';
  mainTitle.textContent = 'Suggestions inbox';

  const mainList = document.createElement('div');
  mainList.className = 'pm-stack';
  mainRoot.append(mainTitle, mainList);

  let selectedId = /** @type {string | null} */ (null);

  function refKey(ref) {
    return `${ref.type}:${ref.id}`;
  }

  function itemKeys(item) {
    return normalizeRefsList(item.targetRefs).map(refKey);
  }

  function matchesHover(item, key) {
    if (!key) return false;
    return itemKeys(item).includes(key);
  }

  function matchesHighlighted(item) {
    if (hl.highlightIds.size === 0) return false;
    const keys = itemKeys(item);
    for (const sid of hl.highlightIds) {
      if (keys.includes(sid)) return true;
    }
    return false;
  }

  function rerenderScroller() {
    const st = ctx.store.getState();
    const items = st.suggestions.items ?? [];
    scroll.replaceChildren();

    const maxAside = 12;
    items.slice(0, maxAside).forEach((it) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.dataset.suggestionId = it.id;
      card.className = 'pm-card-suggestion';
      if (selectedId === it.id || matchesHighlighted(it)) card.classList.add('pm-highlight');
      if (!matchesHighlighted(it) && matchesHover(it, hl.hoveredKey)) {
        card.classList.add('pm-highlight');
      }

      const t = document.createElement('div');
      t.style.fontWeight = '600';
      t.textContent = it.title || '(untitled)';

      const meta = document.createElement('div');
      meta.className = 'pm-muted';
      meta.style.fontSize = '0.78rem';
      meta.textContent = `${it.category || ''} · ${it.priority || ''}`;

      card.append(t, meta);
      card.addEventListener('click', () => {
        selectedId = it.id;
        const refs = normalizeRefsList(it.targetRefs);
        if (refs[0]) {
          ctx.bus.emit(BusEvents.NAVIGATE_TO_ENTITY, refs[0]);
        }
        renderAll();
      });
      scroll.appendChild(card);
    });

    scroll.classList.toggle('pm-more-below', items.length > maxAside);
  }

  function rerenderMain() {
    const st = ctx.store.getState();
    const items = st.suggestions.items ?? [];
    mainList.replaceChildren();

    if (items.length === 0) {
      const p = document.createElement('p');
      p.className = 'pm-muted';
      p.textContent = 'No suggestions yet.';
      mainList.appendChild(p);
      return;
    }

    for (const it of items) {
      const row = document.createElement('div');
      row.dataset.suggestionId = it.id;
      row.className = 'pm-wiki-card';
      const hi =
        selectedId === it.id ||
        matchesHighlighted(it) ||
        (!matchesHighlighted(it) && matchesHover(it, hl.hoveredKey));
      if (hi) row.classList.add('pm-highlight');

      const left = document.createElement('div');
      left.className = 'pm-stack';
      const title = document.createElement('strong');
      title.textContent = it.title;
      const sub = document.createElement('div');
      sub.className = 'pm-muted';
      sub.textContent = `${it.category} · ${it.priority} · ${it.status}`;
      left.append(title, sub);

      const actions = document.createElement('div');
      actions.className = 'pm-toolbar';

      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'pm-btn';
      open.textContent = 'Open';
      open.addEventListener('click', () => {
        selectedId = it.id;
        openEditor(it);
      });
      actions.appendChild(open);

      if (ctx.permissions.canRemoveSuggestion()) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'pm-btn';
        del.textContent = 'Remove';
        del.addEventListener('click', () => {
          ctx.store.updateSuggestions((s) => {
            s.items = s.items.filter((x) => x.id !== it.id);
          });
        });
        actions.appendChild(del);
      }

      row.append(left, actions);
      mainList.appendChild(row);
    }
  }

  function renderAll() {
    rerenderScroller();
    rerenderMain();
  }

  function serializeForm(form) {
    /** @type {Record<string,string>} */
    const out = {};
    new FormData(form).forEach((v, k) => {
      out[k] = String(v ?? '');
    });
    return out;
  }

  function fieldText(label, name, val) {
    const row = document.createElement('div');
    row.className = 'pm-stack';
    const l = document.createElement('label');
    l.className = 'pm-label';
    l.textContent = label;
    const input = document.createElement('input');
    input.name = name;
    input.value = val;
    input.className = 'pm-input';
    row.append(l, input);
    return { row, input };
  }

  function fieldTextarea(label, name, val) {
    const row = document.createElement('div');
    row.className = 'pm-stack';
    const l = document.createElement('label');
    l.className = 'pm-label';
    l.textContent = label;
    const textarea = document.createElement('textarea');
    textarea.name = name;
    textarea.value = val;
    textarea.className = 'pm-textarea';
    row.append(l, textarea);
    return { row, textarea };
  }

  function fieldSelect(label, name, opts, selected) {
    const row = document.createElement('div');
    row.className = 'pm-stack';
    const l = document.createElement('label');
    l.className = 'pm-label';
    l.textContent = label;
    const sel = document.createElement('select');
    sel.name = name;
    sel.className = 'pm-select';
    for (const o of opts) {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      sel.appendChild(opt);
    }
    sel.value = selected ?? opts[0] ?? '';
    row.append(l, sel);
    return { row, sel };
  }

  /**
   * @param {object | null} existing
   * @param {{ type: string, id: string }[]} [extraRefs]
   */
  function openEditor(existing, extraRefs = []) {
    const baseRefs = existing ? normalizeRefsList(existing.targetRefs) : [];
    const mergedMap = new Map();
    for (const r of [...baseRefs, ...extraRefs]) {
      mergedMap.set(refKey(r), r);
    }
    let workingRefs = [...mergedMap.values()];

    const overlay = document.createElement('div');
    overlay.className = 'pm-overlay';

    const modal = document.createElement('div');
    modal.className = 'pm-modal';

    const h = document.createElement('div');
    h.className = 'pm-pane-title';
    h.style.marginBottom = '0.25rem';
    h.textContent = existing ? 'Edit suggestion' : 'New suggestion';

    const form = document.createElement('form');
    form.className = 'pm-stack';

    const title = fieldText('Title', 'title', existing?.title ?? '');
    const body = fieldTextarea('Suggestion', 'body', existing?.body ?? '');
    const category = fieldSelect('Category', 'category', CATEGORIES, existing?.category ?? '');
    const priority = fieldSelect('Priority', 'priority', PRIORITIES, existing?.priority ?? 'Medium');
    const devOnly = ctx.permissions.canSetSuggestionApproval();
    const status = fieldSelect('Status', 'status', ['Pending', 'Approved', 'Rejected'], existing?.status ?? 'Pending');
    const rejection = fieldText('Rejection reason', 'rejectionReason', existing?.rejectionReason ?? '');

    form.append(title.row, body.row, category.row, priority.row);
    if (devOnly) {
      form.append(status.row, rejection.row);
    }

    const refsRow = document.createElement('div');
    refsRow.className = 'pm-stack';
    const refsLbl = document.createElement('div');
    refsLbl.className = 'pm-label';
    refsLbl.textContent = 'Linked targets';
    const refsList = document.createElement('div');
    refsList.className = 'pm-muted';
    refsRow.append(refsLbl, refsList);

    function renderRefs() {
      refsList.replaceChildren();
      if (workingRefs.length === 0) {
        refsList.textContent = 'None';
        return;
      }
      for (const r of workingRefs) {
        const line = document.createElement('div');
        line.textContent = `${r.type} · ${r.id}`;
        refsList.appendChild(line);
      }
    }
    renderRefs();
    form.appendChild(refsRow);

    const actions = document.createElement('div');
    actions.className = 'pm-toolbar';
    actions.style.marginTop = '0.5rem';

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'pm-btn pm-btn-primary';
    submit.textContent = 'Submit';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'pm-btn';
    cancel.textContent = 'Cancel';

    actions.append(submit, cancel);
    form.appendChild(actions);

    modal.append(h, form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function close() {
      overlay.remove();
    }

    cancel.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = serializeForm(form);
      if (!raw.category) {
        alert('Please select a category.');
        return;
      }

      const next = {
        id: existing?.id ?? uid(),
        title: raw.title,
        body: raw.body,
        category: raw.category,
        priority: raw.priority,
        status: devOnly ? raw.status : existing?.status ?? 'Pending',
        rejectionReason: devOnly ? raw.rejectionReason : existing?.rejectionReason ?? '',
        targetRefs: workingRefs,
        createdAt: existing?.createdAt ?? nowIso(),
        updatedAt: nowIso(),
      };

      if (devOnly && next.status === 'Rejected') {
        ctx.store.updateSuggestions((s) => {
          s.items = s.items.filter((x) => x.id !== next.id);
          const rest = s.archived.filter((x) => x.id !== next.id);
          rest.push(next);
          s.archived = rest;
        });
      } else {
        ctx.store.updateSuggestions((s) => {
          if (devOnly && next.status === 'Approved') {
            s.archived = s.archived.filter((x) => x.id !== next.id);
          }
          const idx = s.items.findIndex((x) => x.id === next.id);
          if (idx >= 0) s.items[idx] = next;
          else s.items.push(next);
        });
      }

      close();
      renderAll();
    });

    addBtnAside.focus();
  }

  addBtnAside.addEventListener('click', () => openEditor(null, []));

  const unsubStore = ctx.store.subscribe(renderAll);

  const unsubHover = ctx.bus.on(BusEvents.ENTITY_HOVER, (payload) => {
    if (!payload || typeof payload !== 'object') return;
    const t = /** @type {{ type?: string; id?: string }} */ (payload);
    if (typeof t.type !== 'string' || typeof t.id !== 'string') return;
    hl.hoveredKey = `${t.type}:${t.id}`;
    const items = ctx.store.getState().suggestions.items ?? [];
    hl.highlightIds = new Set(items.filter((it) => matchesHover(it, hl.hoveredKey)).map((it) => it.id));
    ctx.bus.emit(BusEvents.HIGHLIGHT_SUGGESTIONS, { suggestionIds: [...hl.highlightIds], hoveredKey: hl.hoveredKey });
    renderAll();
  });

  const unsubHoverEnd = ctx.bus.on(BusEvents.ENTITY_HOVER_END, () => {
    hl.hoveredKey = null;
    hl.highlightIds = new Set();
    renderAll();
  });

  const unsubOpenForm = ctx.bus.on(BusEvents.OPEN_SUGGESTION_FORM, (payload) => {
    /** @type {{ type: string, id: string }[]} */
    const refs = [];

    const p = payload && typeof payload === 'object' ? payload : {};
    if (typeof p.type === 'string' && typeof p.id === 'string') {
      refs.push({ type: p.type, id: p.id });
    }
    openEditor(null, refs);
  });

  return {
    id: 'suggestions',

    sidebarRoot() {
      return asideShell;
    },

    mainRoot,

    renderAll,

    mount() {
      renderAll();
    },

    unmount() {
      unsubStore();
      unsubHover();
      unsubHoverEnd();
      unsubOpenForm();
    },
  };
}
