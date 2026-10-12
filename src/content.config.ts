import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categorieen, eigenaren, vraagSlugs } from './lib/club';

const categorieSlugs = categorieen.map((c) => c.slug);
const eigenaarSlugs = eigenaren.map((e) => e.slug);

const faq = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/faq',
    // The file name is the URL. A "slug" field in the frontmatter is ignored here on
    // purpose, so editing it in /admin can never break links that were already shared.
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    vraag: z.string().trim().min(5, { error: 'De vraag is te kort.' }),
    // Only used by /admin to choose the file name of a new entry.
    slug: z.string().nullish(),
    categorie: z.enum(categorieSlugs, {
      error: `Onbekende categorie. Kies uit: ${categorieSlugs.join(', ')} (zie src/content/categorieen.yaml).`,
    }),
    eigenaar: z.enum(eigenaarSlugs, {
      error: `Onbekende eigenaar. Kies uit: ${eigenaarSlugs.join(', ')} (zie src/content/eigenaren.yaml).`,
    }),
    laatst_gecheckt: z.coerce.date({ error: 'laatst_gecheckt moet een datum zijn, bijvoorbeeld 2026-10-12.' }),
    status: z.enum(['concept', 'gepubliceerd'], { error: 'status moet "concept" of "gepubliceerd" zijn.' }),
    trefwoorden: z
      .array(z.string())
      .nullish()
      .transform((v) => v ?? []),
    gerelateerd: z
      .array(
        z.enum(vraagSlugs, {
          error: (issue) => `Gerelateerde vraag "${String(issue.input)}" bestaat niet in src/content/faq.`,
        }),
      )
      .nullish()
      .transform((v) => v ?? []),
  }),
});

export const collections = { faq };
