# Guida all'infrastruttura del progetto

> Questa guida spiega **ogni scelta tecnica** fatta in questo progetto: cosa è, perché è stata fatta,
> cosa configura, e dove si può migliorare. Dopo averla letta, dovresti essere in grado di replicare
> questa infrastruttura su qualsiasi nuovo progetto Astro partendo da zero.

---

## Indice

1. [La filosofia del progetto](#1-la-filosofia-del-progetto)
2. [Gestione versione Node — `.nvmrc`](#2-gestione-versione-node--nvmrc)
3. [Dipendenze e script — `package.json`](#3-dipendenze-e-script--packagejson)
4. [Configurazione Astro — `astro.config.mjs`](#4-configurazione-astro--astroconfigmjs)
5. [TypeScript — `tsconfig.json`](#5-typescript--tsconfigjson)
6. [Formattazione automatica — `.prettierrc.json`](#6-formattazione-automatica--prettierrcjson)
7. [CSS processing — `postcss.config.mjs`](#7-css-processing--postcssconfigmjs)
8. [Git hooks — `lefthook.yml`](#8-git-hooks--lefthookyml)
9. [Analisi dead code — `knip.json`](#9-analisi-dead-code--knipjson)
10. [File ignorati da Git — `.gitignore`](#10-file-ignorati-da-git--gitignore)
11. [Test E2E — `playwright.config.ts`](#11-test-e2e--playwrightconfigts)
12. [Deploy e sicurezza — `netlify.toml`](#12-deploy-e-sicurezza--netlifytoml)
13. [Automazione CI/CD — `.github/workflows/`](#13-automazione-cicd--githubworkflows)
14. [Netlify Function — `netlify/functions/deploy.js`](#14-netlify-function--netlifyfunctionsdeployjs)
15. [Struttura `src/` — architettura del codice](#15-struttura-src--architettura-del-codice)
16. [CMS headless — `public/admin/`](#16-cms-headless--publicadmin)
17. [Documentazione interna — `CLAUDE.md` e `docs/`](#17-documentazione-interna--claudemd-e-docs)
18. [Cosa manca: configurazione professionale perfetta](#18-cosa-manca-configurazione-professionale-perfetta)

---

## 1. La filosofia del progetto

Prima di entrare nei file, è utile capire il filo conduttore di tutte le scelte.

### Tre principi guida

**1. Qualità automatizzata, non manuale.**
Ogni controllo ripetibile (formattazione, type check, build, test) è automatizzato. Lo sviluppatore non deve ricordarsi di eseguire nulla: i git hook lo fanno prima del commit, la CI lo fa prima del merge. Se qualcosa è rotto, viene segnalato prima che arrivi in produzione.

**2. Una sola fonte di verità per ogni cosa.**
I dati aziendali stanno solo in `src/config/site.ts`. La versione Node sta solo in `.nvmrc` (e tutti gli altri puntano lì). I contenuti modificabili stanno solo nelle content collections Markdown. Nessuna duplicazione: quando cambia qualcosa, si cambia in un posto solo.

**3. Sicurezza e performance by default.**
I security headers, la Content Security Policy, il caching aggressivo degli asset sono configurati fin dall'inizio in `netlify.toml`, non aggiunti dopo. Le scelte di stack (Astro SSG, zero JS di default, Plausible senza cookie) non sono ornamentali: impattano direttamente le performance e la conformità GDPR.

---

## 2. Gestione versione Node — `.nvmrc`

### Cos'è

`.nvmrc` è un file di una sola riga che indica al tool `nvm` (Node Version Manager) quale versione di Node.js usare in questa directory.

```
24
```

### Perché serve

Il problema classico: il codice funziona sul tuo computer (Node 18) e non funziona su quello di un collega (Node 16), o si comporta diversamente in CI. Fissare la versione elimina questa classe intera di bug.

Quando uno sviluppatore fa `cd gbdesign`, se ha nvm installato con l'auto-switch abilitato, la shell cambia automaticamente alla versione corretta. Nessun bisogno di ricordarsi quale versione usare.

### Come si usa

```bash
# Prima installazione (una volta sola)
nvm install    # legge .nvmrc, installa Node 24

# Ogni volta che si apre il progetto
nvm use        # legge .nvmrc, switcha alla versione corretta
```

### Come abilitare l'auto-switch

Aggiungere al proprio `.zshrc` o `.bashrc`:

```bash
# Auto-switch Node version when entering a directory with .nvmrc
autoload -U add-zsh-hook
load-nvmrc() {
  local nvmrc_path
  nvmrc_path="$(nvm_find_nvmrc)"
  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version
    nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")
    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$(nvm version)" ]; then
      nvm use
    fi
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

### Miglioramento possibile

**Disallineamento attuale**: `.nvmrc` dice `24`, ma `netlify.toml` dice `NODE_VERSION = "22"` e `package.json` dice `"node": ">=22.12.0"`. Questo non causa errori (24 > 22), ma è confuso. La best practice è scegliere una versione e usarla ovunque. Poiché Netlify è la piattaforma di deploy, conviene allineare tutto a ciò che Netlify usa in produzione: o si aggiorna `netlify.toml` a 24, o si abbassa `.nvmrc` a 22.

---

## 3. Dipendenze e script — `package.json`

### Cos'è

`package.json` è il manifesto del progetto Node.js. Definisce il nome del progetto, la versione, i comandi disponibili, le dipendenze e le regole per l'ambiente di esecuzione.

```json
{
  "name": "gbdesign",
  "type": "module",
  "version": "0.0.1",
  "engines": {
    "node": ">=22.12.0"
  },
  ...
}
```

### `"type": "module"` — perché

Indica a Node.js che questo progetto usa ES Modules (la sintassi moderna `import`/`export`) invece di CommonJS (`require`/`module.exports`). Astro richiede ES Modules. Senza questa riga, i file `.mjs` sarebbero necessari ovunque per far funzionare gli import.

### `engines.node` — blocca la versione minima

```json
"engines": {
  "node": ">=22.12.0"
}
```

A differenza di `.nvmrc` (che è una preferenza locale), `engines` è un avviso che npm legge e mostra un warning se la versione installata è incompatibile. Non blocca l'installazione, ma segnala il problema.

### Gli script — spiegati uno per uno

| Script         | Comando              | Quando si usa                                                                                                     |
| -------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `dev`          | `astro dev`          | Durante lo sviluppo — avvia il server locale su `http://localhost:4321` con hot reload                            |
| `build`        | `astro build`        | Genera i file statici in `./dist/` — quello che va in produzione                                                  |
| `preview`      | `astro preview`      | Serve `./dist/` localmente — simula la produzione per testare prima del deploy                                    |
| `check`        | `astro check`        | Esegue il type check TypeScript su tutti i file `.astro` e `.ts`                                                  |
| `format`       | `prettier --write .` | Formatta tutti i file del progetto (modifica i file)                                                              |
| `format:check` | `prettier --check .` | Verifica solo il formato senza modificare (usato in CI per far fallire il workflow se il codice non è formattato) |
| `prepare`      | `lefthook install`   | Installa automaticamente i git hooks di Lefthook — viene eseguito da npm ogni volta che si fa `npm install`       |

**Differenza tra `dev` e `preview`**: `dev` compila al volo e supporta hot reload ma non ottimizza nulla. `preview` serve il build reale: è quello che il browser vede davvero in produzione. Per testare performance, SEO e script, usare sempre `preview`.

### Le dipendenze — produzione vs sviluppo

**`dependencies`** (vanno in produzione, nel bundle finale):

- `astro` — il framework, necessario per compilare
- `@astrojs/sitemap` — genera `sitemap-index.xml` automaticamente
- `@tailwindcss/vite` — il plugin Vite di Tailwind v4
- `tailwindcss` — il framework CSS
- `zod` — validazione degli schemi delle content collections

**`devDependencies`** (solo in sviluppo, non nel bundle finale):

- `typescript` — il compilatore TypeScript
- `@astrojs/check` — il type checker specifico per i file `.astro`
- `@types/node` — i tipi TypeScript per le API Node.js (come `process.env`)
- `prettier` + plugin — il formatter
- `@playwright/test` — il framework di test E2E
- `@tailwindcss/postcss` — il plugin PostCSS (usato da Vite dietro le quinte)
- `lefthook` — il manager dei git hooks

### `overrides` — cosa sono e perché servono

```json
"overrides": {
  "vite": "^7",
  "trim": "0.0.3"
}
```

Gli `overrides` forzano una versione specifica di un pacchetto anche se è una dipendenza indiretta (cioè richiesta da un'altra libreria). Due casi qui:

1. **`vite: "^7"`**: Astro 6 e Tailwind v4 richiedono Vite 7. Senza questo override, npm potrebbe installare Vite 6 (perché alcune dipendenze lo richiedono implicitamente), causando incompatibilità.

2. **`trim: "0.0.3"`**: Workaround per una vulnerabilità di sicurezza (CVE-2020-7753) nel pacchetto `trim`. La versione vulnerabile era ancora tirata in come dipendenza indiretta. L'override forza la versione patchata.

### Miglioramento possibile

Aggiungere uno script `knip` per l'analisi del dead code (vedi sezione 9):

```json
"scripts": {
  "knip": "knip"
}
```

---

## 4. Configurazione Astro — `astro.config.mjs`

### Cos'è

`astro.config.mjs` è il file di configurazione principale del framework Astro. Ogni aspetto del comportamento di Astro — integrations, ottimizzazione immagini, routing, bundling — si configura qui.

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.gbdesign.it',
  integrations: [
    sitemap({
      filter: (page) =>
        page !== 'https://www.gbdesign.it/missione/' && page !== 'https://www.gbdesign.it/servizi/',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### `// @ts-check` — type checking nel config

Anche se il file è `.mjs` (JavaScript), questa direttiva attiva il type checking di TypeScript tramite JSDoc. Se si sbaglia un nome di opzione o si mette un valore del tipo sbagliato, l'IDE lo segnala in rosso senza dover convertire il file in `.ts`.

### `site` — l'URL canonico del sito

```javascript
site: 'https://www.gbdesign.it',
```

Questa stringa è usata da Astro (e dalle sue integrazioni) per costruire URL assoluti. Serve per:

- **Sitemap**: ogni URL nella sitemap viene costruito come `site + path`
- **`Astro.site`**: variabile disponibile in tutti i componenti
- **Canonical tag**: `<link rel="canonical" href="..." />`
- **Open Graph**: `og:url`

Senza questa opzione, la sitemap generata conterrà URL relativi invece di assoluti, rompendo il SEO.

### `integrations` — i plugin di Astro

```javascript
integrations: [
  sitemap({
    filter: (page) =>
      page !== 'https://www.gbdesign.it/missione/' &&
      page !== 'https://www.gbdesign.it/servizi/',
  }),
],
```

`@astrojs/sitemap` scansiona tutte le pagine del sito durante il build e genera automaticamente `/sitemap-index.xml`. Senza configurazione, includerebbe ogni pagina.

Il parametro `filter` esclude pagine specifiche dalla sitemap. In questo caso, `/missione/` e `/servizi/` sono pagine placeholder con `noindex` — non ha senso includerle nella sitemap perché Google le ignorerebbe comunque, e avere URL noindex nella sitemap è contraddittorio.

### `vite.plugins` — perché Tailwind è qui e non in `integrations`

```javascript
vite: {
  plugins: [tailwindcss()],
},
```

Questa è la differenza cruciale tra **Tailwind CSS v3** e **Tailwind CSS v4**.

- In **Tailwind v3**, si usava `@astrojs/tailwind` nelle `integrations` di Astro
- In **Tailwind v4**, Tailwind è diventato un plugin Vite nativo. Non c'è più un'integrazione Astro dedicata. Si aggiunge direttamente a `vite.plugins`

Se si usa ancora `@astrojs/tailwind` con Tailwind v4, si ottengono errori o comportamenti imprevedibili. Questa è la causa numero uno di problemi quando si migra da v3 a v4.

### Miglioramento possibile

```javascript
export default defineConfig({
  site: 'https://www.gbdesign.it',
  compressHTML: true,              // Minifica l'HTML in produzione
  build: {
    inlineStylesheets: 'auto',     // Inline CSS sotto 4KB per ridurre richieste HTTP
  },
  image: {
    remotePatterns: [{ protocol: 'https' }], // Abilita ottimizzazione immagini remote
  },
  ...
});
```

---

## 5. TypeScript — `tsconfig.json`

### Cos'è

`tsconfig.json` configura il compilatore TypeScript. Definisce quanti "severi" devono essere i controlli sui tipi, quali file analizzare, e quali opzioni del compilatore attivare.

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

### `extends: "astro/tsconfigs/strict"` — strict mode

Invece di configurare manualmente ogni opzione, si eredita la configurazione `strict` di Astro. Questa preset attiva automaticamente:

| Opzione                    | Effetto                                                                     |
| -------------------------- | --------------------------------------------------------------------------- |
| `strict: true`             | Attiva tutti i controlli strict\* in una volta                              |
| `noImplicitAny: true`      | Vieta `any` implicito — se TypeScript non riesce a inferire un tipo, errore |
| `strictNullChecks: true`   | `null` e `undefined` non sono assegnabili a qualsiasi tipo                  |
| `noUnusedLocals: true`     | Errore su variabili dichiarate ma non usate                                 |
| `noUnusedParameters: true` | Errore su parametri di funzione non usati                                   |
| `noImplicitReturns: true`  | Ogni percorso di una funzione deve restituire un valore                     |
| `target: ES2022`           | Output JavaScript moderno                                                   |
| `module: ESNext`           | Usa la sintassi ES Modules                                                  |

**Perché strict mode?** Cattura errori a compile time invece che a runtime. Un tipo sbagliato in produzione può causare comportamenti silenziosi difficili da debuggare. Con strict mode, TypeScript lo segnala prima ancora di eseguire il codice.

### `include` — cosa analizzare

```json
"include": [".astro/types.d.ts", "**/*"]
```

- `"**/*"` — analizza tutti i file del progetto
- `".astro/types.d.ts"` — include i tipi generati automaticamente da Astro (content collections, import di immagini, ecc.). Questa cartella viene creata durante `npm run dev` e non va committata (è in `.gitignore`)

### `exclude` — cosa ignorare

```json
"exclude": ["dist"]
```

Esclude la cartella del build output. Analizzare i file generati sarebbe inutile e lento.

### `resolveJsonModule: true` — import di JSON

Permette di importare file `.json` come moduli TypeScript con type safety completa:

```typescript
import data from './data/impostazioni.json';
// TypeScript conosce esattamente la struttura di data
console.log(data.name); // ✅ type-safe
```

Senza questa opzione, l'import di JSON darebbe un errore TypeScript.

### Miglioramento possibile

Aggiungere alias per import più puliti:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@config": ["src/config/site.ts"]
    }
  }
}
```

Con questo, invece di `import { site } from '../../../config/site'` si scrive `import { site } from '@config'`.

---

## 6. Formattazione automatica — `.prettierrc.json`

### Cos'è

Prettier è un **code formatter**: prende il codice scritto in qualsiasi stile e lo riformatta in modo consistente. Non controlla la logica del codice (quello è TypeScript), controlla solo l'aspetto: spazi, virgole, virgolette, lunghezza righe.

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

### Perché un formatter automatico

Senza un formatter, ogni sviluppatore usa le proprie preferenze. Le code review si trasformano in discussioni su "virgolette singole o doppie?" invece che sulla logica. Con Prettier, queste discussioni finiscono: il formatter decide tutto, e nessuno deve ricordarsi le regole.

### Le opzioni — spiegate

| Opzione         | Valore  | Effetto                                                                                                                                                       |
| --------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `semi`          | `true`  | Aggiunge `;` alla fine di ogni statement. Previene bug sottili con il semicolon insertion automatico di JavaScript                                            |
| `singleQuote`   | `true`  | Usa `'stringa'` invece di `"stringa"`. Preferenza standard nel mondo JavaScript/TypeScript                                                                    |
| `trailingComma` | `"es5"` | Aggiunge virgola dopo l'ultimo elemento di array e oggetti. Rende i diff Git più puliti (si aggiunge solo la nuova riga, non la virgola alla riga precedente) |
| `printWidth`    | `100`   | Va a capo quando la riga supera 100 caratteri. 80 è troppo stretto per TypeScript moderno; 120 è troppo largo per leggibilità                                 |
| `tabWidth`      | `2`     | 2 spazi per livello di indentazione (standard web)                                                                                                            |
| `endOfLine`     | `"lf"`  | Usa line endings Unix (`\n`) invece di Windows (`\r\n`). Evita problemi di diff su Windows e Linux                                                            |

### I plugin

**`prettier-plugin-astro`**: Prettier non sa come formattare i file `.astro` (che mescolano frontmatter TypeScript, template HTML e CSS). Questo plugin aggiunge quel supporto. L'override `"parser": "astro"` è necessario per forzare il parser corretto sui file `.astro`.

**`prettier-plugin-tailwindcss`**: Ordina automaticamente le classi Tailwind nell'ordine "raccomandato" (layout → box model → tipografia → colori → ecc.). Senza questo plugin, le classi vengono scritte nell'ordine in cui si digitano, rendendo i file inconsistenti e le diff Git più rumorose.

---

## 7. CSS processing — `postcss.config.mjs`

### Cos'è

PostCSS è un transpiler CSS: prende CSS con sintassi speciale (come le direttive di Tailwind) e lo converte in CSS standard che i browser capiscono.

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### Perché serve con Tailwind v4

Con Tailwind v3, si usavano direttive speciali (`@tailwind base`, `@tailwind components`, `@tailwind utilities`) nei file CSS. PostCSS con il plugin `tailwindcss` le sostituiva con il CSS reale durante il build.

Con **Tailwind v4**, il meccanismo è cambiato: si usa `@import 'tailwindcss'` nel file CSS principale, e il plugin PostCSS `@tailwindcss/postcss` lo espande nell'intero sistema di utility di Tailwind, applicando anche il tema custom definito con `@theme { ... }`.

### Come si collega a `global.css`

```css
/* src/styles/global.css */
@import 'tailwindcss';

@theme {
  --color-brand: #bf282b;
  --color-brand-dark: #9a1f22;
  /* ... */
}
```

Il file `global.css` importa Tailwind e definisce il tema del brand. PostCSS processa questo file tramite `@tailwindcss/postcss` e genera il CSS finale con tutte le utility classes e le variabili custom.

---

## 8. Git hooks — `lefthook.yml`

### Cos'è

I git hooks sono script che vengono eseguiti automaticamente da Git in momenti specifici (prima di un commit, prima di un push, ecc.). Lefthook è uno strumento per gestire questi hook in modo dichiarativo tramite un file YAML versionato.

```yaml
pre-commit:
  parallel: true
  commands:
    prettier:
      glob: '*.{js,ts,astro,css,json,md,yml}'
      run: npx prettier --write {staged_files}
      stage_fixed: true

pre-push:
  parallel: true
  commands:
    check:
      run: npm run check
    build:
      run: npm run build
```

### Perché Lefthook invece di Husky

**Husky** è l'alternativa più popolare, ma ha alcuni svantaggi:

- Crea file fisici in `.husky/` che devono essere committati
- Più verboso nella configurazione
- Non supporta `parallel: true` nativamente

**Lefthook** è più leggero, ha la configurazione in un unico file YAML versionato, supporta l'esecuzione parallela, e ha `stage_fixed: true` (vedi sotto).

### `pre-commit` — cosa succede prima di ogni commit

1. Prende i file staged (quelli che stai per committare)
2. Filtra solo quelli con estensione `*.{js,ts,astro,css,json,md,yml}`
3. Esegue Prettier su quei file
4. **`stage_fixed: true`**: se Prettier ha modificato dei file, li aggiunge automaticamente allo stage. Senza questa opzione, Prettier formatta i file ma non li include nel commit, creando confusione

**Risultato pratico**: non devi mai ricordarti di eseguire `npm run format`. Il commit viene formattato automaticamente.

### `pre-push` — cosa succede prima di ogni push

Prima che il codice arrivi su GitHub, vengono eseguiti in **parallelo**:

- `npm run check` — type check TypeScript (errori di tipo)
- `npm run build` — build completo (assicura che il codice compili)

Se uno dei due fallisce, il push viene bloccato. Il codice non arriva su GitHub rotto.

### `parallel: true` — perché

Con `parallel: true`, i comandi vengono eseguiti contemporaneamente invece che in sequenza. Se `check` richiede 15 secondi e `build` richiede 30 secondi, con `parallel: true` il pre-push richiede ~30 secondi invece di 45.

### Come si installa

Il comando `npm run prepare` (che equivale a `lefthook install`) viene eseguito automaticamente da npm dopo ogni `npm install`. Crea i file hook fisici in `.git/hooks/`. Questa è la ragione del campo `"prepare": "lefthook install"` in `package.json`.

---

## 9. Analisi dead code — `knip.json`

### Cos'è

Knip è uno strumento che analizza il codice sorgente e trova tutto ciò che è stato dichiarato ma non viene mai usato: componenti non importati da nessuna parte, funzioni mai chiamate, export mai importati, dipendenze in `package.json` mai utilizzate.

```json
{
  "ignore": ["public/identity-redirect.js"],
  "netlify": {
    "functions": ["netlify/functions/**/*.js"]
  }
}
```

### Perché serve

In un progetto che evolve nel tempo, è normale lasciare codice non più utilizzato. Questo codice non causa errori (TypeScript non lo vede come problema), ma aumenta il bundle size, confonde i nuovi sviluppatori e crea falsi positivi nei type check.

Knip lo trova tutto automaticamente.

### `ignore` — file da escludere dall'analisi

```json
"ignore": ["public/identity-redirect.js"]
```

`public/identity-redirect.js` è uno script che viene caricato direttamente dal browser via tag `<script>` nell'HTML del CMS. Knip non vede questa connessione (è fuori dal grafo di import TypeScript) e lo segnerebbe come "unused". L'opzione `ignore` dice a Knip di non controllare quel file.

### `netlify.functions` — far capire a Knip le Netlify Functions

```json
"netlify": {
  "functions": ["netlify/functions/**/*.js"]
}
```

Le Netlify Functions in `netlify/functions/` non vengono importate da nessun file del progetto: vengono chiamate da Netlify come handler HTTP. Knip di default le segnerebbe come "unused". Questa opzione dice a Knip di trattare questi file come entry points (punti di ingresso) invece che come codice normale.

### Miglioramento possibile

Aggiungere lo script a `package.json` per poterlo eseguire facilmente:

```json
"scripts": {
  "knip": "knip"
}
```

Poi eseguirlo periodicamente con `npm run knip` o aggiungerlo alla CI.

---

## 10. File ignorati da Git — `.gitignore`

### Cos'è

`.gitignore` dice a Git quali file e cartelle non tracciare. I file ignorati non appaiono in `git status`, non vengono inclusi nei commit, non finiscono su GitHub.

```
dist/
.astro/
node_modules/
npm-debug.log*
...
.env
.env.production
.DS_Store
.idea/
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
/playwright/.auth/
/tests/screenshots/
.netlify
.claude/settings.local.json
```

### Le categorie e perché ogni regola esiste

**Build output** — `dist/`, `.astro/`

`dist/` contiene il sito compilato. Non va committato per due ragioni: 1) può essere rigenerato in qualsiasi momento con `npm run build`, 2) includerlo farebbe crescere il repo di centinaia di MB nel tempo, rendendo i clone lentissimi.

`.astro/` contiene i tipi TypeScript generati automaticamente da Astro per le content collections e gli import di immagini. Viene ricreato da `astro dev` o `astro build`, quindi non ha senso versionarlo.

**Dipendenze** — `node_modules/`

Mai committare `node_modules/`. Può pesare decine di MB. Per ripristinarlo basta `npm install`. Questo è il caso più classico di `.gitignore` e la ragione per cui esiste.

**Variabili d'ambiente** — `.env`, `.env.production`

I file `.env` contengono segreti: token API, chiavi di accesso, URL di build hook. Se finissero su GitHub (anche su un repo privato), sarebbero accessibili a chiunque abbia accesso al repo e rimarrebbero nella history per sempre. Da non committare mai.

**File IDE e OS** — `.idea/`, `.DS_Store`

`.idea/` è la cartella di configurazione di WebStorm/IntelliJ. `.DS_Store` è un file nascosto che macOS crea in ogni cartella. Non hanno nulla a che vedere col codice e non devono essere condivisi.

**Artefatti di test** — `/playwright-report/`, `/test-results/`, ecc.

Report HTML, screenshot e video generati da Playwright durante i test. In CI vengono caricati come artifact su GitHub Actions (con 30 giorni di retention). Localmente non servono nel repo.

**Netlify locale** — `.netlify`

Quando si usa `netlify dev`, Netlify CLI crea una cartella `.netlify` con cache locale e configurazioni. È specifica dell'ambiente locale e non deve essere condivisa.

**Claude Code locale** — `.claude/settings.local.json`

I permessi locali di Claude Code (come "permettere questo comando Bash specifico") sono specifici del computer di sviluppo e non devono essere condivisi nel repo.

---

## 11. Test E2E — `playwright.config.ts`

### Cos'è

Playwright è un framework per i test End-to-End (E2E): automatizza un browser reale (Chrome, Firefox, Safari) per simulare le azioni di un utente — navigare, cliccare, compilare form — e verificare che il sito si comporti correttamente.

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Opzioni chiave — spiegate

**`fullyParallel: true`**

I test vengono eseguiti in parallelo invece che in sequenza. Se hai 10 test, invece di aspettare che il primo finisca per iniziare il secondo, tutti partono contemporaneamente. Riduce drasticamente il tempo di esecuzione.

**`forbidOnly: !!process.env.CI`**

`test.only()` è una scorciatoia che esegue solo un test specifico. È utile in locale per debuggare, ma se rimane nel codice committato blocca tutti gli altri test in CI. Con `forbidOnly: true` (che si attiva solo in CI), il workflow fallisce se trova `.only()` nel codice.

**`retries: process.env.CI ? 2 : 0`**

In CI, i test vengono riprovati fino a 2 volte prima di essere marcati come falliti. Questo gestisce i test "flaky" (che falliscono sporadicamente per motivi non deterministici come timing di rete). In locale, `0` retries: fallisce subito così si vede il problema immediatamente.

**`workers: process.env.CI ? 1 : undefined`**

In CI, si usa 1 solo worker (esecuzione sequenziale). In locale, il numero di worker è automatico (di solito uguale ai core della CPU). In CI si usa 1 perché i runner GitHub Actions hanno risorse limitate e troppa parallelizzazione può causare instabilità.

**`trace: 'on-first-retry'`**

Quando un test fallisce in CI e viene riprovato, Playwright cattura una "trace" completa: screenshot a ogni step, log della console, log di rete. Questa trace viene inclusa nel report HTML e permette di debuggare il fallimento senza dover riprodurlo localmente.

**`webServer`**

Prima di eseguire i test, Playwright avvia automaticamente `npm run preview` (che compila il sito e lo serve su `:4321`). I test testano quindi il sito compilato in produzione, non il server di sviluppo. Con `reuseExistingServer: !process.env.CI`, in locale riusa un server già avviato invece di crearne uno nuovo ogni volta.

**Tre browser**

I test vengono eseguiti su Chromium (Chrome), Firefox e WebKit (Safari). Un bug che appare solo su Safari viene catturato anche senza avere un Mac.

---

## 12. Deploy e sicurezza — `netlify.toml`

### Cos'è

`netlify.toml` configura il comportamento di Netlify: come buildare il sito, quale cartella pubblicare, le regole di redirect/rewrite, gli header HTTP da aggiungere a ogni risposta.

### `[build]` — configurazione del build

```toml
[build]
  command = "npm run build"
  publish = "dist"
  ignore = "node -e \"...\""

[build.environment]
  NODE_VERSION = "22"
```

- `command = "npm run build"` — il comando che Netlify esegue per generare il sito
- `publish = "dist"` — la cartella da pubblicare sul CDN (quella generata da Astro)
- `NODE_VERSION = "22"` — forza Node 22 sull'ambiente Netlify

**`ignore`** — ottimizzazione dei build per il CMS:

```toml
ignore = "node -e \"const m=require('child_process').execSync('git log -1 --pretty=%B').toString().trim(); process.exit(/^(Create|Update|Delete|Upload) /.test(m) ? 0 : 1);\""
```

Il CMS Decap scrive commit con messaggi che iniziano con "Create ...", "Update ...", "Delete ...", "Upload ...". Quando il CMS modifica solo i contenuti Markdown, non è necessario rieseguire tutta la CI. Questo script Node.js legge il messaggio dell'ultimo commit e dice a Netlify di saltare il build automatico per questi commit. Il deploy viene poi triggerato manualmente dal pulsante "Manda in produzione" nel CMS.

**Attenzione**: questa regola `ignore` viene bypassata dai build hook (il pulsante). Se si vuole forzare un deploy, il pulsante nel CMS ignora questa regola e builda sempre.

### `[[headers]]` — cache aggressiva per gli asset versionati

```toml
[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

Astro genera ogni file JavaScript e CSS con un hash nel nome del file (es. `_astro/main.Bc3kD9aT.css`). Questo hash cambia ogni volta che il contenuto del file cambia.

Questo permette di usare `max-age=31536000` (1 anno) e `immutable`: il browser può cachare questi file per un anno senza mai riscaricarli. Se il contenuto cambia, Astro genera un nome diverso, e il browser scarica il nuovo file.

Senza questo header, il browser richiede il file ad ogni visita. Con questo header, il secondo caricamento è praticamente istantaneo.

### `[[headers]]` — security headers per tutte le pagine

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Content-Security-Policy = "..."
```

Questi header di sicurezza vengono aggiunti da Netlify a **ogni risposta HTTP**. Sono configurati una volta sola e si applicano globalmente senza toccare il codice Astro.

| Header                                             | Valore                                                                                            | Protezione                                                                                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `X-Frame-Options: DENY`                            | Il sito non può essere incluso in un `<iframe>` da altri siti                                     | Previene il **clickjacking**: un sito malevolo che nasconde il tuo sito in un iframe invisibile per ingannare l'utente a cliccare dove non vuole                  |
| `X-Content-Type-Options: nosniff`                  | Il browser deve rispettare il Content-Type dichiarato, non "indovinarlo"                          | Previene attacchi dove un file viene caricato come tipo diverso da quello dichiarato                                                                              |
| `Referrer-Policy: strict-origin-when-cross-origin` | L'URL completo viene inviato solo a richieste stessa origine; alle altre si invia solo il dominio | Evita che URL con dati sensibili (token, ID) vengano inviati a siti terzi                                                                                         |
| `Permissions-Policy`                               | Disabilita accesso a camera, microfono, geolocation e FLoC                                        | Il sito non può richiedere queste API del browser, anche se un componente terzo cercasse di farlo                                                                 |
| `Strict-Transport-Security`                        | `max-age=63072000; includeSubDomains; preload`                                                    | Forza HTTPS per 2 anni. Dopo la prima visita, il browser non tenterà mai connessioni HTTP. Con `preload`, si può essere inclusi nella lista hardcoded dei browser |

**Content Security Policy (CSP)** — la più importante e complessa:

```
default-src 'self'
```

Di default, tutto deve venire dallo stesso dominio del sito. Ogni eccezione viene dichiarata esplicitamente.

```
script-src 'self' https://plausible.io
```

Script: solo dal dominio del sito + Plausible Analytics. Nessun altro script esterno può girare.

```
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
```

CSS: dal dominio + inline (necessario per Tailwind che genera stili inline) + Google Fonts.

```
frame-ancestors 'none'
```

Come `X-Frame-Options: DENY`, ma è la versione moderna della stessa protezione.

```
form-action 'self' https://*.netlify.com
```

Il form può fare submit solo verso il dominio del sito e verso Netlify (per Netlify Forms).

### `[[headers]]` per `/admin*` — CSP permissiva per il CMS

```toml
[[headers]]
  for = "/admin*"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow"
    Content-Security-Policy = "... 'unsafe-eval' 'unsafe-inline' ..."
```

Il pannello CMS richiede una CSP molto più permissiva perché:

- Decap CMS usa `'unsafe-eval'` (il suo editor JavaScript genera codice dinamicamente)
- Carica risorse da CDN terzi: `unpkg.com`, `cdn.jsdelivr.net`
- Comunica con Netlify Identity e Cloudinary

`X-Robots-Tag: noindex, nofollow` dice ai motori di ricerca di non indicizzare il pannello admin.

**Nota tecnica**: questa sezione deve stare DOPO quella `/*` nel file. Netlify applica l'ultima regola che fa match — quindi `/admin/index.html` matcha sia `/*` che `/admin*`, ma siccome `/admin*` viene dopo, vince i suoi header.

---

## 13. Automazione CI/CD — `.github/workflows/`

### Cos'è CI/CD

**CI** (Continuous Integration): ogni volta che il codice viene pushato, un sistema automatizzato esegue una serie di controlli (format, type check, build, test). Se qualcosa non va, viene segnalato immediatamente con un'email e un badge rosso sulla PR.

**CD** (Continuous Deployment): quando un commit arriva su `main`, il sito viene automaticamente pubblicato. Netlify gestisce questo: basta connettere il repo al progetto Netlify.

Il vantaggio è che nessuno può accidentalmente rompere il sito senza che il team se ne accorga.

### `ci.yml` — format check

```yaml
name: Code Quality
on:
  push:
    branches: [main, master, develop, feat/**]
  pull_request:
    branches: [main, master, develop, feat/**]
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run format:check
```

**Trigger**: ogni push su `main`, `master`, `develop`, e tutti i branch che iniziano con `feat/`. Anche ogni PR verso questi branch.

**`concurrency` con `cancel-in-progress: true`**: se si fa push di un secondo commit prima che il CI del primo finisca, il job del primo viene cancellato. Evita di occupare runner GitHub Actions con job obsoleti.

**`node-version-file: .nvmrc`**: usa `.nvmrc` come fonte della versione Node invece di hardcodarla nel workflow. Se si aggiorna `.nvmrc`, la CI si aggiorna automaticamente.

**`cache: npm`**: GitHub Actions salva una copia di `node_modules` tra un'esecuzione e la successiva. Se `package-lock.json` non è cambiato, `npm ci` usa la cache invece di scaricare tutto di nuovo. Riduce il tempo del job da ~60s a ~10s.

**`npm ci`** invece di `npm install`: `npm ci` è pensato per la CI. Installa esattamente le versioni in `package-lock.json` senza aggiornare nulla, ed è più veloce di `npm install`.

### `playwright.yml` — E2E tests

```yaml
name: Playwright Tests
jobs:
  test:
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run check
      - run: npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

**`npx playwright install --with-deps`**: scarica i browser (Chromium, Firefox, WebKit) e tutte le dipendenze native di sistema necessarie per farli girare su Linux. Questo step richiede ~2-3 minuti.

**L'ordine degli step è intenzionale**:

1. Type check prima del build — fail fast se ci sono errori di tipo
2. Build prima dei test — i test testano il sito compilato
3. Test dopo il build

**`upload-artifact`** con `if: ${{ !cancelled() }}`\*\*: carica il report HTML di Playwright anche se i test falliscono. Senza questa condizione, se il job viene cancellato manualmente, l'artifact non verrebbe caricato. Con questa condizione, viene caricato sempre tranne in caso di cancellazione.

**`retention-days: 30`**: il report viene conservato per 30 giorni, poi cancellato automaticamente da GitHub Actions.

---

## 14. Netlify Function — `netlify/functions/deploy.js`

### Cos'è una Netlify Function

Una Netlify Function è una funzione serverless: un pezzo di codice che gira su un server gestito da Netlify, senza che tu debba gestire l'infrastruttura. Si attiva tramite una richiesta HTTP e smette di esistere dopo aver risposto.

```javascript
exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: 'Non autorizzato' };
  }

  const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
  if (!hookUrl) {
    return { statusCode: 500, body: 'Build hook non configurato' };
  }

  const response = await fetch(hookUrl, { method: 'POST' });
  if (!response.ok) {
    return { statusCode: 502, body: 'Errore del build hook: ' + response.status };
  }

  return { statusCode: 200, body: 'Deploy avviato' };
};
```

### Il flusso completo del "Manda in produzione"

1. Il redattore è nel pannello CMS (`/admin`), ha effettuato il login con Netlify Identity
2. Clicca il pulsante "🚀 Manda in produzione"
3. Il browser invia una richiesta `POST /api/deploy` con il JWT di autenticazione nell'header
4. In `netlify.toml` c'è un redirect: `POST /api/deploy` → `/.netlify/functions/deploy`
5. Netlify esegue la Function, che:
   - Verifica che il metodo sia POST
   - Verifica che l'utente sia autenticato tramite Netlify Identity
   - Legge la variabile d'ambiente `NETLIFY_BUILD_HOOK_URL`
   - Chiama il build hook di Netlify con una POST
6. Netlify riceve la chiamata al build hook e avvia un nuovo deploy

### Perché tutta questa complessità

Il problema: il CMS deve poter triggerare un build, ma senza esporre il build hook URL nel codice sorgente. Un build hook URL è un segreto: chiunque lo conosca può triggerare deploy illimitati.

La soluzione: il build hook URL sta in una **variabile d'ambiente** su Netlify (impostata nel dashboard, mai nel codice), e la function la usa internamente. Il frontend del CMS non la vede mai.

Inoltre, la function verifica l'autenticazione: solo gli utenti che hanno effettuato il login con Netlify Identity possono triggerare deploy.

### Come configurare `NETLIFY_BUILD_HOOK_URL`

1. Nel dashboard Netlify → Site settings → Build & deploy → Build hooks → "Add build hook"
2. Dare un nome ("CMS Deploy") e scegliere il branch (`main`)
3. Copiare l'URL generato
4. In Netlify → Site settings → Environment variables → aggiungere `NETLIFY_BUILD_HOOK_URL` con quell'URL come valore

---

## 15. Struttura `src/` — architettura del codice

### Il principio fondamentale: una fonte di verità

L'intera architettura di `src/` ruota attorno a questo principio: ogni dato esiste **in un solo posto**. Se si devono aggiornare il telefono, il nome dell'azienda o il numero di traslochi completati, si modifica un file. Un file, una modifica, fatto.

### `src/config/site.ts` — la fonte unica di verità

Ogni componente che ha bisogno di dati aziendali li importa da qui:

```typescript
import { site } from '../config/site';

// Nel template:
<a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
```

**Cosa non fare mai**:

```astro
<!-- ❌ SBAGLIATO: dati hardcoded nel componente -->
<a href="tel:+390733123456">0733 123456</a>
```

Se il numero cambia, con l'hardcoding bisogna trovare e modificare ogni componente che lo usa. Con `site.ts`, si modifica un campo e si rebuilda.

### `src/content.config.ts` — Content Collections con Zod

Le Content Collections sono il sistema di Astro per gestire contenuti Markdown con schema TypeScript validato:

```typescript
import { defineCollection, z } from 'astro:content';

const recensioni = defineCollection({
  type: 'content',
  schema: z.object({
    autore: z.string(),
    citta: z.string().optional(),
    rating: z.number().min(1).max(5),
    dataRecensione: z.coerce.date(),
    in_evidenza: z.boolean().default(false),
  }),
});
```

**Perché Markdown + Zod invece di hardcode nei componenti?**

Un redattore può aggiungere una recensione creando un file `.md` nel CMS senza toccare il codice. Lo schema Zod garantisce che il frontmatter sia corretto — se manca un campo obbligatorio o il rating non è tra 1 e 5, Astro genera un errore in build e non pubblica contenuti invalidi.

### `src/layouts/Layout.astro` — il wrapper di ogni pagina

Ogni pagina del sito usa questo layout:

```astro
---
import SEO from '../components/SEO.astro';
import SchemaOrg from '../components/SchemaOrg.astro';
---

<html lang="it">
  <head>
    <SEO {...Astro.props} />
    <SchemaOrg />
  </head>
  <body>
    <a href="#main" class="skip-link">Vai al contenuto principale</a>
    <slot />
  </body>
</html>
```

Il layout centralizza tutto ciò che va nell'`<head>`: meta tag, Open Graph, Schema.org, font, analytics. Le pagine non devono preoccuparsi di nulla di questo — passano solo `title` e `description` come prop e il resto viene gestito automaticamente.

**`<a href="#main">` skip link**: nascosto visivamente ma visibile quando si naviga con Tab. Permette agli utenti con screen reader o da tastiera di saltare direttamente al contenuto principale senza dover navigare tutto l'header. Requisito WCAG 2.2.

### `src/styles/global.css` — tema e stili base

```css
@import 'tailwindcss';

@theme {
  --color-brand: #bf282b;
  --color-brand-dark: #9a1f22;
  --font-display: 'Playfair Display';
}
```

Il tema viene definito qui con variabili CSS custom e reso disponibile come utility classes di Tailwind. `bg-brand`, `text-brand`, `font-display` sono utilizzabili in tutti i componenti perché derivano da `@theme`.

### `src/pages/` — routing file-based

Astro usa il file system per il routing: ogni file `.astro` in `src/pages/` diventa una route del sito.

| File                      | URL                       |
| ------------------------- | ------------------------- |
| `src/pages/index.astro`   | `/`                       |
| `src/pages/privacy.astro` | `/privacy`                |
| `src/pages/404.astro`     | `/404` (pagina di errore) |

### `src/components/sections/` — una sezione = un componente

Ogni sezione della home è un componente separato in `sections/`. Un componente non dovrebbe superare le 200 righe: se cresce troppo, si spezza.

```astro
<!-- index.astro - la home è solo una composizione di sezioni -->
<HeroSection />
<MissionStoriaSection />
<ServiziSection />
<RecensioniSection />
<LavoriSection />
<ContattiSection />
```

Vantaggi: ogni sezione è indipendente, si può sviluppare e testare isolatamente, è facile cambiare l'ordine o rimuovere una sezione.

---

## 16. CMS headless — `public/admin/`

### Cos'è Decap CMS

Decap CMS (ex Netlify CMS) è un **CMS git-based**: non ha un database. Ogni modifica ai contenuti crea un commit Git. La cartella `src/content/` è il "database" — file Markdown con frontmatter YAML.

**Vantaggi rispetto a WordPress o database:**

- Nessun server da mantenere
- I contenuti sono versionati con Git (si può fare rollback di qualsiasi modifica)
- Non ci sono problemi di sicurezza legati a database esposti
- Il sito rimane statico e velocissimo

### Come funziona il login

Netlify Identity gestisce l'autenticazione. Quando un redattore va su `/admin`, vede un pulsante "Login". Clicca, inserisce email e password, riceve un JWT. Quel JWT viene usato da tutte le chiamate API successive.

`public/identity-redirect.js` gestisce un caso specifico: quando Netlify invia un link di invito o reset password (es. `https://gbdesign.it/#invite_token=abc...`), questo script intercetta il token nell'URL e redirige a `/admin#invite_token=abc...` dove Decap CMS sa come gestirlo.

### `public/admin/config.yml`

Definisce quali campi appaiono nel pannello CMS per ogni content collection. Se la collection Astro ha un campo `rating: z.number()`, nel config.yml si mette:

```yaml
- label: Valutazione
  name: rating
  widget: number
  min: 1
  max: 5
```

Questo campo appare come input numerico nell'interfaccia del CMS.

### Il pulsante "Manda in produzione"

Di default, il CMS non ha un pulsante per deployare. È stato aggiunto custom in `public/admin/index.html`: un bottone che chiama la Netlify Function descritta nella sezione 14. Il pulsante appare solo dopo il login (altrimenti non avrebbe il JWT per autenticarsi).

---

## 17. Documentazione interna — `CLAUDE.md` e `docs/`

### Perché documentazione nel repo

La documentazione che vive nel repo è sempre aggiornata perché:

1. È modificabile dallo stesso strumento con cui si scrive il codice
2. Può essere richiesta come parte del processo di code review ("la PR modifica un'assunzione documentata?")
3. Non si perde se si cambia strumento (Notion, Confluence, ecc.)
4. Claude Code la legge automaticamente all'avvio di ogni sessione

### `CLAUDE.md` — il contratto con l'AI assistant

Quando si usa Claude Code, `CLAUDE.md` viene letto automaticamente all'inizio di ogni sessione. Definisce:

- Cosa fa il progetto e per chi
- Quale sia la "fonte unica di verità" per ogni tipo di dato
- Le regole di stile e tono del copy
- Le cose che non si devono mai fare
- Come l'AI deve approcciare le task

È in pratica un "sistema di istruzioni" che garantisce coerenza tra sessioni diverse.

### `docs/architettura.md`, `docs/qualita.md`, `docs/codice.md`

Tre guide operative che i dev (umani o AI) leggono quando lavorano su un'area specifica:

- **architettura.md**: struttura delle cartelle, stack tecnico, sezioni della home, schemi delle content collections, naming conventions
- **qualita.md**: target Lighthouse (≥95 su Performance, SEO, Accessibility), budget delle immagini, requisiti WCAG 2.2, Definition of Done, security headers
- **codice.md**: regole TypeScript, pattern Astro, setup Tailwind, conventional commits, comandi quotidiani, struttura del form Netlify, smoke test Playwright

---

## 18. Cosa manca: configurazione professionale perfetta

Questa sezione elenca le aggiunte che porterebbero l'infrastruttura al livello "enterprise" o "agenzia professionale". Sono ordinate dalla più urgente alla meno urgente.

---

### 18.1 `.env.example` — documentazione delle variabili d'ambiente

**Cosa manca**: non esiste un file `.env.example` nel repo.

**Perché serve**: chiunque cloni il repo non sa quali variabili d'ambiente configurare. Attualmente l'unica variabile necessaria è `NETLIFY_BUILD_HOOK_URL`, ma non è documentata da nessuna parte nel codice.

**Come aggiungerla**:

Creare `.env.example` nella root:

```bash
# .env.example — Copia questo file in .env e riempi i valori.
# NON committare mai .env

# URL del build hook Netlify (Dashboard → Site → Build hooks → Crea "CMS Deploy")
# Necessario solo per la Netlify Function deploy.js
NETLIFY_BUILD_HOOK_URL=https://api.netlify.com/build_hooks/TUO_HOOK_QUI
```

Committare `.env.example` (è sicuro: ha valori placeholder) e assicurarsi che `.env` sia in `.gitignore` (già fatto).

---

### 18.2 `.editorconfig` — consistenza tra editor

**Cosa manca**: non esiste un `.editorconfig`.

**Perché serve**: Prettier formatta il codice, ma non controlla come l'editor salva i file. Senza `.editorconfig`, un editor configurato male (es. WebStorm con tabs invece di spazi) può introdurre caratteri non visibili che poi Prettier deve correggere ad ogni commit.

**Come aggiungerlo**:

Creare `.editorconfig` nella root:

```ini
# .editorconfig — letto da VS Code, WebStorm, Vim, Emacs, ecc.
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

VS Code lo legge nativamente. WebStorm lo legge con un plugin. Garantisce che tutti gli editor salvino i file nello stesso modo.

---

### 18.3 Allineamento versione Node

**Problema attuale**: tre file definiscono la versione Node in modo incoerente.

| File                            | Versione    |
| ------------------------------- | ----------- |
| `.nvmrc`                        | 24          |
| `netlify.toml` → `NODE_VERSION` | 22          |
| `package.json` → `engines.node` | `>=22.12.0` |

**Soluzione**: scegliere una versione (consiglio: la stessa di Netlify, cioè 22 LTS) e aggiornarla in tutti e tre i file contemporaneamente.

```
# .nvmrc
22
```

```toml
# netlify.toml
NODE_VERSION = "22"
```

```json
# package.json
"engines": { "node": ">=22.12.0" }
```

---

### 18.4 Lighthouse CI ✅ locale — ⏳ GitHub Actions da aggiungere

**Stato**: `@lhci/cli` è installato e `.lighthouserc.json` è configurato. Il comando funziona in locale. Manca ancora il workflow GitHub Actions che lo esegue automaticamente su ogni PR.

**Perché serve**: ogni PR potrebbe introdurre un'immagine non ottimizzata o uno script che abbassa il LCP. Senza automazione, questo si scopre solo dopo il deploy.

#### `.lighthouserc.json` attuale

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4321/"],
      "startServerCommand": "npm run preview",
      "startServerReadyPattern": "Local:",
      "startServerReadyTimeout": 30000,
      "settings": {
        "chromeFlags": "--no-sandbox --disable-dev-shm-usage"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }, "error", { "minScore": 0.85 }],
        "categories:seo": ["warn", { "minScore": 0.9 }, "error", { "minScore": 0.9 }],
        "categories:accessibility": ["warn", { "minScore": 0.9 }, "error", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

Le soglie usano un doppio livello: `warn` avvisa senza bloccare, `error` blocca il CI. Le soglie SEO e accessibility hanno lo stesso valore per warn ed error, quindi in pratica si comportano come un hard block.

`startServerReadyTimeout: 30000` dà 30 secondi al server preview per avviarsi (il default è 15s, troppo poco su macchine lente).

#### Eseguire Lighthouse in locale su Windows + WSL2

`npx lhci autorun` gira **completamente in locale** — non ha bisogno di internet per girare (solo alla fine carica i risultati su `temporary-public-storage` per averli linkabili). Il flusso è:

1. Avvia `npm run preview` (serve `dist/`, quindi serve aver fatto `npm run build` prima)
2. Apre Chrome e naviga su `http://localhost:4321/`
3. Esegue Lighthouse 3 volte e fa la media dei punteggi
4. Confronta i punteggi con le soglie in `.lighthouserc.json`
5. Esce con codice 0 (OK) o 1 (fallimento) in base alle soglie

**Il problema su WSL2**: Lighthouse cerca Chrome nell'ambiente Linux, ma su WSL2 senza Chrome Linux installato trova il `google-chrome.exe` di Windows. Prova ad aprirlo, ma non riesce a connettersi alla porta DevTools perché il processo Chrome gira sul lato Windows mentre Lighthouse ascolta sul lato Linux.

**Soluzione**: installare Google Chrome per Linux nella WSL2.

```bash
# Scarica il pacchetto .deb
wget -q -O /tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Installa (richiede password sudo)
sudo apt install -y /tmp/google-chrome.deb
```

**Perché `--no-sandbox --disable-dev-shm-usage`**: Chrome in ambienti Linux senza display (WSL2, container Docker, runner CI) non ha accesso al namespace sandbox del kernel. Senza `--no-sandbox`, il browser si avvia ma non riesce ad aprire nessuna pagina. `--disable-dev-shm-usage` risolve un problema di memoria condivisa che causa crash su sistemi con `/dev/shm` piccolo (comune nei container).

Questi due flag sono **sicuri** in questo contesto perché LHCI apre Chrome solo per misurare un sito locale, non per navigare contenuti non fidati.

#### Come eseguire

```bash
# Prima, assicurarsi che dist/ sia aggiornato
npm run build

# Poi eseguire Lighthouse
npx lhci autorun
```

Se il build è già fresco (es. hai appena fatto `npm run preview` e il sito gira), puoi saltare il build. Il server preview che LHCI avvia usa `dist/` così com'è.

#### GitHub Actions (ancora da aggiungere)

Per completare l'automazione, aggiungere `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI
on:
  pull_request:
    branches: [main]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npx lhci autorun
```

In GitHub Actions non serve installare Chrome separatamente: `ubuntu-latest` ha già Chromium. I flag `--no-sandbox --disable-dev-shm-usage` nel `.lighthouserc.json` sono necessari anche lì (i runner CI sono container Linux senza display).

---

### 18.5 Dependabot — aggiornamenti automatici delle dipendenze

**Cosa manca**: nessuna automazione che avvisi quando le dipendenze hanno nuove versioni o vulnerabilità.

**Perché serve**: `npm audit` rileva vulnerabilità, ma bisogna ricordarsi di eseguirlo. Le dipendenze invecchiano: dopo 6 mesi un progetto senza aggiornamenti può avere 20+ versioni in ritardo. Dependabot crea PR automatiche con gli aggiornamenti.

**Come aggiungerlo**:

Creare `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # Dipendenze npm
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
    open-pull-requests-limit: 5
    groups:
      # Raggruppa aggiornamenti minor/patch in una PR sola
      minor-and-patch:
        update-types:
          - minor
          - patch

  # Workflow GitHub Actions
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: monthly
```

---

### 18.6 `SECURITY.md` — politica di responsible disclosure

**Cosa manca**: nessuna documentazione su come riportare vulnerabilità di sicurezza.

**Perché serve**: se qualcuno trova una vulnerabilità nel sito (es. un XSS, una misconfiguration del CMS), senza un `SECURITY.md` non sa come segnalarla. Potrebbe aprire una issue pubblica su GitHub, esponendo la vulnerabilità prima che sia fixata.

**Come aggiungerlo**:

Creare `SECURITY.md` nella root:

```markdown
# Security Policy

## Segnalare una vulnerabilità

Se hai trovato una vulnerabilità di sicurezza, **non aprire una issue pubblica**.

Invia una email a: info@gbdesign.it  
Oggetto: [SECURITY] descrizione breve

Risponderemo entro 48 ore. La vulnerabilità verrà fixata prima di qualsiasi disclosure pubblica.
```

---

### 18.7 Bundle size tracking in CI

**Cosa manca**: nessuna verifica automatica che il JavaScript totale rimanga sotto i 30 KB (come documentato in `docs/qualita.md`).

**Perché serve**: una dipendenza introdotta accidentalmente può far esplodere il bundle. Senza un check, si scopre solo quando le performance calano.

**Come aggiungerlo**:

Installare: `npm install --save-dev bundlesize`

Aggiungere in `package.json`:

```json
"bundlesize": [
  {
    "path": "./dist/_astro/*.js",
    "maxSize": "30 kB"
  }
]
```

Aggiungere nel CI dopo il build:

```yaml
- run: npx bundlesize
```

---

### 18.8 `CODEOWNERS` — reviewer automatici

**Cosa manca**: nessuna regola che assegni automaticamente un reviewer quando viene aperta una PR che tocca certi file.

**Perché serve**: se ci sono più sviluppatori, è utile che le PR sui file legali (privacy, cookie, termini) vengano automaticamente assegnate al responsabile, e le PR sulla configurazione CI a chi la gestisce.

**Come aggiungerlo**:

Creare `.github/CODEOWNERS`:

```
# Chiunque fa una PR verso main
*                       @rizzutomatteo

# PR che toccano file legali
src/pages/privacy.astro  @rizzutomatteo
src/pages/cookie.astro   @rizzutomatteo
src/pages/termini.astro  @rizzutomatteo

# PR che toccano CI/CD
.github/                 @rizzutomatteo
netlify.toml             @rizzutomatteo
```

---

### Riepilogo — priorità

| #   | Cosa aggiungere       | Tempo stimato             | Impatto                 |
| --- | --------------------- | ------------------------- | ----------------------- |
| 1   | `.env.example`        | 5 minuti                  | Onboarding + sicurezza  |
| 2   | `.editorconfig`       | 5 minuti                  | Consistenza editor      |
| 3   | Allinea versione Node | 5 minuti                  | Coerenza infrastruttura |
| 4   | Lighthouse CI         | ✅ locale / ⏳ GH Actions | Quality gate automatico |
| 5   | Dependabot            | 10 minuti                 | Sicurezza dipendenze    |
| 6   | `SECURITY.md`         | 10 minuti                 | Responsible disclosure  |
| 7   | Bundle size check     | 15 minuti                 | Performance gate        |
| 8   | `CODEOWNERS`          | 10 minuti                 | Governance PR           |

---

_Ultima revisione: 19 maggio 2026._
