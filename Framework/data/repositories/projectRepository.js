import {
  defaultVersionFile,
  defaultMindMap,
  defaultKanban,
  defaultWiki,
  defaultSuggestions,
  defaultSuggestionsOutbox,
  defaultSettings,
} from '../schema/defaults.js';
import {
  listWikiMarkdownRelativePaths,
  loadMarkdownWiki,
  saveMarkdownWiki,
} from './wikiMarkdownRepository.js';

/** Same opaque id encoding as Framework/sync/remoteManifestSync for `{ version: semver }`. */
const LEGACY_SEMVER_UID_PREFIX = 'legacy-semver:';

const FILES = {
  version: 'version.json',
  mindmap: 'mindmap.json',
  kanban: 'kanban.json',
  wiki: 'wiki.json',
  suggestions: 'suggestions.json',
  suggestionsOutbox: 'suggestions-outbox.json',
  settings: 'settings.json',
};

/** Pulled from GitHub raw Sync; excludes local-only / PeerJS suggestion payloads (see plan). */
export const GITHUB_SYNC_SKIP_JSON = new Set([
  FILES.suggestions,
  FILES.suggestionsOutbox,
]);

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

export function mergeSuggestions(raw) {
  const d = defaultSuggestions();
  if (!raw || typeof raw !== 'object') return d;
  return {
    items: normalizeSuggestionList(Array.isArray(raw.items) ? raw.items : d.items),
    archived: normalizeSuggestionList(Array.isArray(raw.archived) ? raw.archived : d.archived),
  };
}

function mergeSuggestionsOutbox(raw) {
  const d = defaultSuggestionsOutbox();
  if (!raw || typeof raw !== 'object') return d;
  return {
    items: normalizeSuggestionList(Array.isArray(raw.items) ? raw.items : d.items),
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
  const columns = Array.isArray(raw.columns) ? raw.columns : d.columns;
  const migratedColumns = columns.map((col) => {
    if (!col || typeof col !== 'object') return col;
    const cards = Array.isArray(/** @type {{ cards?: unknown }} */ (col).cards)
      ? /** @type {{ cards: unknown[] }} */ (col).cards
      : [];
    return {
      .../** @type {Record<string, unknown>} */ (col),
      cards: cards.filter((card) => !isLegacyKanbanPlaceholderCard(card)).map(coerceKanbanCard),
    };
  });
  return {
    columns: migratedColumns,
  };
}

/** @param {unknown} raw */
function isLegacyKanbanPlaceholderCard(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const card = /** @type {{ title?: unknown, icon?: unknown, description?: unknown, subtasks?: unknown }} */ (raw);
  const subtasks = Array.isArray(card.subtasks) ? card.subtasks : [];
  if (subtasks.length !== 1) return false;
  const task = subtasks[0];
  if (!task || typeof task !== 'object' || Array.isArray(task)) return false;
  const t = /** @type {{ id?: unknown, label?: unknown, done?: unknown }} */ (task);
  return (
    String(card.title ?? '') === 'Card' &&
    String(card.icon ?? '') === '⚙' &&
    String(card.description ?? '') === '' &&
    String(t.id ?? '') === 's1' &&
    String(t.label ?? '') === 'Task' &&
    t.done === false
  );
}

/** @param {unknown} raw */
function coerceKanbanCard(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const card = /** @type {Record<string, unknown>} */ (raw);
  const subtasks = Array.isArray(card.subtasks) ? card.subtasks : [];
  return {
    ...card,
    title: typeof card.title === 'string' ? card.title : 'Untitled card',
    icon: typeof card.icon === 'string' ? card.icon : '⚙',
    description: typeof card.description === 'string' ? card.description : '',
    subtasks: subtasks.map(coerceKanbanSubtask),
  };
}

/** @param {unknown} raw */
function coerceKanbanSubtask(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { id: newKanbanSubtaskId(), label: '', done: false };
  }
  const task = /** @type {{ id?: unknown, label?: unknown, done?: unknown }} */ (raw);
  return {
    id: typeof task.id === 'string' && task.id.trim() ? task.id.trim() : newKanbanSubtaskId(),
    label: typeof task.label === 'string' ? task.label : '',
    done: task.done === true,
  };
}

function newKanbanSubtaskId() {
  return `s-${Math.random().toString(36).slice(2, 8)}`;
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
  const merged = { ...d, ...raw };
  const port = Number(merged.peerRelayPort);
  merged.peerRelayPort = Number.isFinite(port) ? port : d.peerRelayPort;
  merged.peerRelayHost = typeof merged.peerRelayHost === 'string' ? merged.peerRelayHost : d.peerRelayHost;
  merged.peerRelayPath = typeof merged.peerRelayPath === 'string' ? merged.peerRelayPath : d.peerRelayPath;
  merged.peerRelaySecure = merged.peerRelaySecure !== false;
  merged.peerRelayKey =
    typeof merged.peerRelayKey === 'string' && merged.peerRelayKey.trim()
      ? merged.peerRelayKey.trim()
      : d.peerRelayKey;
  merged.remoteDevPeerId =
    typeof merged.remoteDevPeerId === 'string' ? merged.remoteDevPeerId : d.remoteDevPeerId;
  return merged;
}

/**
 * @param {ReturnType<import('../../platform/electronFs.js').createFsAdapter>} fs
 * @param {{ developer?: boolean }} [options]
 */
export function loadAllProjectData(fs, options = {}) {
  const developer = options.developer === true;
  const read = (name) => {
    const p = fs.dataPath(name);
    if (!fs.exists(p)) return null;
    try {
      return fs.readJSON(p);
    } catch {
      return null;
    }
  };

  const markdownFilesPresent = listWikiMarkdownRelativePaths(fs).length > 0;
  const legacyWiki = read(FILES.wiki);
  const wiki = loadMarkdownWiki(fs, legacyWiki ?? defaultWiki());
  if (!markdownFilesPresent) {
    try {
      saveMarkdownWiki(fs, wiki);
    } catch {
      // Loading should not fail just because the one-time bootstrap write could not complete.
    }
  }

  return {
    version: loadVersionJson(read(FILES.version)),
    mindmap: loadMindmapJson(read(FILES.mindmap)),
    kanban: loadKanbanJson(read(FILES.kanban)),
    wiki,
    suggestions: developer ? mergeSuggestions(read(FILES.suggestions)) : defaultSuggestions(),
    suggestionsOutbox: developer ? defaultSuggestionsOutbox() : mergeSuggestionsOutbox(read(FILES.suggestionsOutbox)),
    settings: loadSettingsJson(read(FILES.settings)),
  };
}

/**
 * @param {ReturnType<import('../../platform/electronFs.js').createFsAdapter>} fs
 * @param {ReturnType<typeof loadAllProjectData>} state
 * @param {{ developer?: boolean }} [options]
 */
export function saveAllProjectData(fs, state, options = {}) {
  const developer = options.developer === true;
  fs.writeJSON(fs.dataPath(FILES.version), state.version);
  fs.writeJSON(fs.dataPath(FILES.mindmap), state.mindmap);
  fs.writeJSON(fs.dataPath(FILES.kanban), state.kanban);
  saveMarkdownWiki(fs, state.wiki);
  if (developer) {
    fs.writeJSON(fs.dataPath(FILES.suggestions), state.suggestions);
  } else {
    fs.writeJSON(
      fs.dataPath(FILES.suggestionsOutbox),
      state.suggestionsOutbox ?? defaultSuggestionsOutbox(),
    );
  }
  fs.writeJSON(fs.dataPath(FILES.settings), state.settings);
}

export { FILES };
