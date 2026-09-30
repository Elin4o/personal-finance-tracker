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
  loan: { id: string; personName: string } | null;
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

export type TransactionFilters = {
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  loanOnly?: boolean;
};

export async function getAllTransactions(
  filters: TransactionFilters = {},
  maxRecords = 500,
): Promise<{ data: Transaction[]; truncated: boolean }> {
  const first = await getTransactions(1, 100, filters);
  const all = [...first.data];

  for (
    let page = 2;
    page <= first.meta.totalPages && all.length < maxRecords;
    page++
  ) {
    const next = await getTransactions(page, 100, filters);
    all.push(...next.data);
  }

  return {
    data: all.slice(0, maxRecords),
    truncated: all.length < first.meta.total,
  };
}

export async function getEarliestTransactionDate(): Promise<string | null> {
  const result = await apiGet<{ date: string | null }>(
    "/transactions/earliest-date",
  );
  return result.date;
}

export function getTransactions(
  page = 1,
  limit = 20,
  filters: TransactionFilters = {},
): Promise<TransactionsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filters.type) params.set("type", filters.type);
  if (filters.accountId) params.set("accountId", filters.accountId);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.dateFrom)
    params.set("dateFrom", `${filters.dateFrom}T00:00:00.000Z`);
  if (filters.dateTo) params.set("dateTo", `${filters.dateTo}T23:59:59.999Z`);
  if (filters.loanOnly) params.set("loanOnly", "true");

  return apiGet<TransactionsResponse>(`/transactions?${params.toString()}`);
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
