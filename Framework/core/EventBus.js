/**
 * Minimal pub/sub for cross-feature UI (hover → highlight suggestions, etc.).
 */
export function createEventBus() {
  const listeners = new Map();

  function on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => off(event, handler);
  }

  function off(event, handler) {
    const set = listeners.get(event);
    if (!set) return;
    set.delete(handler);
  }

  function emit(event, payload) {
    const set = listeners.get(event);
    if (!set) return;
    for (const h of set) {
      try {
        h(payload);
      } catch (e) {
        console.error('[EventBus]', event, e);
      }
    }
  }

  return { on, off, emit };
}

/** @enum {string} */
export const BusEvents = {
  ENTITY_HOVER: 'entity:hover',
  ENTITY_HOVER_END: 'entity:hoverEnd',
  OPEN_SUGGESTION_FORM: 'suggestions:openForm',
  HIGHLIGHT_SUGGESTIONS: 'suggestions:highlight',
  NAVIGATE_TO_ENTITY: 'navigate:entity',
};
