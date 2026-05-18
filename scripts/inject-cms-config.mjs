/**
 * Inietta le credenziali Cloudinary in public/admin/config.yml a build time.
 * Richiede le variabili d'ambiente CLOUDINARY_CLOUD_NAME e CLOUDINARY_API_KEY
 * impostate nelle env vars di Netlify.
 * Se non presenti, il CMS funziona senza Cloudinary (upload locale in /images/cms).
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, '../public/admin/config.yml');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;

if (!cloudName || !apiKey) {
  console.log('[cms-config] Variabili Cloudinary non impostate — il CMS usa upload locale.');
  process.exit(0);
}

let config = readFileSync(configPath, 'utf8');
config = config
  .replace('__CLOUDINARY_CLOUD_NAME__', cloudName)
  .replace('__CLOUDINARY_API_KEY__', apiKey);
writeFileSync(configPath, config);
console.log('[cms-config] Credenziali Cloudinary iniettate con successo.');
