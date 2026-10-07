"use client";

import { useState, useEffect, type SubmitEvent } from "react";
import { Loader2, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Transaction,
  createTransaction,
  updateTransaction,
  type TransactionType,
} from "@/lib/transactions-api";
import { getAccounts, type Account } from "@/lib/accounts-api";
import { getCategories, type Category } from "@/lib/categories-api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

import { positiveAmount, required } from "@/lib/validation";
import { Link } from "@/i18n/navigation";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  transaction?: Transaction | null;
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export default function TransactionFormDialog({
  open,
  onOpenChange,
  onSuccess,
  transaction,
}: TransactionDialogProps) {
  const t = useTranslations("transactionFormDialog");
  const tCommon = useTranslations("common");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [accountId, setAccountId] = useState("");
  const [transferToAccountId, setTransferToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() =>
    toDateInputValue(new Date().toISOString()),
  );
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [prevOpen, setPrevOpen] = useState(open);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setAccountId(transaction?.account.id ?? "");
      setTransferToAccountId(transaction?.transferToAccount?.id ?? "");
      setCategoryId(transaction?.category?.id ?? "");
      setType(transaction?.type ?? "EXPENSE");
      setAmount(transaction?.amount ?? "");
      setDate(
        transaction
          ? toDateInputValue(transaction.date)
          : toDateInputValue(new Date().toISOString()),
      );
      setDescription(transaction?.description ?? "");
      setError("");
      setFieldErrors({});
    }
  }

  useEffect(() => {
    if (!open) return;

    void (async () => {
      const [accountsData, categoriesData] = await Promise.all([
        getAccounts(),
        getCategories(),
      ]);

      setAccounts(
        accountsData.filter(
          (account) =>
            !account.isArchived ||
            account.id === transaction?.account.id ||
            account.id === transaction?.transferToAccount?.id,
        ),
      );

      setCategories(
        categoriesData.filter(
          (category) =>
            !category.isArchived || category.id === transaction?.category?.id,
        ),
      );
    })();
  }, [open, transaction]);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const accountError = required(accountId, t("selectAccountError"));

    if (accountError) {
      errors.accountId = accountError;
    }

    if (type === "TRANSFER") {
      const transferError = required(
        transferToAccountId,
        t("selectDestinationError"),
      );

      if (transferError) {
        errors.transferToAccountId = transferError;
      } else if (transferToAccountId === accountId) {
        errors.transferToAccountId = t("differentAccountError");
      }
    } else {
      const categoryError = required(categoryId, t("selectCategoryError"));

      if (categoryError) {
        errors.categoryId = categoryError;
      }
    }

    const amountError = positiveAmount(amount, t("positiveAmountError"));

    if (amountError) {
      errors.amount = amountError;
    }

    const dateError = required(date, t("selectDateError"));

    if (dateError) {
      errors.date = dateError;
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  const hasNoAccounts = open && !transaction && accounts.length === 0;

  const transferDestinations = accounts.filter(
    (account) => account.id !== accountId,
  );

  const selectedAccount = accounts.find((account) => account.id === accountId);

  const relevantCategories = categories.filter(
    (category) => category.type === type,
  );

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      accountId,
      type,
      amount,
      currency: selectedAccount?.currency ?? "EUR",
      date: new Date(date).toISOString(),
      description: description || undefined,
      ...(type === "TRANSFER"
        ? { transferToAccountId }
        : { categoryId: categoryId || undefined }),
    };

    try {
      if (transaction) {
        await updateTransaction(transaction.id, payload);
      } else {
        await createTransaction(payload);
      }

      onOpenChange(false);
      onSuccess();
    } catch {
      setError(transaction ? t("updateError") : t("createError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transaction ? t("editTitle") : t("addTitle")}
          </DialogTitle>

          <DialogDescription>
            {transaction ? t("editDescription") : t("addDescription")}
          </DialogDescription>
        </DialogHeader>

        {hasNoAccounts ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Wallet className="size-8 text-muted-foreground" />

            <p className="text-sm text-muted-foreground">{t("noAccounts")}</p>

            <Button asChild className="h-11 px-4 md:h-10">
              <Link href="/accounts">{t("goToAccounts")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">{tCommon("type")}</Label>

              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as TransactionType);
                  setCategoryId("");
                  setFieldErrors({});
                }}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent position="popper">
                  <SelectItem value="INCOME">{tCommon("income")}</SelectItem>

                  <SelectItem value="EXPENSE">{tCommon("expense")}</SelectItem>

                  <SelectItem value="TRANSFER">
                    {tCommon("transfer")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">
                {type === "TRANSFER" ? t("fromAccount") : tCommon("account")}
              </Label>

              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger
                  id="accountId"
                  className={`w-full ${
                    fieldErrors.accountId ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder={t("selectAccount")} />
                </SelectTrigger>

                <SelectContent position="popper">
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fieldErrors.accountId && (
                <p className="text-xs text-destructive">
                  {fieldErrors.accountId}
                </p>
              )}
            </div>

            {type === "TRANSFER" ? (
              <div className="space-y-2">
                <Label htmlFor="transferToAccountId">{t("toAccount")}</Label>

                <Select
                  value={transferToAccountId}
                  onValueChange={setTransferToAccountId}
                  disabled={transferDestinations.length === 0}
                >
                  <SelectTrigger
                    id="transferToAccountId"
                    className={`w-full ${
                      fieldErrors.transferToAccountId
                        ? "border-destructive"
                        : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        transferDestinations.length === 0
                          ? t("noOtherAccounts")
                          : t("selectDestinationAccount")
                      }
                    />
                  </SelectTrigger>

                  <SelectContent position="popper">
                    {transferDestinations.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {transferDestinations.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {t("secondAccountRequired")}{" "}
                    <Link
                      href="/accounts"
                      className="text-primary hover:underline"
                    >
                      {t("addOneHere")}
                    </Link>
                    .
                  </p>
                ) : (
                  fieldErrors.transferToAccountId && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.transferToAccountId}
                    </p>
                  )
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="categoryId">{tCommon("category")}</Label>

                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  disabled={relevantCategories.length === 0}
                >
                  <SelectTrigger
                    id="categoryId"
                    className={`w-full ${
                      fieldErrors.categoryId ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        relevantCategories.length === 0
                          ? t("noCategories")
                          : t("selectCategory")
                      }
                    />
                  </SelectTrigger>

                  <SelectContent position="popper">
                    {relevantCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {relevantCategories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {t("categoryRequired", {
                      type:
                        type === "INCOME"
                          ? tCommon("income").toLowerCase()
                          : tCommon("expense").toLowerCase(),
                    })}{" "}
                    <Link
                      href="/categories"
                      className="text-primary hover:underline"
                    >
                      {t("addOneHere")}
                    </Link>
                    .
                  </p>
                ) : (
                  fieldErrors.categoryId && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.categoryId}
                    </p>
                  )
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">{tCommon("amount")}</Label>

                <Input
                  id="amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                  className={fieldErrors.amount ? "border-destructive" : ""}
                  required
                />

                {fieldErrors.amount && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.amount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{tCommon("date")}</Label>

                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                  className={fieldErrors.date ? "border-destructive" : ""}
                />

                {fieldErrors.date && (
                  <p className="text-xs text-destructive">{fieldErrors.date}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {tCommon("description")} ({tCommon("optional")})
              </Label>

              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                rows={2}
              />
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
                disabled={isSubmitting || !accountId}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t("saving")}
                  </>
                ) : transaction ? (
                  t("saveChanges")
                ) : (
                  t("addTransaction")
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
