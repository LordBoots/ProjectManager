/**
 * GitHub-style slug for a markdown heading line (ATX: `# Title`).
 * @param {string} line
 * @returns {{ slug: string } | null}
 */
export function slugFromAtxHeadingLine(line) {
  const m = /^\s{0,3}(#{1,6})\s*(.+?)\s*$/.exec(line);
  if (!m) return null;
  let title = m[2].replace(/\s+#+\s*$/, '').trim();
  title = title.replace(/:\s*$/, '').trim();
  const slug = slugifyAnchorFragment(title);
  return slug ? { slug } : null;
}

/**
 * Match `[label](#fragment)` style anchors to heading lines.
 * @param {string} text
 */
export function slugifyAnchorFragment(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * @param {string} markdown
 * @param {string} slug
 * @returns {number | null} 1-based line number
 */
export function findHeadingLineNumberBySlug(markdown, slug) {
  const want = String(slug || '').trim().toLowerCase();
  if (!want) return null;
  const lines = String(markdown || '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const parsed = slugFromAtxHeadingLine(lines[i]);
    if (parsed && parsed.slug === want) return i + 1;
  }
  return null;
}

/**
 * Resolve `href` from `[label](href)` against wiki page id (`pages/foo.md`).
 * @param {string} basePageId
 * @param {string} href raw href (optional `"title"` suffix stripped by caller)
 * @returns {{ kind: 'wiki', pageId: string, hash?: string } | { kind: 'external', href: string } | null}
 */
export function resolveMarkdownHrefToWikiTarget(basePageId, href) {
  const raw = String(href || '').trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) return { kind: 'external', href: raw };
  if (/^mailto:/i.test(raw)) return { kind: 'external', href: raw };

  let pathPart = raw;
  let hash = '';
  const hashIdx = pathPart.indexOf('#');
  if (hashIdx >= 0) {
    hash = pathPart.slice(hashIdx + 1);
    try {
      hash = decodeURIComponent(hash);
    } catch {
      /* keep */
    }
    pathPart = pathPart.slice(0, hashIdx).trim();
  }

  const base = String(basePageId || '').trim();
  if (!base.startsWith('pages/')) return null;

  if (!pathPart) {
    return { kind: 'wiki', pageId: base, ...(hash ? { hash } : {}) };
  }

  const normalizedSlash = pathPart.replace(/\\/g, '/');
  const baseParts = base.split('/').filter(Boolean);
  baseParts.pop();
  /** @type {string[]} */
  let segments;
  if (normalizedSlash.startsWith('/')) {
    segments = normalizedSlash.slice(1).split('/').filter(Boolean);
  } else {
    segments = normalizedSlash.split('/').filter(Boolean);
  }

  const stack = [...baseParts];
  for (const seg of segments) {
    if (seg === '..') stack.pop();
    else if (seg !== '.') stack.push(seg);
  }

  let pageId = stack.join('/');
  if (!pageId.toLowerCase().endsWith('.md')) {
    pageId = `${pageId}.md`;
  }
  if (!pageId.startsWith('pages/')) return null;

  return { kind: 'wiki', pageId, ...(hash ? { hash } : {}) };
}

/**
 * Strip optional `("title")` / `('title')` from markdown link destination.
 * @param {string} inner content inside `(...)` in `[text](...)`
 */
export function stripMarkdownLinkTitleSuffix(inner) {
  let s = String(inner || '').trim();
  const sp = s.search(/\s["']/);
  if (sp >= 0) s = s.slice(0, sp).trim();
  return s;
}
