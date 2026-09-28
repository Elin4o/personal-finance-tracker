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
        setError("This loan has payments and can't be deleted.");
      } else {
        setError("Failed to delete loan. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={!!loan} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete loan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the loan with &quot;
            {loan?.personName}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
