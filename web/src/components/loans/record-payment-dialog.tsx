"use client";

import { useState, useEffect, type SubmitEvent } from "react";
import { Loader2 } from "lucide-react";
import { Loan, createLoanPayment } from "@/lib/loans-api";
import { getAccounts, type Account } from "@/lib/accounts-api";
import { ApiError } from "@/lib/api";
import { positiveAmount } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface RecordPaymentDialogProps {
  loan: Loan | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function RecordPaymentDialog({
  loan,
  onOpenChange,
  onSuccess,
}: RecordPaymentDialogProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [prevLoan, setPrevLoan] = useState<Loan | null>(null);

  if (loan !== prevLoan) {
    setPrevLoan(loan);

    if (loan) {
      setAccountId("");
      setAmount("");
      setDate(new Date().toISOString().slice(0, 10));
      setNote("");
      setError("");
      setFieldErrors({});
    }
  }

  useEffect(() => {
    if (!loan) return;

    void (async () => {
      const data = await getAccounts();
      setAccounts(
        data.filter((a) => !a.isArchived && a.currency === loan.currency),
      );
    })();
  }, [loan]);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!accountId) errors.accountId = "Select an account.";
    const amountError = positiveAmount(amount);
    if (amountError) errors.amount = amountError;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!loan || !validate()) return;

    setIsSubmitting(true);

    try {
      await createLoanPayment({
        loanId: loan.id,
        accountId,
        amount,
        currency: loan.currency,
        date: new Date(date).toISOString(),
        note: note || undefined,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(err.message || "Payment could not be recorded.");
      } else {
        setError("Failed to record payment. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={!!loan} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            {loan &&
              `Remaining balance: ${parseFloat(loan.currentLoanBalance).toFixed(2)} ${loan.currency}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountId">
              {loan?.type === "LENT"
                ? "Deposit into account"
                : "Pay from account"}
            </Label>
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
            {accounts.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No accounts in {loan?.currency} available.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              className="h-11 px-4 md:h-10"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Recording...
                </>
              ) : (
                "Record payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
