import { redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { actionFail, field, requirePin } from '$lib/server/forms';
import { requireUser, updatePin } from '$lib/server/auth';
import { logAudit } from '$lib/server/audit';

export async function load({ locals }) {
  const user = requireUser(locals);
  return { user };
}

export const actions = {
  default: async ({ locals, request }) => {
    const user = requireUser(locals);
    const db = requireDb(locals);
    const form = await request.formData();
    const pin = field(form, 'pin', 16);
    const confirmPin = field(form, 'confirmPin', 16);

    const pinError = requirePin(pin);
    if (pinError) return actionFail(pinError);
    if (pin !== confirmPin) return actionFail('The PIN entries did not match.');

    await updatePin(db, user.id, pin, false);
    await logAudit(db, user.id, 'CHANGE_PIN', 'user', user.id);
    throw redirect(303, '/app');
  }
};
