import { resolve } from 'path';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { transformSync } from 'esbuild';

// Inline the app CSS into <head> so first paint doesn't wait on a
// render-blocking stylesheet request (big Speed Index / LCP win).
// index.css is plain CSS (no preprocessor), so source == final content.
const appCssPath = resolve(__dirname, 'index.css');
const appCss = (() => {
  try {
    const raw = readFileSync(appCssPath, 'utf8');
    return transformSync(raw, { loader: 'css', minify: true }).code;
  } catch (e) {
    console.warn('[inline-css] could not inline CSS:', e.message);
    return null;
  }
})();

function inlineCssPlugin() {
  return {
    name: 'inline-css',
    apply: 'build',
    transformIndexHtml(html) {
      if (!appCss) return html;
      return html.replace(
        /<link rel="stylesheet"[^>]*href="[^"]*\.css"[^>]*>/,
        `<style id="app-critical-css">${appCss}</style>`
      );
    },
  };
}

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: 'esbuild',
    assetsInlineLimit: 8192,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  plugins: [inlineCssPlugin()],
  server: {
    host: true,
    port: 5173
  }
});