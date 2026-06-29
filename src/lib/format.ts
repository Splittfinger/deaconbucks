import { CURRENCY_SHORT } from './constants';

export function formatBucks(amount: number | null | undefined): string {
  return `${Number(amount ?? 0).toLocaleString()} ${CURRENCY_SHORT}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Not yet';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

export function transactionLabel(type: string): string {
  switch (type) {
    case 'STOREHOUSE_DEPOSIT':
      return 'Storehouse Deposit';
    case 'QUORUMPAY_TRANSFER':
      return 'QuorumPay Transfer';
    case 'MITE_MARKET_PURCHASE':
      return 'Mite Market Purchase';
    case 'CLERK_CORRECTION':
      return 'Clerk Correction';
    default:
      return type;
  }
}
