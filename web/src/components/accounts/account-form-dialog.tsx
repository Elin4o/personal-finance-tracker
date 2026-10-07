"use client";

import { useState, type SubmitEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Account,
  createAccount,
  updateAccount,
  type AccountType,
} from "@/lib/accounts-api";
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
import { ApiError } from "@/lib/api";
import { exactLength, required } from "@/lib/validation";
import { useTranslations } from "next-intl";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  account?: Account | null;
}

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK", label: "Bank" },
  { value: "CARD", label: "Card" },
  { value: "SAVINGS", label: "Savings" },
  { value: "OTHER", label: "Other" },
];

export default function AccountFormDialog({
  open,
  onOpenChange,
  onSuccess,
  account,
}: AccountDialogProps) {
  const t = useTranslations("accountFormDialog");
  const tCommon = useTranslations("common");

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CASH");
  const [currency, setCurrency] = useState("EUR");
  const [initialBalance, setInitialBalance] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [prevOpen, setPrevOpen] = useState(open);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setName(account?.name ?? "");
      setType(account?.type ?? "CASH");
      setCurrency(account?.currency ?? "EUR");
      setInitialBalance("0");
      setError("");
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const nameError = required(name, t("emptyName"));
    if (nameError) errors.name = nameError;

    const currencyError = exactLength(currency, 3, tCommon("shortCurrency"));
    if (currencyError) errors.currency = currencyError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!validate()) return;

    try {
      if (account) {
        await updateAccount(account.id, {
          name,
          type,
          currency,
          isArchived: false,
        });
      } else {
        await createAccount({ name, type, currency, initialBalance });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (account && err instanceof ApiError && err.status === 409) {
        setError(t("currencyWithExistingTransactions"));
      } else {
        setError(account ? t("failedUpdate") : t("failedCreate"));
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
            {account ? t("editAccount") : tCommon("addAccount")}
          </DialogTitle>
          <DialogDescription>
            {account ? t("updateDetails") : t("createAccount")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{tCommon("name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              placeholder={t("namePlaceholder")}
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
              onValueChange={(value) => setType(value as AccountType)}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {ACCOUNT_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {tCommon(option.label.toLowerCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">{tCommon("currency")}</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value.toUpperCase())
                }
                required
                maxLength={3}
                minLength={3}
                placeholder={tCommon("currencyPlaceholder")}
                className={fieldErrors.currency ? "border-destructive" : ""}
              />
              {fieldErrors.currency && (
                <p className="text-xs text-destructive">
                  {fieldErrors.currency}
                </p>
              )}
            </div>
            {!account && (
              <div className="space-y-2">
                <Label htmlFor="initialBalance">{t("initialBalance")}</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="1"
                  value={initialBalance}
                  onChange={(event) => setInitialBalance(event.target.value)}
                  required
                />
              </div>
            )}
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
                  {account ? tCommon("saving") : tCommon("creating")}
                </>
              ) : account ? (
                tCommon("submitSave")
              ) : (
                t("submitCreate")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
