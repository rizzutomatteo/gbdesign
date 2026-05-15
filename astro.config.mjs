// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.gbdesign.it',
  integrations: [
    sitemap({
      filter: (page) =>
        page !== 'https://www.gbdesign.it/missione/' &&
        page !== 'https://www.gbdesign.it/servizi/',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
