const LS_KEY = 'pm-dev-peer-identity';

/**
 * Persistent developer Peer id for PeerJS (Electron userData via preload, else localStorage).
 * @returns {Promise<string | null>}
 */
export async function loadDevPeerId() {
  try {
    if (typeof window !== 'undefined' && window.electronAPI?.getPeerIdentity) {
      const r = await window.electronAPI.getPeerIdentity();
      if (r && typeof r.peerId === 'string' && r.peerId.trim()) return r.peerId.trim();
    }
  } catch {
    // fall through
  }
  if (typeof localStorage !== 'undefined') {
    const s = localStorage.getItem(LS_KEY);
    if (s && s.trim()) return s.trim();
  }
  return null;
}

/**
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function saveDevPeerId(id) {
  const peerId = String(id ?? '').trim();
  if (!peerId) return false;
  try {
    if (typeof window !== 'undefined' && window.electronAPI?.setPeerIdentity) {
      return Boolean(await window.electronAPI.setPeerIdentity(peerId));
    }
  } catch {
    // fall through
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LS_KEY, peerId);
    return true;
  }
  return false;
}

/**
 * @returns {Promise<string>}
 */
export async function ensureDevPeerId() {
  let id = await loadDevPeerId();
  if (id) return id;
  id = crypto.randomUUID();
  await saveDevPeerId(id);
  return id;
}
