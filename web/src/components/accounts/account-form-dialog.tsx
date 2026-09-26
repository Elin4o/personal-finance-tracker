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

    const nameError = required(name, "Enter an account name.");
    if (nameError) errors.name = nameError;

    const currencyError = exactLength(
      currency,
      3,
      "Currency must be 3 letters.",
    );
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
        setError(
          "Currency can't be changed — this account has existing transactions.",
        );
      } else {
        setError(
          account
            ? "Failed to update account. Please try again."
            : "Failed to create account. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? "Edit account" : "Add account"}</DialogTitle>
          <DialogDescription>
            {account
              ? "Update your account details."
              : "Create a new account to track its transactions and balance."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              placeholder="e.g. Revolut, Cash wallet"
              className={fieldErrors.name ? "border-destructive" : ""}
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
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
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value.toUpperCase())
                }
                required
                maxLength={3}
                minLength={3}
                placeholder="EUR"
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
                <Label htmlFor="initialBalance">Initial balance</Label>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {account ? "Saving..." : "Creating..."}
                </>
              ) : account ? (
                "Save changes"
              ) : (
                "Create account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
