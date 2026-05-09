export function createSettingsFeature(ctx) {
  const root = document.createElement('div');
  const numberInRange = (v, fallback, min, max) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  };

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

  const mmTitle = document.createElement('p');
  mmTitle.className = 'pm-pane-title';
  mmTitle.style.marginTop = '1.25rem';
  mmTitle.textContent = 'Mind map';

  const linkThicknessLbl = document.createElement('div');
  linkThicknessLbl.className = 'pm-label';
  linkThicknessLbl.textContent = 'Link thickness';

  const linkThicknessRow = document.createElement('div');
  linkThicknessRow.className = 'pm-toolbar';
  linkThicknessRow.style.marginBottom = '0';

  const linkThickness = document.createElement('input');
  linkThickness.type = 'range';
  linkThickness.min = '1';
  linkThickness.max = '8';
  linkThickness.step = '0.5';
  linkThickness.value = String(numberInRange(ctx.store.getState().settings?.mindmapLinkThickness, 2, 1, 8));

  const linkThicknessValue = document.createElement('span');
  linkThicknessValue.className = 'pm-muted';
  linkThicknessValue.textContent = `${linkThickness.value}px`;
  linkThicknessRow.append(linkThickness, linkThicknessValue);

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

  linkThickness.addEventListener('input', () => {
    const v = Number(linkThickness.value);
    linkThicknessValue.textContent = `${v}px`;
    debounceSettings((s) => {
      s.mindmapLinkThickness = v;
    });
  });

  root.append(title, hint, lbl, input, lblBr, branchInput, mmTitle, linkThicknessLbl, linkThicknessRow);

  return {
    root,
    unmount() {
      if (tid) clearTimeout(tid);
    },
  };
}
