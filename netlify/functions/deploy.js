// Netlify Function: trigger build solo per utenti autenticati con Netlify Identity.
// Netlify verifica il JWT dall'header Authorization e popola context.clientContext.user.
// L'URL del build hook va impostato come env var NETLIFY_BUILD_HOOK_URL nel dashboard Netlify.
exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: 'Non autorizzato' };
  }

  const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
  if (!hookUrl) {
    return { statusCode: 500, body: 'Build hook non configurato' };
  }

  const response = await fetch(hookUrl, { method: 'POST' });
  if (!response.ok) {
    return { statusCode: 502, body: 'Errore del build hook: ' + response.status };
  }

  return { statusCode: 200, body: 'Deploy avviato' };
};
