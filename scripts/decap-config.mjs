// Builds public/admin/config.yml from decap/config.yml and fills the select fields
// "categorie" and "eigenaar" from src/content/categorieen.yaml and eigenaren.yaml.
// Runs before every dev and build (see package.json).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parse, stringify } from 'yaml';

const lees = (pad) => parse(readFileSync(pad, 'utf8'));

const config = lees('decap/config.yml');
const categorieen = lees('src/content/categorieen.yaml')
  .slice()
  .sort((a, b) => (a.volgorde ?? 0) - (b.volgorde ?? 0));
const eigenaren = lees('src/content/eigenaren.yaml');

const faq = config.collections.find((c) => c.name === 'faq');
if (!faq) throw new Error('decap/config.yml: collectie "faq" niet gevonden.');

const veld = (naam) => {
  const v = faq.fields.find((f) => f.name === naam);
  if (!v) throw new Error(`decap/config.yml: veld "${naam}" niet gevonden.`);
  return v;
};

veld('categorie').options = categorieen.map((c) => ({ label: c.naam, value: c.slug }));
veld('eigenaar').options = eigenaren.map((e) => ({ label: e.naam, value: e.slug }));

const kop =
  '# NIET BEWERKEN. Dit bestand wordt gemaakt door scripts/decap-config.mjs.\n' +
  '# Pas decap/config.yml, src/content/categorieen.yaml of src/content/eigenaren.yaml aan.\n\n';

mkdirSync('public/admin', { recursive: true });
writeFileSync('public/admin/config.yml', kop + stringify(config, { lineWidth: 0 }));
console.log(`admin/config.yml: ${categorieen.length} categorieen, ${eigenaren.length} eigenaren.`);
