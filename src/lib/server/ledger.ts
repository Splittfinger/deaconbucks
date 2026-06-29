import { MERCHANT_NAME } from '$lib/constants';
import { logAudit } from './audit';
import { getBalance } from './db';
import { hashPin } from './crypto';
import {
  makeAccountCode,
  makeBillSerial,
  makeId,
  makeReceiptCode,
  normalizeAccountCode,
  normalizeLoginCode,
  nowIso
} from './ids';
import type { AuthUser, TransactionType, UserRole } from './types';

type MutationResult = { ok: true; receiptCode?: string; message: string } | { ok: false; message: string };
type ChangesResult = D1Result<unknown> & { meta: { changes?: number } };

interface BillRow {
  id: string;
  serial: string;
  amount: number;
  status: string;
}

interface StoreItemRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface AccountRow {
  id: string;
  displayName: string;
  accountCode: string;
  kind: string;
  status: string;
}

function changes(result: D1Result<unknown>): number {
  return Number((result as ChangesResult).meta?.changes ?? 0);
}

export async function findAccountByCode(db: D1Database, rawCode: string): Promise<AccountRow | null> {
  const code = normalizeAccountCode(rawCode);
  const row = await db
    .prepare(
      `
        SELECT id, display_name AS displayName, account_code AS accountCode, kind, status
        FROM accounts
        WHERE REPLACE(account_code, '-', '') = ?
        LIMIT 1
      `
    )
    .bind(code.replaceAll('-', ''))
    .first<AccountRow>();
  return row ?? null;
}

export async function createUserWithAccount(
  db: D1Database,
  actorUserId: string | null,
  displayName: string,
  rawLoginCode: string,
  pin: string,
  role: UserRole,
  pinResetRequired: boolean
): Promise<MutationResult> {
  const now = nowIso();
  const accountId = makeId('acc');
  const userId = makeId('usr');
  const loginCode = normalizeLoginCode(rawLoginCode);
  const pinHash = await hashPin(pin);
  let accountCode = makeAccountCode(displayName, 'PERSON');

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const exists = await db.prepare('SELECT id FROM accounts WHERE account_code = ?').bind(accountCode).first();
    if (!exists) break;
    accountCode = makeAccountCode(displayName, 'PERSON');
  }

  try {
    await db.batch([
      db
        .prepare(
          `
            INSERT INTO accounts (id, display_name, account_code, kind, status, created_at)
            VALUES (?, ?, ?, 'PERSON', 'ACTIVE', ?)
          `
        )
        .bind(accountId, displayName, accountCode, now),
      db
        .prepare(
          `
            INSERT INTO users (
              id, account_id, display_name, login_code, pin_hash, role, status,
              pin_reset_required, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
          `
        )
        .bind(userId, accountId, displayName, loginCode, pinHash, role, pinResetRequired ? 1 : 0, now, now)
    ]);
    await logAudit(db, actorUserId, 'CREATE_USER', 'user', userId, {
      displayName,
      loginCode,
      role,
      accountCode
    });
    return { ok: true, message: `Created ${displayName}'s Quorum Wallet (${accountCode}).` };
  } catch {
    return { ok: false, message: 'Could not create that account. The login code may already be used.' };
  }
}

export async function createMerchantAccount(
  db: D1Database,
  actorUserId: string | null,
  displayName: string
): Promise<MutationResult> {
  const id = makeId('acc');
  const now = nowIso();
  let accountCode = makeAccountCode(displayName, 'MERCHANT');
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const exists = await db.prepare('SELECT id FROM accounts WHERE account_code = ?').bind(accountCode).first();
    if (!exists) break;
    accountCode = makeAccountCode(displayName, 'MERCHANT');
  }

  try {
    await db
      .prepare(
        `
          INSERT INTO accounts (id, display_name, account_code, kind, status, created_at)
          VALUES (?, ?, ?, 'MERCHANT', 'ACTIVE', ?)
        `
      )
      .bind(id, displayName, accountCode, now)
      .run();
    await logAudit(db, actorUserId, 'CREATE_MERCHANT', 'account', id, { displayName, accountCode });
    return { ok: true, message: `Created merchant account ${displayName} (${accountCode}).` };
  } catch {
    return { ok: false, message: 'Could not create that merchant account.' };
  }
}

export async function ensureDefaultMerchant(db: D1Database, actorUserId: string | null): Promise<void> {
  const existing = await db
    .prepare("SELECT id FROM accounts WHERE kind = 'MERCHANT' AND display_name = ? LIMIT 1")
    .bind(MERCHANT_NAME)
    .first();
  if (!existing) await createMerchantAccount(db, actorUserId, MERCHANT_NAME);
}

export async function depositBill(db: D1Database, user: AuthUser, rawSerial: string): Promise<MutationResult> {
  const serial = rawSerial.trim().toUpperCase();
  const bill = await db
    .prepare('SELECT id, serial, amount, status FROM bills WHERE serial = ? LIMIT 1')
    .bind(serial)
    .first<BillRow>();

  if (!bill) return { ok: false, message: 'That bill serial was not found.' };
  if (bill.status === 'DEPOSITED') return { ok: false, message: 'That bill has already been deposited.' };
  if (bill.status === 'VOID') return { ok: false, message: 'That bill was voided by an adult leader.' };

  const now = nowIso();
  const transactionId = makeId('txn');
  const receiptCode = makeReceiptCode();
  const results = await db.batch([
    db
      .prepare(
        `
          INSERT INTO transactions (
            id, type, from_account_id, to_account_id, amount, note, reference,
            receipt_code, created_by_user_id, created_at
          )
          SELECT ?, 'STOREHOUSE_DEPOSIT', NULL, ?, amount, ?, serial, ?, ?, ?
          FROM bills
          WHERE serial = ? AND status = 'MINTED'
        `
      )
      .bind(transactionId, user.accountId, 'Storehouse Deposit', receiptCode, user.id, now, serial),
    db
      .prepare(
        `
          INSERT INTO ledger_entries (id, transaction_id, account_id, direction, amount, created_at)
          SELECT ?, ?, ?, 'CREDIT', amount, ?
          FROM bills
          WHERE serial = ? AND status = 'MINTED'
        `
      )
      .bind(makeId('led'), transactionId, user.accountId, now, serial),
    db
      .prepare(
        `
          UPDATE bills
          SET status = 'DEPOSITED', deposited_by_account_id = ?, deposited_at = ?
          WHERE serial = ? AND status = 'MINTED'
        `
      )
      .bind(user.accountId, now, serial)
  ]);

  if (changes(results[0]) !== 1) return { ok: false, message: 'That bill could not be deposited.' };
  await logAudit(db, user.id, 'DEPOSIT_BILL', 'bill', bill.id, { serial, amount: bill.amount, receiptCode });
  return { ok: true, receiptCode, message: `Deposited ${bill.amount} Deacon Bucks.` };
}

export async function createTransfer(
  db: D1Database,
  user: AuthUser,
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  note: string,
  type: TransactionType = 'QUORUMPAY_TRANSFER',
  reference: string | null = null
): Promise<MutationResult> {
  if (amount <= 0 || amount > 10_000) return { ok: false, message: 'Enter an amount between 1 and 10,000.' };
  if (fromAccountId === toAccountId) return { ok: false, message: 'Choose a different Quorum Wallet.' };

  const currentBalance = await getBalance(db, fromAccountId);
  if (currentBalance < amount) return { ok: false, message: 'That Quorum Wallet does not have enough Deacon Bucks.' };

  const now = nowIso();
  const transactionId = makeId('txn');
  const receiptCode = makeReceiptCode();
  const results = await db.batch([
    db
      .prepare(
        `
          INSERT INTO transactions (
            id, type, from_account_id, to_account_id, amount, note, reference,
            receipt_code, created_by_user_id, created_at
          )
          SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          WHERE EXISTS (SELECT 1 FROM accounts WHERE id = ? AND status = 'ACTIVE')
            AND EXISTS (SELECT 1 FROM accounts WHERE id = ? AND status = 'ACTIVE')
            AND (
              SELECT COALESCE(SUM(CASE WHEN direction = 'CREDIT' THEN amount ELSE -amount END), 0)
              FROM ledger_entries
              WHERE account_id = ?
            ) >= ?
        `
      )
      .bind(
        transactionId,
        type,
        fromAccountId,
        toAccountId,
        amount,
        note || null,
        reference,
        receiptCode,
        user.id,
        now,
        fromAccountId,
        toAccountId,
        fromAccountId,
        amount
      ),
    db
      .prepare(
        `
          INSERT INTO ledger_entries (id, transaction_id, account_id, direction, amount, created_at)
          SELECT ?, ?, ?, 'DEBIT', ?, ?
          WHERE EXISTS (SELECT 1 FROM transactions WHERE id = ?)
        `
      )
      .bind(makeId('led'), transactionId, fromAccountId, amount, now, transactionId),
    db
      .prepare(
        `
          INSERT INTO ledger_entries (id, transaction_id, account_id, direction, amount, created_at)
          SELECT ?, ?, ?, 'CREDIT', ?, ?
          WHERE EXISTS (SELECT 1 FROM transactions WHERE id = ?)
        `
      )
      .bind(makeId('led'), transactionId, toAccountId, amount, now, transactionId)
  ]);

  if (changes(results[0]) !== 1) return { ok: false, message: 'That transfer could not be completed.' };
  await logAudit(db, user.id, type, 'transaction', transactionId, { fromAccountId, toAccountId, amount, receiptCode });
  return {
    ok: true,
    receiptCode,
    message: type === 'MITE_MARKET_PURCHASE' ? 'Mite Market purchase recorded.' : 'QuorumPay Transfer recorded.'
  };
}

export async function purchaseStoreItem(db: D1Database, user: AuthUser, itemId: string): Promise<MutationResult> {
  const item = await db
    .prepare('SELECT id, name, description, price FROM store_items WHERE id = ? AND active = 1 LIMIT 1')
    .bind(itemId)
    .first<StoreItemRow>();
  if (!item) return { ok: false, message: 'That Mite Market item is not available.' };

  const merchant = await db
    .prepare("SELECT id FROM accounts WHERE kind = 'MERCHANT' AND status = 'ACTIVE' ORDER BY created_at LIMIT 1")
    .first<{ id: string }>();
  if (!merchant) return { ok: false, message: "Ask an adult leader to create a Bishop's Storehouse merchant account." };

  return createTransfer(
    db,
    user,
    user.accountId,
    merchant.id,
    item.price,
    `Mite Market: ${item.name}`,
    'MITE_MARKET_PURCHASE',
    item.id
  );
}

export async function adminAdjustment(
  db: D1Database,
  user: AuthUser,
  accountId: string,
  amount: number,
  direction: 'CREDIT' | 'DEBIT',
  note: string
): Promise<MutationResult> {
  if (amount <= 0 || amount > 10_000) return { ok: false, message: 'Enter an amount between 1 and 10,000.' };
  if (direction === 'DEBIT') {
    const currentBalance = await getBalance(db, accountId);
    if (currentBalance < amount) return { ok: false, message: 'That correction would make the balance negative.' };
  }

  const now = nowIso();
  const transactionId = makeId('txn');
  const receiptCode = makeReceiptCode();
  const fromAccount = direction === 'DEBIT' ? accountId : null;
  const toAccount = direction === 'CREDIT' ? accountId : null;
  const results = await db.batch([
    db
      .prepare(
        `
          INSERT INTO transactions (
            id, type, from_account_id, to_account_id, amount, note, reference,
            receipt_code, created_by_user_id, created_at
          )
          SELECT ?, 'CLERK_CORRECTION', ?, ?, ?, ?, 'ADMIN_ADJUSTMENT', ?, ?, ?
          WHERE EXISTS (SELECT 1 FROM accounts WHERE id = ? AND status = 'ACTIVE')
        `
      )
      .bind(transactionId, fromAccount, toAccount, amount, note || 'Clerk Correction', receiptCode, user.id, now, accountId),
    db
      .prepare(
        `
          INSERT INTO ledger_entries (id, transaction_id, account_id, direction, amount, created_at)
          SELECT ?, ?, ?, ?, ?, ?
          WHERE EXISTS (SELECT 1 FROM transactions WHERE id = ?)
        `
      )
      .bind(makeId('led'), transactionId, accountId, direction, amount, now, transactionId)
  ]);

  if (changes(results[0]) !== 1) return { ok: false, message: 'That Clerk Correction could not be saved.' };
  await logAudit(db, user.id, 'CLERK_CORRECTION', 'transaction', transactionId, { accountId, amount, direction });
  return { ok: true, receiptCode, message: 'Clerk Correction recorded.' };
}

export async function mintBills(
  db: D1Database,
  user: AuthUser,
  amount: number,
  count: number,
  batchLabel: string | null
): Promise<{ ok: true; bills: BillRow[]; message: string } | { ok: false; message: string }> {
  if (amount <= 0 || amount > 500) return { ok: false, message: 'Bill amount must be between 1 and 500.' };
  if (count <= 0 || count > 60) return { ok: false, message: 'Mint between 1 and 60 bills at a time.' };

  const now = nowIso();
  const bills: BillRow[] = [];
  const statements: D1PreparedStatement[] = [];
  for (let index = 0; index < count; index += 1) {
    const id = makeId('bil');
    const serial = makeBillSerial();
    bills.push({ id, serial, amount, status: 'MINTED' });
    statements.push(
      db
        .prepare(
          `
            INSERT INTO bills (id, serial, amount, status, batch_label, minted_by_user_id, minted_at)
            VALUES (?, ?, ?, 'MINTED', ?, ?, ?)
          `
        )
        .bind(id, serial, amount, batchLabel, user.id, now)
    );
  }

  try {
    await db.batch(statements);
    await logAudit(db, user.id, 'MINT_BILLS', 'bill_batch', batchLabel, { amount, count });
    return { ok: true, bills, message: `Minted ${count} printable bill${count === 1 ? '' : 's'}.` };
  } catch {
    return { ok: false, message: 'Could not mint that bill batch. Try again.' };
  }
}

export async function voidBill(db: D1Database, user: AuthUser, rawSerial: string): Promise<MutationResult> {
  const serial = rawSerial.trim().toUpperCase();
  const now = nowIso();
  const result = await db
    .prepare(
      `
        UPDATE bills
        SET status = 'VOID', voided_by_user_id = ?, voided_at = ?
        WHERE serial = ? AND status = 'MINTED'
      `
    )
    .bind(user.id, now, serial)
    .run();

  if (changes(result) !== 1) {
    return { ok: false, message: 'Only minted, undeposited bills can be voided.' };
  }
  await logAudit(db, user.id, 'VOID_BILL', 'bill', serial, { serial });
  return { ok: true, message: 'Bill voided.' };
}
