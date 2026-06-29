import { listAccountTransactions, requireDb } from '$lib/server/db';
import { requireUser, redirectIfPinResetRequired } from '$lib/server/auth';

export async function load({ locals }) {
  const user = requireUser(locals);
  redirectIfPinResetRequired(user);
  const db = requireDb(locals);
  return {
    user,
    transactions: await listAccountTransactions(db, user.accountId, 100)
  };
}
