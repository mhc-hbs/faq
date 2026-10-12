import type { APIRoute } from 'astro';
import { ogPng, pngAntwoord } from '../../lib/og';

/** Share image for the home page, category pages and search. */
export const GET: APIRoute = async () =>
  pngAntwoord(await ogPng({ label: 'Veelgestelde vragen', titel: 'Vragen en antwoorden voor leden, ouders en begeleiders' }));
