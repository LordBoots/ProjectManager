import { loadAllProjectData, saveAllProjectData } from '../data/repositories/projectRepository.js';
import { newDataUid } from './dataUid.js';

let timer = null;

export function createPersistence({ fs, store, debounceMs = 450 }) {
  /** Suppress rebound autosave while applying a rotated snapshot id post-flush */
  let suppressAutoSaveRoundTrip = false;
  /** Exclude the synchronous initial subscribe(...) callback so idle boot does not rotate disk */
  let skipInitialPersistNotify = true;

  function flush(/** @type {{ skipUidBump?: boolean }} */ opts = {}) {
    const skipBump = opts.skipUidBump === true;
    const st = store.getState();

    if (skipBump) {
      saveAllProjectData(fs, st);
      return;
    }

    const uid = newDataUid();
    suppressAutoSaveRoundTrip = true;
    try {
      saveAllProjectData(fs, { ...st, version: { uid } });
      store.patch({ version: { uid } });
    } finally {
      queueMicrotask(() => {
        suppressAutoSaveRoundTrip = false;
      });
    }
  }

  function scheduleSave() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, debounceMs);
  }

  function loadFromDisk() {
    suppressAutoSaveRoundTrip = true;
    try {
      store.replace(loadAllProjectData(fs));
    } finally {
      queueMicrotask(() => {
        suppressAutoSaveRoundTrip = false;
      });
    }
  }

  function saveImmediate(/** @type {{ skipUidBump?: boolean }} */ opts = {}) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    flush(opts);
  }

  let unsub = null;

  function attachAutoSave() {
    if (unsub) return unsub;
    unsub = store.subscribe(() => {
      if (skipInitialPersistNotify) {
        skipInitialPersistNotify = false;
        return;
      }
      if (suppressAutoSaveRoundTrip) return;
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
