import { createLayout } from '../shell/Layout.js';
import { createRouter } from '../shell/Router.js';
import { createEventBus, BusEvents } from '../core/EventBus.js';
import { createPermissions } from '../core/permissions.js';
import { getAppConfig } from './config.js';
import { createFsAdapter } from '../platform/electronFs.js';
import { loadAllProjectData } from '../data/repositories/projectRepository.js';
import { createProjectStore } from '../data/store/ProjectStore.js';
import { createPersistence } from '../sync/localDataPersistence.js';
import {
  fetchRemoteSnapshotId,
  parseRepoHint,
  replaceLocalDataFromGithubRaw,
} from '../sync/remoteManifestSync.js';
import { createHomeFeature } from '../features/home/homeFeature.js';
import { createMindmapFeature } from '../features/mindmap/mindmapFeature.js';
import { createKanbanFeature } from '../features/kanban/kanbanFeature.js';
import { createWikiFeature, parseWikiBlockRefCompound, parseWikiTableRowRefCompound } from '../features/wiki/wikiFeature.js';
import { createSuggestionsFeature } from '../features/suggestions/suggestionsFeature.js';
import { createSettingsFeature } from '../features/settings/settingsFeature.js';

export default class Application {
  constructor() {
    /** @type {Array<() => void>} */
    this._cleanups = [];
  }

  dispose() {
    for (const fn of this._cleanups) {
      try {
        fn();
      } catch (_) {}
    }
    this._cleanups = [];
  }

  async initialize() {
    document.body.replaceChildren();

    const config = getAppConfig();
    const permissions = createPermissions(config);
    const fs = createFsAdapter();
    const initial = loadAllProjectData(fs);
    const store = createProjectStore(initial);
    const bus = createEventBus();

    const persistence = createPersistence({ fs, store });
    persistence.attachAutoSave();

    /** @type {{ impl: null | ReturnType<typeof createRouter> }} */
    const routeApi = {
      impl: null,
      setRoute(r) {
        this.impl?.setRoute(r);
      },
    };

    const layout = createLayout({
      developer: config.developer,
      onSyncClick: async () => {
        await this._runSync(fs, store, persistence, layout);
      },
    });

    const ctx = { store, bus, permissions, persistence, layout, router: routeApi };

    const kanban = createKanbanFeature(ctx);
    const wiki = createWikiFeature(ctx);
    const mindmap = createMindmapFeature(ctx);
    const home = createHomeFeature(ctx);
    const suggestions = createSuggestionsFeature(ctx);

    const panes = new Map([
      ['home', { root: home.root }],
      ['mindmap', { root: mindmap.root }],
      ['kanban', { root: kanban.root }],
      ['wiki', { root: wiki.root }],
      ['suggestions', { root: suggestions.mainRoot }],
    ]);

    let settings = null;
    if (config.developer) {
      settings = createSettingsFeature(ctx);
      panes.set('settings', { root: settings.root });
    }

    const router = createRouter({
      layout,
      panes,
      onNavigate: (d) => {
        if (d.routeKey === 'wiki') wiki.setPage(d.wikiPageId);
      },
    });
    routeApi.impl = router;

    const offNav = bus.on(BusEvents.NAVIGATE_TO_ENTITY, (ref) => {
      if (!ref?.type || !ref?.id) return;
      if (ref.type === 'wikiTableRow' && typeof ref.id === 'string') {
        const parsed = parseWikiTableRowRefCompound(ref.id);
        if (!parsed) return;
        router.setRoute(`wiki:${parsed.pageId}`);
        queueMicrotask(() => wiki.focusLinkedTableRow?.(ref.id));
        return;
      }
      if (ref.type === 'wikiBlock' && typeof ref.id === 'string') {
        const parsed = parseWikiBlockRefCompound(ref.id);
        if (!parsed) return;
        router.setRoute(`wiki:${parsed.pageId}`);
        queueMicrotask(() => wiki.focusLinkedBlock?.(ref.id));
        return;
      }
      if (ref.type === 'wikiPage') router.setRoute(`wiki:${ref.id}`);
      if (ref.type === 'kanbanCard') {
        router.setRoute('kanban');
        kanban.highlightCard(ref.id);
      }
      if (ref.type === 'mindmapNode') {
        router.setRoute('mindmap');
        mindmap.focusNode(ref.id);
      }
    });

    const offFocusInbox = bus.on(BusEvents.FOCUS_SUGGESTION_INBOX, (payload) => {
      const id = payload && typeof payload === 'object' && typeof payload.id === 'string' ? payload.id : '';
      if (!id) return;
      router.setRoute('suggestions');
      suggestions.focusInboxItem?.(id);
    });

    this._cleanups = [
      () => suggestions.unmount(),
      () => home.unmount(),
      () => wiki.unmount(),
      () => mindmap.unmount(),
      () => kanban.unmount(),
      () => settings?.unmount(),
      () => offNav(),
      () => offFocusInbox(),
      () => persistence.dispose(),
    ];

    document.body.appendChild(layout.root);
    suggestions.mount?.();
  }

  /**
   * @param {ReturnType<typeof createFsAdapter>} fs
   * @param {ReturnType<typeof createProjectStore>} store
   * @param {ReturnType<typeof createPersistence>} persistence
   * @param {ReturnType<typeof createLayout>} layout
   */
  async _runSync(fs, store, persistence, layout) {
    layout.syncStatus.textContent = '';
    persistence.saveImmediate({ skipUidBump: true });

    const syncedRepoHint = store.getState().settings?.remoteRepoHint ?? '';
    const syncedGhBranch = store.getState().settings?.remoteGithubBranch ?? '';

    const parsed = parseRepoHint(store.getState().settings);
    if (!parsed) {
      layout.syncStatus.textContent = 'Set repository URL in Settings before Sync.';
      persistence.loadFromDisk();
      return;
    }
    try {
      const remoteSnap = await fetchRemoteSnapshotId(parsed.versionUrl);
      const localSnap = store.getState().version?.uid ?? '';

      if (localSnap === remoteSnap) {
        layout.syncStatus.textContent = 'Same snapshot as GitHub — no download.';
        persistence.loadFromDisk();
        return;
      }

      layout.syncStatus.textContent = 'Snapshot differs — downloading Data from GitHub…';
      await replaceLocalDataFromGithubRaw(fs, parsed.dataRoot);
      persistence.loadFromDisk();
      store.updateSettings((s) => {
        s.remoteRepoHint = syncedRepoHint;
        s.remoteGithubBranch = syncedGhBranch;
      });
      persistence.saveImmediate({ skipUidBump: true });
      layout.syncStatus.textContent = 'Replaced local Data from GitHub and reloaded.';
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e ? /** @type {{ message: string }} */ (e).message : String(e);
      layout.syncStatus.textContent = `Sync failed: ${msg}`;
      persistence.loadFromDisk();
    }
  }
}
