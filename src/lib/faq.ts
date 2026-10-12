import { getCollection, type CollectionEntry } from 'astro:content';

export type Vraag = CollectionEntry<'faq'>;

/** PREVIEW=true also builds entries with status "concept" (with a visible banner). */
export const PREVIEW = process.env.PREVIEW === 'true';

/** All entries that belong on the site, sorted by question. */
export async function zichtbareVragen(): Promise<Vraag[]> {
  const vragen = await getCollection('faq', (v) => PREVIEW || v.data.status === 'gepubliceerd');
  return vragen.sort((a, b) => a.data.vraag.localeCompare(b.data.vraag, 'nl'));
}

export function vraagUrl(v: Vraag): string {
  return `/${v.data.categorie}/${v.id}`;
}

/** Markdown to a single line of plain text, for og:description and meta description. */
export function platteTekst(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/^\s*\|?[\s:-]*\|[\s|:-]*$/gm, ' ')
    .replace(/\|/g, ' ')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function inkorten(tekst: string, max = 150): string {
  if (tekst.length <= max) return tekst;
  const kort = tekst.slice(0, max - 1);
  const spatie = kort.lastIndexOf(' ');
  return `${(spatie > max * 0.6 ? kort.slice(0, spatie) : kort).replace(/[\s.,;:]+$/, '')}…`;
}

export function datumNL(d: Date): string {
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

/** True when the answer was last checked more than 12 months before `nu`. */
export function isVerouderd(gecheckt: Date, nu: Date = new Date()): boolean {
  const grens = new Date(nu);
  grens.setUTCFullYear(grens.getUTCFullYear() - 1);
  return gecheckt < grens;
}
