/**
 * Wraps preload `electronAPI` when present; otherwise uses in-memory persistence (browser dev).
 */
export function createFsAdapter() {
  const api =
    typeof window !== 'undefined' && window.electronAPI && window.electronAPI.getProjectRoot
      ? window.electronAPI
      : null;

  if (!api) {
    const mem = Object.create(null);
    return {
      isElectron: false,
      memory: mem,
      getProjectRoot: () => '.',
      dataPath: (...parts) => ['data', ...parts].join('/'),
      exists: (p) => Object.prototype.hasOwnProperty.call(mem, p),
      readFile: (p) => mem[p],
      writeFile: (p, txt) => {
        mem[p] = txt;
        return true;
      },
      readJSON: (p) => JSON.parse(mem[p] || '{}'),
      writeJSON: (p, data) => {
        mem[p] = JSON.stringify(data, null, 2);
        return true;
      },
    };
  }

  const root = api.getProjectRoot();

  function dataPath(...parts) {
    return api.joinPath(root, 'data', ...parts);
  }

  return {
    isElectron: true,
    getProjectRoot: () => root,
    dataPath,
    exists: (p) => api.exists(p),
    readFile: (p) => api.readFile(p),
    writeFile: (p, txt) => api.writeFile(p, txt),
    readJSON: (p) => api.readJSON(p),
    writeJSON: (p, data) => api.writeJSON(p, data),
  };
}
