import { wikiPageIconBundledHref } from '../shared/assetUrls.js';

const IMG_PREFIX = 'img:';

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

/**
 * Wiki page `pages[].icon` values:
 * — Emoji/text: `"📄"`
 * — Picked/uploaded image: `data:image/...;base64,...` (same approach as mind map / wiki image blocks)
 * — Legacy bundled ref: `"img:file.png"` under `src/Images/wiki-page-icons/`
 */

/**
 * @param {string | undefined | null} icon
 * @returns {string} URL/`data:` for <img>, or "" for emoji/non-image.
 */
export function resolveWikiPageIconUrl(icon) {
  if (typeof icon !== 'string') return '';
  const t = icon.trim();
  if (t.startsWith('data:image')) return t;
  if (/^https?:\/\//i.test(t)) return t;

  if (!t.startsWith(IMG_PREFIX)) return '';
  const name = t.slice(IMG_PREFIX.length).trim();
  if (!SAFE_NAME.test(name)) return '';

  try {
    return wikiPageIconBundledHref(name);
  } catch {
    return '';
  }
}

/**
 * True when icon is removable to default 📄 (embedded image data URL or bundled `img:` ref).
 * @param {string | undefined | null} icon
 */
export function wikiPageUsesBundledIcon(icon) {
  const t = typeof icon === 'string' ? icon.trim() : '';
  return t.startsWith('data:image') || t.startsWith(IMG_PREFIX);
}
