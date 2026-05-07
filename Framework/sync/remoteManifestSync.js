/**
 * Lightweight "manifest" comparison for optional manual sync from a repo URL hint.
 * Fetches `{ dataFolderUrl, versionUrl }`-style guesses from user-provided repo root string.
 */

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
    versionUrl: `${base}/data/version.json`,
    dataRoot: base,
  };
}

export async function fetchRemoteVersion(versionUrl) {
  const res = await fetch(versionUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Version fetch failed: ${res.status}`);
  const j = await res.json();
  if (!j || typeof j.version !== 'string') throw new Error('Invalid version.json');
  return j.version;
}

export function buildSyncHintMessage(localVersion, remoteVersion) {
  if (localVersion === remoteVersion) {
    return `Up to date (${localVersion}).`;
  }
  return `Remote ${remoteVersion} differs from local ${localVersion}. Replace local data from git as described in project docs.`;
}

export function describeGitDataReplace() {
  return 'Download the repo `data` folder and replace your local `data` directory, then press Sync to reload from disk.';
}

export function parseRepoHint(settings) {
  const hint = settings?.remoteRepoHint?.trim() || '';
  return guessRawGithubUrls(hint);
}
