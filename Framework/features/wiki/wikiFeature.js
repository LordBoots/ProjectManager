import { BusEvents } from '../../core/EventBus.js';
import { showContextMenu } from '../../core/contextMenu.js';
import {
  resolveWikiPageIconUrl,
  storedIconFromPickedFile,
  wikiPageUsesBundledIcon,
} from './wikiPageIcons.js';

const WIKI_BLOCK_REF_SEP = '|';

/** @param {string} pageId @param {string} blockId */
function wikiBlockRefCompound(pageId, blockId) {
  return `${pageId}${WIKI_BLOCK_REF_SEP}${blockId}`;
}

/** @param {string} pageId @param {string} blockId @param {string} rowId */
function wikiTableRowRefCompound(pageId, blockId, rowId) {
  return `${pageId}${WIKI_BLOCK_REF_SEP}${blockId}${WIKI_BLOCK_REF_SEP}${rowId}`;
}

/**
 * @param {string} compound
 * @returns {{ pageId: string, blockId: string } | null}
 */
export function parseWikiBlockRefCompound(compound) {
  if (typeof compound !== 'string' || compound.length < 3) return null;
  const parts = compound.split(WIKI_BLOCK_REF_SEP);
  if (parts.length !== 2) return null;
  const pageId = parts[0];
  const blockId = parts[1];
  if (!pageId || !blockId) return null;
  return { pageId, blockId };
}

/**
 * @param {string} compound `pageId|blockId|rowId`
 * @returns {{ pageId: string, blockId: string, rowId: string } | null}
 */
export function parseWikiTableRowRefCompound(compound) {
  if (typeof compound !== 'string' || compound.length < 5) return null;
  const parts = compound.split(WIKI_BLOCK_REF_SEP);
  if (parts.length < 3) return null;
  const pageId = parts[0];
  const blockId = parts[1];
  const rowId = parts.slice(2).join(WIKI_BLOCK_REF_SEP);
  if (!pageId || !blockId || !rowId) return null;
  return { pageId, blockId, rowId };
}

function newTableRowId() {
  return `br-${Math.random().toString(36).slice(2, 10)}`;
}

function newBlockId() {
  return `b-${Math.random().toString(36).slice(2, 10)}`;
}

function newPageId() {
  return `p-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * @param {'text' | 'image' | 'table' | 'separator'} kind
 */
function createBlock(kind) {
  switch (kind) {
    case 'text':
      return { id: newBlockId(), type: 'text', content: '' };
    case 'image':
      return { id: newBlockId(), type: 'image', src: '', alt: '' };
    case 'table':
      return {
        id: newBlockId(),
        type: 'table',
        rows: [
          { id: newTableRowId(), cells: ['', '', ''] },
          { id: newTableRowId(), cells: ['', '', ''] },
          { id: newTableRowId(), cells: ['', '', ''] },
        ],
      };
    case 'separator':
      return { id: newBlockId(), type: 'separator' };
    default:
      throw new Error(String(kind));
  }
}

/** @param {unknown[]} draft */
function excerptFromDraft(draft) {
  let t = '';
  for (const b of draft) {
    if (b && typeof b === 'object' && /** @type {{type?:string}} */ (b).type === 'text')
      t += /** @type {{content?:string}} */ (b).content ?? '';
  }
  return t.replace(/\s+/g, ' ').trim().slice(0, 180);
}

/** @typedef {'text' | 'image' | 'table' | 'separator'} WikiInsertKind */

/**
 * @returns {Promise<WikiInsertKind | null>}
 */
function openWikiElementPicker() {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'pm-overlay';

    const modal = document.createElement('div');
    modal.className = 'pm-modal';

    const h = document.createElement('div');
    h.className = 'pm-pane-title';
    h.style.marginBottom = '0.35rem';
    h.textContent = 'Add element';

    const choices = document.createElement('div');
    choices.className = 'pm-wiki-type-choice';

    function pick(kind, label) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pm-wiki-type-choice-btn';
      b.textContent = label;
      b.addEventListener('click', () => {
        overlay.remove();
        resolve(kind);
      });
      choices.appendChild(b);
    }

    pick('text', 'Text');
    pick('image', 'Image');
    pick('table', 'Table');
    pick('separator', 'Separator');

    const cancelRow = document.createElement('div');
    cancelRow.className = 'pm-toolbar';
    cancelRow.style.marginTop = '0.75rem';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'pm-btn';
    cancel.textContent = 'Cancel';

    cancel.addEventListener('click', () => {
      overlay.remove();
      resolve(null);
    });

    cancelRow.appendChild(cancel);
    modal.append(h, choices, cancelRow);
    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(null);
      }
    });
    document.body.appendChild(overlay);
    cancel.focus();
  });
}

export function createWikiFeature(ctx) {
  /**
   * @param {HTMLElement} wrap
   * @param {string} pageId
   * @param {string} blockId
   */
  function attachWikiBlockSuggestionsUi(wrap, pageId, blockId) {
    const compound = wikiBlockRefCompound(pageId, blockId);
    wrap.setAttribute('data-wiki-block-ref', compound);

    wrap.addEventListener('mouseenter', () => {
      ctx.bus.emit(BusEvents.ENTITY_HOVER, { type: 'wikiBlock', id: compound });
    });
    wrap.addEventListener('mouseleave', () => {
      ctx.bus.emit(BusEvents.ENTITY_HOVER_END, {});
    });
    wrap.addEventListener('contextmenu', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      const isDev = ctx.permissions.isDeveloper();
      showContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: [
          {
            label: isDev ? 'Dev note' : 'Suggest',
            onClick: () =>
              ctx.bus.emit(BusEvents.OPEN_SUGGESTION_FORM, {
                type: 'wikiBlock',
                id: compound,
                kind: isDev ? 'devNote' : 'suggestion',
              }),
          },
        ],
      });
    });
  }

  function attachWikiTableRowSuggestionsUi(tr, pageId, blockId, rowId) {
    const compound = wikiTableRowRefCompound(pageId, blockId, rowId);
    tr.setAttribute('data-wiki-table-row-ref', compound);
    tr.classList.add('pm-wiki-table-tr--linkable');

    tr.addEventListener('mouseenter', () => {
      ctx.bus.emit(BusEvents.ENTITY_HOVER, { type: 'wikiTableRow', id: compound });
    });
    tr.addEventListener('mouseleave', () => {
      ctx.bus.emit(BusEvents.ENTITY_HOVER_END, {});
    });
    tr.addEventListener(
      'contextmenu',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isDev = ctx.permissions.isDeveloper();
        showContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: [
            {
              label: isDev ? 'Dev note' : 'Suggest',
              onClick: () =>
                ctx.bus.emit(BusEvents.OPEN_SUGGESTION_FORM, {
                  type: 'wikiTableRow',
                  id: compound,
                  kind: isDev ? 'devNote' : 'suggestion',
                }),
            },
          ],
        });
      },
      true,
    );
  }

  const root = document.createElement('div');
  root.className = 'pm-wiki';

  const toolbar = document.createElement('div');
  toolbar.className = 'pm-toolbar pm-wiki-toolbar';

  const pageSelect = document.createElement('select');
  pageSelect.className = 'pm-select';
  pageSelect.style.maxWidth = '260px';

  const devNewPageBtn = document.createElement('button');
  devNewPageBtn.type = 'button';
  devNewPageBtn.className = 'pm-btn pm-btn-primary';
  devNewPageBtn.textContent = 'New page';
  devNewPageBtn.title = 'Create a blank wiki page';
  devNewPageBtn.hidden = !ctx.permissions.isDeveloper();

  const iconPreviewWrap = document.createElement('div');
  iconPreviewWrap.className = 'pm-wiki-page-icon-preview-slot';
  iconPreviewWrap.title = 'Page icon (bundled image or emoji)';

  const editIconBtn = document.createElement('button');
  editIconBtn.type = 'button';
  editIconBtn.className = 'pm-btn';
  editIconBtn.textContent = 'Pick icon…';
  editIconBtn.title =
    'Choose an image whose file name will be saved; add the matching file under src/Images/wiki-page-icons/ (shipped with the app, not copied to Data).';

  const clearIconBtn = document.createElement('button');
  clearIconBtn.type = 'button';
  clearIconBtn.className = 'pm-btn pm-btn-ghost';
  clearIconBtn.textContent = 'Emoji';
  clearIconBtn.title = 'Use emoji instead of a bundled image';

  const iconFileInput = document.createElement('input');
  iconFileInput.type = 'file';
  iconFileInput.accept = 'image/svg+xml,.svg,image/png,.png,image/jpeg,.jpg,.jpeg,image/webp,.webp,.gif,.ico,.bmp';
  iconFileInput.className = 'pm-mm-add-file-input';
  iconFileInput.tabIndex = -1;

  function refreshWikiPageIconPreview() {
    iconPreviewWrap.replaceChildren();
    if (!selectedPageId) {
      iconPreviewWrap.appendChild(
        Object.assign(document.createElement('span'), {
          textContent: '—',
          className: 'pm-wiki-page-icon-emoji pm-muted',
        }),
      );
      return;
    }
    const meta = pages().find((x) => x.id === selectedPageId);
    const ic = typeof meta?.icon === 'string' && meta.icon.trim() ? meta.icon.trim() : '📄';
    const url = resolveWikiPageIconUrl(ic);
    if (url) {
      const img = document.createElement('img');
      img.alt = '';
      img.src = url;
      img.addEventListener(
        'error',
        () => {
          img.replaceWith(
            Object.assign(document.createElement('span'), {
              className: 'pm-wiki-page-icon-missing',
              textContent: '?',
              title: 'Bundled icon file missing — add this file under src/Images/wiki-page-icons/',
            }),
          );
        },
        { once: true },
      );
      iconPreviewWrap.appendChild(img);
    } else {
      iconPreviewWrap.appendChild(
        Object.assign(document.createElement('span'), {
          textContent: ic,
          className: 'pm-wiki-page-icon-emoji',
        }),
      );
    }
  }

  function setSelectedPageBundledIconFromFile(file) {
    if (!canEdit() || !selectedPageId) return;
    const stored = storedIconFromPickedFile(file);
    if (!stored) return;
    ctx.store.updateWiki((w) => {
      const pg = [...(w.pages || [])];
      const i = pg.findIndex((x) => x.id === selectedPageId);
      if (i < 0) return;
      pg[i] = {
        ...pg[i],
        icon: stored,
      };
      w.pages = pg;
    });
    syncWikiIconChrome();
  }

  function clearBundledWikiPageIconToEmoji() {
    if (!canEdit() || !selectedPageId) return;
    ctx.store.updateWiki((w) => {
      const pg = [...(w.pages || [])];
      const i = pg.findIndex((x) => x.id === selectedPageId);
      if (i < 0) return;
      pg[i] = { ...pg[i], icon: '📄' };
      w.pages = pg;
    });
    syncWikiIconChrome();
  }

  editIconBtn.addEventListener('click', () => {
    if (!canEdit()) return;
    iconFileInput.click();
  });

  iconFileInput.addEventListener('change', () => {
    const f = iconFileInput.files?.[0];
    iconFileInput.value = '';
    if (f) setSelectedPageBundledIconFromFile(f);
  });

  clearIconBtn.addEventListener('click', () => clearBundledWikiPageIconToEmoji());

  /** Sync icon-picker controls whenever permissions / selection change */
  function syncWikiIconChrome() {
    const on = !!(canEdit() && selectedPageId);
    editIconBtn.disabled = !on;
    iconFileInput.disabled = !on;
    const meta = selectedPageId ? pages().find((x) => x.id === selectedPageId) : null;
    const ic = typeof meta?.icon === 'string' && meta.icon.trim() ? meta.icon.trim() : '📄';
    clearIconBtn.disabled = !on || !wikiPageUsesBundledIcon(ic);
    refreshWikiPageIconPreview();
  }

  toolbar.append(pageSelect, iconPreviewWrap, editIconBtn, clearIconBtn, iconFileInput, devNewPageBtn);

  const title = document.createElement('input');
  title.className = 'pm-input';
  title.placeholder = 'Page title';

  const editor = document.createElement('div');
  editor.className = 'pm-wiki-editor';

  const blocksEl = document.createElement('div');
  blocksEl.className = 'pm-wiki-blocks';

  editor.appendChild(blocksEl);
  root.append(toolbar, title, editor);

  let selectedPageId = /** @type {string | null} */ (null);
  /** Draft blocks for the selected page — stays in JS until flushed to store */
  let draftBlocks = /** @type {unknown[]} */ ([]);
  let saveTimer = null;

  const canEdit = () => ctx.permissions.canEditWiki();

  function wikiState() {
    return ctx.store.getState().wiki;
  }

  function pages() {
    const w = wikiState();
    return Array.isArray(w.pages) ? w.pages : [];
  }

  function blocksForPage(pid) {
    const w = wikiState();
    const arr = Array.isArray(w.blocksByPageId?.[pid]) ? w.blocksByPageId[pid] : [];
    return structuredClone(arr);
  }

  function flushToStore() {
    const pid = selectedPageId;
    if (!pid || !canEdit()) return;

    ctx.store.updateWiki((w) => {
      const pg = [...(w.pages || [])];
      const i = pg.findIndex((x) => x.id === pid);
      if (i < 0) return;
      pg[i] = {
        ...pg[i],
        title: title.value.trim() || pg[i].title,
        description: excerptFromDraft(draftBlocks),
      };
      w.pages = pg;
      w.blocksByPageId = {
        ...(w.blocksByPageId || {}),
        [pid]: structuredClone(draftBlocks),
      };
    });
  }

  function schedulePersist() {
    if (!canEdit()) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      flushToStore();
    }, 380);
  }

  /** @param {number} slotIndex insertion index before block at slotIndex */
  async function insertAt(slotIndex) {
    if (!canEdit() || !selectedPageId) return;
    const kind = await openWikiElementPicker();
    if (!kind) return;
    draftBlocks.splice(slotIndex, 0, createBlock(kind));
    flushToStore();
    renderBlocks();
  }

  /** @param {number} blockIndex */
  function removeAt(blockIndex) {
    if (!canEdit()) return;
    draftBlocks.splice(blockIndex, 1);
    flushToStore();
    renderBlocks();
  }

  /** @param {HTMLElement} wrapper */
  function wireTextBlock(wrapper, blockIndex, block) {
    const ta = document.createElement('textarea');
    ta.className = 'pm-textarea pm-wiki-block-text';
    ta.value = typeof block.content === 'string' ? block.content : '';
    ta.disabled = !canEdit();
    ta.readOnly = !canEdit();
    function fitWikiTextArea() {
      ta.style.height = '0';
      const capStr = getComputedStyle(ta).maxHeight;
      const cap =
        capStr === 'none' || capStr === '' ? Number.POSITIVE_INFINITY : parseFloat(capStr);
      const natural = ta.scrollHeight;
      const use = Number.isFinite(cap) ? Math.min(natural, cap) : natural;
      ta.style.height = `${use}px`;
      ta.style.overflowY = Number.isFinite(cap) && natural > cap ? 'auto' : 'hidden';
    }

    ta.addEventListener('input', () => {
      if (!canEdit()) return;
      draftBlocks[blockIndex] = {
        ...(/** @type {object} */ (draftBlocks[blockIndex])),
        type: 'text',
        content: ta.value,
      };
      fitWikiTextArea();
      schedulePersist();
    });
    wrapper.appendChild(ta);
    queueMicrotask(() => fitWikiTextArea());
  }

  /** @param {HTMLElement} wrapper */
  function wireImageBlock(wrapper, blockIndex, block) {
    const fields = document.createElement('div');
    fields.className = 'pm-wiki-block-img-fields';

    const srcIn = document.createElement('input');
    srcIn.className = 'pm-input';
    srcIn.placeholder = 'Paste a URL here, or choose a file above';
    srcIn.value = typeof block.src === 'string' ? block.src : '';
    srcIn.disabled = !canEdit();

    const altIn = document.createElement('input');
    altIn.className = 'pm-input';
    altIn.placeholder = 'Alt text (optional)';
    altIn.value = typeof block.alt === 'string' ? block.alt : '';
    altIn.disabled = !canEdit();

    let img = /** @type {HTMLImageElement} */ (
      typeof block.src === 'string' && block.src.trim()
        ? Object.assign(new Image(), { src: block.src })
        : document.createElement('img')
    );
    img.className = 'pm-wiki-block-img-preview';
    if (!block.src?.trim()) {
      img.removeAttribute('src');
      img.alt = '';
    }

    const sync = () => {
      draftBlocks[blockIndex] = {
        id: /** @type {{id:string}} */ (draftBlocks[blockIndex]).id,
        type: 'image',
        src: srcIn.value.trim(),
        alt: altIn.value.trim(),
      };
      const s = srcIn.value.trim();
      img.src = s || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      schedulePersist();
    };

    srcIn.addEventListener('input', sync);
    altIn.addEventListener('input', sync);

    const browseRow = document.createElement('div');
    browseRow.className = 'pm-toolbar';
    browseRow.style.marginBottom = '0';
    browseRow.style.flexWrap = 'wrap';
    browseRow.style.gap = '0.35rem';

    const browseBtn = document.createElement('button');
    browseBtn.type = 'button';
    browseBtn.className = 'pm-btn';
    browseBtn.textContent = 'Choose from PC…';
    browseBtn.title = 'Pick an image file (stored as embedded data in wiki.json)';
    browseBtn.disabled = !canEdit();

    const fileIn = document.createElement('input');
    fileIn.type = 'file';
    fileIn.accept = 'image/*';
    fileIn.className = 'pm-mm-add-file-input';
    fileIn.tabIndex = -1;
    fileIn.disabled = !canEdit();

    fileIn.addEventListener('change', () => {
      const f = fileIn.files?.[0];
      if (!f) return;
      const fr = new FileReader();
      fr.onload = () => {
        srcIn.value = String(fr.result || '');
        fileIn.value = '';
        sync();
      };
      fr.onerror = () => {
        fileIn.value = '';
      };
      fr.readAsDataURL(f);
    });

    browseBtn.addEventListener('click', () => {
      if (!canEdit()) return;
      fileIn.click();
    });

    browseRow.append(browseBtn, fileIn);

    sync();
    fields.append(browseRow, srcIn, altIn, img);
    wrapper.appendChild(fields);
  }

  /** @param {HTMLElement} wrapper */
  function wireTableBlock(wrapper, blockIndex, block) {
    const tblBlockId = /** @type {{id:string}} */ (draftBlocks[blockIndex]).id;

    const defaultCells = ['', '', ''];
    const defaultRowModel = () => ({
      id: newTableRowId(),
      cells: [...defaultCells],
    });

    /** @param {unknown} rr */
    const normalizeTableDraftRows = (rr) => {
      if (!Array.isArray(rr) || rr.length === 0) {
        return [defaultRowModel(), defaultRowModel(), defaultRowModel()];
      }
      /** @type {{ id: string, cells: string[] }[]} */
      const out = [];
      for (const r of rr) {
        if (r && typeof r === 'object' && !Array.isArray(r) && Array.isArray(/** @type {{cells?:unknown}} */ (r).cells)) {
          const rawId = typeof /** @type {{id?:unknown}} */ (r).id === 'string' ? String(r.id).trim() : '';
          out.push({
            id: rawId || newTableRowId(),
            cells: /** @type {{cells:unknown[]}} */ (r).cells.map((c) => String(c ?? '')),
          });
        } else if (Array.isArray(r)) {
          out.push({ id: newTableRowId(), cells: r.map((c) => String(c ?? '')) });
        }
      }
      return out.length > 0 ? out : [defaultRowModel(), defaultRowModel(), defaultRowModel()];
    };

    let rows = normalizeTableDraftRows(/** @type {{rows?:unknown}} */ (block).rows ?? []);

    const shell = document.createElement('div');
    shell.className = 'pm-wiki-block-table-shell';

    const table = document.createElement('table');
    table.className = 'pm-wiki-block-table';
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    const syncWhole = () => {
      draftBlocks[blockIndex] = {
        id: tblBlockId,
        type: 'table',
        rows,
      };
      schedulePersist();
    };

    const columnCount = () => {
      let max = 0;
      for (const r of rows) max = Math.max(max, r.cells.length);
      return Math.max(max, 1);
    };

    const renderTableRows = () => {
      const cols = columnCount();
      for (const r of rows) while (r.cells.length < cols) r.cells.push('');
      tbody.replaceChildren();
      rows.forEach((row, ri) => {
        const tr = document.createElement('tr');
        for (let ci = 0; ci < cols; ci++) {
          const td = document.createElement('td');
          const inp = document.createElement('input');
          inp.disabled = !canEdit();
          inp.readOnly = !canEdit();
          inp.value = row.cells[ci] ?? '';
          inp.addEventListener('input', () => {
            row.cells[ci] = inp.value;
            syncWhole();
          });
          td.appendChild(inp);
          tr.appendChild(td);
        }
        const actionTd = document.createElement('td');
        actionTd.className = 'pm-wiki-table-row-remove-cell';
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'pm-wiki-block-remove';
        rm.textContent = '×';
        const lastOnly = rows.length <= 1;
        rm.disabled = lastOnly || !canEdit();
        rm.title = lastOnly ? "Can't remove the last row" : 'Remove row';
        rm.addEventListener('click', (e) => {
          e.preventDefault();
          if (!canEdit() || rows.length <= 1) return;
          rows.splice(ri, 1);
          renderTableRows();
          syncWhole();
        });
        actionTd.appendChild(rm);
        tr.appendChild(actionTd);

        if (selectedPageId && row.id)
          attachWikiTableRowSuggestionsUi(tr, selectedPageId, tblBlockId, row.id);

        tbody.appendChild(tr);
      });
    };

    const addRowHit = document.createElement('div');
    addRowHit.className = 'pm-wiki-table-add-row-hit';
    addRowHit.title = 'Add row';
    addRowHit.setAttribute('role', 'button');
    addRowHit.tabIndex = canEdit() ? 0 : -1;
    if (!canEdit()) addRowHit.classList.add('pm-wiki-table-add-row-hit--disabled');

    const addRow = () => {
      if (!canEdit()) return;
      const n = columnCount();
      rows.push({ id: newTableRowId(), cells: Array(n).fill('') });
      renderTableRows();
      syncWhole();
      const lastInp = tbody.querySelector('tr:last-child input');
      if (lastInp instanceof HTMLInputElement) lastInp.focus();
    };

    addRowHit.addEventListener('click', (e) => {
      e.preventDefault();
      addRow();
    });
    addRowHit.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.defaultPrevented) {
        e.preventDefault();
        addRow();
      }
    });

    renderTableRows();
    syncWhole();
    shell.append(table, addRowHit);
    wrapper.appendChild(shell);
  }

  function renderInsertSlot(insertIndex, opts) {
    const grow = !!(opts?.growHover && canEdit());
    const always = !!(opts?.alwaysVisible && canEdit());
    const slot = document.createElement('div');
    slot.className = 'pm-wiki-insert-slot';
    if (grow) slot.classList.add('pm-wiki-insert-slot--grow');
    if (always) slot.classList.add('pm-wiki-insert-slot--always');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pm-wiki-add-circle';
    btn.innerHTML =
      '<span aria-hidden="true" style="font-weight:700;line-height:1;">+</span>';
    btn.title = 'Insert block';
    if (!grow && !always) btn.style.pointerEvents = 'none';

    if (canEdit()) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        insertAt(insertIndex);
      });
    }

    slot.appendChild(btn);
    return slot;
  }

  function renderBlocks() {
    blocksEl.replaceChildren();
    const list = pages();
    if (!selectedPageId || !list.some((p) => p.id === selectedPageId)) return;

    if (!canEdit()) {
      if (draftBlocks.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'pm-muted';
        empty.textContent = 'This page has no content yet.';
        blocksEl.appendChild(empty);
      }
      for (let bi = 0; bi < draftBlocks.length; bi++) {
        const block = draftBlocks[bi];
        const wrap = document.createElement('div');
        wrap.className = 'pm-wiki-block-wrap';
        if (!block || typeof block !== 'object' || typeof /** @type {{type?:string}} */ (block).type !== 'string') continue;
        const typ = /** @type {{type:string}} */ (block).type;

        if (typ === 'text') {
          const p = document.createElement('div');
          p.className = 'pm-wiki-block-read-text';
          p.style.whiteSpace = 'pre-wrap';
          p.textContent = /** @type {{content?:string}} */ (block).content ?? '';
          wrap.appendChild(p);
        } else if (typ === 'image') {
          const img = document.createElement('img');
          const s = /** @type {{src?:string}} */ (block).src?.trim?.() ?? '';
          if (s) {
            img.src = s;
            img.alt = /** @type {{alt?:string}} */ (block).alt ?? '';
            img.className = 'pm-wiki-block-img-preview';
            wrap.appendChild(img);
          } else wrap.appendChild(Object.assign(document.createElement('span'), { className: 'pm-muted', textContent: '(Image)' }));
        } else if (typ === 'table') {
          const table = document.createElement('table');
          table.className = 'pm-wiki-block-table';
          const tblBlockId =
            typeof /** @type {{id?:unknown}} */ (block).id === 'string'
              ? /** @type {{id:string}} */ (block).id
              : '';
          const rr = Array.isArray(/** @type {{rows?:unknown}} */ (block).rows)
            ? /** @type {unknown[]} */ (block.rows)
            : [];
          for (const rowRaw of rr) {
            const tr = document.createElement('tr');
            /** @type {string[]} */
            let cells = [];
            let rowId = '';
            if (
              rowRaw &&
              typeof rowRaw === 'object' &&
              !Array.isArray(rowRaw) &&
              Array.isArray(/** @type {{cells?:unknown}} */ (rowRaw).cells)
            ) {
              rowId =
                typeof /** @type {{id?:unknown}} */ (rowRaw).id === 'string'
                  ? /** @type {{id:string}} */ (rowRaw).id
                  : '';
              cells = /** @type {{cells:unknown[]}} */ (rowRaw).cells.map((c) => String(c ?? ''));
            } else if (Array.isArray(rowRaw)) {
              cells = rowRaw.map((c) => String(c ?? ''));
            }
            cells.forEach((cell) => {
              const td = document.createElement('td');
              td.textContent = cell;
              tr.appendChild(td);
            });
            table.appendChild(tr);
            if (rowId && tblBlockId && selectedPageId)
              attachWikiTableRowSuggestionsUi(tr, selectedPageId, tblBlockId, rowId);
          }
          wrap.appendChild(table);
        } else if (typ === 'separator') {
          const hr = document.createElement('hr');
          hr.className = 'pm-wiki-sep-line';
          wrap.appendChild(hr);
        }
        const blockId =
          typeof /** @type {{id?:unknown}} */ (block).id === 'string'
            ? /** @type {{id:string}} */ (block).id
            : '';
        if (blockId && selectedPageId && typ !== 'table') attachWikiBlockSuggestionsUi(wrap, selectedPageId, blockId);
        blocksEl.appendChild(wrap);
      }
      return;
    }

    blocksEl.appendChild(
      renderInsertSlot(0, {
        growHover: draftBlocks.length > 0,
        alwaysVisible: draftBlocks.length === 0,
      }),
    );

    for (let bi = 0; bi < draftBlocks.length; bi++) {
      const blockRaw = draftBlocks[bi];

      const wrap = document.createElement('div');
      wrap.className = 'pm-wiki-block-wrap';

      const head = document.createElement('div');
      head.className = 'pm-wiki-block-head';
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'pm-wiki-block-remove';
      rm.textContent = '×';
      rm.title = 'Remove block';
      rm.addEventListener('click', () => removeAt(bi));
      head.appendChild(rm);
      wrap.appendChild(head);

      const bodyInner = document.createElement('div');
      wrap.appendChild(bodyInner);

      if (!blockRaw || typeof blockRaw !== 'object' || typeof /** @type {{ type?: unknown }} */ (blockRaw).type !== 'string') {
        blocksEl.appendChild(wrap);
        blocksEl.appendChild(renderInsertSlot(bi + 1, { growHover: true }));
        continue;
      }

      const block = /** @type {{ type: string }} */ (blockRaw);
      const { type } = block;

      if (type === 'text') wireTextBlock(bodyInner, bi, /** @type {{content?:string,id:string,type:'text'}} */ (blockRaw));
      else if (type === 'image') wireImageBlock(bodyInner, bi, /** @type {{src?:string,alt?:string,id:string,type:'image'}} */ (blockRaw));
      else if (type === 'table') wireTableBlock(bodyInner, bi, /** @type {{rows?:unknown,id:string,type:'table'}} */ (blockRaw));
      else if (type === 'separator') {
        const hr = document.createElement('hr');
        hr.className = 'pm-wiki-sep-line';
        bodyInner.appendChild(hr);
      }

      const blockId =
        blockRaw && typeof blockRaw === 'object' && typeof /** @type {{id?:unknown}} */ (blockRaw).id === 'string'
          ? /** @type {{id:string}} */ (blockRaw).id
          : '';
      if (blockId && selectedPageId && type !== 'table') attachWikiBlockSuggestionsUi(wrap, selectedPageId, blockId);

      blocksEl.appendChild(wrap);
      blocksEl.appendChild(renderInsertSlot(bi + 1, { growHover: true }));
    }
  }

  /**
   * @param pref {string | null | undefined}
   */
  function rerender(pref) {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
      if (selectedPageId && canEdit()) flushToStore();
    }

    const list = pages();
    pageSelect.replaceChildren();
    list.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.title || p.id;
      pageSelect.appendChild(opt);
    });

    const cand = pref && list.some((x) => x.id === pref) ? pref : selectedPageId;
    if (!cand || !list.some((x) => x.id === cand)) selectedPageId = list[0]?.id ?? null;
    else selectedPageId = cand;
    if (selectedPageId) pageSelect.value = selectedPageId;

    title.disabled = !canEdit() || list.length === 0;
    title.readOnly = !canEdit();

    if (!selectedPageId) {
      title.value = '';
      draftBlocks = [];
      renderBlocks();
      syncWikiIconChrome();
      return;
    }

    const meta = list.find((x) => x.id === selectedPageId);
    title.value = meta?.title ?? '';
    draftBlocks = blocksForPage(selectedPageId);
    renderBlocks();
    syncWikiIconChrome();
  }

  pageSelect.addEventListener('change', () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    if (selectedPageId && canEdit()) flushToStore();
    selectedPageId = pageSelect.value;
    rerender();
  });

  title.addEventListener('input', () => {
    if (!selectedPageId || !canEdit()) return;
    schedulePersist();
  });

  devNewPageBtn.addEventListener('click', () => {
    if (!ctx.permissions.isDeveloper()) return;
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    if (selectedPageId && canEdit()) flushToStore();
    const id = newPageId();
    ctx.store.updateWiki((w) => {
      const np = [...(w.pages || [])];
      np.push({
        id,
        title: 'Untitled page',
        description: '',
        icon: '📄',
      });
      w.pages = np;
      w.blocksByPageId = {
        ...(w.blocksByPageId || {}),
        [id]: [],
      };
      w.markdownByPageId = { ...(w.markdownByPageId || {}), [id]: '' };
    });
    rerender(id);
  });

  rerender();

  /** Jump to wiki after navigation; `compoundId` is `pageId|blockId`. */
  function focusLinkedWikiBlock(compoundId) {
    const parsed = parseWikiBlockRefCompound(compoundId);
    if (!parsed) return;
    if (selectedPageId !== parsed.pageId) rerender(parsed.pageId);
    requestAnimationFrame(() => {
      const el = blocksEl.querySelector(`[data-wiki-block-ref="${CSS.escape(compoundId)}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.classList.add('pm-wiki-block-wrap--flash');
      window.setTimeout(() => {
        el?.classList.remove('pm-wiki-block-wrap--flash');
      }, 1100);
    });
  }

  /** Jump to table row after navigation (`pageId|blockId|rowId`). */
  function focusLinkedTableRow(compoundId) {
    const parsed = parseWikiTableRowRefCompound(compoundId);
    if (!parsed) return;
    if (selectedPageId !== parsed.pageId) rerender(parsed.pageId);
    requestAnimationFrame(() => {
      const el = blocksEl.querySelector(`[data-wiki-table-row-ref="${CSS.escape(compoundId)}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.classList.add('pm-wiki-table-row--flash');
      window.setTimeout(() => {
        el?.classList.remove('pm-wiki-table-row--flash');
      }, 1100);
    });
  }

  return {
    root,
    setPage(prefId) {
      rerender(prefId);
    },
    focusLinkedBlock: focusLinkedWikiBlock,
    focusLinkedTableRow,
    unmount() {
      if (saveTimer) clearTimeout(saveTimer);
    },
  };
}
