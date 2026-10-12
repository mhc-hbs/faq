/**
 * Reads the two lists that FAQ entries refer to: src/content/categorieen.yaml and
 * src/content/eigenaren.yaml. The content schema uses them to reject typos, the
 * pages use them for names and e-mail addresses, and scripts/decap-config.mjs
 * reads the same files for the select fields in /admin.
 *
 * Any mistake in these files stops the build with a message in plain Dutch.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export interface Categorie {
  slug: string;
  naam: string;
  omschrijving: string;
  volgorde: number;
}

export interface Eigenaar {
  slug: string;
  naam: string;
  email: string;
}

const CONTENT_DIR = join(process.cwd(), 'src', 'content');
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Top-level paths that already exist; a category with one of these names would clash.
const GERESERVEERD = new Set(['admin', 'api', 'zoeken', 'pagefind', 'uploads', 'uitleg', 'og', '404']);

function leesLijst(bestand: string): Record<string, unknown>[] {
  const pad = join(CONTENT_DIR, bestand);
  const data: unknown = parse(readFileSync(pad, 'utf8'));
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`${bestand}: verwacht een lijst met minstens een item.`);
  }
  return data as Record<string, unknown>[];
}

function tekst(item: Record<string, unknown>, veld: string, bestand: string): string {
  const waarde = item[veld];
  if (typeof waarde !== 'string' || waarde.trim() === '') {
    throw new Error(`${bestand}: veld "${veld}" ontbreekt of is leeg bij ${JSON.stringify(item)}.`);
  }
  return waarde.trim();
}

function controleerSlugs(slugs: string[], bestand: string): void {
  const gezien = new Set<string>();
  for (const slug of slugs) {
    if (!SLUG_RE.test(slug)) {
      throw new Error(`${bestand}: slug "${slug}" mag alleen kleine letters, cijfers en streepjes bevatten.`);
    }
    if (gezien.has(slug)) throw new Error(`${bestand}: slug "${slug}" komt dubbel voor.`);
    gezien.add(slug);
  }
}

function laadCategorieen(): Categorie[] {
  const bestand = 'categorieen.yaml';
  const lijst = leesLijst(bestand).map((item) => ({
    slug: tekst(item, 'slug', bestand),
    naam: tekst(item, 'naam', bestand),
    omschrijving: tekst(item, 'omschrijving', bestand),
    volgorde: Number(item.volgorde ?? 0),
  }));
  controleerSlugs(lijst.map((c) => c.slug), bestand);
  for (const c of lijst) {
    if (GERESERVEERD.has(c.slug)) {
      throw new Error(`${bestand}: "${c.slug}" kan geen categorie zijn, dat adres is al in gebruik.`);
    }
  }
  return lijst.sort((a, b) => a.volgorde - b.volgorde || a.naam.localeCompare(b.naam, 'nl'));
}

function laadEigenaren(): Eigenaar[] {
  const bestand = 'eigenaren.yaml';
  const lijst = leesLijst(bestand).map((item) => ({
    slug: tekst(item, 'slug', bestand),
    naam: tekst(item, 'naam', bestand),
    email: tekst(item, 'email', bestand),
  }));
  controleerSlugs(lijst.map((e) => e.slug), bestand);
  for (const e of lijst) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)) {
      throw new Error(`${bestand}: "${e.email}" bij ${e.slug} is geen geldig e-mailadres.`);
    }
  }
  return lijst;
}

/** Slugs of all FAQ files, taken from the file names (the file name is the URL). */
function laadVraagSlugs(): string[] {
  const slugs = readdirSync(join(CONTENT_DIR, 'faq'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -3));
  for (const slug of slugs) {
    if (!SLUG_RE.test(slug)) {
      throw new Error(
        `src/content/faq/${slug}.md: de bestandsnaam is ook het adres en mag alleen kleine letters, cijfers en streepjes bevatten.`,
      );
    }
  }
  return slugs;
}

export const categorieen = laadCategorieen();
export const eigenaren = laadEigenaren();
export const vraagSlugs = laadVraagSlugs();

export function categorie(slug: string): Categorie {
  const c = categorieen.find((x) => x.slug === slug);
  if (!c) throw new Error(`Onbekende categorie "${slug}".`);
  return c;
}

export function eigenaar(slug: string): Eigenaar {
  const e = eigenaren.find((x) => x.slug === slug);
  if (!e) throw new Error(`Onbekende eigenaar "${slug}".`);
  return e;
}
