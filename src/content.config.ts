import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const recensioni = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recensioni' }),
  schema: z.object({
    autore: z.string(),
    citta: z.string().optional(),
    rating: z.number().min(1).max(5),
    data: z.coerce.date(),
    in_evidenza: z.boolean().default(false),
  }),
});

const lavori = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lavori' }),
  schema: z.object({
    titolo: z.string(),
    descrizione: z.string().optional(),
    foto: z.string(),
    in_evidenza: z.boolean().default(false),
    data: z.coerce.date(),
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
  lavori,
  'tappe-storia': tappeStoria,
  passaggi,
};
