import { FILES } from '../data/repositories/projectRepository.js';

/**
 * GitHub raw: parse repo URL hint, compare `Data/version.json` snapshot ids, optionally pull full `Data/`.
 */

function sanitizeGithubBranch(/** @type {unknown} */ branch) {
  const t = typeof branch === 'string' ? branch.trim() : '';
  if (!t) return 'main';
  if (!/^[a-zA-Z0-9/_.-]+$/.test(t)) return 'main';
  return t;
}

function guessRawGithubUrls(repoRootUrl, githubBranchName) {
  const u = repoRootUrl.trim().replace(/\/$/, '');
  if (!u) return null;
  const m = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/i.exec(u);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2];
  const branch = sanitizeGithubBranch(githubBranchName);
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
  return {
    versionUrl: `${base}/Data/version.json`,
    dataRoot: `${base}/Data`,
  };
}

/** Bypass stale CDN/browser cache on branch-linked raw URLs (GitHub caches aggressively). */
function cacheBustRawUrl(url) {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_cb=${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Fetch every `Data/*.json` from raw GitHub and write into local `Data/`.
 * Validates JSON for each file before writing any of them.
 * @param {ReturnType<typeof import('../platform/electronFs.js').createFsAdapter>} fs
 * @param {string} dataRoot e.g. `https://raw.githubusercontent.com/o/r/main/Data`
 */
export async function replaceLocalDataFromGithubRaw(fs, dataRoot) {
  const base = String(dataRoot).replace(/\/$/, '');
  const names = /** @type {string[]} */ (Object.values(FILES)).filter((name) => name !== FILES.wiki);

  /** @type {Record<string, unknown>} */
  const blobs = {};
  for (const name of names) {
    blobs[name] = await fetchJsonObject(`${base}/${name}`, name);
  }
  for (const name of names) {
    fs.writeJSON(fs.dataPath(name), blobs[name]);
  }

  await replaceLocalWikiFromGithubRaw(fs, base);
}

/**
 * @param {string} url
 * @param {string} label
 */
async function fetchJsonObject(url, label) {
  const res = await fetch(cacheBustRawUrl(url), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Fetch ${label} failed (${res.status})`);
  const txt = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(txt);
  } catch {
    throw new Error(`Remote ${label} is not valid JSON`);
  }
  if (!parsed || typeof parsed !== 'object') throw new Error(`Remote ${label} must be a JSON object`);
  return parsed;
}

/**
 * Downloads listed `wiki/pages/*.md` files. Raw GitHub has no folder listing; the repo may expose `wiki/index.json`
 * only as a manifest of paths. Writes Markdown files under `Data/wiki/pages/` — does **not** write `wiki/index.json` locally.
 *
 * @param {ReturnType<typeof import('../platform/electronFs.js').createFsAdapter>} fs
 * @param {string} base
 */
async function replaceLocalWikiFromGithubRaw(fs, base) {
  try {
    const index = await fetchJsonObject(`${base}/wiki/index.json`, 'wiki/index.json');
    const pages = Array.isArray(/** @type {{ pages?: unknown }} */ (index).pages)
      ? /** @type {{ file?: unknown }[]} */ (/** @type {{ pages: unknown[] }} */ (index).pages)
      : [];
    const markdown = /** @type {Record<string, string>} */ ({});
    for (const page of pages) {
      const file = typeof page.file === 'string' ? page.file.replace(/\\/g, '/').replace(/^\/+/, '') : '';
      if (!file || !file.startsWith('pages/') || !file.toLowerCase().endsWith('.md')) continue;
      const res = await fetch(cacheBustRawUrl(`${base}/wiki/${file}`), { cache: 'no-store' });
      if (!res.ok) throw new Error(`Fetch wiki/${file} failed (${res.status})`);
      markdown[file] = await res.text();
    }
    for (const [file, content] of Object.entries(markdown)) {
      fs.writeFile(fs.dataPath('wiki', file), content);
    }
    return;
  } catch (err) {
    const legacy = await fetchJsonObject(`${base}/${FILES.wiki}`, FILES.wiki);
    fs.writeJSON(fs.dataPath(FILES.wiki), legacy);
  }
}

/** Must match LEGACY_SEMVER_UID_PREFIX in projectRepository.loadVersionJson. */
const LEGACY_SEMVER_UID_PREFIX = 'legacy-semver:';

/**
 * @param {unknown} j
 * @returns {string}
 */
function parseSnapshotIdFromVersionJson(j) {
  if (!j || typeof j !== 'object') throw new Error('Invalid version.json');
  const rec = /** @type {Record<string, unknown>} */ (j);
  if (typeof rec.uid === 'string' && rec.uid.trim().length > 0) return rec.uid.trim();
  if (typeof rec.version === 'string' && rec.version.trim().length > 0) {
    return `${LEGACY_SEMVER_UID_PREFIX}${rec.version.trim()}`;
  }
  throw new Error('Invalid version.json (expected uid or legacy version)');
}

export async function fetchRemoteSnapshotId(versionUrl) {
  const url = cacheBustRawUrl(versionUrl);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Snapshot fetch failed: ${res.status}`);
  try {
    const j = await res.json();
    return parseSnapshotIdFromVersionJson(j);
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}

/** @deprecated use fetchRemoteSnapshotId */
export const fetchRemoteVersion = fetchRemoteSnapshotId;

export function describeGitDataReplace() {
  return 'Compare `Data/version.json` ids with GitHub; if they differ Sync downloads the remote `Data` JSON files, wiki Markdown files, and reloads.';
}

export function parseRepoHint(settings) {
  const hint = settings?.remoteRepoHint?.trim() || '';
  const branch = settings?.remoteGithubBranch ?? '';
  return guessRawGithubUrls(hint, branch);
}
