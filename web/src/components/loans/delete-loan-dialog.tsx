"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Loan, deleteLoan } from "@/lib/loans-api";
import { ApiError } from "@/lib/api";
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
import { useTranslations } from "next-intl";

interface DeleteLoanDialogProps {
  loan: Loan | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function DeleteLoanDialog({
  loan,
  onOpenChange,
  onSuccess,
}: DeleteLoanDialogProps) {
  const t = useTranslations("loanDeleteDialog");
  const tCommon = useTranslations("common");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [prevLoan, setPrevLoan] = useState(loan);

  if (loan !== prevLoan) {
    setPrevLoan(loan);
    setError("");
  }

  async function handleDelete() {
    if (!loan) return;

    setError("");
    setIsDeleting(true);

    try {
      await deleteLoan(loan.id);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(t("loanCantBeDeleted"));
      } else {
        setError(t("failedDelete"));
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={!!loan} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", {
              personName: loan?.personName ?? "",
            })}
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
