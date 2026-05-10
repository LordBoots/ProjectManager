export function createSettingsFeature(ctx) {
  const root = document.createElement('div');
  const settings = ctx.store.getState().settings || {};
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

  input.value = settings.remoteRepoHint || '';

  const lblBr = document.createElement('div');
  lblBr.className = 'pm-label';
  lblBr.textContent = 'Git branch for raw files';

  const branchInput = document.createElement('input');
  branchInput.className = 'pm-input';
  branchInput.placeholder = 'main';
  branchInput.value = settings.remoteGithubBranch || '';

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
  linkThickness.value = String(numberInRange(settings.mindmapLinkThickness, 2, 1, 8));

  const linkThicknessValue = document.createElement('span');
  linkThicknessValue.className = 'pm-muted';
  linkThicknessValue.textContent = `${linkThickness.value}px`;
  linkThicknessRow.append(linkThickness, linkThicknessValue);

  const imageLinkThicknessLbl = document.createElement('div');
  imageLinkThicknessLbl.className = 'pm-label';
  imageLinkThicknessLbl.textContent = 'Image link thickness';

  const imageLinkThicknessRow = document.createElement('div');
  imageLinkThicknessRow.className = 'pm-toolbar';
  imageLinkThicknessRow.style.marginBottom = '0';

  const imageLinkThickness = document.createElement('input');
  imageLinkThickness.type = 'range';
  imageLinkThickness.min = '1';
  imageLinkThickness.max = '8';
  imageLinkThickness.step = '0.5';
  imageLinkThickness.value = String(numberInRange(settings.mindmapImageLinkThickness, 2, 1, 8));

  const imageLinkThicknessValue = document.createElement('span');
  imageLinkThicknessValue.className = 'pm-muted';
  imageLinkThicknessValue.textContent = `${imageLinkThickness.value}px`;
  imageLinkThicknessRow.append(imageLinkThickness, imageLinkThicknessValue);

  const imageLinkColorLbl = document.createElement('div');
  imageLinkColorLbl.className = 'pm-label';
  imageLinkColorLbl.textContent = 'Image link color';

  const imageLinkColor = document.createElement('input');
  imageLinkColor.type = 'color';
  imageLinkColor.value = /^#[0-9a-f]{6}$/i.test(String(settings.mindmapImageLinkColor || ''))
    ? String(settings.mindmapImageLinkColor)
    : '#7d869a';

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

  imageLinkThickness.addEventListener('input', () => {
    const v = Number(imageLinkThickness.value);
    imageLinkThicknessValue.textContent = `${v}px`;
    debounceSettings((s) => {
      s.mindmapImageLinkThickness = v;
    });
  });

  imageLinkColor.addEventListener('input', () => {
    const v = imageLinkColor.value;
    debounceSettings((s) => {
      s.mindmapImageLinkColor = v;
    });
  });

  root.append(
    title,
    hint,
    lbl,
    input,
    lblBr,
    branchInput,
    mmTitle,
    linkThicknessLbl,
    linkThicknessRow,
    imageLinkThicknessLbl,
    imageLinkThicknessRow,
    imageLinkColorLbl,
    imageLinkColor
  );

  return {
    root,
    unmount() {
      if (tid) clearTimeout(tid);
    },
  };
}
