"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Transaction, deleteTransaction } from "@/lib/transactions-api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api";

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function DeleteTransactionDialog({
  transaction,
  onOpenChange,
  onSuccess,
}: DeleteTransactionDialogProps) {
  const t = useTranslations("transactionDeleteDialog");
  const tCommon = useTranslations("common");

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [prevTransaction, setPrevTransaction] = useState(transaction);

  if (transaction !== prevTransaction) {
    setPrevTransaction(transaction);
    setError("");
  }

  async function handleDelete() {
    if (!transaction) return;

    setError("");
    setIsDeleting(true);

    try {
      await deleteTransaction(transaction.id);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(t("loanHasPayments"));
      } else {
        setError(t("failedDelete"));
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={!!transaction} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {transaction?.loan
              ? t("descriptionLoan", {
                  personName: transaction.loan.personName,
                })
              : t("descriptionDefault")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {tCommon("deleting")}
              </>
            ) : (
              tCommon("delete")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
