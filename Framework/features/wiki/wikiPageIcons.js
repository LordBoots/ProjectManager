const IMG_PREFIX = 'img:';

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

/**
 * Stored wiki page icons:
 * — Emoji/text (legacy default): `"📄"`
 * — Bundled file name: `"img:filename.png"` under `src/Images/wiki-page-icons/`
 */

/**
 * @param {string | undefined | null} icon
 * @returns {string} Resolved URL or "" if not a bundled image ref.
 */
export function resolveWikiPageIconUrl(icon) {
  if (typeof icon !== 'string') return '';
  const t = icon.trim();
  if (!t.startsWith(IMG_PREFIX)) return '';
  const name = t.slice(IMG_PREFIX.length).trim();
  if (!SAFE_NAME.test(name)) return '';
  try {
    return new URL(`../../../src/Images/wiki-page-icons/${name}`, import.meta.url).href;
  } catch {
    return '';
  }
}

/**
 * @param {string | undefined | null} icon
 */
export function wikiPageUsesBundledIcon(icon) {
  return !!resolveWikiPageIconUrl(icon);
}

/**
 * @param {File} file
 * @returns {string | null} `img:basename` or null if rejected
 */
export function storedIconFromPickedFile(file) {
  if (!file?.name || typeof file.name !== 'string') return null;
  const base = file.name.trim().replace(/\\/g, '/').split('/').pop() ?? '';
  if (!SAFE_NAME.test(base)) return null;
  return `${IMG_PREFIX}${base}`;
}
