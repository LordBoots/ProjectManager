export function deepClone(obj) {
  return structuredClone(obj);
}

/**
 * Holds normalized project slices; notifies subscribers on shallow replace per key.
 */
export function createProjectStore(initial) {
  let state = deepClone(initial);
  const listeners = new Set();

  function subscribe(fn) {
    listeners.add(fn);
    fn(state);
    return () => listeners.delete(fn);
  }

  function notify() {
    for (const fn of listeners) fn(state);
  }

  function getState() {
    return state;
  }

  function replace(nextFull) {
    state = deepClone(nextFull);
    notify();
  }

  function patch(partial) {
    state = { ...state, ...deepClone(partial) };
    notify();
  }

  function updateMindmap(mutator, opts) {
    const raw = state.mindmap;
    const mm =
      raw != null && typeof raw === "object"
        ? deepClone(raw)
        : deepClone({ nodes: [], edges: [], frames: [], view: { x: 0, y: 0, scale: 1 } });
    mutator(mm);
    state = { ...state, mindmap: mm };
    if (!opts || !opts.silent) notify();
  }

  function updateKanban(mutator) {
    const k = deepClone(state.kanban);
    mutator(k);
    state = { ...state, kanban: k };
    notify();
  }

  function updateWiki(mutator) {
    const w = deepClone(state.wiki);
    mutator(w);
    state = { ...state, wiki: w };
    notify();
  }

  function updateSuggestions(mutator) {
    const s = deepClone(state.suggestions);
    mutator(s);
    state = { ...state, suggestions: s };
    notify();
  }

  function updateSettings(mutator) {
    const s = deepClone(state.settings);
    mutator(s);
    state = { ...state, settings: s };
    notify();
  }

  return {
    subscribe,
    getState,
    replace,
    patch,
    updateMindmap,
    updateKanban,
    updateWiki,
    updateSuggestions,
    updateSettings,
  };
}
