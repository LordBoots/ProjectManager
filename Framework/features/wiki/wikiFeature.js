import { BusEvents } from '../../core/EventBus.js';
import { showContextMenu } from '../../core/contextMenu.js';
import {
  makeUniqueWikiMarkdownFile,
  wikiTitleFromRelativeMarkdownPath,
} from '../../data/repositories/wikiMarkdownRepository.js';
import { mountMarkdownEditor } from './monacoMarkdownEditor.js';

const WIKI_BLOCK_REF_SEP = '|';

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

/** @param {unknown} raw */
function cleanText(raw) {
  return typeof raw === 'string' ? raw : '';
}

/**
 * @param {unknown} wiki
 * @returns {{ id: string, title: string, file?: string }[]}
 */
function wikiPages(wiki) {
  if (!wiki || typeof wiki !== 'object') return [];
  const raw = /** @type {{ pages?: unknown }} */ (wiki).pages;
  return Array.isArray(raw) ? /** @type {ReturnType<typeof wikiPages>} */ (raw) : [];
}

/**
 * @param {unknown} wiki
 * @param {string} pageId
 */
function markdownForPage(wiki, pageId) {
  if (!wiki || typeof wiki !== 'object' || !pageId) return '';
  const rec = /** @type {{ markdownByPageId?: Record<string, string> }} */ (wiki);
  return cleanText(rec.markdownByPageId?.[pageId]);
}

/**
 * @param {ReturnType<typeof wikiPages>} pages
 * @param {string | null | undefined} preferredId
 */
function choosePageId(pages, preferredId) {
  if (preferredId && pages.some((page) => page.id === preferredId)) return preferredId;
  return pages[0]?.id ?? null;
}

export function createWikiFeature(ctx) {
  const root = document.createElement('div');
  root.className = 'pm-wiki';

  const toolbar = document.createElement('div');
  toolbar.className = 'pm-toolbar pm-wiki-markdown-toolbar';

  const pageSelect = document.createElement('select');
  pageSelect.className = 'pm-select';
  pageSelect.title = 'Wiki page';

  const devNewPageBtn = document.createElement('button');
  devNewPageBtn.type = 'button';
  devNewPageBtn.className = 'pm-btn';
  devNewPageBtn.textContent = 'New page';

  const status = document.createElement('span');
  status.className = 'pm-wiki-save-status';

  toolbar.append(pageSelect, devNewPageBtn, status);

  const editorShell = document.createElement('div');
  editorShell.className = 'pm-wiki-monaco-shell';

  root.append(toolbar, editorShell);

  /** @type {string | null} */
  let selectedPageId = null;
  /** @type {string | null} */
  let pendingScrollSlug = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let saveTimer = null;
  let loadingEditorValue = false;

  function canEditWiki() {
    return ctx.permissions.isDeveloper();
  }

  function stateWiki() {
    return ctx.store.getState().wiki;
  }

  const editor = mountMarkdownEditor(editorShell, {
    value: '',
    readOnly: !canEditWiki(),
    getWikiPageId: () => selectedPageId,
    onNavigateWikiPage: (pageId, opts) => {
      if (!pageId) return;
      clearPendingSave();
      flushToStore();
      pendingScrollSlug = opts?.hash ?? null;
      ctx.router.setRoute(`wiki:${pageId}`);
    },
    onChange: () => {
      if (loadingEditorValue || !canEditWiki()) return;
      scheduleSave();
    },
  });

  function setStatus(text) {
    status.textContent = text;
  }

  function pages() {
    return wikiPages(stateWiki());
  }

  function selectedPage() {
    const id = selectedPageId;
    return id ? pages().find((page) => page.id === id) ?? null : null;
  }

  function fillPageSelect(list) {
    const previous = pageSelect.value;
    pageSelect.replaceChildren();
    for (const page of list) {
      const opt = document.createElement('option');
      opt.value = page.id;
      opt.textContent =
        page.title || (page.file ? wikiTitleFromRelativeMarkdownPath(page.file) : page.id.split('/').pop() || page.id);
      pageSelect.appendChild(opt);
    }
    if (selectedPageId) pageSelect.value = selectedPageId;
    else if (previous) pageSelect.value = previous;
  }

  function flushToStore() {
    if (!selectedPageId || !canEditWiki()) return;
    const id = selectedPageId;
    const markdown = editor.getValue();
    ctx.store.updateWiki((wiki) => {
      wiki.markdownByPageId = { ...(wiki.markdownByPageId || {}), [id]: markdown };
    });
    setStatus('Saved');
  }

  function scheduleSave() {
    if (!selectedPageId || !canEditWiki()) return;
    setStatus('Saving...');
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      flushToStore();
      fillPageSelect(pages());
    }, 350);
  }

  function clearPendingSave() {
    if (!saveTimer) return;
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  /**
   * @param {string | null | undefined} preferredPageId
   * @param {{ skipFlush?: boolean }} opts
   */
  function renderPage(preferredPageId, opts = {}) {
    if (!opts.skipFlush) {
      clearPendingSave();
      flushToStore();
    }

    const list = pages();
    selectedPageId = choosePageId(list, preferredPageId || selectedPageId);
    fillPageSelect(list);

    const editable = canEditWiki() && !!selectedPageId;
    root.classList.toggle('pm-wiki--readonly', !editable);
    pageSelect.disabled = list.length === 0;
    devNewPageBtn.hidden = !ctx.permissions.isDeveloper();
    editor.setReadOnly(!editable);

    const page = selectedPage();
    if (!page || !selectedPageId) {
      loadingEditorValue = true;
      editor.setWikiDocument(null, '');
      loadingEditorValue = false;
      setStatus('No pages');
      return;
    }

    pageSelect.value = selectedPageId;
    loadingEditorValue = true;
    editor.setWikiDocument(selectedPageId, markdownForPage(stateWiki(), selectedPageId));
    loadingEditorValue = false;
    setStatus(editable ? 'Ready' : 'Read only');
    const slug = pendingScrollSlug;
    if (slug) {
      pendingScrollSlug = null;
      queueMicrotask(() => editor.revealHeading?.(slug));
    }
    requestAnimationFrame(() => editor.layout());
  }

  function usedWikiFiles() {
    return new Set(
      pages()
        .map((page) => cleanText(page.file || page.id).toLowerCase())
        .filter(Boolean),
    );
  }

  function navigateToPage(pageId) {
    if (!pageId) return;
    ctx.router.setRoute(`wiki:${pageId}`);
  }

  pageSelect.addEventListener('change', () => {
    const next = pageSelect.value;
    clearPendingSave();
    flushToStore();
    navigateToPage(next);
  });

  devNewPageBtn.addEventListener('click', () => {
    if (!ctx.permissions.isDeveloper()) return;
    clearPendingSave();
    flushToStore();
    const file = makeUniqueWikiMarkdownFile('untitled-page', usedWikiFiles());
    const stem = wikiTitleFromRelativeMarkdownPath(file);
    ctx.store.updateWiki((wiki) => {
      wiki.pages = [
        ...(wiki.pages || []),
        {
          id: file,
          title: stem,
          file,
        },
      ];
      wiki.markdownByPageId = { ...(wiki.markdownByPageId || {}), [file]: '' };
      wiki.blocksByPageId = {};
    });
    navigateToPage(file);
    queueMicrotask(() => pageSelect.focus());
  });

  root.addEventListener('contextmenu', (e) => {
    if (!selectedPageId) return;
    const target = e.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
    e.preventDefault();
    const isDev = ctx.permissions.isDeveloper();
    showContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: isDev ? 'Dev note for page' : 'Suggest on page',
          onClick: () =>
            ctx.bus.emit(BusEvents.OPEN_SUGGESTION_FORM, {
              type: 'wikiPage',
              id: selectedPageId,
              kind: isDev ? 'devNote' : 'suggestion',
            }),
        },
      ],
    });
  });

  renderPage(null, { skipFlush: true });

  function setPage(prefId) {
    renderPage(prefId);
  }

  function focusLinkedBlock(compoundId) {
    const parsed = parseWikiBlockRefCompound(compoundId);
    if (!parsed) return;
    renderPage(parsed.pageId);
    editorShell.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function focusLinkedTableRow(compoundId) {
    const parsed = parseWikiTableRowRefCompound(compoundId);
    if (!parsed) return;
    renderPage(parsed.pageId);
    editorShell.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return {
    id: 'wiki',
    root,
    setPage,
    focusLinkedBlock,
    focusLinkedTableRow,
    unmount() {
      clearPendingSave();
      flushToStore();
      editor.dispose();
    },
  };
}
