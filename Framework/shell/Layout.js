/**
 * Builds the top-level chrome: header tabs, main area, suggestions rail slot.
 */

const TAB_IDS = [
  { id: 'home', label: 'Home' },
  { id: 'mindmap', label: 'Mind Map' },
  { id: 'kanban', label: 'Kanban' },
  { id: 'wiki', label: 'Wiki', hiddenRoute: false },
];

export function createLayout({ developer, onSyncClick }) {
  const root = document.createElement('div');
  root.className = 'pm-app';
  root.id = 'pm-app';

  const topbar = document.createElement('header');
  topbar.className = 'pm-topbar';
  topbar.id = 'pm-topbar';

  const brand = document.createElement('h1');
  brand.className = 'pm-brand';
  brand.textContent = 'Project Manager';

  const tabNav = document.createElement('nav');
  tabNav.className = 'pm-tabs';
  tabNav.id = 'pm-tabs';

  const rightToolbar = document.createElement('div');
  rightToolbar.className = 'pm-toolbar';

  const syncBtn = document.createElement('button');
  syncBtn.type = 'button';
  syncBtn.className = 'pm-sync-btn';
  syncBtn.title = 'Check remote version and optionally replace local data folder';
  syncBtn.textContent = 'Sync data';
  if (onSyncClick) {
    syncBtn.addEventListener('click', () => onSyncClick());
  }

  const syncStatus = document.createElement('span');
  syncStatus.className = 'pm-sync-status';
  syncStatus.id = 'pm-sync-status';

  rightToolbar.append(syncBtn, syncStatus);

  const tabButtons = new Map();

  for (const t of TAB_IDS) {
    if (t.hiddenRoute) continue;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pm-tab';
    btn.dataset.route = t.id;
    btn.textContent = t.label;
    tabNav.append(btn);
    tabButtons.set(t.id, btn);
  }

  const suggestionsMainTabBtn = document.createElement('button');
  suggestionsMainTabBtn.type = 'button';
  suggestionsMainTabBtn.className = 'pm-tab';
  suggestionsMainTabBtn.dataset.route = 'suggestions';
  suggestionsMainTabBtn.textContent = 'Suggestions';
  tabNav.append(suggestionsMainTabBtn);
  tabButtons.set('suggestions', suggestionsMainTabBtn);

  if (developer) {
    const settingsBtn = document.createElement('button');
    settingsBtn.type = 'button';
    settingsBtn.className = 'pm-tab';
    settingsBtn.dataset.route = 'settings';
    settingsBtn.textContent = 'Settings';
    tabNav.append(settingsBtn);
    tabButtons.set('settings', settingsBtn);
  }

  topbar.append(brand, tabNav, rightToolbar);

  const body = document.createElement('div');
  body.className = 'pm-body';

  const main = document.createElement('main');
  main.className = 'pm-main';
  main.id = 'pm-main';

  const suggestionsAside = document.createElement('aside');
  suggestionsAside.className = 'pm-suggestions-pane';
  suggestionsAside.id = 'pm-suggestions';

  body.append(main, suggestionsAside);
  root.append(topbar, body);

  return {
    root,
    main,
    suggestionsAside,
    syncStatus,
    tabButtons,
    getTabButton(id) {
      return tabButtons.get(id);
    },
  };
}

export { TAB_IDS };
