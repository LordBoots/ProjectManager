import { BusEvents } from '../core/EventBus.js';
import { defaultSettings } from '../data/schema/defaults.js';
import { mergeSuggestions } from '../data/repositories/projectRepository.js';
import { ensureDevPeerId } from './peerIdentity.js';

const SCHEMA_VERSION = 1;

/** @returns {typeof import('peerjs').default} */
function getPeerConstructor() {
  const P = globalThis.Peer;
  if (typeof P !== 'function') {
    throw new Error(
      '[SuggestionsPeerTransport] PeerJS global missing. Load ./node_modules/peerjs/dist/peerjs.min.js before Framework/main.js.',
    );
  }
  return P;
}

/** @typedef {'idle'|'disconnected'|'connecting'|'connected'|'error'} PeerSyncStatus */

/**
 * @param {Record<string, unknown> | undefined} settings
 */
function buildPeerOptions(settings) {
  const d = defaultSettings();
  const host = typeof settings?.peerRelayHost === 'string' ? settings.peerRelayHost.trim() : '';
  if (!host) return undefined;
  const portRaw = Number(settings?.peerRelayPort);
  const port = Number.isFinite(portRaw) ? portRaw : d.peerRelayPort;
  const pathStr = typeof settings?.peerRelayPath === 'string' ? settings.peerRelayPath : d.peerRelayPath;
  const secure = settings?.peerRelaySecure !== false;
  const key =
    typeof settings?.peerRelayKey === 'string' && settings.peerRelayKey.trim()
      ? settings.peerRelayKey.trim()
      : d.peerRelayKey;
  return { host, port, path: pathStr || '/', secure, key };
}

/**
 * @param {unknown} buf
 */
function parseMessage(buf) {
  const text =
    typeof buf === 'string'
      ? buf
      : buf instanceof ArrayBuffer
        ? new TextDecoder().decode(buf)
        : String(buf);
  const msg = JSON.parse(text);
  if (!msg || typeof msg !== 'object') return null;
  return msg;
}

/**
 * @param {{
 *   store: ReturnType<typeof import('../data/store/ProjectStore.js').createProjectStore>,
 *   bus: ReturnType<typeof import('../core/EventBus.js').createEventBus>,
 *   developer: boolean,
 *   persistence: ReturnType<typeof import('./localDataPersistence.js').createPersistence>,
 * }} opts
 */
export function createSuggestionsPeerTransport(opts) {
  const { store, bus, developer, persistence } = opts;

  /** @type {import('peerjs').Peer | null} */
  let peer = null;
  let disposed = false;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let viewerRetryTimer = null;
  let viewerBackoffMs = 2000;
  /** @type {import('peerjs').DataConnection | null} */
  let viewerConn = null;
  /** @type {Set<import('peerjs').DataConnection>} */
  const devConnections = new Set();

  function currentSettings() {
    return store.getState().settings || defaultSettings();
  }

  function signSettings() {
    const s = currentSettings();
    return JSON.stringify({
      host: s.peerRelayHost,
      port: s.peerRelayPort,
      path: s.peerRelayPath,
      secure: s.peerRelaySecure,
      key: s.peerRelayKey,
      remote: s.remoteDevPeerId,
    });
  }

  let settingsSig = signSettings();

  /**
   * @param {PeerSyncStatus} status
   * @param {string} [detail]
   */
  function emitStatus(status, detail = '') {
    bus.emit(BusEvents.SUGGESTIONS_PEER_STATUS, { status, detail });
  }

  function destroyPeer() {
    try {
      peer?.destroy();
    } catch {
      // ignore
    }
    peer = null;
    viewerConn = null;
    devConnections.clear();
  }

  function snapshotFromStore() {
    const s = store.getState().suggestions;
    return {
      items: Array.isArray(s?.items) ? s.items : [],
      archived: Array.isArray(s?.archived) ? s.archived : [],
    };
  }

  function broadcastSnapshotToViewers() {
    const payload = snapshotFromStore();
    const line = JSON.stringify({ type: 'snapshot', payload });
    for (const c of devConnections) {
      try {
        if (c.open) c.send(line);
      } catch {
        // ignore
      }
    }
  }

  /**
   * @param {import('peerjs').DataConnection} conn
   * @param {unknown} buf
   */
  function onDevConnectionData(conn, buf) {
    let msg;
    try {
      msg = parseMessage(buf);
    } catch {
      return;
    }
    if (!msg) return;

    if (msg.type === 'submit' && msg.payload && typeof msg.payload === 'object') {
      const item = /** @type {{ item?: unknown }} */ (msg.payload).item;
      if (!item || typeof item !== 'object') return;
      store.updateSuggestions((s) => {
        const it = /** @type {{ id?: unknown }} */ (item);
        const id = typeof it.id === 'string' ? it.id : '';
        if (!id) return;
        const idx = s.items.findIndex((x) => x.id === id);
        if (idx >= 0) s.items[idx] = /** @type {(typeof s.items)[number]} */ (item);
        else s.items.push(/** @type {(typeof s.items)[number]} */ (item));
      });
      persistence.saveImmediate({ skipUidBump: true });
      try {
        conn.send(
          JSON.stringify({
            type: 'ack',
            payload: { id: /** @type {{ id: string }} */ (item).id },
          }),
        );
      } catch {
        // ignore
      }
      broadcastSnapshotToViewers();
      return;
    }

    if (msg.type === 'hello') {
      try {
        conn.send(
          JSON.stringify({
            type: 'hello',
            payload: { role: 'dev', schemaVersion: SCHEMA_VERSION },
          }),
        );
        conn.send(JSON.stringify({ type: 'snapshot', payload: snapshotFromStore() }));
      } catch {
        // ignore
      }
    }
  }

  async function startDev() {
    const Peer = getPeerConstructor();
    const id = await ensureDevPeerId();
    const po = buildPeerOptions(currentSettings());
    peer = po ? new Peer(id, po) : new Peer(id);

    peer.on('open', () => {
      emitStatus('connected', id);
    });

    peer.on('error', (err) => {
      console.error('[PeerJS dev]', err);
      emitStatus('error', String(err && /** @type {{ message?: string }} */ (err).message ? /** @type {{ message?: string }} */ (err).message : err));
    });

    peer.on('connection', (conn) => {
      devConnections.add(conn);
      conn.on('open', () => {
        try {
          conn.send(
            JSON.stringify({
              type: 'hello',
              payload: { role: 'dev', schemaVersion: SCHEMA_VERSION },
            }),
          );
          conn.send(JSON.stringify({ type: 'snapshot', payload: snapshotFromStore() }));
        } catch {
          // ignore
        }
      });
      conn.on('data', (data) => onDevConnectionData(conn, data));
      conn.on('close', () => {
        devConnections.delete(conn);
      });
    });
  }

  function clearViewerTimer() {
    if (viewerRetryTimer) {
      clearTimeout(viewerRetryTimer);
      viewerRetryTimer = null;
    }
  }

  function flushViewerOutbox(conn) {
    const items = store.getState().suggestionsOutbox?.items ?? [];
    for (const item of items) {
      try {
        conn.send(JSON.stringify({ type: 'submit', payload: { item } }));
      } catch {
        break;
      }
    }
  }

  /**
   * @param {import('peerjs').DataConnection} conn
   * @param {unknown} buf
   */
  function onViewerData(conn, buf) {
    let msg;
    try {
      msg = parseMessage(buf);
    } catch {
      return;
    }
    if (!msg) return;

    if (msg.type === 'snapshot' && msg.payload) {
      const merged = mergeSuggestions(msg.payload);
      store.updateSuggestions((s) => {
        s.items = merged.items;
        s.archived = merged.archived;
      });
      return;
    }

    if (msg.type === 'ack' && msg.payload && typeof msg.payload === 'object') {
      const id = /** @type {{ id?: unknown }} */ (msg.payload).id;
      if (typeof id !== 'string' || !id.trim()) return;
      store.updateSuggestionsOutbox((ob) => {
        ob.items = ob.items.filter((x) => x.id !== id);
      });
      return;
    }

    if (msg.type === 'error' && msg.payload && typeof msg.payload === 'object') {
      const detail = /** @type {{ message?: unknown }} */ (msg.payload).message;
      emitStatus('error', typeof detail === 'string' ? detail : 'Peer error');
    }
  }

  function scheduleViewerReconnect() {
    if (disposed || developer) return;
    clearViewerTimer();
    viewerRetryTimer = setTimeout(() => {
      viewerRetryTimer = null;
      connectViewer();
    }, viewerBackoffMs);
    viewerBackoffMs = Math.min(30000, Math.round(viewerBackoffMs * 1.35));
  }

  function connectViewer() {
    if (disposed || developer) return;
    const remoteId = String(currentSettings().remoteDevPeerId ?? '').trim();
    if (!remoteId) {
      emitStatus('disconnected', 'Set the developer Peer id below.');
      destroyPeer();
      scheduleViewerReconnect();
      return;
    }

    emitStatus('connecting', remoteId);
    destroyPeer();
    viewerBackoffMs = 2000;

    const Peer = getPeerConstructor();
    const po = buildPeerOptions(currentSettings());
    peer = po ? new Peer(undefined, po) : new Peer();

    peer.on('error', (err) => {
      console.error('[PeerJS viewer]', err);
      emitStatus('error', String(err && /** @type {{ message?: string }} */ (err).message ? /** @type {{ message?: string }} */ (err).message : err));
      scheduleViewerReconnect();
    });

    peer.on('open', () => {
      if (!peer) return;
      try {
        const conn = peer.connect(remoteId, { reliable: true });
        viewerConn = conn;
        conn.on('open', () => {
          emitStatus('connected', remoteId);
          try {
            conn.send(
              JSON.stringify({
                type: 'hello',
                payload: { role: 'viewer', schemaVersion: SCHEMA_VERSION },
              }),
            );
            flushViewerOutbox(conn);
          } catch {
            // ignore
          }
        });
        conn.on('data', (data) => onViewerData(conn, data));
        conn.on('close', () => {
          viewerConn = null;
          emitStatus('disconnected', 'Disconnected — retrying…');
          scheduleViewerReconnect();
        });
      } catch (e) {
        console.error('[PeerJS viewer connect]', e);
        scheduleViewerReconnect();
      }
    });
  }

  /** Re-flush when outbox gains items while connected */
  let lastOutboxLen = -1;
  const unsubStore = store.subscribe((st) => {
    if (developer || disposed) return;
    const items = st.suggestionsOutbox?.items ?? [];
    if (viewerConn && viewerConn.open && items.length > lastOutboxLen) {
      flushViewerOutbox(viewerConn);
    }
    lastOutboxLen = items.length;
  });

  let lastDevSuggestionsRef = store.getState().suggestions;
  let devBcastTimer = null;
  const unsubDevSnapshot = developer
    ? store.subscribe((st) => {
        if (disposed) return;
        if (st.suggestions === lastDevSuggestionsRef) return;
        lastDevSuggestionsRef = st.suggestions;
        clearTimeout(devBcastTimer);
        devBcastTimer = setTimeout(() => {
          broadcastSnapshotToViewers();
        }, 300);
      })
    : null;

  async function start() {
    if (disposed) return;
    if (developer) {
      emitStatus('connecting', 'Starting…');
      await startDev();
    } else {
      emitStatus('disconnected', 'Connecting…');
      connectViewer();
    }
  }

  /** Watch relay / remote id; restart transport when relevant fields change */
  const unsubSettings = store.subscribe(() => {
    if (developer || disposed) return;
    const next = signSettings();
    if (next !== settingsSig) {
      settingsSig = next;
      viewerBackoffMs = 2000;
      clearViewerTimer();
      connectViewer();
    }
  });

  function dispose() {
    disposed = true;
    clearViewerTimer();
    if (devBcastTimer) clearTimeout(devBcastTimer);
    if (unsubDevSnapshot) unsubDevSnapshot();
    destroyPeer();
    unsubStore();
    unsubSettings();
  }

  return { start, dispose };
}
