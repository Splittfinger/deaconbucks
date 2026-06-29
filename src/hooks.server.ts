import type { Handle } from '@sveltejs/kit';
import { getUserFromSession, SESSION_COOKIE } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const db = event.platform?.env?.DB ?? null;
  event.locals.db = db;
  event.locals.user = null;

  if (db) {
    event.locals.user = await getUserFromSession(db, event.cookies.get(SESSION_COOKIE));
  }

  const response = await resolve(event);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'same-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  return response;
};
