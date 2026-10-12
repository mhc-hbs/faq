import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Share images (1200x630) in club colours, rendered at build time. Satori turns a small
// element tree into SVG, resvg turns that into PNG. No browser and no external service.

const require = createRequire(import.meta.url);
const font = (gewicht: number) =>
  readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${gewicht}-normal.woff`));

const FONTS = [
  { name: 'Inter', data: font(500), weight: 500 as const, style: 'normal' as const },
  { name: 'Inter', data: font(800), weight: 800 as const, style: 'normal' as const },
];

const LOGO = `data:image/png;base64,${readFileSync(join(process.cwd(), 'public', 'logo.png')).toString('base64')}`;

const ROOD = '#be0027';
const ZWART = '#1b1b1d';

type Stijl = Record<string, string | number>;
type Knoop = { type: string; props: { style?: Stijl; children?: unknown; [k: string]: unknown } };

function h(type: string, style: Stijl, ...children: unknown[]): Knoop {
  return { type, props: { style, children: children.length === 1 ? children[0] : children } };
}

function img(src: string, width: number, height: number): Knoop {
  return { type: 'img', props: { src, width, height } };
}

/** Smaller type for longer questions, so they fit in at most four lines. */
function kopMaat(tekst: string): number {
  if (tekst.length <= 40) return 72;
  if (tekst.length <= 70) return 62;
  if (tekst.length <= 100) return 54;
  return 46;
}

interface Kaart {
  /** Small red line above the title, such as the category name. */
  label: string;
  titel: string;
}

export async function ogPng({ label, titel }: Kaart): Promise<Uint8Array> {
  const boom = h(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: ZWART,
      borderBottom: `16px solid ${ROOD}`,
      fontFamily: 'Inter',
      color: '#ffffff',
    },
    // Top row: site name.
    h(
      'div',
      { display: 'flex', alignItems: 'center', padding: '56px 64px 0' },
      h('div', { display: 'flex', fontSize: 32, fontWeight: 800 }, 'MHC HBS'),
      h('div', { display: 'flex', marginLeft: 12, fontSize: 32, fontWeight: 500, color: '#b9b9bf' }, 'Vragen'),
    ),
    // Main block: label and question, with the shield large on the right.
    h(
      'div',
      { display: 'flex', flex: 1, alignItems: 'center', padding: '0 64px' },
      h(
        'div',
        { display: 'flex', flexDirection: 'column', flex: 1, paddingRight: 48 },
        h(
          'div',
          {
            display: 'flex',
            fontSize: 26,
            fontWeight: 800,
            color: '#ff4d6a',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 20,
          },
          label,
        ),
        h(
          'div',
          { display: 'flex', fontSize: kopMaat(titel), fontWeight: 800, lineHeight: 1.12, letterSpacing: -1 },
          titel,
        ),
      ),
      img(LOGO, 250, 295),
    ),
  );

  const svg = await satori(boom as never, { width: 1200, height: 630, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}

export function pngAntwoord(png: Uint8Array): Response {
  return new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png' } });
}
