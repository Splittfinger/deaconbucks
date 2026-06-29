export type UserRole = 'DEACON' | 'ADMIN';
export type AccountKind = 'PERSON' | 'MERCHANT';
export type AccountStatus = 'ACTIVE' | 'DISABLED';
export type BillStatus = 'MINTED' | 'DEPOSITED' | 'VOID';
export type TransactionType =
  | 'STOREHOUSE_DEPOSIT'
  | 'QUORUMPAY_TRANSFER'
  | 'MITE_MARKET_PURCHASE'
  | 'CLERK_CORRECTION';

export interface AuthUser {
  id: string;
  accountId: string;
  displayName: string;
  loginCode: string;
  role: UserRole;
  accountCode: string;
  pinResetRequired: boolean;
}

export interface AccountSummary {
  id: string;
  displayName: string;
  accountCode: string;
  kind: AccountKind;
  status: AccountStatus;
  balance: number;
}

export interface TransactionSummary {
  id: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  reference: string | null;
  receiptCode: string;
  createdAt: string;
  fromName: string | null;
  fromCode: string | null;
  toName: string | null;
  toCode: string | null;
}
