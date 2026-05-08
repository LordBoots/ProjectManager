import { BusEvents } from '../../core/EventBus.js';
import { showContextMenu } from '../../core/contextMenu.js';

export function createKanbanFeature(ctx) {
  const root = document.createElement('div');

  const bar = document.createElement('div');
  bar.className = 'pm-toolbar';

  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'pm-btn';
  add.textContent = 'Add card';
  add.hidden = !ctx.permissions.canEditKanban();
  bar.appendChild(add);

  const board = document.createElement('div');
  board.className = 'pm-kanban';
  root.append(bar, board);

  /** @type {{ colId: string, id: string } | null} */
  let drag = null;
  /** @type {string | null} */
  let expandedCardId = null;

  function nid(prefix = 'k') {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function blankCard() {
    return {
      id: nid(),
      title: 'Card',
      icon: String.fromCodePoint(0x2699),
      description: '',
      subtasks: [{ id: nid('s'), label: 'Task', done: false }],
    };
  }

  function canEdit() {
    return ctx.permissions.canEditKanban();
  }

  function normalizedSubtasks(card) {
    return Array.isArray(card.subtasks) ? card.subtasks : [];
  }

  function progressFor(card) {
    const subtasks = normalizedSubtasks(card);
    const total = subtasks.length;
    const done = subtasks.filter((x) => x && x.done).length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  }

  function findPos(st, colId, id) {
    const ci = st.kanban.columns.findIndex((x) => x.id === colId);
    if (ci < 0) return null;
    const cards = st.kanban.columns[ci].cards || [];
    const ix = cards.findIndex((c) => c.id === id);
    if (ix < 0) return null;
    return { ci, ix };
  }

  function findCard(cardId) {
    for (const col of ctx.store.getState().kanban.columns || []) {
      const card = (col.cards || []).find((c) => c.id === cardId);
      if (card) return card;
    }
    return null;
  }

  function updateCard(cardId, mutator, opts) {
    ctx.store.updateKanban((k) => {
      for (const col of k.columns || []) {
        const card = (col.cards || []).find((c) => c.id === cardId);
        if (!card) continue;
        mutator(card);
        return;
      }
    }, opts);
  }

  function commitKanbanEdits() {
    ctx.store.updateKanban(() => {});
  }

  function removeCard(cardId) {
    ctx.store.updateKanban((k) => {
      for (const col of k.columns || []) {
        const cards = col.cards || [];
        const next = cards.filter((c) => c.id !== cardId);
        if (next.length !== cards.length) {
          col.cards = next;
          return;
        }
      }
    });
    if (expandedCardId === cardId) expandedCardId = null;
    render();
  }

  function focusCardTitle(cardId) {
    const input = board.querySelector(`[data-kid="${CSS.escape(cardId)}"] .pm-k-card-title-input`);
    if (input instanceof HTMLInputElement) input.focus();
  }

  function focusCardTitleSoon(cardId) {
    focusCardTitle(cardId);
    window.setTimeout(() => focusCardTitle(cardId), 0);
    window.setTimeout(() => focusCardTitle(cardId), 35);
    window.setTimeout(() => focusCardTitle(cardId), 120);
  }

  function isPrimaryActivation(ev) {
    return typeof ev.button !== 'number' || ev.button === 0;
  }

  function onKanbanButton(btn, fn) {
    let handled = false;
    btn.addEventListener('mouseup', (ev) => {
      if (!isPrimaryActivation(ev)) return;
      ev.preventDefault();
      ev.stopPropagation();
      handled = true;
      fn();
      window.setTimeout(() => {
        handled = false;
      }, 0);
    });
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (!handled) fn();
    });
  }

  function armTextEditor(el) {
    const keepFocus = () => {
      const placeCaret = () => {
        if (typeof el.selectionStart !== 'number' || typeof el.selectionEnd !== 'number') return;
        const end = String(el.value || '').length;
        el.setSelectionRange(end, end);
      };
      const focus = () => {
        el.focus();
        placeCaret();
      };
      focus();
      window.setTimeout(focus, 0);
      window.setTimeout(focus, 35);
      window.setTimeout(focus, 120);
    };
    el.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      keepFocus();
    });
    el.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      keepFocus();
    });
    el.addEventListener('pointerup', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      keepFocus();
    });
    el.addEventListener('mouseup', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      keepFocus();
    });
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      keepFocus();
    });
  }

  function renderProgress(card) {
    const { done, total, percent } = progressFor(card);
    const wrap = document.createElement('div');
    wrap.className = 'pm-k-progress-wrap';

    const meta = document.createElement('div');
    meta.className = 'pm-k-progress-meta';
    meta.textContent = total ? `${done} / ${total} tasks` : 'No tasks';

    const p = document.createElement('div');
    p.className = 'pm-progress';
    const f = document.createElement('div');
    f.className = 'pm-progress-fill';
    f.style.width = `${percent}%`;
    p.appendChild(f);

    wrap.append(meta, p);
    return wrap;
  }

  function attachCardChrome(el, card) {
    el.addEventListener('mouseenter', () => ctx.bus.emit(BusEvents.ENTITY_HOVER, { type: 'kanbanCard', id: card.id }));
    el.addEventListener('mouseleave', () => ctx.bus.emit(BusEvents.ENTITY_HOVER_END, {}));
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: [
          {
            label: ctx.permissions.isDeveloper() ? 'Add dev note' : 'Add suggestion',
            onClick: () =>
              ctx.bus.emit(BusEvents.OPEN_SUGGESTION_FORM, {
                type: 'kanbanCard',
                id: card.id,
                kind: ctx.permissions.isDeveloper() ? 'devNote' : 'suggestion',
              }),
          },
        ],
      });
    });

  }

  function attachDragHandle(handle, col, card, cardEl) {
    handle.draggable = canEdit();
    handle.addEventListener('click', (ev) => ev.stopPropagation());
    handle.addEventListener('dragstart', (ev) => {
      if (!canEdit() || expandedCardId === card.id) {
        ev.preventDefault();
        return;
      }
      drag = { colId: col.id, id: card.id };
      try {
        ev.dataTransfer.setData('text/plain', card.id);
      } catch (_) {}
      cardEl.style.opacity = '0.5';
    });
    handle.addEventListener('dragend', () => {
      cardEl.style.opacity = '';
      drag = null;
    });
  }

  function renderCollapsedCard(el, card) {
    const head = document.createElement('div');
    head.className = 'pm-k-card-title-row';

    const dragHandle = document.createElement('button');
    dragHandle.type = 'button';
    dragHandle.className = 'pm-k-card-drag';
    dragHandle.title = 'Drag card';
    dragHandle.textContent = '⋮⋮';

    const icon = document.createElement('span');
    icon.className = 'pm-k-card-icon';
    icon.textContent = String(card.icon || '').trim() || String.fromCodePoint(0x2699);

    const title = document.createElement('strong');
    title.className = 'pm-k-card-title';
    title.textContent = String(card.title || '').trim() || 'Untitled card';
    head.append(dragHandle, icon, title);
    el.appendChild(head);

    const desc = String(card.description || '').trim();
    if (desc) {
      const p = document.createElement('div');
      p.className = 'pm-muted pm-k-card-desc';
      p.textContent = desc.slice(0, 140);
      el.appendChild(p);
    }

    const subtasks = renderCollapsedSubtasks(card);
    if (subtasks) el.appendChild(subtasks);

    el.appendChild(renderProgress(card));
    return { dragHandle };
  }

  function renderCollapsedSubtasks(card) {
    const subtasks = normalizedSubtasks(card);
    if (!subtasks.length) return null;

    const wrap = document.createElement('div');
    wrap.className = 'pm-k-card-task-list';

    for (const task of subtasks) {
      const row = document.createElement('label');
      row.className = 'pm-k-card-task';
      row.addEventListener('pointerup', (ev) => ev.stopPropagation());
      row.addEventListener('mouseup', (ev) => ev.stopPropagation());
      row.addEventListener('click', (ev) => ev.stopPropagation());

      const done = document.createElement('input');
      done.type = 'checkbox';
      done.checked = !!task.done;
      done.disabled = !canEdit();
      done.addEventListener('change', () => {
        if (!canEdit()) return;
        updateCard(card.id, (c) => {
          const t = normalizedSubtasks(c).find((x) => x.id === task.id);
          if (t) t.done = done.checked;
        });
      });

      const name = document.createElement('span');
      name.className = 'pm-k-card-task-label';
      name.textContent = String(task.label || '').trim() || 'Untitled task';

      row.append(done, name);
      wrap.appendChild(row);
    }

    return wrap;
  }

  function renderExpandedCard(el, card) {
    const form = document.createElement('div');
    form.className = 'pm-k-card-editor';
    form.addEventListener('dragstart', (ev) => ev.preventDefault());

    const top = document.createElement('div');
    top.className = 'pm-k-card-editor-top';

    const icon = document.createElement('input');
    icon.className = 'pm-input pm-k-card-icon-input';
    icon.value = String(card.icon || '').trim() || String.fromCodePoint(0x2699);
    icon.placeholder = 'Icon';
    icon.addEventListener('input', () => updateCard(card.id, (c) => (c.icon = icon.value), { silent: true }));
    armTextEditor(icon);

    const title = document.createElement('input');
    title.className = 'pm-input pm-k-card-title-input';
    title.value = String(card.title || '');
    title.placeholder = 'Card title';
    title.addEventListener('input', () => updateCard(card.id, (c) => (c.title = title.value), { silent: true }));
    armTextEditor(title);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'pm-btn';
    close.textContent = 'Done';
    onKanbanButton(close, () => {
      expandedCardId = null;
      commitKanbanEdits();
    });

    top.append(icon, title, close);

    const desc = document.createElement('textarea');
    desc.className = 'pm-textarea pm-k-card-description';
    desc.value = String(card.description || '');
    desc.placeholder = 'Description';
    desc.rows = 3;
    desc.addEventListener('input', () => updateCard(card.id, (c) => (c.description = desc.value), { silent: true }));
    armTextEditor(desc);

    const subtaskList = renderSubtaskEditor(card);

    const actions = document.createElement('div');
    actions.className = 'pm-k-card-actions';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'pm-btn pm-btn-ghost pm-k-danger';
    del.textContent = 'Delete card';
    onKanbanButton(del, () => removeCard(card.id));

    actions.appendChild(del);
    form.append(top, desc, subtaskList, renderProgress(card), actions);
    el.appendChild(form);
  }

  function renderSubtaskEditor(card) {
    const wrap = document.createElement('div');
    wrap.className = 'pm-k-subtasks';

    const head = document.createElement('div');
    head.className = 'pm-k-subtasks-head';
    const label = document.createElement('strong');
    label.textContent = 'Subtasks';

    const addTask = document.createElement('button');
    addTask.type = 'button';
    addTask.className = 'pm-btn pm-btn-ghost';
    addTask.textContent = 'Add subtask';
    onKanbanButton(addTask, () => {
      updateCard(card.id, (c) => {
        c.subtasks = [...normalizedSubtasks(c), { id: nid('s'), label: '', done: false }];
      });
    });

    head.append(label, addTask);
    wrap.appendChild(head);

    const subtasks = normalizedSubtasks(card);
    if (!subtasks.length) {
      const empty = document.createElement('div');
      empty.className = 'pm-muted pm-k-subtask-empty';
      empty.textContent = 'No subtasks yet.';
      wrap.appendChild(empty);
      return wrap;
    }

    for (const task of subtasks) {
      const row = document.createElement('div');
      row.className = 'pm-k-subtask-row';

      const done = document.createElement('input');
      done.type = 'checkbox';
      done.checked = !!task.done;
      done.addEventListener('change', () => {
        updateCard(card.id, (c) => {
          const t = normalizedSubtasks(c).find((x) => x.id === task.id);
          if (t) t.done = done.checked;
        });
      });

      const name = document.createElement('input');
      name.className = 'pm-input pm-k-subtask-label';
      name.value = String(task.label || '');
      name.placeholder = 'Subtask';
      name.addEventListener('input', () => {
        updateCard(card.id, (c) => {
          const t = normalizedSubtasks(c).find((x) => x.id === task.id);
          if (t) t.label = name.value;
        }, { silent: true });
      });
      armTextEditor(name);

      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'pm-btn pm-btn-ghost pm-k-subtask-remove';
      rm.textContent = '×';
      rm.title = 'Remove subtask';
      onKanbanButton(rm, () => {
        updateCard(card.id, (c) => {
          c.subtasks = normalizedSubtasks(c).filter((x) => x.id !== task.id);
        });
      });

      row.append(done, name, rm);
      wrap.appendChild(row);
    }

    return wrap;
  }

  function renderCard(col, card) {
    const el = document.createElement('article');
    el.className = 'pm-k-card';
    if (expandedCardId === card.id) el.classList.add('pm-k-card--expanded');
    el.draggable = false;
    el.dataset.kid = card.id;
    attachCardChrome(el, card);

    if (expandedCardId === card.id && canEdit()) renderExpandedCard(el, card);
    else {
      const { dragHandle } = renderCollapsedCard(el, card);
      attachDragHandle(dragHandle, col, card, el);
      if (canEdit()) {
        let openedFromPointer = false;
        const openCard = () => {
          if (expandedCardId === card.id) return;
          if (expandedCardId && expandedCardId !== card.id) commitKanbanEdits();
          expandedCardId = card.id;
          const current = findCard(card.id) || card;
          el.replaceWith(renderCard(col, current));
          focusCardTitleSoon(card.id);
        };
        el.addEventListener('pointerup', (ev) => {
          if (!isPrimaryActivation(ev) || ev.target instanceof Element && ev.target.closest('.pm-k-card-drag')) return;
          openedFromPointer = true;
          ev.preventDefault();
          openCard();
        });
        el.addEventListener('mouseup', (ev) => {
          if (openedFromPointer || !isPrimaryActivation(ev) || ev.target instanceof Element && ev.target.closest('.pm-k-card-drag')) return;
          ev.preventDefault();
          openCard();
        });
        el.addEventListener('click', (ev) => {
          if (!isPrimaryActivation(ev) || ev.target instanceof Element && ev.target.closest('.pm-k-card-drag')) return;
          ev.preventDefault();
          if (!openedFromPointer) openCard();
        });
      }
    }

    return el;
  }

  function render() {
    board.replaceChildren();
    (ctx.store.getState().kanban.columns || []).forEach((col) => {
      const el = document.createElement('div');
      el.className = 'pm-column';

      const h = document.createElement('div');
      h.className = 'pm-column-head';
      h.textContent = col.title;
      el.appendChild(h);

      (col.cards || []).forEach((c) => el.appendChild(renderCard(col, c)));

      el.addEventListener('dragover', (e) => canEdit() && e.preventDefault());
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!drag || !canEdit()) return;
        const from = drag;
        const st = ctx.store.getState();
        const p = findPos(st, from.colId, from.id);
        if (!p) return;
        ctx.store.updateKanban((k) => {
          const dj = k.columns.findIndex((x) => x.id === col.id);
          if (dj < 0) return;
          const fromCards = [...(k.columns[p.ci].cards || [])];
          const mv = fromCards.splice(p.ix, 1)[0];
          if (!mv) return;
          k.columns[p.ci].cards = fromCards;
          k.columns[dj].cards = [...(k.columns[dj].cards || []), mv];
        });
        drag = null;
        render();
      });

      board.appendChild(el);
    });
  }

  add.addEventListener('click', () => {
    if (!canEdit()) return;
    const card = blankCard();
    ctx.store.updateKanban((k) => {
      if (k.columns[0]) k.columns[0].cards = [...(k.columns[0].cards || []), card];
    });
    expandedCardId = card.id;
    render();
  });

  const unsub = ctx.store.subscribe(render);
  render();

  return {
    root,
    highlightCard(id) {
      board.querySelectorAll('.pm-k-card').forEach((n) => n.classList.remove('pm-highlight'));
      const w = board.querySelector(`[data-kid="${CSS.escape(id)}"]`);
      if (w) {
        w.classList.add('pm-highlight');
        w.scrollIntoView({ block: 'nearest' });
      }
    },
    unmount() {
      unsub();
    },
  };
}
