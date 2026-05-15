import { z } from 'zod';
import cmsRaw from '../data/impostazioni.json';

const CmsSchema = z.object({
  googleReviews: z.string().url(),
  name: z.string(),
  social: z.object({
    facebook: z.string().url(),
    instagram: z.string().url(),
  }),
  phone: z.string(),
  tagline: z.string(),
  whatsapp: z.string(),
  phoneDisplay: z.string(),
  email: z.string().email(),
  description: z.string(),
  stats: z.object({
    anni: z.number(),
    lavori: z.number(),
    rating: z.string(),
    recensioni: z.number(),
  }),
});

// I campi editabili dal CMS vengono da impostazioni.json.
// I dati legali (P. IVA, REA, indirizzo) non sono esposti nel CMS:
// vanno aggiornati qui dal developer prima del go-live.
const cms = CmsSchema.parse(cmsRaw);

export const site = {
  ...cms,
  url: 'https://www.gbdesign.it',
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

export type NavItem = {
  href: string;
  label: string;
  footerLabel?: string;
  inFooter?: boolean;
};

export const nav: NavItem[] = [
  { href: '/missione', label: 'Mission' },
  { href: '/storia', label: 'Storia', footerLabel: 'La nostra storia' },
  { href: '/servizi', label: 'Servizi' },
  { href: '#recensioni', label: 'Recensioni' },
  { href: '#lavori', label: 'Lavori', inFooter: false },
  { href: '#contatti', label: 'Contatti' },
];
