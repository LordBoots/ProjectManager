import {
  findHeadingLineNumberBySlug,
  resolveMarkdownHrefToWikiTarget,
  slugifyAnchorFragment,
  stripMarkdownLinkTitleSuffix,
} from './wikiMarkdownLinks.js';

const MONACO_LOADER_SRC = 'node_modules/monaco-editor/min/vs/loader.js';
const MONACO_VS_PATH = 'node_modules/monaco-editor/min/vs';

const WIKI_SCHEME = 'wiki';

let loaderPromise = null;

/** @type {{ dispose: () => void } | null} */
let wikiLinkOpenerDisposable = null;

/** @type {{ dispose: () => void } | null} */
let wikiMarkdownLinkProviderDisposable = null;

/** @type {{
 *   getWikiPageId: () => string | null,
 *   revealHeadingForSlug: (slug: string) => void,
 *   onNavigateWikiPage: (pageId: string, opts?: { hash?: string }) => void,
 * }} */
const wikiLinkBridge = {
  getWikiPageId: () => null,
  revealHeadingForSlug: () => {},
  onNavigateWikiPage: () => {},
};

/**
 * @param {string} fsPath
 * @returns {string | null}
 */
function wikiPageIdFromFsPath(fsPath) {
  const norm = fsPath.replace(/\\/g, '/');
  const idx = norm.toLowerCase().lastIndexOf('/wiki/pages/');
  if (idx === -1) return null;
  return norm.slice(idx + '/wiki/'.length);
}

/**
 * @param {{ scheme: string, path: string, fragment?: string, fsPath: string }} uri
 * @returns {{ pageId: string, hash: string } | null}
 */
function wikiTargetFromMonacoUri(uri) {
  const scheme = uri.scheme.toLowerCase();
  let fragment = '';
  if (uri.fragment) {
    try {
      fragment = decodeURIComponent(uri.fragment);
    } catch {
      fragment = uri.fragment;
    }
  }

  if (scheme === WIKI_SCHEME) {
    let p = uri.path;
    if (p.startsWith('/')) p = p.slice(1);
    if (!p || !p.endsWith('.md') || !p.startsWith('pages/')) return null;
    const normHash = fragment ? slugifyAnchorFragment(fragment) || fragment.trim().toLowerCase() : '';
    return { pageId: p, hash: normHash };
  }

  if (scheme === 'file') {
    const pageId = wikiPageIdFromFsPath(uri.fsPath);
    if (!pageId || !pageId.endsWith('.md') || !pageId.startsWith('pages/')) return null;
    const normHash = fragment ? slugifyAnchorFragment(fragment) || fragment.trim().toLowerCase() : '';
    return { pageId, hash: normHash };
  }

  return null;
}

/**
 * @param {unknown} monaco
 */
function attachWikiLinkOpener(monaco) {
  if (wikiLinkOpenerDisposable) return;

  wikiLinkOpenerDisposable = monaco.editor.registerLinkOpener({
    /** @param {{ scheme: string, path: string, fragment?: string, fsPath: string, toString?: (skipEncoding?: boolean) => string }} resource */
    open(resource) {
      const scheme = resource.scheme.toLowerCase();
      if (scheme === 'http' || scheme === 'https' || scheme === 'mailto') return false;

      const target = wikiTargetFromMonacoUri(resource);

      if (!target || !target.pageId.startsWith('pages/')) return false;

      const current = wikiLinkBridge.getWikiPageId();
      if (!current) return false;

      if (target.pageId === current) {
        if (target.hash) {
          wikiLinkBridge.revealHeadingForSlug(target.hash);
          return true;
        }
        return false;
      }

      wikiLinkBridge.onNavigateWikiPage(target.pageId, target.hash ? { hash: target.hash } : undefined);
      return true;
    },
  });
}

/**
 * @param {unknown} monaco
 * @param {string | null} pageId
 */
function wikiUriForPage(monaco, pageId) {
  const clean = String(pageId || '_none').replace(/^\/+/, '');
  const path = `/${clean}`;
  return monaco.Uri.from({ scheme: WIKI_SCHEME, path });
}

/**
 * @param {unknown} monaco
 * @param {{ pageId: string, hash?: string }} target
 */
function wikiMonacoUriFromWikiTarget(monaco, target) {
  const clean = String(target.pageId || '').replace(/^\/+/, '');
  const path = `/${clean}`;
  const fragRaw = target.hash;
  const frag = fragRaw ? slugifyAnchorFragment(fragRaw) || String(fragRaw).trim().toLowerCase() : '';
  if (frag) return monaco.Uri.from({ scheme: WIKI_SCHEME, path, fragment: frag });
  return monaco.Uri.from({ scheme: WIKI_SCHEME, path });
}

/**
 * Standalone Monaco does not treat Markdown `[](url)` as links by default; register a provider so Ctrl/Cmd+hover works.
 * @param {unknown} monaco
 */
function attachWikiMarkdownLinkProvider(monaco) {
  if (wikiMarkdownLinkProviderDisposable) return;

  wikiMarkdownLinkProviderDisposable = monaco.languages.registerLinkProvider('markdown', {
    /** @param {{ uri: { scheme: string, path: string }, getValue: () => string, getPositionAt: (n: number) => any }} model */
    provideLinks(model) {
      if (!model?.uri || model.uri.scheme !== WIKI_SCHEME) return { links: [] };
      let basePageId = model.uri.path;
      if (basePageId.startsWith('/')) basePageId = basePageId.slice(1);
      if (!basePageId.startsWith('pages/')) return { links: [] };

      const full = model.getValue();
      /** @type {{ range: unknown, url: unknown }[]} */
      const links = [];
      const re = /\[[^\]]*\]\(([^)]*)\)/g;
      let m;
      while ((m = re.exec(full)) !== null) {
        const innerRaw = m[1];
        const href = stripMarkdownLinkTitleSuffix(innerRaw);
        if (!href) continue;

        const resolved = resolveMarkdownHrefToWikiTarget(basePageId, href);
        if (!resolved) continue;

        const fullMatch = m[0];
        const idx = m.index;
        const openParen = idx + fullMatch.indexOf('(');
        const leading = innerRaw.match(/^\s*/)?.[0]?.length ?? 0;
        const urlStart = openParen + 1 + leading;
        const urlEnd = urlStart + href.length;

        const startPos = model.getPositionAt(urlStart);
        const endPos = model.getPositionAt(urlEnd);
        const range = new monaco.Range(
          startPos.lineNumber,
          startPos.column,
          endPos.lineNumber,
          endPos.column,
        );

        const url =
          resolved.kind === 'external' ? resolved.href : wikiMonacoUriFromWikiTarget(monaco, resolved);

        links.push({ range, url });
      }
      return { links };
    },
  });
}

function ensureMonacoLoader() {
  if (window.monaco?.editor) return Promise.resolve(window.monaco);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    /**
     * Electron sets `window.require` to Node/CommonJS require. Monaco's bundled loader runs with `isNode &&
     * isElectronRenderer` and sets `_nodeRequire` from `(global.require || require)` before it replaces `global.require`
     * with the AMD shim. Clearing `window.require` first breaks `_nodeRequire` and leads to "not a function" when
     * loading editor chunks.
     *
     * We only stash the native bridge if we see Electron's require (AMD `RequireFunc.config` exists on Monaco's shim).
     */
    const amdRequireAlready =
      typeof window.require === 'function' && typeof window.require.config === 'function';
    if (
      !amdRequireAlready &&
      typeof window.require === 'function' &&
      window.require.config === undefined &&
      typeof process !== 'undefined' &&
      process?.versions?.electron
    ) {
      window.nodeRequire = window.require;
    }

    const finish = () => {
      const amdRequire = window.require;
      if (!amdRequire?.config) {
        reject(new Error('Monaco AMD loader did not expose require.config'));
        return;
      }
      amdRequire.config({ paths: { vs: MONACO_VS_PATH } });
      amdRequire(
        ['vs/editor/editor.main'],
        () => {
          if (window.monaco?.editor) resolve(window.monaco);
          else reject(new Error('Monaco editor did not initialize'));
        },
        reject,
      );
    };

    if (amdRequireAlready) {
      finish();
      return;
    }

    const script = document.createElement('script');
    script.src = MONACO_LOADER_SRC;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error(`Unable to load ${MONACO_LOADER_SRC}`));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

/**
 * Mount a Monaco Markdown editor and degrade to a textarea if the local Monaco build cannot load.
 * @param {HTMLElement} host
 * @param {{
 *   value?: string,
 *   wikiPageId?: string | null,
 *   readOnly?: boolean,
 *   onChange?: (value: string) => void,
 *   getWikiPageId?: () => string | null,
 *   onNavigateWikiPage?: (pageId: string, opts?: { hash?: string }) => void,
 * }} opts
 */
export function mountMarkdownEditor(host, opts = {}) {
  let value = String(opts.value ?? '');
  /** @type {string | null} */
  let wikiPageId = opts.wikiPageId ?? null;
  let readOnly = opts.readOnly === true;
  let disposed = false;
  /** @type {any} */
  let editor = null;
  let textarea = null;
  /** @type {any} */
  let monacoRef = null;

  const loading = document.createElement('div');
  loading.className = 'pm-wiki-monaco-loading';
  loading.textContent = 'Loading Markdown editor...';
  host.replaceChildren(loading);

  function notify(nextValue) {
    value = nextValue;
    opts.onChange?.(value);
  }

  function revealHeadingForSlug(slug) {
    if (!editor || !slug) return;
    const model = editor.getModel();
    if (!model) return;
    const line = findHeadingLineNumberBySlug(model.getValue(), slug);
    if (line != null) editor.revealLineInCenter(line);
  }

  function syncLinkBridge() {
    wikiLinkBridge.getWikiPageId = opts.getWikiPageId || (() => wikiPageId);
    wikiLinkBridge.revealHeadingForSlug = revealHeadingForSlug;
    wikiLinkBridge.onNavigateWikiPage =
      opts.onNavigateWikiPage ||
      (() => {
        /* noop */
      });
  }

  function mountFallback(message) {
    if (disposed) return;
    textarea = document.createElement('textarea');
    textarea.className = 'pm-textarea pm-wiki-markdown-fallback';
    textarea.value = value;
    textarea.readOnly = readOnly;
    textarea.spellcheck = true;
    textarea.addEventListener('input', () => notify(textarea?.value ?? ''));
    host.replaceChildren(textarea);
    if (message) textarea.placeholder = message;
  }

  /**
   * @param {unknown} monaco
   */
  function applyWikiModel(monaco) {
    if (!editor || disposed) return;
    const uri = wikiUriForPage(monaco, wikiPageId);
    const prev = editor.getModel();

    let model = monaco.editor.getModel(uri);
    if (model) {
      if (model.getValue() !== value) model.setValue(value);
      editor.setModel(model);
      if (prev && prev !== model) prev.dispose();
      return;
    }

    const next = monaco.editor.createModel(value, 'markdown', uri);
    editor.setModel(next);
    if (prev && prev !== next) prev.dispose();
  }

  ensureMonacoLoader()
    .then((monaco) => {
      if (disposed) return;
      monacoRef = monaco;
      syncLinkBridge();
      attachWikiMarkdownLinkProvider(monaco);
      attachWikiLinkOpener(monaco);

      const container = document.createElement('div');
      container.className = 'pm-wiki-monaco-editor';
      host.replaceChildren(container);
      editor = monaco.editor.create(container, {
        wordWrap: 'on',
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly,
        links: true,
        theme: document.documentElement.classList.contains('pm-theme-light') ? 'vs' : 'vs-dark',
        scrollBeyondLastLine: false,
      });

      applyWikiModel(monaco);
      editor.onDidChangeModelContent(() => notify(editor?.getValue() ?? ''));
    })
    .catch((err) => {
      console.warn('[Wiki] Monaco unavailable, using textarea fallback.', err);
      mountFallback('Monaco could not be loaded. Editing continues in this Markdown textarea.');
    });

  return {
    setValue(nextValue) {
      value = String(nextValue ?? '');
      if (editor && monacoRef) {
        const m = editor.getModel();
        if (m && m.getValue() !== value) m.setValue(value);
      } else if (textarea && textarea.value !== value) textarea.value = value;
    },
    /**
     * Swap markdown content and wiki document URI (relative link base).
     * @param {string | null} pageId `pages/foo.md` or null when empty
     * @param {string} text
     */
    setWikiDocument(pageId, text) {
      wikiPageId = pageId;
      value = String(text ?? '');
      syncLinkBridge();
      if (editor && monacoRef) {
        applyWikiModel(monacoRef);
        editor.updateOptions({ readOnly });
      } else if (textarea) textarea.value = value;
    },
    revealHeading(slug) {
      revealHeadingForSlug(slug);
    },
    getValue() {
      if (editor) return editor.getValue();
      if (textarea) return textarea.value;
      return value;
    },
    setReadOnly(nextReadOnly) {
      readOnly = nextReadOnly === true;
      if (editor) editor.updateOptions({ readOnly });
      if (textarea) textarea.readOnly = readOnly;
    },
    layout() {
      editor?.layout();
    },
    dispose() {
      disposed = true;
      wikiLinkBridge.getWikiPageId = () => null;
      wikiLinkBridge.revealHeadingForSlug = () => {};
      wikiLinkBridge.onNavigateWikiPage = () => {};

      editor?.dispose();
      editor = null;
      textarea = null;
      monacoRef = null;

      if (wikiMarkdownLinkProviderDisposable) {
        wikiMarkdownLinkProviderDisposable.dispose();
        wikiMarkdownLinkProviderDisposable = null;
      }
      if (wikiLinkOpenerDisposable) {
        wikiLinkOpenerDisposable.dispose();
        wikiLinkOpenerDisposable = null;
      }

      host.replaceChildren();
    },
  };
}
