const MONACO_LOADER_SRC = 'node_modules/monaco-editor/min/vs/loader.js';
const MONACO_VS_PATH = 'node_modules/monaco-editor/min/vs';

let loaderPromise = null;

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
 * @param {{ value?: string, readOnly?: boolean, onChange?: (value: string) => void }} opts
 */
export function mountMarkdownEditor(host, opts = {}) {
  let value = String(opts.value ?? '');
  let readOnly = opts.readOnly === true;
  let disposed = false;
  let editor = null;
  let textarea = null;

  const loading = document.createElement('div');
  loading.className = 'pm-wiki-monaco-loading';
  loading.textContent = 'Loading Markdown editor...';
  host.replaceChildren(loading);

  function notify(nextValue) {
    value = nextValue;
    opts.onChange?.(value);
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

  ensureMonacoLoader()
    .then((monaco) => {
      if (disposed) return;
      const container = document.createElement('div');
      container.className = 'pm-wiki-monaco-editor';
      host.replaceChildren(container);
      editor = monaco.editor.create(container, {
        value,
        language: 'markdown',
        wordWrap: 'on',
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly,
        theme: document.documentElement.classList.contains('pm-theme-light') ? 'vs' : 'vs-dark',
        scrollBeyondLastLine: false,
      });
      editor.onDidChangeModelContent(() => notify(editor?.getValue() ?? ''));
    })
    .catch((err) => {
      console.warn('[Wiki] Monaco unavailable, using textarea fallback.', err);
      mountFallback('Monaco could not be loaded. Editing continues in this Markdown textarea.');
    });

  return {
    setValue(nextValue) {
      value = String(nextValue ?? '');
      if (editor && editor.getValue() !== value) editor.setValue(value);
      if (textarea && textarea.value !== value) textarea.value = value;
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
      editor?.dispose();
      editor = null;
      textarea = null;
      host.replaceChildren();
    },
  };
}
