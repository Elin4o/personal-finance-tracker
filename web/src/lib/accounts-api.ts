import { apiDelete, apiGet, apiPatch, apiPost } from "./api";

export type AccountType = "CASH" | "BANK" | "CARD" | "SAVINGS" | "OTHER";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: string;
  currentBalance: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export function getAccounts(): Promise<Account[]> {
  return apiGet<Account[]>("/accounts");
}

export function createAccount(data: {
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: string;
}): Promise<Account> {
  return apiPost<Account>("/accounts", data);
}

export function updateAccount(
  id: string,
  data: {
    name: string;
    type: AccountType;
    currency: string;
    isArchived: boolean;
  },
): Promise<Account> {
  return apiPatch<Account>(`/accounts/${id}`, data);
}

export function deleteAccount(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/accounts/${id}`);
}
