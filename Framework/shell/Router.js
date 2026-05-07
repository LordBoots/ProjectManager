/**
 * Tab-based router; supports `wiki:<pageId>` deep links from Home.
 */

/**
 * @param {{
 *   layout: { main: HTMLElement, tabButtons: Map<string, HTMLButtonElement>, onRouteChange?: Function },
 *   panes: Map<string, { root: HTMLElement | (() => HTMLElement) }>,
 *   onNavigate?: (detail: { routeKey: string, routeFull: string, wikiPageId: string | null }) => void,
 * }} opts
 */
export function createRouter({ layout, panes, onNavigate }) {
  /** @type {string | null} */
  let wikiPageId = null;
  /** @type {string} */
  let routeFull = 'home';
  /** @type {string} */
  let routeKey = 'home';

  function commit() {
    for (const [id, pane] of panes) {
      const el = typeof pane.root === 'function' ? pane.root() : pane.root;
      el.style.display = id === routeKey ? '' : 'none';
    }
    for (const [, btn] of layout.tabButtons) {
      if (!btn) continue;
      const rid = btn.dataset.route;
      btn.classList.toggle('pm-tab-active', rid === routeKey);
    }
    if (typeof onNavigate === 'function') {
      onNavigate({ routeKey, routeFull, wikiPageId });
    }
    if (layout.onRouteChange) {
      layout.onRouteChange(routeKey, routeFull, wikiPageId);
    }
  }

  function setRoute(next) {
    if (typeof next !== 'string') return;

    wikiPageId = null;
    routeFull = next;

    if (next.startsWith('wiki:')) {
      routeKey = 'wiki';
      wikiPageId = next.slice(5) || null;
    } else {
      routeKey = next;
    }

    if (!panes.has(routeKey)) {
      routeKey = 'home';
      routeFull = 'home';
      wikiPageId = null;
    }

    commit();
  }

  function getRoute() {
    return routeFull;
  }

  function getRouteKey() {
    return routeKey;
  }

  function getWikiPageId() {
    return wikiPageId;
  }

  for (const [, btn] of layout.tabButtons) {
    btn.addEventListener('click', () => {
      const rid = btn.dataset.route;
      if (rid) setRoute(rid);
    });
  }

  panes.forEach((pane, id) => {
    const el = typeof pane.root === 'function' ? pane.root() : pane.root;
    el.style.display = id === routeKey ? '' : 'none';
    layout.main.append(el);
  });

  commit();

  return { setRoute, getRoute, getRouteKey, getWikiPageId };
}
