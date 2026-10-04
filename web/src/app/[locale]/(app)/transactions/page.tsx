"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  MoreVertical,
  Plus,
  ArrowLeft,
} from "lucide-react";
import TransactionFormDialog from "@/components/transactions/transaction-form-dialog";
import DeleteTransactionDialog from "@/components/transactions/delete-transaction-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Transaction,
  TransactionFilters,
  getTransactions,
} from "@/lib/transactions-api";
import { Badge } from "@/components/ui/badge";
import { Account, getAccounts } from "@/lib/accounts-api";
import { Category, getCategories } from "@/lib/categories-api";
import TransactionFiltersBar from "@/components/transactions/transaction-filters";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

function formatAmount(transaction: Transaction) {
  const value = parseFloat(transaction.amount).toFixed(2);
  if (transaction.type === "INCOME") return `+${value}`;
  if (transaction.type === "EXPENSE") return `-${value}`;
  return value;
}

function amountColor(type: Transaction["type"]) {
  if (type === "INCOME") return "text-success";
  if (type === "EXPENSE") return "text-destructive";
  return "text-foreground";
}

function TypeIcon({ type }: { type: Transaction["type"] }) {
  if (type === "INCOME")
    return <ArrowDownLeft className="size-4 text-success" />;
  if (type === "EXPENSE")
    return <ArrowUpRight className="size-4 text-destructive" />;
  return <ArrowLeftRight className="size-4 text-muted-foreground" />;
}

function accountLabel(account: Transaction["account"]) {
  return account.isArchived ? `${account.name} (archived)` : account.name;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const searchParams = useSearchParams();
  const [cameFromDashboard] = useState(
    () => searchParams.get("from") === "dashboard",
  );
  const [filters, setFilters] = useState<TransactionFilters>(() => {
    const type = searchParams.get("type");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    return {
      type:
        type === "INCOME" || type === "EXPENSE" || type === "TRANSFER"
          ? type
          : undefined,
      dateFrom: dateFrom ?? undefined,
      dateTo: dateTo ?? undefined,
    };
  });
  const hasActiveFilters = Object.values(filters).some(Boolean);

  function handleFiltersChange(next: TransactionFilters) {
    setPage(1);
    setFilters(next);
  }

  async function loadTransactions() {
    setIsLoading(true);
    setError("");

    try {
      const result = await getTransactions(page, 20, filters);

      if (page > result.meta.totalPages && page > 1) {
        setPage(result.meta.totalPages);
        return;
      }

      setTransactions(result.data);
      setTotalPages(result.meta.totalPages);
    } catch {
      setError("Failed to load transactions.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const result = await getTransactions(page, 20, filters);
        if (!ignore) {
          setTransactions(result.data);
          setTotalPages(result.meta.totalPages);
          setError("");
        }
      } catch {
        if (!ignore) setError("Failed to load transactions.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, [page, filters]);

  useEffect(() => {
    let ignore = false;

    void (async () => {
      try {
        const [accountsData, categoriesData] = await Promise.all([
          getAccounts(),
          getCategories(),
        ]);
        if (!ignore) {
          setAccounts(accountsData);
          setCategories(categoriesData);
        }
      } catch {}
    })();

    return () => {
      ignore = true;
    };
  }, []);

  function openCreateDialog() {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(transaction: Transaction) {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {cameFromDashboard && (
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
      )}
      {(transactions.length > 0 || hasActiveFilters) && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              All your income, expenses, and transfers.
            </p>

            <Button
              className="h-11 shrink-0 px-4 md:h-10 cursor-pointer"
              onClick={openCreateDialog}
            >
              <Plus className="size-4" />
              Add transaction
            </Button>
          </div>
          <TransactionFiltersBar
            filters={filters}
            onChange={handleFiltersChange}
            accounts={accounts}
            categories={categories}
          />
        </>
      )}

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!isLoading &&
        !error &&
        transactions.length === 0 &&
        !hasActiveFilters && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first transaction to start tracking your spending.
            </p>
            <Button
              className="mt-4 h-11 px-4 md:h-10"
              onClick={openCreateDialog}
            >
              <Plus className="size-4" />
              Add your first transaction
            </Button>
          </div>
        )}

      {!isLoading &&
        !error &&
        transactions.length === 0 &&
        hasActiveFilters && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm font-medium">No matching transactions</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing or clearing your filters.
            </p>
            <Button
              variant="outline"
              className="mt-4 h-11 px-4 md:h-10"
              onClick={() => handleFiltersChange({})}
            >
              Clear filters
            </Button>
          </div>
        )}

      {!isLoading && !error && transactions.length > 0 && (
        <>
          <div className="hidden rounded-lg border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Date</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className={`${transaction.account.isArchived ? "opacity-50" : ""}`}
                  >
                    <TableCell>
                      <TypeIcon type={transaction.type} />
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {transaction.type === "TRANSFER"
                        ? `${accountLabel(transaction.account)} → ${transaction.transferToAccount ? accountLabel(transaction.transferToAccount) : "—"}`
                        : accountLabel(transaction.account)}
                    </TableCell>
                    <TableCell>
                      {transaction.loan ? (
                        <Badge variant="outline">Loan</Badge>
                      ) : transaction.category ? (
                        <Badge
                          variant="outline"
                          className={
                            transaction.category.type === "INCOME"
                              ? "border-success/30 text-success"
                              : "border-destructive/30 text-destructive"
                          }
                        >
                          {transaction.category.name}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-muted-foreground">
                      {transaction.description ?? "—"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono ${amountColor(transaction.type)}`}
                    >
                      {formatAmount(transaction)} {transaction.currency}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!transaction.loan && (
                            <DropdownMenuItem
                              onClick={() => openEditDialog(transaction)}
                            >
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setDeletingTransaction(transaction)}
                            variant="destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`w-full min-w-0 rounded-lg border bg-card p-4 ${transaction.account.isArchived ? "opacity-50" : ""}   `}
              >
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <TypeIcon type={transaction.type} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {transaction.type === "TRANSFER"
                          ? `${accountLabel(transaction.account)} → ${
                              transaction.transferToAccount
                                ? accountLabel(transaction.transferToAccount)
                                : "—"
                            }`
                          : accountLabel(transaction.account)}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                        {transaction.loan ? (
                          " · Loan"
                        ) : transaction.category ? (
                          <span
                            className={
                              transaction.category.type === "INCOME"
                                ? "text-success"
                                : "text-destructive"
                            }
                          >
                            {" "}
                            · {transaction.category.name}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!transaction.loan && (
                        <DropdownMenuItem
                          onClick={() => openEditDialog(transaction)}
                        >
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingTransaction(transaction)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {transaction.description && (
                  <p className="mt-2 min-w-0 max-w-full overflow-hidden text-sm text-muted-foreground wrap-anywhere">
                    {transaction.description}
                  </p>
                )}

                <p
                  className={`mt-2 text-right font-mono text-sm ${amountColor(
                    transaction.type,
                  )}`}
                >
                  {formatAmount(transaction)} {transaction.currency}
                </p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <TransactionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadTransactions}
        transaction={editingTransaction}
      />

      <DeleteTransactionDialog
        transaction={deletingTransaction}
        onOpenChange={(open) => {
          if (!open) setDeletingTransaction(null);
        }}
        onSuccess={loadTransactions}
      />
    </div>
  );
}
