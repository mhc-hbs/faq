import type { APIRoute, GetStaticPaths } from 'astro';
import { categorie } from '../../../lib/club';
import { zichtbareVragen, type Vraag } from '../../../lib/faq';
import { ogPng, pngAntwoord } from '../../../lib/og';

/** Share image per question, used as og:image on the question page. */
export const getStaticPaths = (async () => {
  const vragen = await zichtbareVragen();
  return vragen.map((vraag) => ({
    params: { categorie: vraag.data.categorie, slug: vraag.id },
    props: { vraag },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ vraag: Vraag }> = async ({ props }) => {
  const { vraag } = props;
  return pngAntwoord(await ogPng({ label: categorie(vraag.data.categorie).naam, titel: vraag.data.vraag }));
};
