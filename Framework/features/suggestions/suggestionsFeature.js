import { BusEvents } from '../../core/EventBus.js';

const CATEGORIES = ['Art', 'Audio', 'Code', 'Design', 'Narrative', 'Production', 'Scope', 'UX'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const KIND_SUGGESTION = 'suggestion';
const KIND_DEV_NOTE = 'devNote';

/** @param {unknown} raw */
function prioritySlug(raw) {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (s === 'low') return 'low';
  if (s === 'high') return 'high';
  if (s === 'medium') return 'medium';
  return 'other';
}

/**
 * @param {string} label
 * @param {unknown} rawForSlug
 */
function priorityPillEl(label, rawForSlug) {
  const span = document.createElement('span');
  span.className = `pm-suggest-priority pm-suggest-priority--${prioritySlug(rawForSlug ?? label)}`;
  span.textContent = label.trim() || '?';
  return span;
}

/**
 * Sidebar card meta row: category (plain) · priority pill.
 * @param {HTMLElement} metaEl
 * @param {string | undefined} category
 * @param {string | undefined} priority
 */
function renderAsidePriorityMeta(metaEl, category, priority) {
  metaEl.replaceChildren();
  const cat = String(category ?? '').trim();
  const pri = String(priority ?? '').trim();
  if (!cat && !pri) return;
  if (cat && pri) {
    metaEl.append(cat, document.createTextNode(' · '), priorityPillEl(pri, priority));
    return;
  }
  if (cat) metaEl.appendChild(document.createTextNode(cat));
  else metaEl.appendChild(priorityPillEl(pri, priority));
}

/**
 * Inbox subtitle: category · priority pill · status
 * @param {HTMLElement} subEl
 * @param {string | undefined} category
 * @param {string | undefined} priority
 * @param {string | undefined} status
 */
function renderInboxSubtitle(subEl, category, priority, status) {
  subEl.replaceChildren();
  const cat = String(category ?? '').trim();
  const pri = String(priority ?? '').trim();
  const stat = String(status ?? '').trim();

  const factories = [];
  if (cat) factories.push(() => document.createTextNode(cat));
  if (pri) factories.push(() => priorityPillEl(pri, priority));
  if (stat) factories.push(() => document.createTextNode(stat));

  for (let i = 0; i < factories.length; i++) {
    if (i > 0) subEl.appendChild(document.createTextNode(' · '));
    subEl.appendChild(factories[i]());
  }
}

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
    if (t === 'mindmapNode' || t === 'kanbanCard' || t === 'wikiPage' || t === 'wikiBlock' || t === 'wikiTableRow') {
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
  const isDev = ctx.permissions.isDeveloper();

  let asidePanelKind = KIND_SUGGESTION;

  /** @param {object | null | undefined} it */
  function itemKindOf(it) {
    return it && it.kind === KIND_DEV_NOTE ? KIND_DEV_NOTE : KIND_SUGGESTION;
  }

  function passesPanelFilter(it) {
    if (!isDev) return itemKindOf(it) === KIND_SUGGESTION;
    return itemKindOf(it) === asidePanelKind;
  }

  function itemsForPanel(items) {
    return (items ?? []).filter(passesPanelFilter);
  }

  const asideShell = ctx.layout.suggestionsAside;
  asideShell.replaceChildren();

  const asideHead = document.createElement('div');
  asideHead.className = 'pm-suggestions-aside-head';

  const asideTabsWrap = document.createElement('div');
  asideTabsWrap.className = 'pm-tabs';

  /** @type {HTMLButtonElement | null} */
  let asideTabS = null;
  /** @type {HTMLButtonElement | null} */
  let asideTabD = null;

  if (isDev) {
    asideTabS = document.createElement('button');
    asideTabS.type = 'button';
    asideTabS.className = 'pm-tab pm-tab-active';
    asideTabS.textContent = 'Suggestions';
    asideTabS.addEventListener('click', () => {
      asidePanelKind = KIND_SUGGESTION;
      syncKindTabs();
      renderAll();
    });
    asideTabD = document.createElement('button');
    asideTabD.type = 'button';
    asideTabD.className = 'pm-tab';
    asideTabD.textContent = 'Dev notes';
    asideTabD.addEventListener('click', () => {
      asidePanelKind = KIND_DEV_NOTE;
      syncKindTabs();
      renderAll();
    });
    asideTabsWrap.append(asideTabS, asideTabD);
  }

  const addBtnAside = document.createElement('button');
  addBtnAside.type = 'button';
  addBtnAside.className = 'pm-btn pm-btn-ghost';
  addBtnAside.style.padding = '0.15rem 0.45rem';
  addBtnAside.textContent = '+';
  addBtnAside.title = 'New suggestion';

  if (isDev) {
    asideHead.append(asideTabsWrap, addBtnAside);
  } else {
    const sp = document.createElement('span');
    sp.className = 'pm-sidebar-title';
    sp.style.margin = '0';
    sp.textContent = 'Suggestions';
    asideHead.append(sp, addBtnAside);
  }

  const scroll = document.createElement('div');
  scroll.className = 'pm-suggestions-scroll';
  scroll.id = 'pm-suggestions-scroll';

  asideShell.append(asideHead, scroll);

  const mainRoot = document.createElement('div');
  mainRoot.className = 'pm-suggestions-main';

  const mainTabsWrap = document.createElement('div');
  mainTabsWrap.className = 'pm-tabs';
  mainTabsWrap.style.marginBottom = '0.5rem';

  /** @type {HTMLButtonElement | null} */
  let mainTabS = null;
  /** @type {HTMLButtonElement | null} */
  let mainTabD = null;

  if (isDev) {
    mainTabS = document.createElement('button');
    mainTabS.type = 'button';
    mainTabS.className = 'pm-tab pm-tab-active';
    mainTabS.textContent = 'Suggestions';
    mainTabS.addEventListener('click', () => {
      asidePanelKind = KIND_SUGGESTION;
      syncKindTabs();
      renderAll();
    });
    mainTabD = document.createElement('button');
    mainTabD.type = 'button';
    mainTabD.className = 'pm-tab';
    mainTabD.textContent = 'Dev notes';
    mainTabD.addEventListener('click', () => {
      asidePanelKind = KIND_DEV_NOTE;
      syncKindTabs();
      renderAll();
    });
    mainTabsWrap.append(mainTabS, mainTabD);
  } else {
    mainTabsWrap.style.display = 'none';
  }

  const mainTitle = document.createElement('p');
  mainTitle.className = 'pm-pane-title';
  mainTitle.style.marginBottom = '0.75rem';

  const mainList = document.createElement('div');
  mainList.className = 'pm-stack';
  mainRoot.append(mainTabsWrap, mainTitle, mainList);

  function updateMainTitle() {
    mainTitle.textContent = asidePanelKind === KIND_DEV_NOTE ? 'Dev notes inbox' : 'Suggestions inbox';
  }

  function syncKindTabs() {
    if (!isDev) {
      addBtnAside.title = 'New suggestion';
      return;
    }
    const onS = asidePanelKind === KIND_SUGGESTION;
    asideTabS?.classList.toggle('pm-tab-active', onS);
    asideTabD?.classList.toggle('pm-tab-active', !onS);
    mainTabS?.classList.toggle('pm-tab-active', onS);
    mainTabD?.classList.toggle('pm-tab-active', !onS);
    addBtnAside.title = onS ? 'New suggestion' : 'New dev note';
    updateMainTitle();
  }

  let selectedId = /** @type {string | null} */ (null);

  /** Open sidebar cards (header toggles membership in this set) */
  const asideExpandedDetailIds = /** @type {Set<string>} */ (new Set());

  function cardNavigateFromSidebar(it) {
    selectedId = it.id;
    const refs = normalizeRefsList(it.targetRefs);
    if (refs[0]) {
      ctx.bus.emit(BusEvents.NAVIGATE_TO_ENTITY, refs[0]);
    }
    renderAll();
  }

  function focusInboxItem(id) {
    const st = ctx.store.getState();
    const item = (st.suggestions.items ?? []).find((x) => x.id === id);
    if (!item) return;
    selectedId = id;
    if (isDev) {
      asidePanelKind = itemKindOf(item);
      syncKindTabs();
    }
    renderAll();
    requestAnimationFrame(() => {
      const row = mainList.querySelector(`[data-suggestion-id="${CSS.escape(id)}"]`);
      row?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

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
    for (const el of scroll.querySelectorAll('details.pm-card-suggestion')) {
      const sid = el.dataset.suggestionId;
      if (sid && /** @type {HTMLDetailsElement} */ (el).open) asideExpandedDetailIds.add(sid);
    }

    const st = ctx.store.getState();
    const items = itemsForPanel(st.suggestions.items ?? []);
    scroll.replaceChildren();

    const maxAside = 12;
    items.slice(0, maxAside).forEach((it) => {
      const expanded = asideExpandedDetailIds.has(it.id);

      const card = document.createElement('div');
      card.dataset.suggestionId = it.id;
      card.dataset.sidebarOpen = expanded ? '1' : '0';
      card.className = 'pm-card-suggestion';
      if (selectedId === it.id || matchesHighlighted(it)) card.classList.add('pm-highlight');
      if (!matchesHighlighted(it) && matchesHover(it, hl.hoveredKey)) {
        card.classList.add('pm-highlight');
      }

      const headerBtn = document.createElement('button');
      headerBtn.type = 'button';
      headerBtn.className = 'pm-suggest-card-header';
      headerBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');

      const title = document.createElement('div');
      title.className = 'pm-suggest-card-title';
      title.textContent = it.title || '(untitled)';

      const divider = document.createElement('div');
      divider.className = 'pm-suggest-expand-hit';
      divider.setAttribute('aria-hidden', 'true');

      const meta = document.createElement('div');
      meta.className = 'pm-suggest-card-meta';
      renderAsidePriorityMeta(meta, it.category, it.priority);

      const dividerUnderMeta = document.createElement('div');
      dividerUnderMeta.className = 'pm-suggest-expand-hit';
      dividerUnderMeta.setAttribute('aria-hidden', 'true');

      headerBtn.append(title, divider, meta, dividerUnderMeta);

      const bodyPanel = document.createElement('div');
      bodyPanel.className = 'pm-suggest-expand-body';
      bodyPanel.hidden = !expanded;

      const bodyHeading = document.createElement('div');
      bodyHeading.className = 'pm-suggest-expand-body-heading';
      bodyHeading.textContent = itemKindOf(it) === KIND_DEV_NOTE ? 'Notes' : 'Description:';

      const bodyTxt = document.createElement('div');
      bodyTxt.className = 'pm-suggest-expand-desc';
      bodyTxt.textContent = (it.body ?? '').trim() || '(No description)';
      bodyPanel.append(bodyHeading, bodyTxt);

      const jumpBtn = document.createElement('button');
      jumpBtn.type = 'button';
      jumpBtn.className = 'pm-btn pm-btn-ghost pm-suggest-jump-btn';
      jumpBtn.textContent = 'Open in inbox';
      jumpBtn.title = 'Jump to this item in the main list to edit or remove';
      jumpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ctx.bus.emit(BusEvents.FOCUS_SUGGESTION_INBOX, { id: it.id });
      });

      const firstRef = normalizeRefsList(it.targetRefs)[0];
      if (firstRef) {
        const followBtn = document.createElement('button');
        followBtn.type = 'button';
        followBtn.className = 'pm-btn pm-btn-ghost pm-suggest-follow-btn';
        followBtn.textContent = 'Open linked item';
        followBtn.title =
          'Go to the linked mind map item, Kanban card, wiki page, wiki block, or table row';
        followBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          cardNavigateFromSidebar(it);
        });
        bodyPanel.appendChild(followBtn);
      }
      bodyPanel.appendChild(jumpBtn);

      headerBtn.addEventListener('click', () => {
        if (asideExpandedDetailIds.has(it.id)) asideExpandedDetailIds.delete(it.id);
        else asideExpandedDetailIds.add(it.id);
        rerenderScroller();
      });

      card.append(headerBtn, bodyPanel);

      card.title = firstRef
        ? 'Use the header strip to show details. Buttons open inbox or linked item.'
        : 'Use the header strip to show details. Open in inbox to edit.';

      scroll.appendChild(card);
    });

    scroll.classList.toggle('pm-more-below', items.length > maxAside);
  }

  function rerenderMain() {
    const st = ctx.store.getState();
    const items = itemsForPanel(st.suggestions.items ?? []);
    mainList.replaceChildren();
    updateMainTitle();

    if (items.length === 0) {
      const p = document.createElement('p');
      p.className = 'pm-muted';
      p.textContent = asidePanelKind === KIND_DEV_NOTE ? 'No dev notes yet.' : 'No suggestions yet.';
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
      sub.className = 'pm-muted pm-suggestions-inbox-meta';
      renderInboxSubtitle(sub, it.category, it.priority, it.status);
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
   * @param {'suggestion'|'devNote'} [kindForNew]
   */
  function openEditor(existing, extraRefs = [], kindForNew = KIND_SUGGESTION) {
    const effectiveKind = existing ? itemKindOf(existing) : kindForNew === KIND_DEV_NOTE ? KIND_DEV_NOTE : KIND_SUGGESTION;

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
    h.textContent = existing
      ? effectiveKind === KIND_DEV_NOTE
        ? 'Edit dev note'
        : 'Edit suggestion'
      : effectiveKind === KIND_DEV_NOTE
        ? 'New dev note'
        : 'New suggestion';

    const form = document.createElement('form');
    form.className = 'pm-stack';

    const title = fieldText('Title', 'title', existing?.title ?? '');
    const body = fieldTextarea(effectiveKind === KIND_DEV_NOTE ? 'Notes' : 'Suggestion', 'body', existing?.body ?? '');
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
        kind: effectiveKind,
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

  addBtnAside.addEventListener('click', () => openEditor(null, [], isDev ? asidePanelKind : KIND_SUGGESTION));

  /** Mind map / kanban / wiki updates replace `state` often; `suggestions` keeps the same reference until that slice changes. Rebuilding the aside on every notify() replaced the DOM every frame during drags and swallowed clicks. */
  let lastSuggestionsSlice = /** @type {object | null} */ (null);
  const unsubStore = ctx.store.subscribe((st) => {
    const s = st.suggestions;
    if (lastSuggestionsSlice !== null && s === lastSuggestionsSlice) return;
    lastSuggestionsSlice = s;
    renderAll();
  });

  const unsubHover = ctx.bus.on(BusEvents.ENTITY_HOVER, (payload) => {
    if (!payload || typeof payload !== 'object') return;
    const t = /** @type {{ type?: string; id?: string }} */ (payload);
    if (typeof t.type !== 'string' || typeof t.id !== 'string') return;
    hl.hoveredKey = `${t.type}:${t.id}`;
    const items = ctx.store.getState().suggestions.items ?? [];
    hl.highlightIds = new Set(
      items.filter((it) => passesPanelFilter(it) && matchesHover(it, hl.hoveredKey)).map((it) => it.id),
    );
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
    const pk = typeof /** @type {{ kind?: string }} */ (p).kind === 'string' ? /** @type {{ kind?: string }} */ (p).kind : '';
    const kindNew =
      pk === KIND_DEV_NOTE || pk === KIND_SUGGESTION ? pk : ctx.permissions.isDeveloper() ? KIND_DEV_NOTE : KIND_SUGGESTION;
    openEditor(null, refs, kindNew);
  });

  return {
    id: 'suggestions',

    sidebarRoot() {
      return asideShell;
    },

    mainRoot,

    renderAll,

    focusInboxItem,

    mount() {
      syncKindTabs();
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
