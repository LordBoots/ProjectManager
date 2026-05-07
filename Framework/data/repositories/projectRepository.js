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

function newWikiBlockId() {
  return `b-${Math.random().toString(36).slice(2, 10)}`;
}

function newWikiTableRowId() {
  return `br-${Math.random().toString(36).slice(2, 10)}`;
}

/** @param {unknown} raw */
function coerceWikiTableRow(raw) {
  if (Array.isArray(raw)) {
    return { id: newWikiTableRowId(), cells: raw.map((c) => String(c ?? '')) };
  }
  if (
    raw &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    Array.isArray(/** @type {{cells?:unknown}} */ (raw).cells)
  ) {
    const rid =
      typeof /** @type {{id?:unknown}} */ (raw).id === 'string' && String(raw.id).trim()
        ? String(raw.id).trim()
        : newWikiTableRowId();
    return {
      id: rid,
      cells: /** @type {{cells:unknown[]}} */ (raw).cells.map((c) => String(c ?? '')),
    };
  }
  return null;
}

/** @param {unknown} raw */
function coerceWikiBlock(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.type !== 'string') return null;
  const bid =
    typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : newWikiBlockId();
  if (/** @type {{ type?: string }} */ (raw).type === 'text') {
    return {
      id: bid,
      type: /** @type {'text'} */ ('text'),
      content: typeof /** @type {{ content?: unknown }} */ (raw).content === 'string' ? raw.content : '',
    };
  }
  if (/** @type {{ type?: string }} */ (raw).type === 'image') {
    return {
      id: bid,
      type: /** @type {'image'} */ ('image'),
      src: typeof /** @type {{ src?: unknown }} */ (raw).src === 'string' ? raw.src : '',
      alt: typeof /** @type {{ alt?: unknown }} */ (raw).alt === 'string' ? raw.alt : '',
    };
  }
  if (/** @type {{ type?: string }} */ (raw).type === 'table') {
    const rr = /** @type {{ rows?: unknown }} */ (raw).rows;
    const rowObjs =
      Array.isArray(rr) && rr.length > 0
        ? /** @type {NonNullable<ReturnType<typeof coerceWikiTableRow>>[]} */ (
            rr.map(coerceWikiTableRow).filter((x) => x !== null)
          )
        : [];
    const mkEmptyRow = () => ({ id: newWikiTableRowId(), cells: ['', '', ''] });
    const safe = rowObjs.length > 0 ? rowObjs : [mkEmptyRow(), mkEmptyRow(), mkEmptyRow()];
    return {
      id: bid,
      type: /** @type {'table'} */ ('table'),
      title: typeof /** @type {{ title?: unknown }} */ (raw).title === 'string' ? /** @type {{ title: string }} */ (raw).title : '',
      rows: safe,
    };
  }
  if (/** @type {{ type?: string }} */ (raw).type === 'separator') {
    return { id: bid, type: /** @type {'separator'} */ ('separator') };
  }
  return null;
}

export function normalizeWikiBlockList(arr) {
  const list = Array.isArray(arr) ? arr : [];
  /** @type {NonNullable<ReturnType<typeof coerceWikiBlock>>[]} */
  const out = [];
  for (const x of list) {
    const b = coerceWikiBlock(x);
    if (b) out.push(b);
  }
  return out;
}

export function loadWikiJson(raw) {
  const d = defaultWiki();
  if (!raw || typeof raw !== 'object') return d;
  const pages = Array.isArray(raw.pages) ? raw.pages : d.pages;
  const markdownByPageId =
    raw.markdownByPageId && typeof raw.markdownByPageId === 'object'
      ? raw.markdownByPageId
      : d.markdownByPageId;

  const rawBlocks = raw.blocksByPageId && typeof raw.blocksByPageId === 'object' ? raw.blocksByPageId : {};

  /** @type {Record<string, ReturnType<typeof normalizeWikiBlockList>>} */
  const blocksByPageId = {};
  for (const p of pages) {
    const id = p.id;
    let list = normalizeWikiBlockList(Array.isArray(rawBlocks[id]) ? rawBlocks[id] : []);
    if (list.length === 0 && markdownByPageId[id] && String(markdownByPageId[id]).trim()) {
      list = [
        {
          id: newWikiBlockId(),
          type: 'text',
          content: String(markdownByPageId[id]),
        },
      ];
    }
    blocksByPageId[id] = list;
  }

  return {
    pages,
    markdownByPageId,
    blocksByPageId,
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
