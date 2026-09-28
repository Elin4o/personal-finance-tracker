import { apiGet, apiPost, apiPatch, apiDelete } from "./api";

export type LoanType = "BORROWED" | "LENT";

export type LoanPayment = {
  id: string;
  amount: string;
  currency: string;
  date: string;
  note: string | null;
  createdAt: string;
  account?: { id: string; name: string };
  transaction?: { id: string };
};

export type Loan = {
  id: string;
  personName: string;
  type: LoanType;
  amount: string;
  currentLoanBalance: string;
  currency: string;
  date: string;
  dueDate: string | null;
  description: string | null;
  payments: LoanPayment[];
  createdAt: string;
  updatedAt: string;
};

export function getLoans(): Promise<Loan[]> {
  return apiGet<Loan[]>("/loans");
}

export function createLoan(data: {
  personName: string;
  type: LoanType;
  amount: string;
  currency: string;
  date: string;
  dueDate?: string;
  description?: string;
  accountId: string;
}): Promise<Loan> {
  return apiPost<Loan>("/loans", data);
}

export function updateLoan(
  id: string,
  data: Partial<{
    personName: string;
    type: LoanType;
    amount: string;
    currency: string;
    date: string;
    dueDate: string;
    description: string;
  }>,
): Promise<Loan> {
  return apiPatch<Loan>(`/loans/${id}`, data);
}

export function deleteLoan(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/loans/${id}`);
}

export function getLoanPayments(loanId: string): Promise<LoanPayment[]> {
  return apiGet<LoanPayment[]>(`/loans/payments/${loanId}`);
}

export function createLoanPayment(data: {
  loanId: string;
  accountId: string;
  amount: string;
  currency: string;
  date: string;
  note?: string;
}): Promise<LoanPayment> {
  return apiPost<LoanPayment>("/loans/payments", data);
}
