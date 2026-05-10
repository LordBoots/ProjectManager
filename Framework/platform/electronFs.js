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
      dataPath: (...parts) => ['Data', ...parts].join('/'),
      exists: (p) => Object.prototype.hasOwnProperty.call(mem, p),
      readDir: (p) => readDirMemory(mem, p),
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
    return api.joinPath(root, 'Data', ...parts);
  }

  return {
    isElectron: true,
    getProjectRoot: () => root,
    dataPath,
    exists: (p) => api.exists(p),
    readDir: (p) => {
      try {
        return api.readdir(p);
      } catch {
        return [];
      }
    },
    readFile: (p) => api.readFile(p),
    writeFile: (p, txt) => api.writeFile(p, txt),
    readJSON: (p) => api.readJSON(p),
    writeJSON: (p, data) => api.writeJSON(p, data),
  };
}

/**
 * @param {Record<string, string>} mem
 * @param {string} dirPath
 */
function readDirMemory(mem, dirPath) {
  const prefix = `${String(dirPath).replace(/\\/g, '/').replace(/\/?$/u, '/')}`;
  /** @type {string[]} */
  const out = [];
  for (const k of Object.keys(mem)) {
    const nk = String(k).replace(/\\/g, '/');
    if (!nk.startsWith(prefix)) continue;
    const rest = nk.slice(prefix.length);
    if (!rest || rest.includes('/')) continue;
    out.push(rest);
  }
  return out.sort((a, b) => a.localeCompare(b));
}
