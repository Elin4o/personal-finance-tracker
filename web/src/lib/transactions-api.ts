import { Account } from "./accounts-api";
import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import { Category } from "./categories-api";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: string;
  currency: string;
  date: string;
  description: string | null;
  account: Account;
  transferToAccount: Account | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
};

export type TransactionsResponse = {
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function getTransactions(
  page = 1,
  limit = 20,
): Promise<TransactionsResponse> {
  return apiGet<TransactionsResponse>(
    `/transactions?page=${page}&limit=${limit}`,
  );
}

export function createTransaction(data: {
  accountId: string;
  transferToAccountId?: string;
  categoryId?: string;
  type: TransactionType;
  amount: string;
  currency: string;
  date: string;
  description?: string;
}): Promise<Transaction> {
  return apiPost<Transaction>("/transactions", data);
}

export function updateTransaction(
  id: string,
  data: Partial<{
    accountId: string;
    transferToAccountId: string;
    categoryId: string;
    type: TransactionType;
    amount: string;
    currency: string;
    date: string;
    description: string;
  }>,
): Promise<Transaction> {
  return apiPatch<Transaction>(`/transactions/${id}`, data);
}

export function deleteTransaction(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/transactions/${id}`);
}
