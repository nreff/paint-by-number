import { defineConfig } from 'vite';

// Relative base so the built site works from any GitHub Pages sub-path
// (https://<user>.github.io/<repo>/) or a custom domain without changes.
export default defineConfig({
  base: './',
});
