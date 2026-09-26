"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  MoreVertical,
  Plus,
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
import { Transaction, getTransactions } from "@/lib/transactions-api";

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

  async function loadTransactions() {
    setIsLoading(true);
    setError("");

    try {
      const result = await getTransactions(page);

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
        const result = await getTransactions(page);
        if (!ignore) {
          setTransactions(result.data);
          setTotalPages(result.meta.totalPages);
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
  }, [page]);

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
      {transactions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            All your income, expenses, and transfers.
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="size-4" />
            Add transaction
          </Button>
        </div>
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

      {!isLoading && !error && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No transactions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first transaction to start tracking your spending.
          </p>
          <Button className="mt-4" onClick={openCreateDialog}>
            <Plus className="size-4" />
            Add your first transaction
          </Button>
        </div>
      )}

      {!isLoading && !error && transactions.length > 0 && (
        <>
          <div className="hidden rounded-lg border md:block">
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
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <TypeIcon type={transaction.type} />
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {transaction.type === "TRANSFER"
                        ? `${transaction.account.name} → ${transaction.transferToAccount?.name ?? "—"}`
                        : transaction.account.name}
                    </TableCell>
                    <TableCell>{transaction.category?.name ?? "—"}</TableCell>
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
                          <DropdownMenuItem
                            onClick={() => openEditDialog(transaction)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingTransaction(transaction)}
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
                className="w-full min-w-0 rounded-lg border p-4"
              >
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <TypeIcon type={transaction.type} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {transaction.type === "TRANSFER"
                          ? `${transaction.account.name} → ${
                              transaction.transferToAccount?.name ?? "—"
                            }`
                          : transaction.account.name}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                        {transaction.category &&
                          ` · ${transaction.category.name}`}
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
                      <DropdownMenuItem
                        onClick={() => openEditDialog(transaction)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingTransaction(transaction)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {transaction.description && (
                  <div className="mt-2 w-full overflow-hidden">
                    <p className="text-sm text-muted-foreground break-all">
                      {transaction.description}
                    </p>
                  </div>
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
