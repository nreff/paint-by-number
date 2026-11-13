import './style.css';
import { mountColorer } from './colorer';
import { mountGallery } from './gallery';
import { getPage } from './pages';

// Hash routing (#/ and #/page/<id>) so deep links and reloads work on GitHub Pages.
const root = document.getElementById('app')!;
let cleanup: () => void = () => {};

function route(): void {
  cleanup();
  const match = location.hash.match(/^#\/page\/([\w-]+)/);
  const page = match ? getPage(match[1]) : undefined;
  if (page) {
    document.title = `${page.title} · Paint by Number`;
    cleanup = mountColorer(root, page);
  } else {
    if (match) history.replaceState(null, '', '#/');
    cleanup = mountGallery(root);
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();
