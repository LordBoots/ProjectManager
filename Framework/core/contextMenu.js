/** @typedef {{ x: number, y: number }} Point */

export function showContextMenu({ x, y, items }) {
  const wrap = document.createElement('div');
  wrap.className = 'pm-context-menu';
  wrap.style.left = `${x}px`;
  wrap.style.top = `${y}px`;

  for (const it of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = it.label;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
      it.onClick();
    });
    wrap.appendChild(b);
  }

  document.body.appendChild(wrap);

  function onDoc(ev) {
    if (!wrap.contains(ev.target)) close();
  }

  function onEsc(ev) {
    if (ev.key === 'Escape') close();
  }

  requestAnimationFrame(() => {
    document.addEventListener('mousedown', onDoc, true);
    document.addEventListener('keydown', onEsc, true);
  });

  function close() {
    document.removeEventListener('mousedown', onDoc, true);
    document.removeEventListener('keydown', onEsc, true);
    wrap.remove();
  }

  return { close };
}
