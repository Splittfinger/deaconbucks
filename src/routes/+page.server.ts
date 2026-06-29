import { redirect } from '@sveltejs/kit';
import { getUserCount, requireDb } from '$lib/server/db';

export async function load({ locals }) {
  if (locals.user) throw redirect(303, '/app');
  const db = requireDb(locals);
  const users = await getUserCount(db);
  throw redirect(303, users === 0 ? '/setup' : '/login');
}
