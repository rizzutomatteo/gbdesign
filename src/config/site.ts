import cms from '../data/impostazioni.json';

// I campi editabili dal CMS vengono da impostazioni.json.
// I dati legali (P. IVA, REA, indirizzo) non sono esposti nel CMS:
// vanno aggiornati qui dal developer prima del go-live.
export const site = {
  ...cms,
  piva: '01234567891',
  rea: 'MC-123456',
  address: {
    street: 'Via Esempio, 1',
    city: 'Macerata',
    province: 'MC',
    zip: '62100',
  },
};

export type Site = typeof site;
