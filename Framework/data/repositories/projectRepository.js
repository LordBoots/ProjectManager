import {
  defaultVersionFile,
  defaultMindMap,
  defaultKanban,
  defaultWiki,
  defaultSuggestions,
  defaultSettings,
} from '../schema/defaults.js';

const FILES = {
  version: 'version.json',
  mindmap: 'mindmap.json',
  kanban: 'kanban.json',
  wiki: 'wiki.json',
  suggestions: 'suggestions.json',
  settings: 'settings.json',
};

function mergeSuggestions(raw) {
  const d = defaultSuggestions();
  if (!raw || typeof raw !== 'object') return d;
  return {
    items: Array.isArray(raw.items) ? raw.items : d.items,
    archived: Array.isArray(raw.archived) ? raw.archived : d.archived,
  };
}

export function loadMindmapJson(raw) {
  const d = defaultMindMap();
  if (!raw || typeof raw !== 'object') return d;
  return {
    nodes: Array.isArray(raw.nodes) ? raw.nodes : d.nodes,
    edges: Array.isArray(raw.edges) ? raw.edges : d.edges,
    view:
      raw.view && typeof raw.view === 'object'
        ? { ...d.view, ...raw.view }
        : d.view,
    snapGrid: typeof raw.snapGrid === 'boolean' ? raw.snapGrid : d.snapGrid,
  };
}

export function loadKanbanJson(raw) {
  const d = defaultKanban();
  if (!raw || typeof raw !== 'object') return d;
  return {
    columns: Array.isArray(raw.columns) ? raw.columns : d.columns,
  };
}

export function loadWikiJson(raw) {
  const d = defaultWiki();
  if (!raw || typeof raw !== 'object') return d;
  return {
    pages: Array.isArray(raw.pages) ? raw.pages : d.pages,
    markdownByPageId:
      raw.markdownByPageId && typeof raw.markdownByPageId === 'object'
        ? raw.markdownByPageId
        : d.markdownByPageId,
  };
}

export function loadVersionJson(raw) {
  const d = defaultVersionFile();
  if (!raw || typeof raw !== 'object') return d;
  return {
    version: typeof raw.version === 'string' ? raw.version : String(raw.version ?? d.version),
  };
}

export function loadSettingsJson(raw) {
  const d = defaultSettings();
  if (!raw || typeof raw !== 'object') return d;
  return { ...d, ...raw };
}

/**
 * @param {ReturnType<import('../../platform/electronFs.js').createFsAdapter>} fs
 */
export function loadAllProjectData(fs) {
  const read = (name) => {
    const p = fs.dataPath(name);
    if (!fs.exists(p)) return null;
    try {
      return fs.readJSON(p);
    } catch {
      return null;
    }
  };

  return {
    version: loadVersionJson(read(FILES.version)),
    mindmap: loadMindmapJson(read(FILES.mindmap)),
    kanban: loadKanbanJson(read(FILES.kanban)),
    wiki: loadWikiJson(read(FILES.wiki)),
    suggestions: mergeSuggestions(read(FILES.suggestions)),
    settings: loadSettingsJson(read(FILES.settings)),
  };
}

/**
 * @param {ReturnType<import('../../platform/electronFs.js').createFsAdapter>} fs
 * @param {ReturnType<typeof loadAllProjectData>} state
 */
export function saveAllProjectData(fs, state) {
  fs.writeJSON(fs.dataPath(FILES.version), state.version);
  fs.writeJSON(fs.dataPath(FILES.mindmap), state.mindmap);
  fs.writeJSON(fs.dataPath(FILES.kanban), state.kanban);
  fs.writeJSON(fs.dataPath(FILES.wiki), state.wiki);
  fs.writeJSON(fs.dataPath(FILES.suggestions), state.suggestions);
  fs.writeJSON(fs.dataPath(FILES.settings), state.settings);
}

export { FILES };
