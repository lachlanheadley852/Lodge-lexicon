import { defineConfig } from 'vite';

// Relative base so the build works at any path, e.g. /Lodge-lexicon/ on GitHub Pages.
export default defineConfig({
  base: './',
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
