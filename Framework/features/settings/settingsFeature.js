export function createSettingsFeature(ctx) {
  const root = document.createElement('div');

  const title = document.createElement('p');
  title.className = 'pm-pane-title';
  title.textContent = 'Developer settings';

  const hint = document.createElement('p');
  hint.className = 'pm-muted';
  hint.style.maxWidth = '520px';
  hint.textContent =
    'Optional GitHub repo root for remote version check (uses raw.githubusercontent.com main branch). Replace local data from git manually; use Sync to reload from disk.';

  const lbl = document.createElement('div');
  lbl.className = 'pm-label';
  lbl.textContent = 'Repository URL';

  const input = document.createElement('input');
  input.className = 'pm-input';
  input.placeholder = 'https://github.com/user/repo';

  input.value = ctx.store.getState().settings?.remoteRepoHint || '';

  let tid = null;
  input.addEventListener('input', () => {
    clearTimeout(tid);
    tid = setTimeout(() => {
      const v = input.value.trim();
      ctx.store.updateSettings((s) => {
        s.remoteRepoHint = v;
      });
    }, 300);
  });

  root.append(title, hint, lbl, input);

  return {
    root,
    unmount() {
      if (tid) clearTimeout(tid);
    },
  };
}
