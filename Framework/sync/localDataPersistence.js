import { loadAllProjectData, saveAllProjectData } from '../data/repositories/projectRepository.js';

let timer = null;

export function createPersistence({ fs, store, debounceMs = 450 }) {
  function flush() {
    saveAllProjectData(fs, store.getState());
  }

  function scheduleSave() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, debounceMs);
  }

  function loadFromDisk() {
    const data = loadAllProjectData(fs);
    store.replace(data);
  }

  function saveImmediate() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    flush();
  }

  let unsub = null;

  function attachAutoSave() {
    if (unsub) return unsub;
    unsub = store.subscribe(() => {
      scheduleSave();
    });
    return unsub;
  }

  function dispose() {
    if (timer) clearTimeout(timer);
    if (unsub) unsub();
    unsub = null;
  }

  return {
    loadFromDisk,
    saveImmediate,
    flush,
    attachAutoSave,
    dispose,
  };
}
