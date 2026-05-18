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
      filter: (page) => {
        const excluded = [
          'https://www.gbdesign.it/missione/',
          'https://www.gbdesign.it/servizi/',
          'https://www.gbdesign.it/grazie/',
          'https://www.gbdesign.it/404/',
          'https://www.gbdesign.it/500/',
        ];
        return !excluded.includes(page);
      },
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
