import { z } from 'zod';
import cmsRaw from '../data/impostazioni.json';

const CmsSchema = z.object({
  googleReviews: z.url(),
  name: z.string(),
  social: z.object({
    facebook: z.url().or(z.literal('')).optional(),
    instagram: z.url().or(z.literal('')).optional(),
  }),
  phone: z.string(),
  tagline: z.string(),
  whatsapp: z.string(),
  phoneDisplay: z.string(),
  email: z.email(),
  description: z.string(),
  stats: z.object({
    anni: z.number(),
    lavori: z.number(),
    rating: z.number(),
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
  // TODO: sostituire con P.IVA e REA reali prima del go-live
  piva: '01234567891',
  rea: 'MC-123456',
  address: {
    street: 'Via Esempio, 1',
    city: 'Macerata',
    province: 'MC',
    zip: '62100',
  },
  legalUpdatedAt: '16 maggio 2026',
};

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
