"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Category, deleteCategory } from "@/lib/categories-api";
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

interface DeleteCategoryDialogProps {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function DeleteCategoryDialog({
  category,
  onOpenChange,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const t = useTranslations("categoriesDeleteDialog");
  const tCommon = useTranslations("common");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [prevCategory, setPrevCategory] = useState(category);

  if (category !== prevCategory) {
    setPrevCategory(category);
    setError("");
  }

  async function handleDelete() {
    if (!category) return;

    setError("");
    setIsDeleting(true);

    try {
      await deleteCategory(category.id);
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
    <AlertDialog open={!!category} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.rich("description", {
              name: category?.name as string,
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
