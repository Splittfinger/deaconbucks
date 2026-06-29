import { fail } from '@sveltejs/kit';

export function field(form: FormData, name: string, maxLength = 160): string {
  const value = form.get(name);
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function intField(form: FormData, name: string): number {
  const value = Number(field(form, name, 24));
  if (!Number.isInteger(value)) return Number.NaN;
  return value;
}

export function requirePin(value: string): string | null {
  if (!/^\d{4,12}$/u.test(value)) return 'PINs must be 4 to 12 digits.';
  return null;
}

export function actionFail(message: string, values: Record<string, string | number | boolean | null> = {}) {
  return fail(400, { ok: false, message, values });
}
