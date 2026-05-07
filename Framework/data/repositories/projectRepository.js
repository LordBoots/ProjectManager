import {
  defaultVersionFile,
  defaultMindMap,
  defaultKanban,
  defaultWiki,
  defaultSuggestions,
  defaultSettings,
} from '../schema/defaults.js';

/** Same opaque id encoding as Framework/sync/remoteManifestSync for `{ version: semver }`. */
const LEGACY_SEMVER_UID_PREFIX = 'legacy-semver:';

const FILES = {
  version: 'version.json',
  mindmap: 'mindmap.json',
  kanban: 'kanban.json',
  wiki: 'wiki.json',
  suggestions: 'suggestions.json',
  settings: 'settings.json',
};

function normalizeSuggestionItem(it) {
  if (!it || typeof it !== 'object' || typeof /** @type {{ id?: unknown }} */ (it).id !== 'string') return null;
  /** @type {Record<string, unknown>} */
  const o = { .../** @type {Record<string, unknown>} */ (it) };
  o.kind = o.kind === 'devNote' ? 'devNote' : 'suggestion';
  return o;
}

function normalizeSuggestionList(arr) {
  const list = Array.isArray(arr) ? arr : [];
  /** @type {Record<string, unknown>[]} */
  const out = [];
  for (const it of list) {
    const n = normalizeSuggestionItem(it);
    if (n) out.push(n);
  }
  return out;
}

function mergeSuggestions(raw) {
  const d = defaultSuggestions();
  if (!raw || typeof raw !== 'object') return d;
  return {
    items: normalizeSuggestionList(Array.isArray(raw.items) ? raw.items : d.items),
    archived: normalizeSuggestionList(Array.isArray(raw.archived) ? raw.archived : d.archived),
  };
}

export function loadMindmapJson(raw) {
  const d = defaultMindMap();
  if (!raw || typeof raw !== 'object') return d;
  /** @type {unknown[]} */
  const rawFrames = Array.isArray(raw.frames) ? raw.frames : [];
  const frames = rawFrames
    .filter((f) => f && typeof f === 'object' && typeof /** @type {{ id?: unknown }} */ (f).id === 'string')
    .map((f) => {
      const fr = /** @type {{ id: string, x?: unknown, y?: unknown, w?: unknown, h?: unknown, memberIds?: unknown }} */ (f);
      const nx = typeof fr.x === 'number' && !Number.isNaN(fr.x) ? fr.x : 0;
      const ny = typeof fr.y === 'number' && !Number.isNaN(fr.y) ? fr.y : 0;
      return {
        id: fr.id,
        x: nx,
        y: ny,
        w: typeof fr.w === 'number' && !Number.isNaN(fr.w) ? fr.w : 160,
        h: typeof fr.h === 'number' && !Number.isNaN(fr.h) ? fr.h : 120,
        memberIds: Array.isArray(fr.memberIds)
          ? fr.memberIds.filter((id) => typeof id === 'string')
          : [],
      };
    });
  return {
    nodes: Array.isArray(raw.nodes) ? raw.nodes : d.nodes,
    edges: Array.isArray(raw.edges) ? raw.edges : d.edges,
    frames,
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
  if (typeof raw.uid === 'string' && raw.uid.trim().length > 0) {
    return { uid: raw.uid.trim() };
  }
  if (typeof raw.version === 'string' && raw.version.trim().length > 0) {
    return { uid: `${LEGACY_SEMVER_UID_PREFIX}${raw.version.trim()}` };
  }
  return d;
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
