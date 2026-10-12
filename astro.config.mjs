// @ts-check
import { defineConfig } from 'astro/config';

// Absolute site address, used for canonical links and link previews (og:url, og:image).
// On Vercel the production domain is filled in automatically; SITE_URL overrides it.
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
});
