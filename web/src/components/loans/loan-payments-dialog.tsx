"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Loan, LoanPayment, getLoanPayments } from "@/lib/loans-api";
import { deleteTransaction } from "@/lib/transactions-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoanPaymentsDialogProps {
  loan: Loan | null;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

export default function LoanPaymentsDialog({
  loan,
  onOpenChange,
  onChanged,
}: LoanPaymentsDialogProps) {
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loanId = loan?.id ?? null;
  const [prevLoanId, setPrevLoanId] = useState<string | null>(null);

  if (loanId !== prevLoanId) {
    setPrevLoanId(loanId);
    setPayments([]);
    setIsLoading(true);
    setError("");
    setConfirmingId(null);
  }

  useEffect(() => {
    if (!loanId) return;
    let ignore = false;

    async function run(id: string) {
      try {
        const data = await getLoanPayments(id);
        if (!ignore) setPayments(data);
      } catch {
        if (!ignore) setError("Failed to load payments.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void run(loanId);

    return () => {
      ignore = true;
    };
  }, [loanId]);

  async function handleCancel(payment: LoanPayment) {
    if (!payment.transaction) return;

    setError("");
    setCancellingId(payment.id);

    try {
      await deleteTransaction(payment.transaction.id);
      setPayments((current) => current.filter((p) => p.id !== payment.id));
      setConfirmingId(null);
      onChanged();
    } catch {
      setError("Failed to cancel payment. Please try again.");
    } finally {
      setCancellingId(null);
    }
  }

  const sorted = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <Dialog open={!!loan} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payments</DialogTitle>
          <DialogDescription>{loan?.personName}</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No payments yet.
          </p>
        )}

        <ul className="divide-y">
          {sorted.map((payment) => (
            <li key={payment.id} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-medium">
                    {parseFloat(payment.amount).toFixed(2)} {payment.currency}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(payment.date).toLocaleDateString()}
                    {payment.account && ` · ${payment.account.name}`}
                    {payment.note && ` · ${payment.note}`}
                  </p>
                </div>

                {confirmingId !== payment.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 shrink-0"
                    aria-label="Cancel payment"
                    onClick={() => setConfirmingId(payment.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>

              {confirmingId === payment.id && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="destructive"
                    className="h-11 flex-1 sm:h-10"
                    disabled={cancellingId === payment.id}
                    onClick={() => void handleCancel(payment)}
                  >
                    {cancellingId === payment.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Cancel payment"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 flex-1 sm:h-10"
                    onClick={() => setConfirmingId(null)}
                  >
                    Keep
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
