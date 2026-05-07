/** @typedef {{ version: string }} VersionFile */

/** @typedef {{ id: string, type: string, text?: string, src?: string, x: number, y: number, w: number, h: number, styles?: Record<string, unknown>, note?: boolean }} MindMapNode */

/** @typedef {{ id: string, fromNodeId: string, toNodeId: string }} MindMapEdge */

/** @typedef {{ id: string, x: number, y: number, w: number, h: number, memberIds: string[] }} MindMapFrame */

/** @typedef {{ nodes: MindMapNode[], edges: MindMapEdge[], frames?: MindMapFrame[], view: { x: number, y: number, scale: number }, snapGrid?: boolean }} MindMapData */

/** @typedef {{ id: string, icon?: string, title: string, description?: string, subtasks: { id: string, label: string, done: boolean }[] }} KanbanCard */

/** @typedef {{ id: string, title: string, cards: KanbanCard[] }} KanbanColumn */

/** @typedef {{ columns: KanbanColumn[] }} KanbanData */

/** @typedef {{ id: string, title: string, description?: string, icon?: string }} WikiPageMeta */

/** @typedef {{ pages: WikiPageMeta[], markdownByPageId?: Record<string, string> }} WikiData */

/**
 * @typedef {{ id: string, title: string, body: string, category: string, priority: string, status: string, rejectionReason?: string, targetRefs?: EntityRef[], createdAt?: string, updatedAt?: string }} SuggestionItem
 */

/**
 * @typedef {{ type: 'mindmapNode'|'kanbanCard'|'wikiPage', id: string }} EntityRef
 */

/** @typedef {{ remoteRepoHint?: string }} AppSettings */

export function defaultVersionFile() {
  /** @type {VersionFile} */
  return { version: '0.0.0-local' };
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
        id: 'p-intro',
        title: 'Introduction',
        description: 'Project overview',
        icon: '📄',
      },
    ],
    markdownByPageId: {
      'p-intro': '# Introduction\n\nWrite your overview here.',
    },
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
  };
}
