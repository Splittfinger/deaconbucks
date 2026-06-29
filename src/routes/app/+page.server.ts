import { redirect } from '@sveltejs/kit';
import {
  listAccountTransactions,
  listActiveRecipients,
  requireDb,
  getBalance
} from '$lib/server/db';
import { actionFail, field, intField } from '$lib/server/forms';
import { requireUser, redirectIfPinResetRequired } from '$lib/server/auth';
import { createTransfer, depositBill, findAccountByCode } from '$lib/server/ledger';

export async function load({ locals }) {
  const user = requireUser(locals);
  redirectIfPinResetRequired(user);
  const db = requireDb(locals);

  const [balance, transactions, recipients, items] = await Promise.all([
    getBalance(db, user.accountId),
    listAccountTransactions(db, user.accountId, 8),
    listActiveRecipients(db, user.accountId),
    db
      .prepare(
        `
          SELECT id, name, description, price
          FROM store_items
          WHERE active = 1
          ORDER BY sort_order, name
          LIMIT 3
        `
      )
      .all<{ id: string; name: string; description: string | null; price: number }>()
  ]);

  return {
    user,
    balance,
    transactions,
    recipients,
    items: items.results ?? []
  };
}

export const actions = {
  deposit: async ({ locals, request }) => {
    const user = requireUser(locals);
    redirectIfPinResetRequired(user);
    const db = requireDb(locals);
    const form = await request.formData();
    const serial = field(form, 'serial', 80);
    if (!serial) return actionFail('Enter a bill serial.');
    const result = await depositBill(db, user, serial);
    if (!result.ok) return actionFail(result.message);
    return result;
  },

  transfer: async ({ locals, request }) => {
    const user = requireUser(locals);
    redirectIfPinResetRequired(user);
    const db = requireDb(locals);
    const form = await request.formData();
    const selectedAccountId = field(form, 'recipientId', 80);
    const recipientCode = field(form, 'recipientCode', 40);
    const amount = intField(form, 'amount');
    const note = field(form, 'note', 120);
    let toAccountId = selectedAccountId;

    if (!toAccountId && recipientCode) {
      const account = await findAccountByCode(db, recipientCode);
      if (!account || account.status !== 'ACTIVE') return actionFail('That account code was not found.');
      toAccountId = account.id;
    }

    if (!toAccountId) return actionFail('Choose a recipient or enter an account code.');
    if (!Number.isInteger(amount)) return actionFail('Enter a whole-number amount.');

    const result = await createTransfer(db, user, user.accountId, toAccountId, amount, note);
    if (!result.ok) return actionFail(result.message);
    return result;
  }
};
