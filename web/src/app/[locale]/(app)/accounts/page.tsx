"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";
import AccountFormDialog from "@/components/accounts/account-form-dialog";
import DeleteAccountDialog from "@/components/accounts/delete-account-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Account, getAccounts, updateAccount } from "@/lib/accounts-api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

const ACCOUNT_TYPE_LABELS: Record<Account["type"], string> = {
  CASH: "Cash",
  BANK: "Bank",
  CARD: "Card",
  SAVINGS: "Savings",
  OTHER: "Other",
};

export default function AccountsPage() {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

  const [showArchived, setShowArchived] = useState(false);

  const visibleAccounts = showArchived
    ? accounts
    : accounts.filter((a) => !a.isArchived);

  async function loadAccounts() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch {
      setError(t("failedLoad"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const data = await getAccounts();
        if (!ignore) setAccounts(data);
      } catch {
        if (!ignore) setError(t("failedLoad"));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, [t]);

  function openCreateDialog() {
    setEditingAccount(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(account: Account) {
    setEditingAccount(account);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {accounts.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">{t("manageAccounts")}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={setShowArchived}
                className="cursor-pointer"
              />
              <Label
                htmlFor="show-archived"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {tCommon("showArchived")}
              </Label>
            </div>

            <Button
              className="h-11 px-4 md:h-10 cursor-pointer"
              onClick={openCreateDialog}
            >
              <Plus className="size-4" />
              {tCommon("addAccount")}
            </Button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!isLoading && !error && accounts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm font-medium">{t("noAccount")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("addFirstAccount")}
          </p>
          <Button
            className="mt-4 h-11 px-4 md:h-10 cursor-pointer"
            onClick={openCreateDialog}
          >
            <Plus className="size-4" />
            {t("buttonAddFirstAccount")}
          </Button>
        </div>
      )}

      {!isLoading &&
        !error &&
        accounts.length > 0 &&
        visibleAccounts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm font-medium">{t("allArchived")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("turnArchivedOn")}
            </p>
          </div>
        )}

      {!isLoading && !error && visibleAccounts.length > 0 && (
        <>
          <div className="hidden rounded-lg border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon("name")}</TableHead>
                  <TableHead>{tCommon("type")}</TableHead>
                  <TableHead>{tCommon("currency")}</TableHead>
                  <TableHead className="text-right">{t("balance")}</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleAccounts.map((account) => (
                  <TableRow
                    key={account.id}
                    className={account.isArchived ? "opacity-50" : ""}
                  >
                    <TableCell className="font-medium">
                      {account.name}
                    </TableCell>
                    <TableCell>
                      {tCommon(ACCOUNT_TYPE_LABELS[account.type].toLowerCase())}
                    </TableCell>
                    <TableCell>{account.currency}</TableCell>
                    <TableCell className="text-right font-mono">
                      {parseFloat(account.currentBalance).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                          >
                            <MoreVertical className="size-4 cursor-pointer" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(account)}
                            className="cursor-pointer"
                          >
                            {tCommon("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={async () => {
                              await updateAccount(account.id, {
                                isArchived: !account.isArchived,
                                name: account.name,
                                type: account.type,
                                currency: account.currency,
                              });
                              loadAccounts();
                            }}
                          >
                            {account.isArchived
                              ? tCommon("unarchive")
                              : tCommon("archive")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            variant="destructive"
                            onClick={() => setDeletingAccount(account)}
                          >
                            {tCommon("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-3 md:hidden">
            {visibleAccounts.map((account) => (
              <div
                key={account.id}
                className={`w-full min-w-0 rounded-lg bg-card border p-4 ${
                  account.isArchived ? "opacity-50" : ""
                }`}
              >
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {account.name}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {ACCOUNT_TYPE_LABELS[account.type]} · {account.currency}
                      {account.isArchived && " · Archived"}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(account)}>
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={async () => {
                          await updateAccount(account.id, {
                            isArchived: !account.isArchived,
                            name: account.name,
                            type: account.type,
                            currency: account.currency,
                          });
                          loadAccounts();
                        }}
                      >
                        {account.isArchived ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingAccount(account)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="mt-2 text-right font-mono text-sm">
                  {parseFloat(account.currentBalance).toFixed(2)}{" "}
                  {account.currency}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <AccountFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadAccounts}
        account={editingAccount}
      />

      <DeleteAccountDialog
        account={deletingAccount}
        onOpenChange={(open) => {
          if (!open) setDeletingAccount(null);
        }}
        onSuccess={loadAccounts}
      />
    </div>
  );
}
