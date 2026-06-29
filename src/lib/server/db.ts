import { error } from '@sveltejs/kit';
import type { AccountSummary, TransactionSummary } from './types';

type CountRow = { count: number };
type BalanceRow = { balance: number | null };

const BALANCE_SQL = `
  COALESCE(
    SUM(CASE WHEN direction = 'CREDIT' THEN amount ELSE -amount END),
    0
  )
`;

export function requireDb(locals: App.Locals): D1Database {
  if (!locals.db) {
    throw error(503, 'Cloudflare D1 is not available. Run through Cloudflare Pages or Wrangler with the DB binding.');
  }
  return locals.db;
}

export async function getUserCount(db: D1Database): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) AS count FROM users').first<CountRow>();
  return row?.count ?? 0;
}

export async function getBalance(db: D1Database, accountId: string): Promise<number> {
  const row = await db
    .prepare(`SELECT ${BALANCE_SQL} AS balance FROM ledger_entries WHERE account_id = ?`)
    .bind(accountId)
    .first<BalanceRow>();
  return Number(row?.balance ?? 0);
}

export async function listAccounts(db: D1Database): Promise<AccountSummary[]> {
  const result = await db
    .prepare(
      `
        SELECT
          a.id,
          a.display_name AS displayName,
          a.account_code AS accountCode,
          a.kind,
          a.status,
          ${BALANCE_SQL} AS balance
        FROM accounts a
        LEFT JOIN ledger_entries le ON le.account_id = a.id
        GROUP BY a.id
        ORDER BY a.kind, a.display_name
      `
    )
    .all<AccountSummary>();
  return result.results ?? [];
}

export async function listActiveRecipients(db: D1Database, currentAccountId: string): Promise<AccountSummary[]> {
  const result = await db
    .prepare(
      `
        SELECT
          a.id,
          a.display_name AS displayName,
          a.account_code AS accountCode,
          a.kind,
          a.status,
          ${BALANCE_SQL} AS balance
        FROM accounts a
        LEFT JOIN ledger_entries le ON le.account_id = a.id
        WHERE a.status = 'ACTIVE' AND a.id != ?
        GROUP BY a.id
        ORDER BY a.kind, a.display_name
      `
    )
    .bind(currentAccountId)
    .all<AccountSummary>();
  return result.results ?? [];
}

export async function listAccountTransactions(
  db: D1Database,
  accountId: string,
  limit = 50
): Promise<TransactionSummary[]> {
  const result = await db
    .prepare(
      `
        SELECT
          t.id,
          t.type,
          t.amount,
          t.note,
          t.reference,
          t.receipt_code AS receiptCode,
          t.created_at AS createdAt,
          fa.display_name AS fromName,
          fa.account_code AS fromCode,
          ta.display_name AS toName,
          ta.account_code AS toCode
        FROM transactions t
        LEFT JOIN accounts fa ON fa.id = t.from_account_id
        LEFT JOIN accounts ta ON ta.id = t.to_account_id
        WHERE t.from_account_id = ? OR t.to_account_id = ?
        ORDER BY t.created_at DESC
        LIMIT ?
      `
    )
    .bind(accountId, accountId, limit)
    .all<TransactionSummary>();
  return result.results ?? [];
}

export async function listAllTransactions(db: D1Database, limit = 200): Promise<TransactionSummary[]> {
  const result = await db
    .prepare(
      `
        SELECT
          t.id,
          t.type,
          t.amount,
          t.note,
          t.reference,
          t.receipt_code AS receiptCode,
          t.created_at AS createdAt,
          fa.display_name AS fromName,
          fa.account_code AS fromCode,
          ta.display_name AS toName,
          ta.account_code AS toCode
        FROM transactions t
        LEFT JOIN accounts fa ON fa.id = t.from_account_id
        LEFT JOIN accounts ta ON ta.id = t.to_account_id
        ORDER BY t.created_at DESC
        LIMIT ?
      `
    )
    .bind(limit)
    .all<TransactionSummary>();
  return result.results ?? [];
}
