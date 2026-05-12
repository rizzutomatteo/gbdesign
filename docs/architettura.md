# Architettura — GB Design

> Leggi questo file quando lavori su: stack, struttura cartelle, sezioni della home, content collections, dati aziendali.

---

## 1. Stack tecnico

- **Framework**: Astro 5 (TypeScript strict)
- **Styling**: Tailwind CSS 4 via plugin Vite (NON `@astrojs/tailwind`)
- **Hosting**: Netlify (free) con deploy continuo da `main`
- **Repository**: GitHub privato
- **Form**: Netlify Forms (100 invii/mese gratis)
- **Analytics**: Plausible (no cookie banner)
- **CI**: GitHub Actions (lint + type check + build su PR)
- **Test E2E**: Playwright smoke test
- **Node**: 22 LTS (fissato in `.nvmrc` e `netlify.toml`)
- **Package manager**: npm

### Librerie permesse senza chiedere

- `astro-icon` per icone (Heroicons / Lucide)
- `@fontsource/<font>` per font self-hosted
- `@astrojs/sitemap` per la sitemap

### Da evitare

- jQuery, GSAP completo (CSS basta), animation library pesanti
- Mappe Google con API key in chiaro nel client
- Widget chat di terze parti senza richiesta esplicita
- Carousel library quando basta `scroll-snap` CSS

**Mai aggiungere dipendenze nuove senza giustificarle**. Ogni dipendenza è debito di manutenzione perpetuo.

---

## 2. Struttura cartelle completa

```
gbdesign-traslochi/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── llms.txt
│   └── images/
│       ├── logo.svg
│       ├── hero/
│       ├── lavori/                  # gallery "I nostri lavori"
│       ├── processo/                # foto sezione "Come lavoriamo"
│       └── sedi/
├── src/
│   ├── assets/                      # immagini gestite da astro:assets
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── Navigation.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── Mission.astro
│   │   │   ├── Numeri.astro              # counter animati
│   │   │   ├── ComeLavoriamo.astro       # processo + foto
│   │   │   ├── Lavori.astro              # gallery
│   │   │   ├── Recensioni.astro
│   │   │   ├── Storia.astro              # timeline
│   │   │   ├── Sedi.astro
│   │   │   ├── Social.astro
│   │   │   └── ContattiForm.astro
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Container.astro
│   │   │   ├── Section.astro
│   │   │   ├── Counter.astro             # singolo numero animato
│   │   │   ├── Card.astro
│   │   │   ├── Lightbox.astro
│   │   │   └── Map.astro                 # iframe lazy
│   │   └── seo/
│   │       ├── SEO.astro
│   │       └── SchemaMovingCompany.astro
│   ├── config/
│   │   └── site.ts                       # fonte unica di verità (cfr. §4)
│   ├── content/
│   │   ├── recensioni/                   # una recensione per file
│   │   ├── lavori/                       # un lavoro per file
│   │   ├── tappe-storia/                 # una tappa per file
│   │   └── passaggi/                     # uno step del processo per file
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── contatti.astro                # opzionale
│   │   ├── grazie.astro                  # post-form
│   │   ├── privacy.astro
│   │   ├── cookie.astro
│   │   └── 404.astro
│   ├── styles/
│   │   └── global.css
│   └── lib/
│       └── seo.ts
├── tests/
│   └── smoke.spec.ts
├── .github/workflows/ci.yml
├── docs/
│   ├── architettura.md                   # questo file
│   ├── qualita.md
│   └── codice.md
├── .env.example
├── .gitignore
├── .nvmrc
├── .prettierrc.json
├── astro.config.mjs
├── netlify.toml
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── CLAUDE.md
└── README.md
```

---

## 3. Sezioni della home: mapping completo

| # | Sezione | Componente | Contenuto sorgente |
|---|---|---|---|
| 1 | Header | `layout/Header.astro` | `src/config/site.ts` (telefono, nav) |
| 2 | Hero | `sections/Hero.astro` | hard-coded (claim del brand) |
| 3 | Mission | `sections/Mission.astro` | hard-coded breve |
| 4 | I numeri | `sections/Numeri.astro` | `site.ts → numeri_chiave` |
| 5 | Come lavoriamo | `sections/ComeLavoriamo.astro` | content collection `passaggi/` |
| 6 | I nostri lavori | `sections/Lavori.astro` | content collection `lavori/` |
| 7 | Recensioni | `sections/Recensioni.astro` | content collection `recensioni/` |
| 8 | Storia | `sections/Storia.astro` | content collection `tappe-storia/` |
| 9 | Sedi | `sections/Sedi.astro` | `site.ts → sedi[]` |
| 10 | Social | `sections/Social.astro` | `site.ts → social` |
| 11 | Contatti | `sections/ContattiForm.astro` | static + `site.ts` (recapiti) |
| 12 | Footer | `layout/Footer.astro` | `site.ts` |

**Tutto ciò che cambia nel tempo** (recensioni, foto lavori, tappe storia, step processo) vive in **content collection Markdown** sotto `src/content/`. Aggiungi un file → al prossimo deploy compare in pagina. Niente hardcoding nei `.astro`.

---

## 4. Fonte unica di verità: `src/config/site.ts`

Tutti i dati aziendali stanno qui. Esempio di forma:

```ts
export const site = {
  ragioneSociale: "GB Design S.r.l.",
  annoFondazione: 2008,
  pIva: "01234567890",
  rea: "MC-123456",

  dominio: "gbdesign-traslochi.it",

  contatti: {
    telefono: "+39 0733 234567",
    whatsapp: "+39 320 1234567",
    email: "info@gbdesign-traslochi.it",
    pec: "gbdesign@pec.it",
  },

  sedi: [
    {
      tipo: "sede principale",
      indirizzo: "Contrada Piediripa 25",
      cap: "62100",
      citta: "Macerata",
      provincia: "MC",
      regione: "Marche",
      paese: "IT",
      geo: { lat: 43.2812, lng: 13.4536 },
      orari: "Lun-Ven 8:30-19:00 · Sab 9:00-13:00",
    },
    {
      tipo: "sede operativa",
      indirizzo: "Via Adriatica 100",
      cap: "62012",
      citta: "Civitanova Marche",
      provincia: "MC",
      regione: "Marche",
      paese: "IT",
      geo: { lat: 43.3072, lng: 13.7228 },
      orari: "Lun-Ven 9:00-18:00",
    },
  ],

  social: {
    instagram: "https://instagram.com/gbdesign.traslochi",
    facebook: "https://facebook.com/GBDesignTraslochi",
    tiktok: "",
    youtube: "",
  },

  numeriChiave: {
    traslochiCompletati: 2500,
    anniEsperienza: 15,
    clientiSoddisfatti: 1800,
    recensioniMedia: 4.9,
  },
} as const;

export type Site = typeof site;
```

**Tutti i valori qui sopra sono ESEMPI**: sostituire con quelli reali prima del go-live (resta valido che la provincia di servizio è Macerata).

---

## 5. Content collections — come si scrive un contenuto

Definizione schema in `src/content/config.ts`:

```ts
import { defineCollection, z } from "astro:content";

const recensioni = defineCollection({
  type: "content",
  schema: z.object({
    autore: z.string(),
    citta: z.string().optional(),
    rating: z.number().min(1).max(5),
    data: z.date(),
    in_evidenza: z.boolean().default(false),
  }),
});

const lavori = defineCollection({
  type: "content",
  schema: ({ image }) => z.object({
    titolo: z.string(),
    descrizione: z.string().optional(),
    foto: image(),
    in_evidenza: z.boolean().default(false),
    data: z.date(),
  }),
});

const tappeStoria = defineCollection({
  type: "content",
  schema: z.object({
    anno: z.number(),
    titolo: z.string(),
    descrizione: z.string(),
  }),
});

const passaggi = defineCollection({
  type: "content",
  schema: ({ image }) => z.object({
    ordine: z.number(),
    titolo: z.string(),
    descrizione: z.string(),
    icona: z.string(),    // nome icona astro-icon
    foto: image().optional(),
  }),
});

export const collections = { recensioni, lavori, "tappe-storia": tappeStoria, passaggi };
```

Esempio `src/content/recensioni/laura-macerata.md`:

```markdown
---
autore: "Laura B."
citta: "Macerata"
rating: 5
data: 2026-03-12
in_evidenza: true
---

Squadra puntuale, gentile, professionale. Hanno smontato e rimontato due armadi
e una libreria senza un graffio. Costo onesto, niente sorprese. Consigliatissimi.
```

---

## 6. Naming

| Tipo | Convenzione | Esempio |
|---|---|---|
| Componenti Astro | PascalCase | `PreventivoForm.astro` |
| Pagine | kebab-case | `chi-siamo.astro` |
| Slug URL | kebab-case minuscolo | `/contatti` |
| File content | kebab-case | `laura-macerata.md` |
| Variabili TS | camelCase | `numeriChiave` |
| Tipi / interfacce | PascalCase | `Sede`, `Recensione` |
| Classi CSS custom | kebab-case | `hero-grid` |
| CSS variables | kebab-case con prefisso | `--color-brand-500` |

---

*Aggiornato: 12 maggio 2026.*
