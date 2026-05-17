import { BusEvents } from '../../core/EventBus.js';
import { showContextMenu } from '../../core/contextMenu.js';
import {
  makeUniqueWikiMarkdownFile,
  wikiTitleFromRelativeMarkdownPath,
} from '../../data/repositories/wikiMarkdownRepository.js';
import { extractWikiSidebarOutline } from './wikiMarkdownLinks.js';
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

  const body = document.createElement('div');
  body.className = 'pm-wiki-body';

  const sidebar = document.createElement('aside');
  sidebar.className = 'pm-wiki-sidebar';

  const pageListSection = document.createElement('div');
  pageListSection.className = 'pm-wiki-sidebar-section pm-wiki-sidebar-pages';
  const pageListHeading = document.createElement('div');
  pageListHeading.className = 'pm-wiki-sidebar-heading';
  pageListHeading.textContent = 'Pages';
  const pageListPlaceholder = document.createElement('p');
  pageListPlaceholder.className = 'pm-wiki-sidebar-placeholder';
  pageListPlaceholder.textContent =
    'Page list will move here and replace the toolbar dropdown in a later update.';
  pageListSection.append(pageListHeading, pageListPlaceholder);

  const indexSection = document.createElement('div');
  indexSection.className = 'pm-wiki-sidebar-section pm-wiki-sidebar-index';
  const indexHeading = document.createElement('div');
  indexHeading.className = 'pm-wiki-sidebar-heading';
  indexHeading.textContent = 'Index';
  const indexScroll = document.createElement('div');
  indexScroll.className = 'pm-wiki-sidebar-index-scroll';
  indexSection.append(indexHeading, indexScroll);

  sidebar.append(pageListSection, indexSection);

  const main = document.createElement('div');
  main.className = 'pm-wiki-main';

  const editorShell = document.createElement('div');
  editorShell.className = 'pm-wiki-monaco-shell';

  main.append(editorShell);
  body.append(sidebar, main);
  root.append(toolbar, body);

  /** @type {string | null} */
  let selectedPageId = null;
  /** @type {string | null} */
  let pendingScrollSlug = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let saveTimer = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let indexRefreshTimer = null;
  let loadingEditorValue = false;

  function canEditWiki() {
    return ctx.permissions.isDeveloper();
  }

  function stateWiki() {
    return ctx.store.getState().wiki;
  }

  /**
   * @param {{ target: 'wiki' | 'external', pageId?: string, hash?: string, href?: string }} entry
   */
  function followSidebarLink(entry) {
    if (entry.target === 'external' && entry.href) {
      window.open(entry.href, '_blank', 'noopener,noreferrer');
      return;
    }
    const pid = entry.pageId;
    const hash = entry.hash;
    if (!pid) return;
    if (pid === selectedPageId) {
      if (hash) queueMicrotask(() => editor.revealHeading?.(hash));
      return;
    }
    clearPendingSave();
    flushToStore();
    pendingScrollSlug = hash ?? null;
    ctx.router.setRoute(`wiki:${pid}`);
  }

  function scheduleSidebarIndexRefresh() {
    if (indexRefreshTimer) clearTimeout(indexRefreshTimer);
    indexRefreshTimer = setTimeout(() => {
      indexRefreshTimer = null;
      refreshSidebarIndexPanel();
    }, 200);
  }

  function refreshSidebarIndexPanel() {
    indexScroll.replaceChildren();
    if (!selectedPageId || !selectedPageId.startsWith('pages/')) {
      const p = document.createElement('p');
      p.className = 'pm-wiki-sidebar-muted';
      p.textContent = 'Open a wiki page to see the index.';
      indexScroll.append(p);
      return;
    }

    const markdown = editor.getValue();
    const { headings, links } = extractWikiSidebarOutline(markdown, selectedPageId);

    if (headings.length > 0) {
      const sub = document.createElement('div');
      sub.className = 'pm-wiki-sidebar-subheading';
      sub.textContent = 'Headings';
      indexScroll.append(sub);
      const ul = document.createElement('ul');
      ul.className = 'pm-wiki-sidebar-list';
      for (const h of headings) {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pm-wiki-sidebar-link';
        btn.style.paddingLeft = `${0.35 + (h.depth - 1) * 0.65}rem`;
        btn.textContent = h.title;
        btn.addEventListener('click', () => editor.revealHeading?.(h.slug));
        li.append(btn);
        ul.append(li);
      }
      indexScroll.append(ul);
    }

    if (links.length > 0) {
      const sub = document.createElement('div');
      sub.className = 'pm-wiki-sidebar-subheading';
      sub.textContent = 'Links';
      indexScroll.append(sub);
      const ul = document.createElement('ul');
      ul.className = 'pm-wiki-sidebar-list';
      for (const link of links) {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pm-wiki-sidebar-link pm-wiki-sidebar-link--outbound';
        if (link.target === 'external') btn.title = link.href;
        else btn.title = link.hash ? `${link.pageId}#${link.hash}` : link.pageId;
        btn.textContent = link.label;
        btn.addEventListener('click', () => followSidebarLink(link));
        li.append(btn);
        ul.append(li);
      }
      indexScroll.append(ul);
    }

    if (headings.length === 0 && links.length === 0) {
      const p = document.createElement('p');
      p.className = 'pm-wiki-sidebar-muted';
      p.textContent = 'No headings or markdown links on this page.';
      indexScroll.append(p);
    }
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
      if (!loadingEditorValue) scheduleSidebarIndexRefresh();
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
      refreshSidebarIndexPanel();
      return;
    }

    pageSelect.value = selectedPageId;
    loadingEditorValue = true;
    editor.setWikiDocument(selectedPageId, markdownForPage(stateWiki(), selectedPageId));
    loadingEditorValue = false;
    setStatus(editable ? 'Ready' : 'Read only');
    refreshSidebarIndexPanel();
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
      if (indexRefreshTimer) {
        clearTimeout(indexRefreshTimer);
        indexRefreshTimer = null;
      }
      editor.dispose();
    },
  };
}
