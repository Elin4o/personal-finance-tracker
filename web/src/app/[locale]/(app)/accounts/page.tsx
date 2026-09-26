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

const ACCOUNT_TYPE_LABELS: Record<Account["type"], string> = {
  CASH: "Cash",
  BANK: "Bank",
  CARD: "Card",
  SAVINGS: "Savings",
  OTHER: "Other",
};

export default function AccountsPage() {
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
      setError("Failed to load accounts.");
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
        if (!ignore) setError("Failed to load accounts.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, []);

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
      {visibleAccounts.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Manage your cash, bank, and card accounts.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={setShowArchived}
              />
              <Label
                htmlFor="show-archived"
                className="text-sm text-muted-foreground"
              >
                Show archived
              </Label>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="size-4" />
              Add account
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

      {!isLoading && !error && visibleAccounts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No accounts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first account to start tracking your money.
          </p>
          <Button className="mt-4" onClick={openCreateDialog}>
            <Plus className="size-4" />
            Add your first account
          </Button>
        </div>
      )}

      {!isLoading && !error && visibleAccounts.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleAccounts.map((account) => (
                <TableRow
                  key={account.id}
                  className={account.isArchived ? "opacity-50" : ""}
                >
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{ACCOUNT_TYPE_LABELS[account.type]}</TableCell>
                  <TableCell>{account.currency}</TableCell>
                  <TableCell className="text-right font-mono">
                    {parseFloat(account.currentBalance).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(account)}
                        >
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
