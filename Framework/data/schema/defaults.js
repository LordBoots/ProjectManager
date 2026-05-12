import { newDataUid } from '../../sync/dataUid.js';

/** @typedef {{ uid: string }} VersionFile */

/** @typedef {{ id: string, type: string, text?: string, header?: string, src?: string, wikiPageId?: string, x: number, y: number, w: number, h: number, styles?: Record<string, unknown>, note?: boolean }} MindMapNode */

/** @typedef {{ id: string, fromNodeId: string, toNodeId: string, imageAnchorId?: string, color?: string, bidirectional?: boolean }} MindMapEdge */

/** @typedef {{ id: string, x: number, y: number, w: number, h: number, memberIds: string[], title?: string }} MindMapFrame */

/** @typedef {{ nodes: MindMapNode[], edges: MindMapEdge[], frames?: MindMapFrame[], view: { x: number, y: number, scale: number }, snapGrid?: boolean }} MindMapData */

/** @typedef {{ id: string, icon?: string, title: string, description?: string, subtasks: { id: string, label: string, done: boolean }[] }} KanbanCard */

/** @typedef {{ id: string, title: string, cards: KanbanCard[] }} KanbanColumn */

/** @typedef {{ columns: KanbanColumn[] }} KanbanData */

/** @typedef {{ id: string, text: string }} WikiTocRow */
/** @typedef {{ id: string, title: string, description?: string, icon?: string, file?: string }} WikiPageMeta */

/**
 * @typedef {{ id: string, type: 'text', content: string }} WikiBlockText
 * @typedef {{ id: string, type: 'image', src: string, alt?: string }} WikiBlockImage
 * @typedef {{ id: string, cells: string[] }} WikiTableRow
 * @typedef {{ id: string, type: 'table', title?: string, rows: WikiTableRow[] }} WikiBlockTable
 * @typedef {{ id: string, type: 'separator' }} WikiBlockSeparator
 * @typedef {WikiBlockText|WikiBlockImage|WikiBlockTable|WikiBlockSeparator} WikiBlock
 */

/** @typedef {{ pages: WikiPageMeta[], markdownByPageId?: Record<string, string>, blocksByPageId?: Record<string, WikiBlock[]> }} WikiData */

/**
 * @typedef {{ id: string, title: string, body: string, category: string, priority: string, status: string, rejectionReason?: string, targetRefs?: EntityRef[], kind?: 'suggestion'|'devNote', createdAt?: string, updatedAt?: string }} SuggestionItem
 */

/**
 * @typedef {{ type: 'mindmapNode'|'kanbanCard'|'wikiPage'|'wikiBlock'|'wikiTableRow', id: string }} EntityRef
 */

/**
 * @typedef {{
 *   remoteRepoHint?: string,
 *   remoteGithubBranch?: string,
 *   mindmapLinkThickness?: number|string,
 *   mindmapImageLinkThickness?: number|string,
 *   mindmapImageLinkColor?: string,
 *   peerRelayHost?: string,
 *   peerRelayPort?: number,
 *   peerRelayPath?: string,
 *   peerRelaySecure?: boolean,
 *   peerRelayKey?: string,
 *   remoteDevPeerId?: string,
 * }} AppSettings
 */

export function defaultVersionFile() {
  /** @type {VersionFile} */
  return { uid: newDataUid() };
}

export function defaultMindMap() {
  /** @type {MindMapData} */
  return {
    nodes: [
      {
        id: 'n-root',
        type: 'text',
        text: 'Game vision',
        x: -60,
        y: -40,
        w: 160,
        h: 80,
      },
    ],
    edges: [],
    frames: [],
    view: { x: 0, y: 0, scale: 1 },
    snapGrid: false,
  };
}

export function defaultKanban() {
  /** @type {KanbanData} */
  return {
    columns: [
      { id: 'c-todo', title: 'Todo', cards: [] },
      { id: 'c-doing', title: 'Doing', cards: [] },
      { id: 'c-done', title: 'Done', cards: [] },
    ],
  };
}

export function defaultWiki() {
  /** @type {WikiData} */
  return {
    pages: [
      {
        id: 'pages/introduction.md',
        title: 'introduction',
        file: 'pages/introduction.md',
      },
    ],
    markdownByPageId: {},
    blocksByPageId: {},
  };
}

export function defaultSuggestions() {
  return {
    items: /** @type {SuggestionItem[]} */ ([]),
    archived: /** @type {SuggestionItem[]} */ ([]),
  };
}

export function defaultSettings() {
  /** @type {AppSettings} */
  return {
    remoteRepoHint: '',
    remoteGithubBranch: '',
    mindmapLinkThickness: 2,
    mindmapImageLinkThickness: 2,
    mindmapImageLinkColor: '#7d869a',
    peerRelayHost: '',
    peerRelayPort: 443,
    peerRelayPath: '/',
    peerRelaySecure: true,
    peerRelayKey: 'peerjs',
    remoteDevPeerId: '',
  };
}

/** Viewer-only queue of suggestions waiting to upload to the developer Peer. */
export function defaultSuggestionsOutbox() {
  return { items: [] };
}
