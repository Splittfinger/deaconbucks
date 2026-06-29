import { requireDb } from '$lib/server/db';
import { actionFail, field } from '$lib/server/forms';
import { requireUser, redirectIfPinResetRequired } from '$lib/server/auth';
import { depositBill } from '$lib/server/ledger';

export async function load({ locals, url }) {
  const user = requireUser(locals);
  redirectIfPinResetRequired(user);
  return {
    serial: url.searchParams.get('serial')?.trim().toUpperCase() ?? ''
  };
}

export const actions = {
  default: async ({ locals, request }) => {
    const user = requireUser(locals);
    redirectIfPinResetRequired(user);
    const db = requireDb(locals);
    const form = await request.formData();
    const serial = field(form, 'serial', 80);
    if (!serial) return actionFail('Enter a bill serial.');
    const result = await depositBill(db, user, serial);
    if (!result.ok) return actionFail(result.message);
    return result;
  }
};
