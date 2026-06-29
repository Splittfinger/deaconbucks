import { redirect } from '@sveltejs/kit';
import { createSession, setSessionCookie } from '$lib/server/auth';
import { getUserCount, requireDb } from '$lib/server/db';
import { actionFail, field, requirePin } from '$lib/server/forms';
import { createUserWithAccount, ensureDefaultMerchant } from '$lib/server/ledger';
import { normalizeLoginCode } from '$lib/server/ids';

export async function load({ locals }) {
  const db = requireDb(locals);
  if ((await getUserCount(db)) > 0) throw redirect(303, '/login');
  return {};
}

export const actions = {
  default: async ({ cookies, locals, request }) => {
    const db = requireDb(locals);
    if ((await getUserCount(db)) > 0) throw redirect(303, '/login');

    const form = await request.formData();
    const displayName = field(form, 'displayName', 80);
    const loginCode = normalizeLoginCode(field(form, 'loginCode', 40));
    const pin = field(form, 'pin', 16);
    const pinError = requirePin(pin);

    if (!displayName || !loginCode) return actionFail('Add a display name and login code.', { displayName, loginCode });
    if (pinError) return actionFail(pinError, { displayName, loginCode });

    const created = await createUserWithAccount(db, null, displayName, loginCode, pin, 'ADMIN', false);
    if (!created.ok) return actionFail(created.message, { displayName, loginCode });
    await ensureDefaultMerchant(db, null);

    const row = await db.prepare('SELECT id FROM users WHERE login_code = ?').bind(loginCode).first<{ id: string }>();
    if (row) {
      const session = await createSession(db, row.id);
      setSessionCookie(cookies, session.token, session.expires);
    }

    throw redirect(303, '/app');
  }
};
