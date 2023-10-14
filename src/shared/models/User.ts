export enum AccountTier {
  Starter = 'starter',
  Premium = 'premium',
}

export enum SubStatus {
  Active = 'active',
  PastDue = 'past_due',
  Cancelled = 'cancelled',
}

export type User = {
  username: string;
  email: string;
  accountTier: AccountTier;
  subscription: {
    subId: string;
    status: SubStatus;
  } | null;
};
