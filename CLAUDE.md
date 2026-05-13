# CLAUDE.md — GB Design (Traslochi)

> Contesto del progetto letto automaticamente da Claude Code all'avvio.
> Tienilo **slim**: dettagli operativi vivono in `docs/`. Aggiorna sia questo file sia i `docs/` quando cambia un'assunzione.

---

## 1. Cos'è questo progetto

**Cliente**: GB Design — impresa di traslochi e montaggio mobili attiva nella **provincia di Macerata (Marche)**.

**Tipo di sito**: **one-pager vetrina** semplice, conciso, professionale. Una sola pagina lunga con sezioni in anchor, più pagine legali. Niente blog, niente e-commerce, niente area riservata.

**Obiettivo**: presentare l'azienda con serietà e portare contatti via **telefono, WhatsApp, email, form**. Il telefono è la conversione principale: il form è solo un'opzione in più.

**Pubblico**:
- **Privati** del maceratese (30-60 anni), valorizzano serietà e contatto umano.
- **Aziende**: PMI, uffici, attività commerciali che spostano sede.

**Servizi raccontati nella home (non in pagine dedicate)**: traslochi residenziali, traslochi aziendali, montaggio e smontaggio mobili.

---

## 2. Dove vivono i dati aziendali

**Fonte unica di verità**: `src/config/site.ts`.

Telefono, email, indirizzi delle sedi, P. IVA, social, numeri chiave (anni, traslochi completati, recensioni) sono **lì e solo lì**. Nessun componente hardcoda questi valori: si importa sempre dalla config.

Quando il cliente dice *"cambia il telefono"* o *"aggiorniamo il numero di traslochi a 3000"* → si modifica solo `src/config/site.ts`.

---

## 3. Sezioni della home (ordine canonico)

L'identità del sito è la sequenza di sezioni. Ognuna ha il suo componente in `src/components/sections/`.

1. **Header** sticky — logo + nav anchor + telefono + CTA preventivo
2. **Hero** — claim + sottoclaim + due CTA + foto mezzo/squadra
3. **Mission** — 3-4 righe, chi siamo e cosa promettiamo
4. **I numeri** — counter animati (anni, traslochi, clienti, voto medio)
5. **Come lavoriamo** — 4-5 step del processo con icona e foto
6. **I nostri lavori** — gallery 6-9 foto con lightbox
7. **Recensioni** — 3-6 testimonianze + badge Google se presente
8. **Storia** — timeline 4-6 tappe dal 2008 ad oggi
9. **Sedi** — card per sede con indirizzo, orari, mappa (lazy)
10. **Social** — link Instagram, Facebook, ecc.
11. **Contatti** — form breve + telefono + WhatsApp
12. **Footer** — P. IVA, REA, link legali, copyright

Pagine separate dalla home: `/privacy`, `/cookie`, `/404`. Eventualmente `/contatti` e `/grazie` (post-form).

---

## 4. Tono di voce

**Amichevole, rassicurante, umano**. Il trasloco è uno dei momenti più stressanti della vita: il sito abbassa la tensione, non parla come una multinazionale.

- **Tu** ai privati. **Voi** alle aziende quando il contesto lo richiede. Mai *"Lei"*.
- Frasi corte. Verbi attivi. Concretezza.
- Prima **cosa risolviamo**, poi **cosa facciamo**.
- CTA chiare e ripetute: *"Chiamaci"*, *"Scrivici su WhatsApp"*, *"Richiedi un preventivo"*.

Esempi giusti:
> Traslocare stanca. Ce ne occupiamo noi: imballiamo, carichiamo, montiamo i mobili nella tua nuova casa. Tu pensi solo a rilassarti.

> Devi spostare l'ufficio senza fermare l'attività? Veniamo nel weekend, lunedì sei operativo.

Esempi da evitare:
> ❌ Soluzioni di mobility integrate per il vostro relocation aziendale.
> ❌ Il sottoscritto è lieto di offrire la massima professionalità.

---

## 5. Cose che NON si fanno (mai)

- Mai aggiungere Google Analytics, Meta Pixel, Hotjar o tracker invasivi senza chiedere
- Mai hardcodare dati aziendali nei componenti: si importa da `src/config/site.ts`
- Mai usare `any` in TypeScript
- Mai testo in inglese sulle pagine pubbliche (sito solo italiano)
- Mai `<img>` per immagini importate: sempre `<Image />` di Astro
- Mai componenti monolitici > 200 righe: spezza
- Mai committare senza prima formattare con Prettier
- Mai rimuovere `lang="it"` da `<html>`
- Mai usare *"Lei"* nel copy
- Mai animazioni senza rispettare `prefers-reduced-motion`
- Mai pubblicare immagini senza alt text (eccetto le decorative con `alt=""`)
- Mai caricare iframe mappe al `load` della home (uccide LCP): vanno dietro un click
- Mai aggiungere dipendenze nuove senza giustificarle

---

## 6. Come Claude approccia le task

**All'inizio di una sessione**:
1. Leggi questo `CLAUDE.md` per intero
2. Apri `src/config/site.ts` per allinearti sui dati correnti
3. Esplora il codice rilevante prima di modificarlo
4. Per task complesse: **Plan Mode**, mostra il piano, attendi conferma

**Granularità**: una richiesta = una cosa. Meglio 5 commit piccoli che 1 gigante. Se l'utente dice *"crea l'intera home"*, proponi di farla **per sezioni** (Hero, poi Mission, poi Numeri…) con revisione visiva tra una e l'altra.

**Quando la richiesta è ambigua**: chiedi chiarimenti prima di scrivere codice.

> *"Aggiungi le recensioni."*
> → *"Tre cose prima di partire: 1) content collection Markdown o tre fisse nel componente? 2) Con stelle o solo testo + nome + città? 3) Carosello o griglia?"*

**Quando la richiesta entra in conflitto col CLAUDE.md o coi `docs/`**: segnala il conflitto, non eseguire silenziosamente.

> *"Aggiungi Google Analytics."*
> → *"Il §5 vieta tracker invasivi senza conferma. GA4 richiede cookie banner. Posso configurare Plausible (già nello stack) in 5 minuti — va bene?"*

**Aggiornare la documentazione**: se durante una task emerge una convenzione nuova o ne viene contraddetta una scritta, chiedi all'utente di aggiornare il file corretto **prima** di andare avanti. La memoria del progetto vive in questi file.

---

## 7. Indice della documentazione

Quando lavori su un'area specifica, **leggi anche il file dedicato**. Sono in `docs/`.

| Quando lavori su… | Leggi anche |
|---|---|
| File tree, sezioni, stack tecnico, content collections | [`docs/architettura.md`](docs/architettura.md) |
| SEO, Schema.org, accessibilità, performance, Definition of Done | [`docs/qualita.md`](docs/qualita.md) |
| TypeScript, Astro, Tailwind, naming, Git, comandi, form Netlify | [`docs/codice.md`](docs/codice.md) |

**Regola operativa**: non aprire i `docs/` "per scrupolo" se la task è banale (es. cambiare un testo). Aprili solo quando lavori sull'area che coprono. Risparmi contesto.

---

## 8.  github


---

*Ultima revisione: 12 maggio 2026.*

