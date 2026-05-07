/**
 * Bundled images under project `src/Images/`.
 * Resolve from **this module** (`Framework/features/shared/`) so paths match Overview hero tiles
 * (`../../../src/Images/…`) everywhere — same pattern everywhere we load shipped artwork.
 */

const TO_SRC_IMAGES = '../../../src/Images/';

/**
 * @param {string} fileName basename only (e.g. `mind_map.png`)
 */
export function mindMapHeroHref() {
  return new URL(`${TO_SRC_IMAGES}mind_map.png`, import.meta.url).href;
}

/** @returns {string} */
export function kanbanHeroHref() {
  return new URL(`${TO_SRC_IMAGES}kanban.png`, import.meta.url).href;
}

/**
 * @param {string} fileName basename under `wiki-page-icons/`
 * @returns {string}
 */
export function wikiPageIconBundledHref(fileName) {
  return new URL(`${TO_SRC_IMAGES}wiki-page-icons/${fileName}`, import.meta.url).href;
}
