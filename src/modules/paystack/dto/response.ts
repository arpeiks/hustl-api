export type TPaystackBank = {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export type TPaystackResolveAccountResponse = {
  account_number: string;
  account_name: string;
  bank_id: number;
};

export type TPaystackTransfer = {
  integration: number;
  domain: string;
  amount: number;
  currency: string;
  source: string;
  reason: string;
  recipient: number;
  status: string;
  transfer_code: string;
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type TPaystackRecipient = {
  active: boolean;
  createdAt: string;
  currency: string;
  domain: string;
  email: string | null;
  id: number;
  integration: number;
  name: string;
  recipient_code: string;
  type: string;
  updatedAt: string;
  is_deleted: boolean;
  details: {
    authorization_code: string | null;
    account_number: string;
    account_name: string | null;
    bank_code: string;
    bank_name: string;
  };
};

export type TPaystackDedicatedAccount = {
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    customer_code: string;
    phone: string | null;
    metadata: any;
    risk_action: string;
    international_format_phone: string | null;
  };
  bank: {
    name: string;
    id: number;
    slug: string;
  };
  id: number;
  account_name: string;
  account_number: string;
  created_at: string;
  updated_at: string;
  currency: string;
  split_config: any;
  active: boolean;
  assigned: boolean;
  provider: {
    id: number;
    provider_slug: string;
    bank_id: number;
    bank_name: string;
  };
  assignment: {
    integration: number;
    assignee_id: number;
    assignee_type: string;
    expired: boolean;
    account_type: string;
    assigned_at: string;
  };
};

export type TPaystackBankProvider = {
  id: number;
  provider_slug: string;
  bank_id: number;
  bank_name: string;
};

export type TPaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type TPaystackListResponse<T> = {
  status: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    skipped: number;
    perPage: number;
    page: number;
    pageCount: number;
  };
};

export type TPaystackSubaccount = {
  id: number;
  metadata: any;
  domain: string;
  active: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
  is_verified: boolean;
  business_name: string;
  account_number: string;
  subaccount_code: string;
  settlement_bank: string;
  percentage_charge: number;
  description: string | null;
  settlement_bank_code: string;
  settlement_schedule: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
};

export type TPaystackInitializeTransactionResponse = {
  reference: string;
  access_code: string;
  authorization_url: string;
};
