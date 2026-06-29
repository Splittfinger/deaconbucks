import { redirect, type Cookies } from '@sveltejs/kit';
import { hashPin, randomToken, sha256Base64Url, verifyPin } from './crypto';
import { makeId, nowIso, normalizeLoginCode } from './ids';
import type { AuthUser, UserRole } from './types';

export const SESSION_COOKIE = 'liahona_ledger_session';
const SESSION_DAYS = 30;
const MAX_FAILURES = 6;
const LOCK_MINUTES = 15;

interface LoginRow {
  id: string;
  accountId: string;
  displayName: string;
  loginCode: string;
  pinHash: string;
  role: UserRole;
  status: string;
  accountCode: string;
  accountStatus: string;
  pinResetRequired: number;
}

interface AttemptRow {
  failure_count: number;
  locked_until: string | null;
}

function toAuthUser(row: Omit<LoginRow, 'pinHash' | 'status' | 'accountStatus'>): AuthUser {
  return {
    id: row.id,
    accountId: row.accountId,
    displayName: row.displayName,
    loginCode: row.loginCode,
    role: row.role,
    accountCode: row.accountCode,
    pinResetRequired: row.pinResetRequired === 1
  };
}

export function sessionCookieOptions(expires: Date) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: !import.meta.env.DEV,
    expires
  };
}

export async function getUserFromSession(db: D1Database, token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null;
  const tokenHash = await sha256Base64Url(token);
  const now = nowIso();
  const row = await db
    .prepare(
      `
        SELECT
          u.id,
          u.account_id AS accountId,
          u.display_name AS displayName,
          u.login_code AS loginCode,
          u.role,
          u.pin_reset_required AS pinResetRequired,
          a.account_code AS accountCode
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        JOIN accounts a ON a.id = u.account_id
        WHERE s.token_hash = ?
          AND s.expires_at > ?
          AND u.status = 'ACTIVE'
          AND a.status = 'ACTIVE'
        LIMIT 1
      `
    )
    .bind(tokenHash, now)
    .first<Omit<LoginRow, 'pinHash' | 'status' | 'accountStatus'>>();

  if (!row) return null;
  await db.prepare('UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?').bind(now, tokenHash).run();
  return toAuthUser(row);
}

export async function createSession(db: D1Database, userId: string): Promise<{ token: string; expires: Date }> {
  const token = randomToken();
  const tokenHash = await sha256Base64Url(token);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db
    .prepare(
      `
        INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    )
    .bind(makeId('ses'), userId, tokenHash, expires.toISOString(), now.toISOString(), now.toISOString())
    .run();
  return { token, expires };
}

export async function destroySession(db: D1Database, token: string | undefined): Promise<void> {
  if (!token) return;
  await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Base64Url(token)).run();
}

async function isLocked(db: D1Database, loginCode: string): Promise<boolean> {
  const attempt = await db
    .prepare('SELECT failure_count, locked_until FROM login_attempts WHERE login_code = ?')
    .bind(loginCode)
    .first<AttemptRow>();
  return Boolean(attempt?.locked_until && new Date(attempt.locked_until).getTime() > Date.now());
}

async function recordFailure(db: D1Database, loginCode: string): Promise<void> {
  const now = nowIso();
  const existing = await db
    .prepare('SELECT failure_count, locked_until FROM login_attempts WHERE login_code = ?')
    .bind(loginCode)
    .first<AttemptRow>();
  const nextCount = (existing?.failure_count ?? 0) + 1;
  const lockedUntil =
    nextCount >= MAX_FAILURES ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString() : existing?.locked_until;

  await db
    .prepare(
      `
        INSERT INTO login_attempts (login_code, failure_count, locked_until, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(login_code) DO UPDATE SET
          failure_count = excluded.failure_count,
          locked_until = excluded.locked_until,
          updated_at = excluded.updated_at
      `
    )
    .bind(loginCode, nextCount, lockedUntil ?? null, now)
    .run();
}

async function clearFailures(db: D1Database, loginCode: string): Promise<void> {
  await db.prepare('DELETE FROM login_attempts WHERE login_code = ?').bind(loginCode).run();
}

export async function loginWithPin(
  db: D1Database,
  rawLoginCode: string,
  pin: string
): Promise<{ ok: true; user: AuthUser; token: string; expires: Date } | { ok: false; message: string }> {
  const loginCode = normalizeLoginCode(rawLoginCode);
  if (await isLocked(db, loginCode)) {
    return { ok: false, message: 'Too many tries. Ask an adult leader to reset the PIN or wait 15 minutes.' };
  }

  const row = await db
    .prepare(
      `
        SELECT
          u.id,
          u.account_id AS accountId,
          u.display_name AS displayName,
          u.login_code AS loginCode,
          u.pin_hash AS pinHash,
          u.role,
          u.status,
          u.pin_reset_required AS pinResetRequired,
          a.account_code AS accountCode,
          a.status AS accountStatus
        FROM users u
        JOIN accounts a ON a.id = u.account_id
        WHERE u.login_code = ?
        LIMIT 1
      `
    )
    .bind(loginCode)
    .first<LoginRow>();

  const valid = row && row.status === 'ACTIVE' && row.accountStatus === 'ACTIVE' && (await verifyPin(pin, row.pinHash));
  if (!valid || !row) {
    await recordFailure(db, loginCode);
    return { ok: false, message: 'That login code or PIN did not work.' };
  }

  await clearFailures(db, loginCode);
  const session = await createSession(db, row.id);
  return { ok: true, user: toAuthUser(row), ...session };
}

export async function updatePin(db: D1Database, userId: string, pin: string, resetRequired: boolean): Promise<void> {
  await db
    .prepare('UPDATE users SET pin_hash = ?, pin_reset_required = ?, updated_at = ? WHERE id = ?')
    .bind(await hashPin(pin), resetRequired ? 1 : 0, nowIso(), userId)
    .run();
}

export function requireUser(locals: App.Locals): AuthUser {
  if (!locals.user) throw redirect(303, '/login');
  return locals.user;
}

export function requireAdmin(locals: App.Locals): AuthUser {
  const user = requireUser(locals);
  if (user.role !== 'ADMIN') throw redirect(303, '/app');
  if (user.pinResetRequired) throw redirect(303, '/change-pin');
  return user;
}

export function redirectIfPinResetRequired(user: AuthUser): void {
  if (user.pinResetRequired) throw redirect(303, '/change-pin');
}

export function setSessionCookie(cookies: Cookies, token: string, expires: Date): void {
  cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expires));
}

export function clearSessionCookie(cookies: Cookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}
