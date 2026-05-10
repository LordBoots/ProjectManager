const WIKI_PAGES_DIR = 'pages';

/** Markdown files under wiki (relative to `Data/wiki/`), sorted */
export function listWikiMarkdownRelativePaths(fs) {
  const dir = fs.dataPath('wiki', WIKI_PAGES_DIR);
  if (typeof fs.readDir !== 'function') return [];
  let names = [];
  try {
    names = fs.readDir(dir);
  } catch {
    return [];
  }
  return names
    .filter((name) => typeof name === 'string' && name.toLowerCase().endsWith('.md') && !name.startsWith('.'))
    .map((name) => `${WIKI_PAGES_DIR}/${name.replace(/\\/g, '/')}`)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Filename stem (no path, no `.md`) for sidebar / display.
 * @param {string} relative `pages/foo.md`
 */
export function wikiTitleFromRelativeMarkdownPath(relative) {
  const base = String(relative || '').split('/').pop() ?? '';
  return base.replace(/\.md$/i, '') || 'page';
}

/** @param {string} title */
export function slugifyWikiPageTitle(title) {
  const base = String(title || 'untitled-page')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return base || 'untitled-page';
}

/**
 * @param {string} slugOrTitle basis for basename
 * @param {Set<string>} usedFiles lowercase `pages/foo.md`
 */
export function makeUniqueWikiMarkdownFile(slugOrTitle, usedFiles) {
  const base = slugifyWikiPageTitle(slugOrTitle);
  let n = 1;
  while (true) {
    const suffix = n === 1 ? '' : `-${n}`;
    const file = `${WIKI_PAGES_DIR}/${base}${suffix}.md`;
    if (!usedFiles.has(file.toLowerCase())) {
      usedFiles.add(file.toLowerCase());
      return file;
    }
    n += 1;
  }
}

/** @param {unknown} raw */
function cleanText(raw) {
  return typeof raw === 'string' ? raw : '';
}

/** @param {Set<string>} usedFiles lowercase */
function legacyPageMetaToMarkdownPage(raw, usedFiles) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const rec = /** @type {Record<string, unknown>} */ (raw);
  const legacyTitle = cleanText(rec.title).trim() || 'Untitled page';
  const explicitFile = cleanText(rec.file).replace(/\\/g, '/').replace(/^\/+/, '');
  const file =
    explicitFile &&
    explicitFile.startsWith(`${WIKI_PAGES_DIR}/`) &&
    explicitFile.toLowerCase().endsWith('.md')
      ? explicitFile
      : makeUniqueWikiMarkdownFile(legacyTitle, usedFiles);
  usedFiles.add(file.toLowerCase());
  const id = file;
  const title = wikiTitleFromRelativeMarkdownPath(file);
  return { id, title, file };
}

/** @param {unknown} raw */
function normalizeLegacyPages(raw) {
  return Array.isArray(raw) ? raw : [];
}

/** @param {unknown} raw */
function normalizeLegacyBlocks(raw) {
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? /** @type {Record<string, unknown>} */ (raw) : {};
}

/** @param {unknown} raw */
function normalizeMarkdownByPageId(raw) {
  const out = /** @type {Record<string, string>} */ ({});
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [id, val] of Object.entries(/** @type {Record<string, unknown>} */ (raw))) {
    if (typeof val === 'string') out[id] = val;
  }
  return out;
}

/** @param {unknown} block */
function legacyBlockToMarkdown(block) {
  if (!block || typeof block !== 'object' || Array.isArray(block)) return '';
  const rec = /** @type {Record<string, unknown>} */ (block);
  const type = cleanText(rec.type);
  if (type === 'text') return cleanText(rec.content);
  if (type === 'image') {
    const src = cleanText(rec.src).trim();
    if (!src) return '';
    return `![${cleanText(rec.alt).replace(/\]/g, '\\]')}](${src})`;
  }
  if (type === 'separator') return '---';
  if (type === 'table') {
    const title = cleanText(rec.title).trim();
    const rows = Array.isArray(rec.rows) ? rec.rows : [];
    const escapePipeCell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
    const cells = rows
      .map((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return [];
        const rowCells = /** @type {{ cells?: unknown }} */ (row).cells;
        return Array.isArray(rowCells) ? rowCells.map((cell) => escapePipeCell(String(cell ?? ''))) : [];
      })
      .filter((row) => row.length > 0);
    if (cells.length === 0) return title ? `### ${title}` : '';
    const width = Math.max(...cells.map((row) => row.length), 1);
    const padded = cells.map((row) => Array.from({ length: width }, (_, i) => row[i] ?? ''));
    const header = padded[0];
    const sep = Array.from({ length: width }, () => '---');
    const body = padded.slice(1);
    const table = [header, sep, ...body].map((row) => `| ${row.join(' | ')} |`).join('\n');
    return title ? `### ${title}\n\n${table}` : table;
  }
  return '';
}

/**
 * @param {unknown[]} blocks
 */
function legacyBlocksToMarkdown(blocks) {
  return blocks.map(legacyBlockToMarkdown).filter((part) => part.trim()).join('\n\n');
}

/**
 * Wiki pages discovered from `Data/wiki/pages/*.md`. Page `id` is the relative path (`pages/foo.md`);
 * title is the filename stem. No `wiki/index.json` is read or written.
 *
 * @param {ReturnType<import('../../platform/electronFs.js').createFsAdapter>} fs
 * @param {unknown} legacyWiki `wiki.json` shape for one-time migration
 */
export function loadMarkdownWiki(fs, legacyWiki) {
  const legacy = legacyWiki && typeof legacyWiki === 'object' ? /** @type {Record<string, unknown>} */ (legacyWiki) : {};

  /** @type {{ id: string, title: string, file: string }[]} */
  let pages = [];
  const markdownByPageId = /** @type {Record<string, string>} */ ({});
  const legacyMarkdown = normalizeMarkdownByPageId(legacy.markdownByPageId);
  const legacyBlocks = normalizeLegacyBlocks(legacy.blocksByPageId);

  const relPathsOnDisk = listWikiMarkdownRelativePaths(fs);

  if (relPathsOnDisk.length > 0) {
    pages = relPathsOnDisk.map((file) => ({
      id: file,
      title: wikiTitleFromRelativeMarkdownPath(file),
      file,
    }));
    for (const page of pages) {
      const filePath = fs.dataPath('wiki', page.file);
      markdownByPageId[page.id] = String(fs.exists(filePath) ? fs.readFile(filePath) ?? '' : '');
    }
  } else {
    const usedFiles = new Set();
    const bootstrapRows = normalizeLegacyPages(legacy.pages);
    /** @type {{ id: string, title: string, file: string, oldMarkdownKey?: string }[]} */
    const pairs = [];
    for (const row of bootstrapRows) {
      const meta = legacyPageMetaToMarkdownPage(row, usedFiles);
      if (!meta) continue;
      const oldId =
        row && typeof row === 'object' && !Array.isArray(row)
          ? cleanText(/** @type {{ id?: unknown }} */ (row).id).trim()
          : '';
      pairs.push({
        ...meta,
        ...(oldId ? { oldMarkdownKey: oldId } : {}),
      });
    }

    if (pairs.length === 0) {
      const intro = `${WIKI_PAGES_DIR}/introduction.md`;
      pages = [
        {
          id: intro,
          title: wikiTitleFromRelativeMarkdownPath(intro),
          file: intro,
        },
      ];
      markdownByPageId[intro] = '# Introduction\n';
    } else {
      pages = pairs.map((p) => ({ id: p.id, title: p.title, file: p.file }));
      for (const pair of pairs) {
        const { id, oldMarkdownKey, file } = pair;
        let md = legacyMarkdown[id] ?? '';
        if (!md.trim() && oldMarkdownKey) md = legacyMarkdown[oldMarkdownKey] ?? '';

        /** @type {unknown[]} */
        let blocks = [];
        if (Array.isArray(legacyBlocks[id])) blocks = /** @type {unknown[]} */ (legacyBlocks[id]);
        else if (oldMarkdownKey && Array.isArray(legacyBlocks[oldMarkdownKey]))
          blocks = /** @type {unknown[]} */ (legacyBlocks[oldMarkdownKey]);

        if (!md.trim()) md = legacyBlocksToMarkdown(blocks);
        if (!md.trim() && file.toLowerCase().endsWith('introduction.md')) md = '# Introduction\n';
        markdownByPageId[id] = md;
      }
    }
  }

  return {
    pages,
    markdownByPageId,
    blocksByPageId: {},
  };
}

/**
 * @param {ReturnType<import('../../platform/electronFs.js').createFsAdapter>} fs
 * @param {{ pages?: unknown[], markdownByPageId?: Record<string, string> }} wiki
 */
export function saveMarkdownWiki(fs, wiki) {
  const rawPages = Array.isArray(wiki?.pages) ? wiki.pages : [];
  const markdownByPageId = normalizeMarkdownByPageId(wiki?.markdownByPageId);

  for (const page of rawPages) {
    if (!page || typeof page !== 'object' || Array.isArray(page)) continue;
    const rec = /** @type {{ file?: unknown, id?: unknown }} */ (page);
    const id = typeof rec.id === 'string' ? rec.id : '';
    const file = typeof rec.file === 'string' ? rec.file : id;
    if (!file || !file.startsWith(`${WIKI_PAGES_DIR}/`) || !file.toLowerCase().endsWith('.md')) continue;
    const canonical = normalizeWikiFileRelativePath(file);
    const key = normalizeWikiFileRelativePath(id) || canonical;
    const content = markdownByPageId[key] ?? markdownByPageId[canonical] ?? '';
    fs.writeFile(fs.dataPath('wiki', canonical), content);
  }
}

/** @param {string} raw */
function normalizeWikiFileRelativePath(raw) {
  const norm = raw.replace(/\\/g, '/').replace(/^\/+/u, '');
  if (!norm.startsWith(`${WIKI_PAGES_DIR}/`) || !norm.toLowerCase().endsWith('.md')) return '';
  return norm;
}
