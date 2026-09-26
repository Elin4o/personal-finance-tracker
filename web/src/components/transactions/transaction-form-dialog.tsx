"use client";

import { useState, useEffect, type SubmitEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Transaction,
  createTransaction,
  updateTransaction,
  type TransactionType,
} from "@/lib/transactions-api";
import { getAccounts, type Account } from "@/lib/accounts-api";
import { getCategories, type Category } from "@/lib/categories-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { positiveAmount, required } from "@/lib/validation";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  transaction?: Transaction | null;
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export default function TransactionFormDialog({
  open,
  onOpenChange,
  onSuccess,
  transaction,
}: TransactionDialogProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [accountId, setAccountId] = useState("");
  const [transferToAccountId, setTransferToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() =>
    toDateInputValue(new Date().toISOString()),
  );
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [prevOpen, setPrevOpen] = useState(open);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setAccountId(transaction?.account.id ?? "");
      setTransferToAccountId(transaction?.transferToAccount?.id ?? "");
      setCategoryId(transaction?.category?.id ?? "");
      setType(transaction?.type ?? "EXPENSE");
      setAmount(transaction?.amount ?? "");
      setDate(
        transaction
          ? toDateInputValue(transaction.date)
          : toDateInputValue(new Date().toISOString()),
      );
      setDescription(transaction?.description ?? "");
      setError("");
      setFieldErrors({});
    }
  }

  useEffect(() => {
    if (!open) return;

    void (async () => {
      const [accountsData, categoriesData] = await Promise.all([
        getAccounts(),
        getCategories(),
      ]);
      setAccounts(accountsData.filter((a) => !a.isArchived));
      setCategories(categoriesData.filter((c) => !c.isArchived));
    })();
  }, [open]);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const accountError = required(accountId, "Select an account.");
    if (accountError) {
      errors.accountId = accountError;
    }

    if (type === "TRANSFER") {
      const transferError = required(
        transferToAccountId,
        "Select a destination account.",
      );

      if (transferError) {
        errors.transferToAccountId = transferError;
      } else if (transferToAccountId === accountId) {
        errors.transferToAccountId =
          "Transfer destination must be a different account.";
      }
    } else {
      const categoryError = required(categoryId, "Select a category.");

      if (categoryError) {
        errors.categoryId = categoryError;
      }
    }

    const amountError = positiveAmount(
      amount,
      "Enter an amount greater than 0.",
    );

    if (amountError) {
      errors.amount = amountError;
    }

    const dateError = required(date, "Select a date.");

    if (dateError) {
      errors.date = dateError;
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const relevantCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      accountId,
      type,
      amount,
      currency: selectedAccount?.currency ?? "EUR",
      date: new Date(date).toISOString(),
      description: description || undefined,
      ...(type === "TRANSFER"
        ? { transferToAccountId }
        : { categoryId: categoryId || undefined }),
    };

    try {
      if (transaction) {
        await updateTransaction(transaction.id, payload);
      } else {
        await createTransaction(payload);
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      setError(
        transaction
          ? "Failed to update transaction. Please try again."
          : "Failed to create transaction. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit transaction" : "Add transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Update this transaction's details."
              : "Record a new income, expense, or transfer."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value as TransactionType);
                setCategoryId("");
                setFieldErrors({});
              }}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId">
              {type === "TRANSFER" ? "From account" : "Account"}
            </Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger
                id="accountId"
                className={`w-full ${
                  fieldErrors.accountId ? "border-destructive" : ""
                }`}
              >
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent position="popper">
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.accountId && (
              <p className="text-xs text-destructive">
                {fieldErrors.accountId}
              </p>
            )}
          </div>

          {type === "TRANSFER" ? (
            <div className="space-y-2">
              <Label htmlFor="transferToAccountId">To account</Label>
              <Select
                value={transferToAccountId}
                onValueChange={setTransferToAccountId}
              >
                <SelectTrigger
                  id="transferToAccountId"
                  className={`w-full ${
                    fieldErrors.transferToAccountId ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.currency})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {fieldErrors.transferToAccountId && (
                <p className="text-xs text-destructive">
                  {fieldErrors.transferToAccountId}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger
                  id="categoryId"
                  className={`w-full ${
                    fieldErrors.categoryId ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {relevantCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.categoryId && (
                <p className="text-xs text-destructive">
                  {fieldErrors.categoryId}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  const value = event.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    setAmount(value);
                  }
                }}
                className={fieldErrors.amount ? "border-destructive" : ""}
                required
              />
              {fieldErrors.amount && (
                <p className="text-xs text-destructive">{fieldErrors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className={fieldErrors.date ? "border-destructive" : ""}
              />
              {fieldErrors.date && (
                <p className="text-xs text-destructive">{fieldErrors.date}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !accountId}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : transaction ? (
                "Save changes"
              ) : (
                "Add transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
