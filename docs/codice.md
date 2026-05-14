# Codice — GB Design

> Leggi questo file quando lavori su: TypeScript, Astro, Tailwind, CSS, form Netlify, comandi, Git, CI.

---

## 1. TypeScript

- **Strict mode** sempre attivo (`"strict": true` in `tsconfig.json`)
- Mai `any`. Se non sai il tipo, usa `unknown` + narrowing
- Props dei componenti tipizzate con `interface`
- Usa `as const` per oggetti di configurazione che non cambiano
- Esporta tipi insieme ai dati: `export type Site = typeof site;`

```astro
---
interface Props {
  titolo: string;
  descrizione: string;
  ctaLabel?: string;
}

const { titolo, descrizione, ctaLabel = 'Richiedi preventivo' } = Astro.props;
---
```

---

## 2. Astro

- Frontmatter `---` sopra, markup sotto, **niente logica complessa nel markup**
- Usa `<Image />` di `astro:assets` per **ogni** immagine importata (mai `<img>` raw)
- Hydration: usa la direttiva più leggera possibile
  - `client:visible` quasi sempre (counter, lightbox, mappa)
  - `client:idle` per widget non critici
  - `client:load` solo se davvero necessario
- Componenti monolitici > 200 righe = da spezzare
- Una sezione della home = un componente in `src/components/sections/`
- I dati dinamici (dalla config o dalle content collection) si caricano nel frontmatter, mai nel markup

---

## 3. Tailwind CSS 4 + CSS

### Setup

In `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://gbdesign-traslochi.it',
  vite: { plugins: [tailwindcss()] },
});
```

In `src/styles/global.css`:

```css
@import 'tailwindcss';

@theme {
  /* Palette GB Design: Rosso Acceso, Nero e Bianco */
  --color-brand-50: #fef2f2; /* Bianco sporco rosato per sfondi light */
  --color-brand-500: #e11d48; /* Il Rosso core: acceso, moderno e "carino" (Rose-Red) */
  --color-brand-700: #be123c; /* Rosso scuro per hover e stati attivi */
  --color-brand-900: #881337; /* Rosso profondo per contrasti forti */

  /* Inchiostri e Neutri */
  --color-ink-900: #020617; /* Nero quasi assoluto (Slate 950) per il testo principale */
  --color-ink-700: #334155; /* Grigio molto scuro per testi secondari */
  --color-ink-500: #64748b; /* Grigio medio per icone o placeholder */

  --color-white: #ffffff; /* Bianco puro */

  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-display: 'Manrope Variable', system-ui, sans-serif;
}
```

Importa in `BaseLayout.astro`:

```astro
---
import '../styles/global.css';
---
```

### Regole

- **Mobile-first** sempre. Stili base per mobile, varianti `md:`/`lg:` solo se servono
- Niente CSS sparsi: utility Tailwind quasi sempre. `<style>` scoped nel componente solo per casi specifici
- Usa `text-balance` per i titoli e `text-pretty` per i paragrafi (CSS moderno)
- Animazioni: classi `transition-*` e `animate-*` di Tailwind o keyframes definiti nel `@theme`
- Sempre rispettare `prefers-reduced-motion` (cfr. `docs/qualita.md` §2)

---

## 4. Naming

| Tipo                   | Convenzione                   | Esempio                   |
| ---------------------- | ----------------------------- | ------------------------- |
| Componenti Astro       | PascalCase                    | `PreventivoForm.astro`    |
| Pagine                 | kebab-case                    | `chi-siamo.astro`         |
| Slug URL               | kebab-case minuscolo          | `/contatti`               |
| File content           | kebab-case                    | `laura-macerata.md`       |
| Variabili TS           | camelCase                     | `numeriChiave`            |
| Tipi / interfacce      | PascalCase                    | `Sede`, `Recensione`      |
| Classi CSS custom      | kebab-case                    | `hero-grid`               |
| CSS variables          | kebab-case con prefisso       | `--color-brand-500`       |
| Costanti env pubbliche | `PUBLIC_SCREAMING_SNAKE_CASE` | `PUBLIC_PLAUSIBLE_DOMAIN` |

---

## 5. Git & Conventional Commits

- Branch principale: `main` = sito live
- usare feature branch + Pull Request

### Conventional Commits — formato obbligatorio

Ogni commit deve seguire lo standard [Conventional Commits](https://conventionalcommits.org).
Formato: `<tipo>(<ambito>): <descrizione breve>`

```
feat: aggiunta sezione recensioni
fix: form contatti non inviava su Safari
content: aggiornati i numeri della sezione contatori
style: ridimensionato logo header su mobile
perf: lightbox lazy import al primo click
seo: aggiunto schema MovingCompany con sedi multiple
a11y: focus visibile su tutti i link header
chore: aggiornate dipendenze minor
ci: aggiunto job Playwright al workflow
docs: aggiornato docs/qualita.md (sezione sedi GBP)
refactor: estratto componente Counter
test: smoke test home con Playwright
```

### Micro-Commit Strategy (Professional Workflow)

- **Non accumulare**: Non aspettare la fine dell'attività per fare un unico commit gigante.
- **Atomicità**: Ogni commit deve rappresentare una singola unità logica di cambiamento. Se una funzione richiede una modifica alla config e poi il codice nuovo, fai due commit separati.
- **Frequenza**: Esegui un commit ogni volta che un piccolo step è completato e testato.

### Cosa NON committare mai

- `node_modules/`, `dist/`, `.netlify/`, `.env`, `.env.*` (eccetto `.env.example`)
- File con chiavi API o password in chiaro
- Foto non ottimizzate (> 500 KB)
- File `.DS_Store` o `Thumbs.db`

### `.gitignore`

```
node_modules/
dist/
.env
.env.*
!.env.example
.DS_Store
Thumbs.db
*.log
.netlify/
.vscode/settings.json
playwright-report/
test-results/
```

### Branch Management

- Prima di iniziare ogni nuova attività, crea un branch dedicato.
- Nomenclatura branch: `<tipo>/<breve-descrizione>` (es. `feat/login-form` o `fix/header-z-index`).
- Lavora esclusivamente sul branch creato e non su `main` o `master`.

### Messaggi di Commit

- Usa il presente imperativo ("add feature" non "added feature").
- La prima riga non deve superare i 50 caratteri.
- Se necessario, aggiungi una riga vuota e una descrizione più dettagliata.
- commit sempre in inglese

---

## 6. Comandi quotidiani

```bash
# Sviluppo
npm install                # prima volta o dopo un pull
npm run dev                # http://localhost:4321
npm run build              # build di produzione in ./dist
npm run preview            # anteprima del build

# Qualità
npx astro check            # type check Astro + TS
npx prettier --write .     # formatta tutto
npx prettier --check .     # solo verifica

# Test
npx playwright test
npx playwright test --ui

# Manutenzione
npm outdated               # dipendenze obsolete
npm update                 # aggiorna minor/patch
npm audit                  # vulnerabilità note
npm audit fix              # correzione automatica
```

---

## 7. Form Netlify — implementazione

Il form è secondario rispetto a telefono/WhatsApp. Tienilo **corto**.

### Campi

Obbligatori:

- Nome\*
- Telefono\*
- Email\*
- Messaggio\*
- Consenso privacy\*

Opzionali:

- Tipo di trasloco (radio: casa / ufficio / montaggio mobili)
- Data indicativa

### HTML accessibile e anti-spam

```html
<form
  name="contatti"
  method="POST"
  data-netlify="true"
  data-netlify-honeypot="bot-field"
  action="/grazie"
>
  <p hidden>
    <label>Non riempire: <input name="bot-field" /></label>
  </p>

  <div>
    <label for="nome">Nome*</label>
    <input id="nome" type="text" name="nome" required autocomplete="name" />
  </div>

  <div>
    <label for="telefono">Telefono*</label>
    <input id="telefono" type="tel" name="telefono" required autocomplete="tel" />
  </div>

  <div>
    <label for="email">Email*</label>
    <input id="email" type="email" name="email" required autocomplete="email" />
  </div>

  <fieldset>
    <legend>Tipo di trasloco</legend>
    <label><input type="radio" name="tipo" value="casa" /> Casa</label>
    <label><input type="radio" name="tipo" value="ufficio" /> Ufficio</label>
    <label><input type="radio" name="tipo" value="montaggio" /> Solo montaggio mobili</label>
  </fieldset>

  <div>
    <label for="data">Data indicativa</label>
    <input id="data" type="date" name="data" />
  </div>

  <div>
    <label for="messaggio">Messaggio*</label>
    <textarea id="messaggio" name="messaggio" required rows="5"></textarea>
  </div>

  <label>
    <input type="checkbox" name="privacy" required />
    Ho letto e accetto la <a href="/privacy">privacy policy</a>
  </label>

  <button type="submit">Invia</button>
</form>
```

### Note tecniche

- **NON** serve `<input type="hidden" name="form-name">` (Astro genera HTML statico)
- Action `/grazie` per pagina di ringraziamento e tracking conversione
- Notifiche email: Netlify Forms → Notifications → Email → indirizzo da `site.ts`
- Goal Plausible: `Form inviato` su `/grazie`

### Pagina `/grazie`

Pagina semplice con messaggio di conferma, telefono, link al sito. Imposta:

```astro
<meta name="robots" content="noindex, follow" />
```

per non far indicizzare la pagina di ringraziamento.

---

## 8. GitHub Actions — CI minima

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci

      - name: Format check
        run: npx prettier --check .

      - name: Type check
        run: npx astro check

      - name: Build
        run: npm run build

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: E2E smoke test
        run: npx playwright test
```

Ad ogni push GitHub esegue questi controlli **prima** che Netlify pubblichi.

---

## 9. Playwright — smoke test minimi

`tests/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('la home carica con titolo corretto', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/GB Design/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('le sezioni principali sono presenti', async ({ page }) => {
  await page.goto('/');
  for (const section of [
    'mission',
    'numeri',
    'come-lavoriamo',
    'lavori',
    'recensioni',
    'storia',
    'sedi',
    'contatti',
  ]) {
    await expect(page.locator(`#${section}`)).toBeVisible();
  }
});

test('nessun errore console su home', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  expect(errors).toEqual([]);
});

test('il form contatti ha tutti i campi obbligatori', async ({ page }) => {
  await page.goto('/#contatti');
  for (const field of ['Nome', 'Telefono', 'Email', 'Messaggio']) {
    await expect(page.getByLabel(field)).toBeVisible();
  }
});
```

---

_Aggiornato: 12 maggio 2026._
