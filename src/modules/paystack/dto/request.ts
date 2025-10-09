export type TPaystackResolveAccountRequestBody = {
  account_number: string;
  bank_code: string;
};

export type TPaystackCreateTransferRequestBody = {
  source: string;
  amount: number;
  recipient: string;
  reason?: string;
  reference?: string;
};

export type TPaystackCreateRecipientRequestBody = {
  type: string;
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
  description?: string;
};

export type TPaystackCreateDedicatedAccountRequestBody = {
  phone?: string;
  email?: string;
  customer: string;
  last_name?: string;
  first_name?: string;
  preferred_bank?: string;
};

export type TPaystackListDedicatedAccountRequestBody = {
  active?: boolean;
  currency?: string;
  provider_slug?: string;
  bank_id?: number;
  customer?: string;
  perPage?: number;
  page?: number;
};

export type TPaystackFetchDedicatedAccountRequestBody = {
  dedicated_account_id: string;
};

export type TPaystackDeactivateDedicatedAccountRequestBody = {
  dedicated_account_id: string;
};

export type TPaystackSplitDedicatedAccountRequestBody = {
  dedicated_account_id: string;
  split_code: string;
};

export type TPaystackCreateSubaccountRequestBody = {
  metadata?: any;
  bank_code: string;
  description?: string;
  business_name: string;
  account_number: string;
  percentage_charge?: number;
  settlement_schedule: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
};

export type TPaystackInitializeTransactionRequestBody = {
  email: string;
  amount: number;
  metadata?: any;
  currency?: string;
  reference?: string;
  subaccount?: string;
  callback_url?: string;
  split?: {
    type: 'percentage' | 'flat';
    currency?: string;
    subaccounts: Array<{
      share: number;
      subaccount: string;
    }>;
    bearer_subaccount?: string;
    bearer_type?: 'account' | 'subaccount' | 'all' | 'proportional';
  };
};
