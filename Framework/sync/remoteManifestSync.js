/**
 * Lightweight "manifest" comparison for optional manual sync from a repo URL hint.
 * Fetches `{ dataFolderUrl, versionUrl }`-style guesses from user-provided repo root string.
 */

/** GitHub raw URLs are case-sensitive; this project uses `Data/` on the repo. */
function guessRawGithubUrls(repoRootUrl) {
  const u = repoRootUrl.trim().replace(/\/$/, '');
  if (!u) return null;
  const m = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/i.exec(u);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2];
  const branch = 'main';
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
  return {
    versionUrl: `${base}/Data/version.json`,
    dataRoot: `${base}/Data`,
  };
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

/** @param {string} id */
function legacySemverValue(id) {
  if (typeof id !== 'string' || !id.startsWith(LEGACY_SEMVER_UID_PREFIX)) return null;
  const v = id.slice(LEGACY_SEMVER_UID_PREFIX.length);
  return v.length ? v : null;
}

/** Human-readable snippet for sync status text. */
function formatSnapForUi(id) {
  const sem = legacySemverValue(id);
  if (sem) return `semver:${sem}`;
  if (typeof id !== 'string' || !id.length) return '(missing)';
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…`;
}

export async function fetchRemoteVersion(versionUrl) {
  const res = await fetch(versionUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Version fetch failed: ${res.status}`);
  try {
    const j = await res.json();
    return parseSnapshotIdFromVersionJson(j);
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}

export function buildSyncHintMessage(localSnapshotId, remoteSnapshotId) {
  if (localSnapshotId === remoteSnapshotId) {
    return `Remote snapshot matches local (${formatSnapForUi(remoteSnapshotId)}).`;
  }

  const rSem = legacySemverValue(remoteSnapshotId);
  const lSem = legacySemverValue(localSnapshotId);
  const a = formatSnapForUi(remoteSnapshotId);
  const b = formatSnapForUi(localSnapshotId);

  if (rSem !== null && lSem === null) {
    return `Snapshots differ (remote semver:${rSem}, local uid ${b}). GitHub version.json still uses "version"; commit and push your local Data/version.json (uid field) to match the new snapshot format.`;
  }
  if (lSem !== null && rSem === null) {
    return `Snapshots differ (remote uid ${a}, local semver:${lSem}). Pull or merge upstream Data/version.json, then Sync to reload from disk.`;
  }

  return `Snapshots differ (${a} vs ${b}). Merge Data via git, then Sync to reload from disk.`;
}
export function describeGitDataReplace() {
  return 'Download the repo `Data` folder and replace your local data directory, then press Sync to reload from disk. Snapshot ids live in version.json.';
}

export function parseRepoHint(settings) {
  const hint = settings?.remoteRepoHint?.trim() || '';
  return guessRawGithubUrls(hint);
}
