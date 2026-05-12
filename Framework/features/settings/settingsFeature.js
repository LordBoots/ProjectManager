import { ensureDevPeerId } from '../../sync/peerIdentity.js';

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

  const peerSyncTitle = document.createElement('p');
  peerSyncTitle.className = 'pm-pane-title';
  peerSyncTitle.style.marginTop = '1.25rem';
  peerSyncTitle.textContent = 'Suggestions sync (PeerJS)';

  const peerSyncHint = document.createElement('p');
  peerSyncHint.className = 'pm-muted';
  peerSyncHint.style.maxWidth = '520px';
  peerSyncHint.textContent =
    'Viewer builds dial this stable id. Store it outside git (Electron userData). Leave relay host empty to use the default public PeerServer, or point host/port/path/key at a self-hosted peerjs-server.';

  const peerIdLbl = document.createElement('div');
  peerIdLbl.className = 'pm-label';
  peerIdLbl.textContent = 'Your developer Peer id';

  const peerIdRow = document.createElement('div');
  peerIdRow.className = 'pm-toolbar';
  peerIdRow.style.flexWrap = 'wrap';

  const peerIdInput = document.createElement('input');
  peerIdInput.className = 'pm-input';
  peerIdInput.readOnly = true;
  peerIdInput.style.flex = '1';
  peerIdInput.style.minWidth = '12rem';

  const copyPeerBtn = document.createElement('button');
  copyPeerBtn.type = 'button';
  copyPeerBtn.className = 'pm-btn';
  copyPeerBtn.textContent = 'Copy id';
  copyPeerBtn.addEventListener('click', async () => {
    const v = peerIdInput.value;
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
    } catch {
      peerIdInput.select();
      document.execCommand('copy');
    }
  });

  peerIdRow.append(peerIdInput, copyPeerBtn);

  void (async () => {
    try {
      peerIdInput.value = await ensureDevPeerId();
    } catch {
      peerIdInput.value = '';
    }
  })();

  const relayHostLbl = document.createElement('div');
  relayHostLbl.className = 'pm-label';
  relayHostLbl.textContent = 'Relay host (optional)';

  const relayHostInput = document.createElement('input');
  relayHostInput.className = 'pm-input';
  relayHostInput.placeholder = 'Empty = default cloud server';
  relayHostInput.value = String(settings.peerRelayHost ?? '');

  const relayPortLbl = document.createElement('div');
  relayPortLbl.className = 'pm-label';
  relayPortLbl.textContent = 'Relay port';

  const relayPortInput = document.createElement('input');
  relayPortInput.className = 'pm-input';
  relayPortInput.style.maxWidth = '6rem';
  relayPortInput.type = 'number';
  relayPortInput.value = String(settings.peerRelayPort ?? 443);

  const relayPathLbl = document.createElement('div');
  relayPathLbl.className = 'pm-label';
  relayPathLbl.textContent = 'Relay path';

  const relayPathInput = document.createElement('input');
  relayPathInput.className = 'pm-input';
  relayPathInput.value = String(settings.peerRelayPath ?? '/');

  const relayKeyLbl = document.createElement('div');
  relayKeyLbl.className = 'pm-label';
  relayKeyLbl.textContent = 'PeerServer key';

  const relayKeyInput = document.createElement('input');
  relayKeyInput.className = 'pm-input';
  relayKeyInput.value = String(settings.peerRelayKey ?? 'peerjs');

  const relaySecureLbl = document.createElement('label');
  relaySecureLbl.className = 'pm-toolbar';
  relaySecureLbl.style.cursor = 'pointer';
  const relaySecure = document.createElement('input');
  relaySecure.type = 'checkbox';
  relaySecure.checked = settings.peerRelaySecure !== false;
  relaySecureLbl.appendChild(relaySecure);
  relaySecureLbl.appendChild(document.createTextNode(' Use secure WebSocket (wss)'));

  relayHostInput.addEventListener('input', () => {
    const v = relayHostInput.value.trim();
    debounceSettings((s) => {
      s.peerRelayHost = v;
    });
  });

  relayPortInput.addEventListener('input', () => {
    const n = Number(relayPortInput.value);
    debounceSettings((s) => {
      s.peerRelayPort = Number.isFinite(n) ? n : 443;
    });
  });

  relayPathInput.addEventListener('input', () => {
    const v = relayPathInput.value.trim() || '/';
    debounceSettings((s) => {
      s.peerRelayPath = v;
    });
  });

  relayKeyInput.addEventListener('input', () => {
    const v = relayKeyInput.value.trim() || 'peerjs';
    debounceSettings((s) => {
      s.peerRelayKey = v;
    });
  });

  relaySecure.addEventListener('change', () => {
    debounceSettings((s) => {
      s.peerRelaySecure = relaySecure.checked;
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
    imageLinkColor,
    peerSyncTitle,
    peerSyncHint,
    peerIdLbl,
    peerIdRow,
    relayHostLbl,
    relayHostInput,
    relayPortLbl,
    relayPortInput,
    relayPathLbl,
    relayPathInput,
    relayKeyLbl,
    relayKeyInput,
    relaySecureLbl
  );

  return {
    root,
    unmount() {
      if (tid) clearTimeout(tid);
    },
  };
}
