// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.gbdesign.it',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    remotePatterns: [{ protocol: 'https' }],
  },
  prefetch: true,
  integrations: [
    sitemap({
      filter: (page) =>
        page !== 'https://www.gbdesign.it/missione/' && page !== 'https://www.gbdesign.it/servizi/',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@config': fileURLToPath(new URL('./src/config/site.ts', import.meta.url)),
      },
    },
  },
});
