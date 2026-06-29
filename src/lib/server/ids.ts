import { randomBytes } from './crypto';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeId(prefix: string): string {
  return `${prefix}_${randomCode(18).toLowerCase()}`;
}

export function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let value = '';
  for (const byte of bytes) value += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  return value;
}

export function normalizeLoginCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/gu, '-');
}

export function normalizeAccountCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/gu, '');
}

export function makeAccountCode(displayName: string, kind: 'PERSON' | 'MERCHANT'): string {
  if (kind === 'MERCHANT') return `BSH-${randomCode(6)}`;
  const namePart = displayName
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/gu, '')
    .trim()
    .split(/\s+/u)[0]
    ?.slice(0, 5);
  return `DQ-${namePart || 'PAL'}-${randomCode(3)}`;
}

export function makeReceiptCode(): string {
  return `ROS-${randomCode(8)}`;
}

export function makeBillSerial(): string {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `DB-${stamp}-${randomCode(6)}`;
}
