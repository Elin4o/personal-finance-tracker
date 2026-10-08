"use client";

import { useState, useEffect, type SubmitEvent } from "react";
import { Loader2, Wallet } from "lucide-react";
import { Loan, createLoan, updateLoan, type LoanType } from "@/lib/loans-api";
import { getAccounts, type Account } from "@/lib/accounts-api";
import { ApiError } from "@/lib/api";
import { required, positiveAmount } from "@/lib/validation";
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
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  loan?: Loan | null;
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export default function LoanFormDialog({
  open,
  onOpenChange,
  onSuccess,
  loan,
}: LoanDialogProps) {
  const t = useTranslations("loanFormDialog");
  const tCommon = useTranslations("common");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [personName, setPersonName] = useState("");
  const [type, setType] = useState<LoanType>("LENT");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(() =>
    toDateInputValue(new Date().toISOString()),
  );
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const hasPayments = (loan?.payments.length ?? 0) > 0;

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setPersonName(loan?.personName ?? "");
      setType(loan?.type ?? "LENT");
      setAmount(loan?.amount ?? "");
      setCurrency(loan?.currency ?? "EUR");
      setAccountId("");
      setDate(
        loan
          ? toDateInputValue(loan.date)
          : toDateInputValue(new Date().toISOString()),
      );
      setDueDate(loan?.dueDate ? toDateInputValue(loan.dueDate) : "");
      setDescription(loan?.description ?? "");
      setError("");
      setFieldErrors({});
    }
  }

  useEffect(() => {
    if (!open || loan) return;

    void (async () => {
      const data = await getAccounts();
      setAccounts(data.filter((account) => !account.isArchived));
    })();
  }, [open, loan]);

  const hasNoAccounts = open && !loan && accounts.length === 0;

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const nameError = required(personName, t("enterName"));
    if (nameError) {
      errors.personName = nameError;
    }

    const amountError = positiveAmount(amount, tCommon("positiveAmountError"));

    if (amountError) {
      errors.amount = amountError;
    }

    if (!loan && !accountId) {
      errors.accountId = tCommon("selectAccount");
    }

    const dueDateError =
      dueDate && date && dueDate < date ? t("dueDateBeforeDate") : undefined;

    if (dueDateError) {
      errors.dueDate = dueDateError;
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (loan) {
        await updateLoan(loan.id, {
          personName,
          type,
          date: new Date(date).toISOString(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          description: description || undefined,
          ...(hasPayments ? {} : { amount, currency }),
        });
      } else {
        await createLoan({
          personName,
          type,
          amount,
          currency,
          accountId,
          date: new Date(date).toISOString(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          description: description || undefined,
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        if (err.code === "LOAN_CURRENCY_MISMATCH") {
          setError(t("currencyMismatch"));
        } else {
          setError(err.message || t("invalidDetails"));
        }
      } else {
        setError(loan ? t("failedUpdate") : t("failedCreate"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{loan ? t("editLoan") : tCommon("addLoan")}</DialogTitle>

          <DialogDescription>
            {loan ? t("updateLoanDetails") : t("recordMoney")}
          </DialogDescription>
        </DialogHeader>

        {hasNoAccounts ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Wallet className="size-8 text-muted-foreground" />

            <p className="text-sm text-muted-foreground">
              {t("linkedAccount")}
            </p>

            <Button asChild className="h-11 px-4 md:h-10">
              <Link href="/accounts">{tCommon("goToAccounts")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">{tCommon("type")}</Label>

              <Select
                value={type}
                onValueChange={(value) => setType(value as LoanType)}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent position="popper">
                  <SelectItem value="LENT">{t("iLent")}</SelectItem>

                  <SelectItem value="BORROWED">{t("iBorrowed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personName">{t("person")}</Label>

              <Input
                id="personName"
                value={personName}
                onChange={(event) => {
                  setPersonName(event.target.value);

                  if (fieldErrors.personName) {
                    setFieldErrors((current) => ({
                      ...current,
                      personName: "",
                    }));
                  }
                }}
                maxLength={200}
                placeholder={t("personPlaceholder")}
                className={fieldErrors.personName ? "border-destructive" : ""}
              />

              {fieldErrors.personName && (
                <p className="text-xs text-destructive">
                  {fieldErrors.personName}
                </p>
              )}
            </div>

            {!loan && (
              <div className="space-y-2">
                <Label htmlFor="accountId">{tCommon("account")}</Label>

                <Select
                  value={accountId}
                  onValueChange={(value) => {
                    setAccountId(value);

                    const selectedAccount = accounts.find(
                      (account) => account.id === value,
                    );

                    if (selectedAccount) {
                      setCurrency(selectedAccount.currency);
                    }

                    if (fieldErrors.accountId) {
                      setFieldErrors((current) => ({
                        ...current,
                        accountId: "",
                      }));
                    }
                  }}
                >
                  <SelectTrigger
                    id="accountId"
                    className={cn(
                      "w-full",
                      fieldErrors.accountId && "border-destructive",
                    )}
                  >
                    <SelectValue placeholder={tCommon("selectAccount")} />
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
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">{tCommon("amount")}</Label>

                <Input
                  id="amount"
                  inputMode="decimal"
                  value={amount}
                  disabled={hasPayments}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      setAmount(value);

                      if (fieldErrors.amount) {
                        setFieldErrors((current) => ({
                          ...current,
                          amount: "",
                        }));
                      }
                    }
                  }}
                  className={fieldErrors.amount ? "border-destructive" : ""}
                />

                {fieldErrors.amount && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.amount}
                  </p>
                )}
              </div>

              {!loan && (
                <div className="space-y-2">
                  <Label htmlFor="currency">{tCommon("currency")}</Label>

                  <Input id="currency" value={currency} readOnly disabled />
                </div>
              )}
            </div>

            {hasPayments && (
              <p className="text-xs text-muted-foreground">
                {t("forbiddenChanges")}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">{tCommon("date")}</Label>

                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);

                    if (fieldErrors.dueDate) {
                      setFieldErrors((current) => ({
                        ...current,
                        dueDate: "",
                      }));
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">{t("dueDate")}</Label>

                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  min={date}
                  onChange={(event) => {
                    setDueDate(event.target.value);

                    if (fieldErrors.dueDate) {
                      setFieldErrors((current) => ({
                        ...current,
                        dueDate: "",
                      }));
                    }
                  }}
                  className={fieldErrors.dueDate ? "border-destructive" : ""}
                />

                {fieldErrors.dueDate && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.dueDate}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>

              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={1000}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {tCommon("saving")}
                  </>
                ) : loan ? (
                  tCommon("submitSave")
                ) : (
                  tCommon("addLoan")
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
