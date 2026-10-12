/**
 * GET /api/auth: first half of the GitHub login for /admin (Decap CMS).
 *
 * Decap opens this route in a popup. We send the editor on to GitHub with a random
 * `state` value, also stored in a short-lived cookie, which api/callback.ts checks
 * when GitHub sends the editor back. Needs OAUTH_GITHUB_CLIENT_ID in the environment.
 *
 * Runs on the Vercel Node.js runtime with the Web-standard Request/Response API.
 */

// Scopes Decap may ask for via `auth_scope` in decap/config.yml. Anything else falls back to public_repo.
const ALLOWED_SCOPES = new Set(['public_repo', 'repo']);

export function GET(request: Request): Response {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response('OAUTH_GITHUB_CLIENT_ID ontbreekt in de Vercel-instellingen.', { status: 500 });
  }

  const url = new URL(request.url);
  const requested = url.searchParams.get('scope') ?? '';
  const scope = ALLOWED_SCOPES.has(requested) ? requested : 'public_repo';
  const state = crypto.randomUUID();

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  authorize.searchParams.set('scope', scope);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('allow_signup', 'true');

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      'Set-Cookie': `decap_oauth_state=${state}; Path=/api; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  });
}
