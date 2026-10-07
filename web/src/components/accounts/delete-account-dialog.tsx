"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Account, deleteAccount } from "@/lib/accounts-api";
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

interface DeleteAccountDialogProps {
  account: Account | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function DeleteAccountDialog({
  account,
  onOpenChange,
  onSuccess,
}: DeleteAccountDialogProps) {
  const t = useTranslations("accountDeleteDialog");
  const tCommon = useTranslations("common");

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [prevAccount, setPrevAccount] = useState(account);

  if (account !== prevAccount) {
    setPrevAccount(account);
    setError("");
  }

  async function handleDelete() {
    if (!account) return;

    setError("");
    setIsDeleting(true);

    try {
      await deleteAccount(account.id);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(t("existingTransactionError"));
      } else {
        setError(t("failedDelete"));
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={!!account} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", {
              name: account?.name ?? "",
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
                {t("deleting")}
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
