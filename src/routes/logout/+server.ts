import { redirect } from '@sveltejs/kit';
import { clearSessionCookie, destroySession, SESSION_COOKIE } from '$lib/server/auth';

export async function GET({ cookies, locals }) {
  if (locals.db) await destroySession(locals.db, cookies.get(SESSION_COOKIE));
  clearSessionCookie(cookies);
  throw redirect(303, '/login');
}
