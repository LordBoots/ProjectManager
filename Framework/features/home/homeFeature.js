/** Photo tiles on Overview; hero art resolves like wiki bundled icons (`../shared/assetUrls.js`). */
import { mindMapHeroHref, kanbanHeroHref } from '../shared/assetUrls.js';
import { resolveWikiPageIconUrl } from '../wiki/wikiPageIcons.js';

export function createHomeFeature(ctx) {
  const root = document.createElement('div');
  root.className = 'pm-home';

  const title = document.createElement('p');
  title.className = 'pm-pane-title pm-home-overview-spacer';
  title.setAttribute('aria-hidden', 'true');

  const hero = document.createElement('div');
  hero.className = 'pm-big-cards';

  const wikiTitle = document.createElement('p');
  wikiTitle.className = 'pm-pane-title pm-home-section-title';
  wikiTitle.style.marginTop = '1.5rem';
  wikiTitle.textContent = 'Wiki';

  const wikiSeparator = document.createElement('div');
  wikiSeparator.className = 'pm-home-section-separator';

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
      mindMapHeroHref(),
      'linear-gradient(145deg, rgba(90,230,220,0.3), rgba(15,17,21,0.86))',
    ),
    makeHero(
      'Kanban Board',
      'kanban',
      kanbanHeroHref(),
      'linear-gradient(145deg, rgba(108,140,255,0.38), rgba(15,17,21,0.88)), radial-gradient(circle at 70% 20%, rgba(255,140,220,0.22), transparent)',
    ),
  );

  root.append(title, hero, wikiTitle, wikiSeparator, wikiGrid);

  function render() {
    const { wiki } = ctx.store.getState();
    wikiGrid.replaceChildren();

    const pages = Array.isArray(wiki.pages) ? wiki.pages : [];
    for (const p of pages) {
      const c = document.createElement('article');
      c.className = 'pm-wiki-card pm-home-wiki-tile';

      const ic = typeof p.icon === 'string' ? p.icon.trim() : '';
      const url = resolveWikiPageIconUrl(ic);
      /** @type {HTMLElement} */
      let iconSlot;
      if (url) {
        const img = document.createElement('img');
        img.className = 'pm-wiki-icon-img';
        img.src = url;
        img.alt = '';
        img.addEventListener(
          'error',
          () => {
            img.replaceWith(
              Object.assign(document.createElement('span'), {
                className: 'pm-wiki-icon pm-home-wiki-tile-icon-emoji',
                textContent: '📄',
              }),
            );
          },
          { once: true },
        );
        iconSlot = img;
      } else {
        iconSlot = Object.assign(document.createElement('span'), {
          className: 'pm-wiki-icon pm-home-wiki-tile-icon-emoji',
          textContent: ic || '📄',
        });
      }

      const iconWrap = document.createElement('div');
      iconWrap.className = 'pm-home-wiki-tile-icon';
      iconWrap.appendChild(iconSlot);

      const name = document.createElement('div');
      name.className = 'pm-home-wiki-tile-title';
      name.textContent = p.title;

      c.append(iconWrap, name);
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
