/**
 * GET /api/callback: second half of the GitHub login for /admin (Decap CMS).
 *
 * GitHub sends the editor here with a `code`. After checking `state` against the
 * cookie set by api/auth.ts, we trade the code for an access token and hand it to
 * the Decap window that opened the popup, using Decap's postMessage handshake:
 *
 *   popup  -> opener: "authorizing:github"
 *   opener -> popup:  (any message, proves the opener is listening)
 *   popup  -> opener: "authorization:github:success:{token,provider}"
 *
 * The token is only ever posted to a window on this same origin.
 * Needs OAUTH_GITHUB_CLIENT_ID and OAUTH_GITHUB_CLIENT_SECRET in the environment.
 */

type Result = { status: 'success'; token: string } | { status: 'error'; message: string };

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

function page(result: Result): Response {
  const content =
    result.status === 'success'
      ? { token: result.token, provider: 'github' }
      : { message: result.message, provider: 'github' };
  const message = `authorization:github:${result.status}:${JSON.stringify(content)}`;
  // JSON in a <script> block: escape "<" so the payload can never close the tag.
  const payload = JSON.stringify(message).replace(/</g, '\\u003c');
  const text =
    result.status === 'success'
      ? 'Je bent ingelogd. Dit venster sluit vanzelf.'
      : `Inloggen is niet gelukt: ${result.message}`;

  const html = `<!doctype html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Inloggen</title></head>
<body style="font-family: system-ui, sans-serif; padding: 2rem;">
<p id="tekst"></p>
<script>
(function () {
  var message = ${payload};
  var origin = window.location.origin;
  document.getElementById('tekst').textContent = ${JSON.stringify(text).replace(/</g, '\\u003c')};
  if (!window.opener) return;
  function receive(event) {
    if (event.origin !== origin) return;
    window.removeEventListener('message', receive);
    window.opener.postMessage(message, origin);
  }
  window.addEventListener('message', receive);
  window.opener.postMessage('authorizing:github', origin);
})();
</script>
</body>
</html>`;

  return new Response(html, {
    status: result.status === 'success' ? 200 : 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': 'decap_oauth_state=; Path=/api; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return page({ status: 'error', message: 'OAUTH_GITHUB_CLIENT_ID of OAUTH_GITHUB_CLIENT_SECRET ontbreekt.' });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = readCookie(request, 'decap_oauth_state');

  if (url.searchParams.get('error')) {
    return page({ status: 'error', message: url.searchParams.get('error_description') ?? 'GitHub weigerde de toegang.' });
  }
  if (!code || !state || !expected || state !== expected) {
    return page({ status: 'error', message: 'de sessie is verlopen of ongeldig. Probeer het opnieuw.' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${url.origin}/api/callback`,
      }),
    });
    const data = (await response.json()) as { access_token?: string; error_description?: string };
    if (!response.ok || !data.access_token) {
      return page({ status: 'error', message: data.error_description ?? 'GitHub gaf geen toegangssleutel terug.' });
    }
    return page({ status: 'success', token: data.access_token });
  } catch {
    return page({ status: 'error', message: 'GitHub was niet bereikbaar. Probeer het later opnieuw.' });
  }
}
