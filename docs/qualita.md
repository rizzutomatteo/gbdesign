# Qualità — GB Design

> Leggi questo file quando lavori su: SEO, Schema.org, accessibilità, performance, immagini, font, mappe, Definition of Done.

Le tre dimensioni di qualità (SEO, accessibilità, performance) sono **non negoziabili** ed entrano nella Definition of Done della §5.

---

## 1. SEO — essenziale ma non maniacale

Il sito ha **una pagina che conta**: la home. Regole semplici e ferree.

### Meta tag (in `BaseLayout.astro`)

- `<title>`: `GB Design — Traslochi e montaggio mobili a Macerata`
- `<meta description>`: 140-160 caratteri, include città, servizio, anni di esperienza
- `lang="it"` su `<html>`
- Open Graph completo (`og:title`, `og:description`, `og:image` 1200×630, `og:url`, `og:type=website`, `og:locale=it_IT`)
- Twitter card `summary_large_image`
- `canonical` corretto

### Heading

- **Un solo `<h1>`** sulla home, nell'Hero (es. *"Traslochi a Macerata, fatti come si deve"*)
- Ogni sezione successiva inizia con un `<h2>`
- Sotto-elementi in `<h3>` (tappe della storia, recensioni, sedi)
- Mai saltare livelli di heading

### Keyword da inserire naturalmente

- *traslochi Macerata*, *trasloco Macerata*
- *impresa di traslochi Macerata*, *ditta traslochi provincia di Macerata*
- *traslochi aziendali Macerata*, *traslochi uffici Macerata*
- *montaggio mobili Macerata*
- *traslochi Civitanova Marche* (sede operativa)

Una occorrenza in ogni punto chiave (title, H1, primo paragrafo, alt text immagine hero) **basta**. Google nel 2026 non premia il keyword stuffing.

### URL puliti

- `/`, `/contatti`, `/privacy`, `/cookie`
- Slug minuscoli con trattini, in italiano
- Mai `/page?id=1` o `/Home`

### Sitemap e robots

- `sitemap-index.xml` generata da `@astrojs/sitemap`
- `public/robots.txt` punta alla sitemap
- `public/llms.txt` presente (standard 2026 per motori AI)

### Schema.org `MovingCompany` con sedi multiple

In `src/components/seo/SchemaMovingCompany.astro`:

```json
{
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  "name": "GB Design",
  "@id": "https://gbdesign-traslochi.it/#org",
  "url": "https://gbdesign-traslochi.it",
  "logo": "https://gbdesign-traslochi.it/images/logo.svg",
  "image": "https://gbdesign-traslochi.it/og/gbdesign.jpg",
  "telephone": "+39 0733 234567",
  "email": "info@gbdesign-traslochi.it",
  "priceRange": "€€",
  "foundingDate": "2008",
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Provincia di Macerata" },
    { "@type": "AdministrativeArea", "name": "Marche" }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Contrada Piediripa 25",
    "addressLocality": "Macerata",
    "postalCode": "62100",
    "addressRegion": "MC",
    "addressCountry": "IT"
  },
  "location": [
    {
      "@type": "Place",
      "name": "GB Design — Sede principale Macerata",
      "address": { "@type": "PostalAddress", "streetAddress": "Contrada Piediripa 25", "addressLocality": "Macerata", "postalCode": "62100", "addressRegion": "MC", "addressCountry": "IT" },
      "geo": { "@type": "GeoCoordinates", "latitude": 43.2812, "longitude": 13.4536 }
    },
    {
      "@type": "Place",
      "name": "GB Design — Sede operativa Civitanova Marche",
      "address": { "@type": "PostalAddress", "streetAddress": "Via Adriatica 100", "addressLocality": "Civitanova Marche", "postalCode": "62012", "addressRegion": "MC", "addressCountry": "IT" },
      "geo": { "@type": "GeoCoordinates", "latitude": 43.3072, "longitude": 13.7228 }
    }
  ],
  "sameAs": [
    "https://instagram.com/gbdesign.traslochi",
    "https://facebook.com/GBDesignTraslochi"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "1800"
  }
}
```

Per ogni recensione in pagina aggiungere un blocco `Review` aggregato all'organizzazione.

Tutti i valori devono leggersi da `src/config/site.ts`, mai hardcodati.

### Google Business Profile

Registrare **due schede GBP**, una per sede (Macerata e Civitanova Marche). Sono gratis e per un'attività locale portano più traffico del sito stesso. Ogni scheda ha:

- Telefono e orari coerenti con `site.ts`
- Foto delle sedi (almeno 5 per scheda)
- Categoria primaria: *Servizio di trasloco*
- Categoria secondaria: *Servizio di montaggio mobili*

---

## 2. Accessibilità (WCAG 2.2 AA)

Obbligatorio per legge UE dal giugno 2025 e fattore di ranking Google.

- **Contrasto testo** ≥ 4.5:1 (3:1 per testo grande ≥ 18pt)
- **Focus visibile** su ogni elemento interattivo (mai `outline: none` senza sostituto)
- **Navigazione completa da tastiera** (`Tab`, `Shift+Tab`, `Enter`, `Esc`)
- **Skip link** in cima al body per saltare alla `main`
- **Form**: ogni `<input>` ha la sua `<label>` collegata via `for`/`id`
- **Immagini**: `alt` descrittivo; `alt=""` solo se decorative (e con `role="presentation"` se serve)
- **Heading**: gerarchia rispettata, niente salti
- **`lang="it"`** su `<html>`, lang diverso sulle parti in altre lingue
- **`prefers-reduced-motion`** rispettato (counter, parallax, fade si fermano)
- **`aria-label`** sui pulsanti icona senza testo (es. apri/chiudi menu)
- **`aria-current="page"`** sul link attivo della nav
- **Skip "Apri mappa"** delle sedi non è solo per performance: è anche un'opzione di scelta (rispetto del consenso)

### CSS minimo da avere in `global.css`

```css
*:focus-visible {
  outline: 3px solid var(--color-brand-500);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
}
.skip-link:focus {
  left: 1rem;
  top: 1rem;
  z-index: 100;
  background: white;
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-brand-700);
}
```

### Strumenti di verifica

- **axe DevTools** (Chrome/Firefox extension)
- **Lighthouse → Accessibility** (Chrome DevTools)
- **WAVE** ([wave.webaim.org](https://wave.webaim.org))
- Test manuale: navigare tutto il sito **solo con tastiera**

**Target**: Lighthouse Accessibility **≥ 95** e zero violazioni axe-core.

---

## 3. Performance — budget rigorosi

Un one-pager **deve volare**.

### Target

| Metrica | Obiettivo |
|---|---|
| LCP | < 2,0 s |
| CLS | < 0,05 |
| INP | < 200 ms |
| JS totale | < 30 KB |
| Lighthouse Performance | ≥ 95 mobile |
| Lighthouse SEO | ≥ 95 |
| Lighthouse Accessibility | ≥ 95 |

### Immagini

- Sempre **AVIF** (fallback WebP). Mai PNG/JPG > 200 KB
- `width` e `height` espliciti su ogni `<img>` per zero CLS sulla gallery
- Hero image: `loading="eager"` + `fetchpriority="high"`
- Tutto il resto: `loading="lazy"`
- Sempre il componente `<Image />` di `astro:assets` per immagini importate

Esempio:

```astro
---
import { Image } from 'astro:assets';
import hero from '../assets/hero.jpg';
---
<Image
  src={hero}
  alt="Squadra GB Design davanti al furgone, Macerata"
  loading="eager"
  fetchpriority="high"
  widths={[400, 800, 1200, 1600]}
  sizes="(max-width: 768px) 100vw, 1200px"
  format="avif"
/>
```

### Font

- Self-hosted con `@fontsource/<nome>` (privacy e velocità)
- `font-display: swap`
- Preload del font del titolo se è diverso da quello del body
- Massimo 2 famiglie, 2 pesi ciascuna

### JavaScript

- Astro non spedisce JS di default — sfrutta questa cosa
- Hydration: usa la direttiva più leggera possibile
  - `client:visible` quasi sempre (counter, lightbox, mappa)
  - `client:idle` per widget non critici
  - `client:load` solo se davvero necessario

### Componenti rischiosi per LCP (gestiti con cura)

- **Mappe sedi**: NON caricare iframe al render. Mostra preview con CTA "Apri mappa" → al click inserisce l'iframe. Senza questo, l'LCP crolla di 2+ secondi.
- **Lightbox gallery**: lazy-import al primo click, non al `load`.
- **Counter animati**: parte quando entra nel viewport via `IntersectionObserver`, non al `load`. Rispetta `prefers-reduced-motion`.
- **Feed social**: se davvero serve, lazy-load oltre la piega. Meglio mostrare semplici link.

### Strumenti di test

- [PageSpeed Insights](https://pagespeed.web.dev) — obiettivo 95+ mobile
- [WebPageTest](https://webpagetest.org) — il più accurato
- [GTmetrix](https://gtmetrix.com)

---

## 4. Security headers (in `netlify.toml`)

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://plausible.io; frame-src https://www.openstreetmap.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://*.netlify.com"
```

Adatta CSP in base ai servizi esterni reali (analytics, mappa). Verifica con [csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com).

---

## 5. Definition of Done

Una task è "finita" SOLO se:

- [ ] `npm run build` passa senza errori
- [ ] `npx astro check` passa (type check Astro + TS)
- [ ] `npx prettier --check .` passa
- [ ] Lighthouse mobile sulla sezione modificata: **Performance ≥ 95**, **SEO ≥ 95**, **Accessibility ≥ 95**
- [ ] Nessuna nuova violazione **axe-core**
- [ ] Se hai aggiunto contenuti modificabili spesso → sono in `src/content/<collezione>/`, non hardcoded
- [ ] Se hai cambiato dati aziendali → aggiornato `src/config/site.ts`, non sparsi nei componenti
- [ ] Se hai aggiunto immagini → AVIF, < 200 KB, con `alt` descrittivo e `width`/`height`
- [ ] Conventional Commit corretto (cfr. `docs/codice.md` §5)
- [ ] Se hai cambiato architettura → aggiornato il file `docs/` corrispondente

---

## 6. Cosa controllare ad ogni deploy

- `src/config/site.ts` coerente con la realtà
- `public/robots.txt` punta alla sitemap corretta
- `public/llms.txt` aggiornato (descrizione azienda, URL principali)
- `src/components/seo/SchemaMovingCompany.astro` valido (test su [validator.schema.org](https://validator.schema.org))
- `netlify.toml` security headers attivi (test su [securityheaders.com](https://securityheaders.com))
- Sitemap raggiungibile su `/sitemap-index.xml`
- HTTPS forzato (su Netlify: Domain settings → Force HTTPS)

---

*Aggiornato: 12 maggio 2026.*
