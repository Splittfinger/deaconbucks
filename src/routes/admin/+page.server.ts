import { fail } from '@sveltejs/kit';
import { logAudit } from '$lib/server/audit';
import { requireAdmin, updatePin } from '$lib/server/auth';
import { listAccounts, listAllTransactions, requireDb } from '$lib/server/db';
import { actionFail, field, intField, requirePin } from '$lib/server/forms';
import { makeId, nowIso, normalizeLoginCode } from '$lib/server/ids';
import {
  adminAdjustment,
  createMerchantAccount,
  createUserWithAccount,
  mintBills,
  voidBill
} from '$lib/server/ledger';

export async function load({ locals }) {
  const user = requireAdmin(locals);
  const db = requireDb(locals);

  const [accounts, transactions, users, bills, items, audits] = await Promise.all([
    listAccounts(db),
    listAllTransactions(db, 200),
    db
      .prepare(
        `
          SELECT
            u.id,
            u.display_name AS displayName,
            u.login_code AS loginCode,
            u.role,
            u.status,
            u.pin_reset_required AS pinResetRequired,
            a.account_code AS accountCode
          FROM users u
          JOIN accounts a ON a.id = u.account_id
          ORDER BY u.role DESC, u.display_name
        `
      )
      .all<{
        id: string;
        displayName: string;
        loginCode: string;
        role: string;
        status: string;
        pinResetRequired: number;
        accountCode: string;
      }>(),
    db
      .prepare(
        `
          SELECT
            b.serial,
            b.amount,
            b.status,
            b.batch_label AS batchLabel,
            b.minted_at AS mintedAt,
            b.deposited_at AS depositedAt,
            a.display_name AS depositedBy
          FROM bills b
          LEFT JOIN accounts a ON a.id = b.deposited_by_account_id
          ORDER BY b.minted_at DESC
          LIMIT 160
        `
      )
      .all<{
        serial: string;
        amount: number;
        status: string;
        batchLabel: string | null;
        mintedAt: string;
        depositedAt: string | null;
        depositedBy: string | null;
      }>(),
    db
      .prepare(
        `
          SELECT id, name, description, price, active, sort_order AS sortOrder
          FROM store_items
          ORDER BY active DESC, sort_order, name
        `
      )
      .all<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        active: number;
        sortOrder: number;
      }>(),
    db
      .prepare(
        `
          SELECT
            al.action,
            al.entity_type AS entityType,
            al.entity_id AS entityId,
            al.details_json AS detailsJson,
            al.created_at AS createdAt,
            u.display_name AS actorName
          FROM audit_logs al
          LEFT JOIN users u ON u.id = al.actor_user_id
          ORDER BY al.created_at DESC
          LIMIT 120
        `
      )
      .all<{
        action: string;
        entityType: string;
        entityId: string | null;
        detailsJson: string | null;
        createdAt: string;
        actorName: string | null;
      }>()
  ]);

  return {
    user,
    accounts,
    transactions,
    users: users.results ?? [],
    bills: bills.results ?? [],
    items: items.results ?? [],
    audits: audits.results ?? []
  };
}

export const actions = {
  createUser: async ({ locals, request }) => {
    const admin = requireAdmin(locals);
    const db = requireDb(locals);
    const form = await request.formData();
    const displayName = field(form, 'displayName', 80);
    const loginCode = normalizeLoginCode(field(form, 'loginCode', 40));
    const pin = field(form, 'pin', 16);
    const role = field(form, 'role', 12) === 'ADMIN' ? 'ADMIN' : 'DEACON';
    const pinError = requirePin(pin);

    if (!displayName || !loginCode) return actionFail('Add a display name and login code.');
    if (pinError) return actionFail(pinError);

    const result = await createUserWithAccount(db, admin.id, displayName, loginCode, pin, role, true);
    if (!result.ok) return actionFail(result.message);
    return result;
  },

  createMerchant: async ({ locals, request }) => {
    const admin = requireAdmin(locals);
    const db = requireDb(locals);
    const form = await request.formData();
    const displayName = field(form, 'displayName', 80);
    if (!displayName) return actionFail('Add a merchant display name.');
    const result = await createMerchantAccount(db, admin.id, displayName);
    if (!result.ok) return actionFail(result.message);
    return result;
  },

  resetPin: async ({ locals, request }) => {
    const admin = requireAdmin(locals);
    const db = requireDb(locals);
    const form = await request.formData();
    const userId = field(form, 'userId', 80);
    const pin = field(form, 'pin', 16);
    const pinError = requirePin(pin);
    if (!userId) return actionFail('Choose a user.');
    if (pinError) return actionFail(pinError);
    await updatePin(db, userId, pin, true);
    await logAudit(db, admin.id, 'RESET_PIN', 'user', userId);
    return { ok: true, message: 'Temporary PIN saved. The user will choose a new PIN next sign-in.' };
  },

  mintBills: async ({ locals, request }) => {
    const admin = requireAdmin(locals);
    const db = requireDb(locals);
    const form = await request.formData();
    const amount = intField(form, 'amount');
    const count = intField(form, 'count');
    const batchLabel = field(form, 'batchLabel', 80) || null;
    if (!Number.isInteger(amount) || !Number.isInteger(count)) return actionFail('Enter whole numbers for amount and count.');
    const result = await mintBills(db, admin, amount, count, batchLabel);
    if (!result.ok) return actionFail(result.message);
    return { ok: true, message: result.message, bills: result.bills };
  },

  voidBill: async ({ locals, request }) => {
    const admin = requireAdmin(locals);
    const db = requireDb(locals);
    const form = await request.formData();
    const serial = field(form, 'serial', 80);
    if (!serial) return actionFail('Enter a bill serial.');
    const result = await voidBill(db, admin, serial);
    if (!result.ok) return actionFail(result.message);
    return result;
  },

  saveItem: async ({ locals, request }) => {
    const admin = requireAdmin(locals);
    const db = requireDb(locals);
    const form = await request.formData();
    const id = field(form, 'itemId', 80);
    const name = field(form, 'name', 80);
    const description = field(form, 'description', 200);
    const price = intField(form, 'price');
    const sortOrder = intField(form, 'sortOrder');
    const active = form.has('active') ? 1 : 0;
    const now = nowIso();

    if (!name) return actionFail('Add an item name.');
    if (!Number.isInteger(price) || price <= 0 || price > 10_000) return actionFail('Enter an item price from 1 to 10,000.');

    if (id) {
      const result = await db
        .prepare(
          `
            UPDATE store_items
            SET name = ?, description = ?, price = ?, active = ?, sort_order = ?, updated_at = ?
            WHERE id = ?
          `
        )
        .bind(name, description || null, price, active, Number.isInteger(sortOrder) ? sortOrder : 0, now, id)
        .run();
      if ((result.meta as { changes?: number }).changes !== 1) return actionFail('That item was not found.');
      await logAudit(db, admin.id, 'UPDATE_STORE_ITEM', 'store_item', id, { name, price, active });
      return { ok: true, message: 'Mite Market item updated.' };
    }

    const itemId = makeId('itm');
    await db
      .prepare(
        `
          INSERT INTO store_items (id, name, description, price, active, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .bind(itemId, name, description || null, price, active, Number.isInteger(sortOrder) ? sortOrder : 0, now, now)
      .run();
    await logAudit(db, admin.id, 'CREATE_STORE_ITEM', 'store_item', itemId, { name, price, active });
    return { ok: true, message: 'Mite Market item saved.' };
  },

  correction: async ({ locals, request }) => {
    const admin = requireAdmin(locals);
    const db = requireDb(locals);
    const form = await request.formData();
    const accountId = field(form, 'accountId', 80);
    const amount = intField(form, 'amount');
    const direction = field(form, 'direction', 8) === 'DEBIT' ? 'DEBIT' : 'CREDIT';
    const note = field(form, 'note', 140);
    if (!accountId) return actionFail('Choose an account.');
    if (!Number.isInteger(amount)) return actionFail('Enter a whole-number amount.');
    const result = await adminAdjustment(db, admin, accountId, amount, direction, note);
    if (!result.ok) return actionFail(result.message);
    return result;
  }
};
