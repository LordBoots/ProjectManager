import { createLayout } from '../shell/Layout.js';
import { createRouter } from '../shell/Router.js';
import { createEventBus, BusEvents } from '../core/EventBus.js';
import { createPermissions } from '../core/permissions.js';
import { getAppConfig } from './config.js';
import { createFsAdapter } from '../platform/electronFs.js';
import { loadAllProjectData } from '../data/repositories/projectRepository.js';
import { createProjectStore } from '../data/store/ProjectStore.js';
import { createPersistence } from '../sync/localDataPersistence.js';
import { fetchRemoteVersion, parseRepoHint, buildSyncHintMessage } from '../sync/remoteManifestSync.js';
import { createHomeFeature } from '../features/home/homeFeature.js';
import { createMindmapFeature } from '../features/mindmap/mindmapFeature.js';
import { createKanbanFeature } from '../features/kanban/kanbanFeature.js';
import { createWikiFeature } from '../features/wiki/wikiFeature.js';
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
        await this._runSync(store, persistence, layout);
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

    this._cleanups = [
      () => suggestions.unmount(),
      () => home.unmount(),
      () => wiki.unmount(),
      () => mindmap.unmount(),
      () => kanban.unmount(),
      () => settings?.unmount(),
      () => offNav(),
      () => persistence.dispose(),
    ];

    document.body.appendChild(layout.root);
    suggestions.mount?.();
  }

  /**
   * @param {ReturnType<typeof createProjectStore>} store
   * @param {ReturnType<typeof createPersistence>} persistence
   * @param {ReturnType<typeof createLayout>} layout
   */
  async _runSync(store, persistence, layout) {
    layout.syncStatus.textContent = '';
    persistence.saveImmediate();
    const parsed = parseRepoHint(store.getState().settings);
    if (!parsed) {
      layout.syncStatus.textContent = 'Set repository URL in Settings for remote version check.';
      persistence.loadFromDisk();
      return;
    }
    try {
      const remote = await fetchRemoteVersion(parsed.versionUrl);
      const local = store.getState().version?.version ?? '';
      layout.syncStatus.textContent = buildSyncHintMessage(local, remote);
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? e.message : String(e);
      layout.syncStatus.textContent = `Remote check failed: ${msg}. Reloading from disk.`;
    }
    persistence.loadFromDisk();
  }
}
