/**
 * Build-time / boot flag: set `window.__PM_DEVELOPER__` in index.html before main.js loads.
 */
export function getAppConfig() {
  const developer = Boolean(typeof window !== 'undefined' && window.__PM_DEVELOPER__);
  return { developer };
}
