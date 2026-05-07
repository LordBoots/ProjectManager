/** Placeholder PeerJS wiring — transports should write through the same `data/` hydration path later. */

export function createPeerSyncPlaceholder() {
  return {
    isEnabled: () => false,
    start() {},
    stop() {},
  };
}
