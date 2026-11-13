import { pageProgress } from './core/session';
import { PAGES } from './pages';
import { h, thumbnail } from './render';

export function mountGallery(root: HTMLElement): () => void {
  const grid = h('div', { class: 'grid' });
  for (const page of PAGES) {
    const { done, total, fills } = pageProgress(page);
    const percent = Math.floor((done / total) * 100);
    const status = done === 0 ? 'Start' : done === total ? 'Done ✓' : `${percent}%`;
    const bar = h('span', { class: 'bar' }, h('span', { style: `width:${(done / total) * 100}%` }));
    grid.appendChild(
      h(
        'a',
        { class: `card${done === total ? ' complete' : ''}`, href: `#/page/${page.id}` },
        h('span', { class: 'thumb-wrap' }, thumbnail(page, fills)),
        h(
          'span',
          { class: 'card-meta' },
          h('span', { class: 'card-title', text: page.title }),
          h('span', { class: 'card-sub', text: `${page.palette.length} colors · ${total} spaces` }),
          h('span', { class: 'card-progress' }, bar, h('span', { class: 'card-status', text: status })),
        ),
      ),
    );
  }

  // Future milestone: turn an uploaded photo into a ColoringPage (likely via an image model).
  // TODO: replace this placeholder with an upload flow that emits a ColoringPage.
  grid.appendChild(
    h(
      'div',
      { class: 'card soon', 'aria-disabled': 'true' },
      h('span', { class: 'thumb-wrap soon-art', text: '+' }),
      h(
        'span',
        { class: 'card-meta' },
        h('span', { class: 'card-title', text: 'Your own photo' }),
        h('span', { class: 'card-sub', text: 'Coming soon: turn any picture into a page' }),
      ),
    ),
  );

  root.replaceChildren(
    h(
      'div',
      { class: 'gallery' },
      h(
        'header',
        { class: 'hero' },
        h('h1', { text: 'Paint by Number' }),
        h('p', { text: 'Pick a page, choose a color, and fill every space with its number.' }),
      ),
      grid,
    ),
  );
  document.title = 'Paint by Number';
  return () => {};
}
