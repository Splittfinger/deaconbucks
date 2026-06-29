import { fail, redirect } from '@sveltejs/kit';
import { DISCLAIMER } from '$lib/constants';
import { clearSessionCookie, loginWithPin, setSessionCookie } from '$lib/server/auth';
import { getUserCount, requireDb } from '$lib/server/db';
import { field } from '$lib/server/forms';

export async function load({ locals }) {
  if (locals.user) throw redirect(303, locals.user.pinResetRequired ? '/change-pin' : '/app');
  const db = requireDb(locals);
  if ((await getUserCount(db)) === 0) throw redirect(303, '/setup');
  return { disclaimer: DISCLAIMER };
}

export const actions = {
  default: async ({ cookies, locals, request }) => {
    const db = requireDb(locals);
    const form = await request.formData();
    const loginCode = field(form, 'loginCode', 40);
    const pin = field(form, 'pin', 16);

    if (!loginCode || !pin) {
      clearSessionCookie(cookies);
      return fail(400, { message: 'Enter your login code and PIN.', loginCode });
    }

    const result = await loginWithPin(db, loginCode, pin);
    if (!result.ok) {
      clearSessionCookie(cookies);
      return fail(400, { message: result.message, loginCode });
    }

    setSessionCookie(cookies, result.token, result.expires);
    throw redirect(303, result.user.pinResetRequired ? '/change-pin' : '/app');
  }
};
