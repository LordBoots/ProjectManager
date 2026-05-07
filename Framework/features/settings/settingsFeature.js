export function createSettingsFeature(ctx) {
  const root = document.createElement('div');

  const title = document.createElement('p');
  title.className = 'pm-pane-title';
  title.textContent = 'Developer settings';

  const hint = document.createElement('p');
  hint.className = 'pm-muted';
  hint.style.maxWidth = '520px';
  hint.textContent =
    'GitHub repo + branch used for Sync. Snapshot id comes from Data/version.json. If GitHub differs, Sync replaces all local Data JSON from raw.githubusercontent.com (branch default main), then restores this repo URL/branch above. Uses cache-busting on each fetch.';

  const lbl = document.createElement('div');
  lbl.className = 'pm-label';
  lbl.textContent = 'Repository URL';

  const input = document.createElement('input');
  input.className = 'pm-input';
  input.placeholder = 'https://github.com/user/repo';

  input.value = ctx.store.getState().settings?.remoteRepoHint || '';

  const lblBr = document.createElement('div');
  lblBr.className = 'pm-label';
  lblBr.textContent = 'Git branch for raw files';

  const branchInput = document.createElement('input');
  branchInput.className = 'pm-input';
  branchInput.placeholder = 'main';
  branchInput.value = ctx.store.getState().settings?.remoteGithubBranch || '';

  let tid = null;
  function debounceSettings(mut) {
    clearTimeout(tid);
    tid = setTimeout(() => {
      ctx.store.updateSettings(mut);
    }, 300);
  }

  input.addEventListener('input', () => {
    const v = input.value.trim();
    debounceSettings((s) => {
      s.remoteRepoHint = v;
    });
  });

  branchInput.addEventListener('input', () => {
    const v = branchInput.value.trim();
    debounceSettings((s) => {
      s.remoteGithubBranch = v;
    });
  });

  root.append(title, hint, lbl, input, lblBr, branchInput);

  return {
    root,
    unmount() {
      if (tid) clearTimeout(tid);
    },
  };
}
