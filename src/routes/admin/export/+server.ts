import { requireAdmin } from '$lib/server/auth';
import { requireDb } from '$lib/server/db';

function csvEscape(value: unknown): string {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/u.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  return `${lines.join('\n')}\n`;
}

const exports = {
  transactions: `
    SELECT
      t.created_at,
      t.type,
      fa.display_name AS from_account,
      fa.account_code AS from_account_code,
      ta.display_name AS to_account,
      ta.account_code AS to_account_code,
      t.amount,
      t.note,
      t.reference,
      t.receipt_code
    FROM transactions t
    LEFT JOIN accounts fa ON fa.id = t.from_account_id
    LEFT JOIN accounts ta ON ta.id = t.to_account_id
    ORDER BY t.created_at DESC
  `,
  accounts: `
    SELECT
      a.display_name,
      a.account_code,
      a.kind,
      a.status,
      COALESCE(SUM(CASE WHEN le.direction = 'CREDIT' THEN le.amount ELSE -le.amount END), 0) AS balance
    FROM accounts a
    LEFT JOIN ledger_entries le ON le.account_id = a.id
    GROUP BY a.id
    ORDER BY a.kind, a.display_name
  `,
  users: `
    SELECT
      u.display_name,
      u.login_code,
      u.role,
      u.status,
      u.pin_reset_required,
      a.account_code
    FROM users u
    JOIN accounts a ON a.id = u.account_id
    ORDER BY u.role DESC, u.display_name
  `,
  bills: `
    SELECT
      b.serial,
      b.amount,
      b.status,
      b.batch_label,
      b.minted_at,
      b.deposited_at,
      a.display_name AS deposited_by
    FROM bills b
    LEFT JOIN accounts a ON a.id = b.deposited_by_account_id
    ORDER BY b.minted_at DESC
  `,
  audit: `
    SELECT
      al.created_at,
      u.display_name AS actor,
      al.action,
      al.entity_type,
      al.entity_id,
      al.details_json
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.actor_user_id
    ORDER BY al.created_at DESC
  `,
  store_items: `
    SELECT name, description, price, active, sort_order, created_at, updated_at
    FROM store_items
    ORDER BY active DESC, sort_order, name
  `
} as const;

export async function GET({ locals, url }) {
  requireAdmin(locals);
  const db = requireDb(locals);
  const kind = url.searchParams.get('kind') ?? 'transactions';
  const sql = exports[kind as keyof typeof exports] ?? exports.transactions;
  const result = await db.prepare(sql).all<Record<string, unknown>>();
  const csv = toCsv(result.results ?? []);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="liahona-ledger-${kind}.csv"`
    }
  });
}
