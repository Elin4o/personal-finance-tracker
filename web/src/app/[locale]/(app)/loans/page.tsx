"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Plus, HandCoins } from "lucide-react";
import LoanFormDialog from "@/components/loans/loan-form-dialog";
import DeleteLoanDialog from "@/components/loans/delete-loan-dialog";
import RecordPaymentDialog from "@/components/loans/record-payment-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loan, getLoans } from "@/lib/loans-api";
import LoanPaymentsDialog from "@/components/loans/loan-payments-dialog";
import { useLocale, useTranslations } from "next-intl";

export default function LoansPage() {
  const t = useTranslations("loans");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deletingLoan, setDeletingLoan] = useState<Loan | null>(null);
  const [payingLoan, setPayingLoan] = useState<Loan | null>(null);

  const [historyLoan, setHistoryLoan] = useState<Loan | null>(null);

  async function loadLoans() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getLoans();
      setLoans(data);
    } catch {
      setError(t("failedLoanLoad"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const data = await getLoans();
        if (!ignore) setLoans(data);
      } catch {
        if (!ignore) setError(t("failedLoanLoad"));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, [t]);

  function openCreateDialog() {
    setEditingLoan(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(loan: Loan) {
    setEditingLoan(loan);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {loans.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          <Button
            className="h-11 shrink-0 px-4 md:h-10"
            onClick={openCreateDialog}
          >
            <Plus className="size-4" />
            {tCommon("addLoan")}
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!isLoading && !error && loans.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm font-medium">{t("noLoans")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("trackMoney")}
          </p>
          <Button className="mt-4 h-11 px-4 md:h-10" onClick={openCreateDialog}>
            <Plus className="size-4" />
            {t("addFirstLoan")}
          </Button>
        </div>
      )}

      {!isLoading && !error && loans.length > 0 && (
        <div className="space-y-3">
          {loans.map((loan) => {
            const total = parseFloat(loan.amount);
            const remaining = parseFloat(loan.currentLoanBalance);
            const paidPct = total > 0 ? ((total - remaining) / total) * 100 : 0;
            const isPaidOff = remaining <= 0;

            return (
              <div key={loan.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <HandCoins className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{loan.personName}</p>
                        <Badge
                          variant="outline"
                          className={
                            loan.type === "LENT"
                              ? "border-success/30 text-success"
                              : "border-destructive/30 text-destructive"
                          }
                        >
                          {loan.type === "LENT" ? t("lent") : t("borrowed")}
                        </Badge>
                        {isPaidOff && <Badge variant="outline">Paid off</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(loan.date).toLocaleDateString(locale)}
                        {loan.dueDate &&
                          ` · Due ${new Date(loan.dueDate).toLocaleDateString(locale)}`}
                      </p>

                      {loan.description && (
                        <p className="mt-2 min-w-0 max-w-full text-sm text-muted-foreground wrap-anywhere">
                          {loan.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {loan.payments.length > 0 && (
                        <DropdownMenuItem onClick={() => setHistoryLoan(loan)}>
                          {t("viewPayments")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => openEditDialog(loan)}>
                        {tCommon("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingLoan(loan)}
                        variant="destructive"
                      >
                        {tCommon("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex flex-col-reverse gap-0.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-muted-foreground">
                      {t("paid")} {(total - remaining).toFixed(2)} {t("of")}{" "}
                      {total.toFixed(2)} {loan.currency}
                    </span>
                    <span className="font-mono font-medium">
                      {remaining.toFixed(2)} {loan.currency} {t("left")}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, paidPct)}%` }}
                    />
                  </div>
                  {!isPaidOff && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-11 w-full px-4 sm:h-10 sm:w-auto"
                      onClick={() => setPayingLoan(loan)}
                    >
                      {tCommon("recordPayment")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LoanPaymentsDialog
        loan={historyLoan}
        onOpenChange={(open) => {
          if (!open) setHistoryLoan(null);
        }}
        onChanged={loadLoans}
      />

      <LoanFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadLoans}
        loan={editingLoan}
      />

      <DeleteLoanDialog
        loan={deletingLoan}
        onOpenChange={(open) => {
          if (!open) setDeletingLoan(null);
        }}
        onSuccess={loadLoans}
      />

      <RecordPaymentDialog
        loan={payingLoan}
        onOpenChange={(open) => {
          if (!open) setPayingLoan(null);
        }}
        onSuccess={loadLoans}
      />
    </div>
  );
}
