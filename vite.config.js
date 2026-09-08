import { resolve } from 'path';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { transformSync } from 'esbuild';

// Inline the app CSS into <head> so first paint doesn't wait on a
// render-blocking stylesheet request (big Speed Index / LCP win).
const appCssPath = resolve(__dirname, 'index.css');

function inlineCssPlugin() {
  return {
    name: 'inline-css',
    transformIndexHtml(html) {
      try {
        const raw = readFileSync(appCssPath, 'utf8');
        const minified = transformSync(raw, { loader: 'css', minify: true }).code;
        return html.replace(
          /<link rel="stylesheet"[^>]*href="[^"]*index\.css"[^>]*>/,
          `<style id="app-critical-css">${minified}</style>`
        );
      } catch (e) {
        console.warn('[inline-css] could not inline CSS:', e.message);
        return html;
      }
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
  },
  preview: {
    host: true,
    port: 5173
  }
});