/** Photo tiles on Overview; resolved from this module so paths work with file:// and dev server. */
const IMG_MIND_MAP = new URL('../../../src/Images/mind_map.png', import.meta.url).href;
const IMG_KANBAN = new URL('../../../src/Images/kanban.png', import.meta.url).href;

export function createHomeFeature(ctx) {
  const root = document.createElement('div');
  root.className = 'pm-home';

  const title = document.createElement('p');
  title.className = 'pm-pane-title';
  title.textContent = 'Overview';

  const hero = document.createElement('div');
  hero.className = 'pm-big-cards';

  const wikiTitle = document.createElement('p');
  wikiTitle.className = 'pm-pane-title pm-muted';
  wikiTitle.style.marginTop = '1.5rem';
  wikiTitle.textContent = 'Wiki';

  const wikiGrid = document.createElement('div');
  wikiGrid.className = 'pm-small-cards';

  function makeHero(label, route, imageUrl, tintStack) {
    const card = document.createElement('div');
    card.className = 'pm-home-hero-card';
    card.style.backgroundImage = `${tintStack}, url(${JSON.stringify(imageUrl)})`;
    card.setAttribute('role', 'button');
    const lbl = document.createElement('span');
    lbl.className = 'pm-home-hero-label';
    lbl.textContent = label;
    card.appendChild(lbl);
    card.addEventListener('click', () => ctx.router.setRoute(route));
    return card;
  }

  hero.append(
    makeHero(
      'Mind Map',
      'mindmap',
      IMG_MIND_MAP,
      'linear-gradient(145deg, rgba(90,230,220,0.3), rgba(15,17,21,0.86))',
    ),
    makeHero(
      'Kanban Board',
      'kanban',
      IMG_KANBAN,
      'linear-gradient(145deg, rgba(108,140,255,0.38), rgba(15,17,21,0.88)), radial-gradient(circle at 70% 20%, rgba(255,140,220,0.22), transparent)',
    ),
  );

  root.append(title, hero, wikiTitle, wikiGrid);

  function render() {
    const { wiki } = ctx.store.getState();
    wikiGrid.replaceChildren();

    const pages = Array.isArray(wiki.pages) ? wiki.pages : [];
    for (const p of pages) {
      const c = document.createElement('article');
      c.className = 'pm-wiki-card';
      const icon = document.createElement('span');
      icon.className = 'pm-wiki-icon';
      icon.textContent = p.icon || '📄';

      const col = document.createElement('div');
      const pt = document.createElement('strong');
      pt.textContent = p.title;
      const sub = document.createElement('div');
      sub.className = 'pm-muted';
      sub.textContent = p.description || '';

      col.append(pt, sub);
      c.append(icon, col);
      c.addEventListener('click', () => ctx.router.setRoute(`wiki:${p.id}`));
      wikiGrid.appendChild(c);
    }
  }

  const unsub = ctx.store.subscribe(render);

  return {
    id: 'home',
    root,
    unmount() {
      unsub();
    },
  };
}
