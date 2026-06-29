import { requireDb } from '$lib/server/db';
import { actionFail, field } from '$lib/server/forms';
import { requireUser, redirectIfPinResetRequired } from '$lib/server/auth';
import { purchaseStoreItem } from '$lib/server/ledger';

export async function load({ locals }) {
  const user = requireUser(locals);
  redirectIfPinResetRequired(user);
  const db = requireDb(locals);
  const items = await db
    .prepare(
      `
        SELECT id, name, description, price
        FROM store_items
        WHERE active = 1
        ORDER BY sort_order, name
      `
    )
    .all<{ id: string; name: string; description: string | null; price: number }>();

  return {
    items: items.results ?? []
  };
}

export const actions = {
  buy: async ({ locals, request }) => {
    const user = requireUser(locals);
    redirectIfPinResetRequired(user);
    const db = requireDb(locals);
    const form = await request.formData();
    const itemId = field(form, 'itemId', 80);
    if (!itemId) return actionFail('Choose an item.');
    const result = await purchaseStoreItem(db, user, itemId);
    if (!result.ok) return actionFail(result.message);
    return result;
  }
};
