"use client";

import { useState, type SubmitEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Category,
  createCategory,
  updateCategory,
  type CategoryType,
} from "@/lib/categories-api";
import { ApiError } from "@/lib/api";
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
import { required } from "@/lib/validation";
import { useTranslations } from "next-intl";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  category?: Category | null;
}

export default function CategoryFormDialog({
  open,
  onOpenChange,
  onSuccess,
  category,
}: CategoryDialogProps) {
  const t = useTranslations("categoriesFormDialog");
  const tCommon = useTranslations("common");
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [prevOpen, setPrevOpen] = useState(open);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setName(category?.name ?? "");
      setType(category?.type ?? "EXPENSE");
      setError("");
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    const nameError = required(name, t("emptyName"));
    if (nameError) errors.name = nameError;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (category) {
        await updateCategory(category.id, { name, type });
      } else {
        await createCategory({ name, type });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (category && err instanceof ApiError && err.status === 409) {
        setError(t("existingTransactionTypeError"));
      } else {
        setError(category ? t("failedUpdate") : t("failedCreate"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? t("editCategory") : tCommon("addCategory")}
          </DialogTitle>
          <DialogDescription>
            {category ? t("updateDetails") : t("createCategory")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{tCommon("name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              placeholder={t("categoryNamePlaceholder")}
              className={fieldErrors.name ? "border-destructive" : ""}
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{tCommon("type")}</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as CategoryType)}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="INCOME">{tCommon("income")}</SelectItem>
                <SelectItem value="EXPENSE">{tCommon("expense")}</SelectItem>
              </SelectContent>
            </Select>
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
                  {category ? tCommon("saving") : tCommon("creating")}
                </>
              ) : category ? (
                tCommon("submitSave")
              ) : (
                t("submitCreateCategory")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
