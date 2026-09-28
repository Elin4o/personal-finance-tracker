"use client";

import { useState, useEffect, type SubmitEvent } from "react";
import { Loader2 } from "lucide-react";
import { Loan, createLoan, updateLoan, type LoanType } from "@/lib/loans-api";
import { getAccounts, type Account } from "@/lib/accounts-api";
import { ApiError } from "@/lib/api";
import { required, positiveAmount, exactLength } from "@/lib/validation";
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

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  loan?: Loan | null;
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export default function LoanFormDialog({
  open,
  onOpenChange,
  onSuccess,
  loan,
}: LoanDialogProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [personName, setPersonName] = useState("");
  const [type, setType] = useState<LoanType>("LENT");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(() =>
    toDateInputValue(new Date().toISOString()),
  );
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const hasPayments = (loan?.payments.length ?? 0) > 0;

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setPersonName(loan?.personName ?? "");
      setType(loan?.type ?? "LENT");
      setAmount(loan?.amount ?? "");
      setCurrency(loan?.currency ?? "EUR");
      setAccountId("");
      setDate(
        loan
          ? toDateInputValue(loan.date)
          : toDateInputValue(new Date().toISOString()),
      );
      setDueDate(loan?.dueDate ? toDateInputValue(loan.dueDate) : "");
      setDescription(loan?.description ?? "");
      setError("");
      setFieldErrors({});
    }
  }

  useEffect(() => {
    if (!open || loan) return;

    void (async () => {
      const data = await getAccounts();
      setAccounts(data.filter((a) => !a.isArchived));
    })();
  }, [open, loan]);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const nameError = required(personName, "Enter a name.");
    if (nameError) errors.personName = nameError;

    const amountError = positiveAmount(amount);
    if (amountError) errors.amount = amountError;

    if (!loan) {
      const currencyError = exactLength(
        currency,
        3,
        "Currency must be 3 letters.",
      );
      if (currencyError) errors.currency = currencyError;

      if (!accountId) errors.accountId = "Select an account.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (loan) {
        await updateLoan(loan.id, {
          personName,
          type,
          date: new Date(date).toISOString(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          description: description || undefined,
          ...(hasPayments ? {} : { amount, currency }),
        });
      } else {
        await createLoan({
          personName,
          type,
          amount,
          currency,
          accountId,
          date: new Date(date).toISOString(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          description: description || undefined,
        });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(err.message || "Invalid loan details.");
      } else {
        setError(
          loan
            ? "Failed to update loan. Please try again."
            : "Failed to create loan. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{loan ? "Edit loan" : "Add loan"}</DialogTitle>
          <DialogDescription>
            {loan
              ? "Update this loan's details."
              : "Record money you've lent or borrowed."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as LoanType)}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="LENT">I lent money</SelectItem>
                <SelectItem value="BORROWED">I borrowed money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personName">Person</Label>
            <Input
              id="personName"
              value={personName}
              onChange={(event) => setPersonName(event.target.value)}
              maxLength={200}
              placeholder="e.g. John Doe"
              className={fieldErrors.personName ? "border-destructive" : ""}
            />
            {fieldErrors.personName && (
              <p className="text-xs text-destructive">
                {fieldErrors.personName}
              </p>
            )}
          </div>

          {!loan && (
            <div className="space-y-2">
              <Label htmlFor="accountId">Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger
                  id="accountId"
                  className={`w-full ${fieldErrors.accountId ? "border-destructive" : ""}`}
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
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                disabled={hasPayments}
                onChange={(event) => {
                  const value = event.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(value)) setAmount(value);
                }}
                className={fieldErrors.amount ? "border-destructive" : ""}
              />
              {fieldErrors.amount && (
                <p className="text-xs text-destructive">{fieldErrors.amount}</p>
              )}
            </div>

            {!loan && (
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={currency}
                  onChange={(event) =>
                    setCurrency(event.target.value.toUpperCase())
                  }
                  maxLength={3}
                  placeholder="EUR"
                  className={fieldErrors.currency ? "border-destructive" : ""}
                />
                {fieldErrors.currency && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.currency}
                  </p>
                )}
              </div>
            )}
          </div>

          {hasPayments && (
            <p className="text-xs text-muted-foreground">
              Amount and currency can&apos;t be changed after payments have been
              made.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date (optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : loan ? (
                "Save changes"
              ) : (
                "Add loan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
