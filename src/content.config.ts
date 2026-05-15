import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const recensioni = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recensioni' }),
  schema: z.object({
    autore: z.string(),
    citta: z.string().optional(),
    rating: z.number().min(1).max(5),
    dataRecensione: z.coerce.date(),
    in_evidenza: z.boolean().default(false),
  }),
});

const montaggi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/montaggi' }),
  schema: z.object({
    titolo: z.string(),
    luogo: z.string(),
    descrizione: z.string(),
    categoria: z.enum(['montaggio-di-pregio', 'trasloco']),
    in_evidenza: z.boolean().default(false),
    dataLavoro: z.coerce.date(),
    foto: z.string().optional(),
  }),
});

const tappeStoria = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tappe-storia' }),
  schema: z.object({
    anno: z.number(),
    titolo: z.string(),
    descrizione: z.string(),
  }),
});

const passaggi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/passaggi' }),
  schema: z.object({
    ordine: z.number(),
    titolo: z.string(),
    descrizione: z.string(),
    icona: z.string(),
    foto: z.string().optional(),
  }),
});

export const collections = {
  recensioni,
  montaggi,
  'tappe-storia': tappeStoria,
  passaggi,
};
