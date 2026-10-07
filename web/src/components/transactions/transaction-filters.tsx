"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type {
  TransactionFilters,
  TransactionType,
} from "@/lib/transactions-api";
import type { Account } from "@/lib/accounts-api";
import type { Category } from "@/lib/categories-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "../ui/switch";
import { useTranslations } from "next-intl";

const ALL = "all";

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  accounts: Account[];
  categories: Category[];
}

export default function TransactionFiltersBar({
  filters,
  onChange,
  accounts,
  categories,
}: TransactionFiltersBarProps) {
  const [open, setOpen] = useState(false);

  const t = useTranslations("transactionFilters");
  const tCommon = useTranslations("common");
  const tTransactions = useTranslations("transactions");

  const activeCount = Object.values(filters).filter(Boolean).length;
  const categoryDisabled = filters.type === "TRANSFER";

  const visibleCategories =
    filters.type && filters.type !== "TRANSFER"
      ? categories.filter((c) => c.type === filters.type)
      : categories;

  function handleTypeChange(value: string) {
    const type = value === ALL ? undefined : (value as TransactionType);

    const currentCategory = categories.find((c) => c.id === filters.categoryId);

    const keepCategory =
      !type || (type !== "TRANSFER" && currentCategory?.type === type);

    onChange({
      ...filters,
      type,
      categoryId: keepCategory ? filters.categoryId : undefined,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="outline"
          className="h-11 flex-1 cursor-pointer"
          onClick={() => setOpen((value) => !value)}
        >
          <SlidersHorizontal className="size-4" />
          {t("filters")}
          {activeCount > 0 && ` (${activeCount})`}
        </Button>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            className="h-11 cursor-pointer"
            onClick={() => onChange({})}
          >
            {t("clear")}
          </Button>
        )}
      </div>

      <div
        className={`${
          open ? "grid" : "hidden"
        } grid-cols-1 gap-3 sm:grid-cols-2 md:grid md:grid-cols-3 lg:grid-cols-5`}
      >
        <div className="space-y-1.5">
          <Label
            htmlFor="filter-type"
            className="text-xs text-muted-foreground"
          >
            {tCommon("type")}
          </Label>

          <Select value={filters.type ?? ALL} onValueChange={handleTypeChange}>
            <SelectTrigger
              id="filter-type"
              className="w-full data-[size=default]:h-11 md:data-[size=default]:h-10"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent position="popper">
              <SelectItem value={ALL}>{t("allTypes")}</SelectItem>
              <SelectItem value="INCOME">{tCommon("income")}</SelectItem>
              <SelectItem value="EXPENSE">{tCommon("expense")}</SelectItem>
              <SelectItem value="TRANSFER">{tCommon("transfer")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="filter-account"
            className="text-xs text-muted-foreground"
          >
            {tCommon("account")}
          </Label>

          <Select
            value={filters.accountId ?? ALL}
            onValueChange={(value) =>
              onChange({
                ...filters,
                accountId: value === ALL ? undefined : value,
              })
            }
          >
            <SelectTrigger
              id="filter-account"
              className="w-full data-[size=default]:h-11 md:data-[size=default]:h-10"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent position="popper">
              <SelectItem value={ALL}>{t("allAccounts")}</SelectItem>

              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                  {account.isArchived && t("archived")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="filter-category"
            className="text-xs text-muted-foreground"
          >
            {tCommon("category")}
          </Label>

          <Select
            value={filters.categoryId ?? ALL}
            disabled={categoryDisabled}
            onValueChange={(value) =>
              onChange({
                ...filters,
                categoryId: value === ALL ? undefined : value,
              })
            }
          >
            <SelectTrigger
              id="filter-category"
              className="w-full data-[size=default]:h-11 md:data-[size=default]:h-10"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent position="popper">
              <SelectItem value={ALL}>{t("allCategories")}</SelectItem>

              {visibleCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                  {category.isArchived && t("archived")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="filter-from"
            className="text-xs text-muted-foreground"
          >
            {t("from")}
          </Label>

          <Input
            id="filter-from"
            type="date"
            className="h-11 cursor-pointer md:h-10"
            value={filters.dateFrom ?? ""}
            max={filters.dateTo}
            onChange={(event) =>
              onChange({
                ...filters,
                dateFrom: event.target.value || undefined,
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-to" className="text-xs text-muted-foreground">
            {t("to")}
          </Label>

          <Input
            id="filter-to"
            type="date"
            className="h-11 cursor-pointer md:h-10"
            value={filters.dateTo ?? ""}
            min={filters.dateFrom}
            onChange={(event) =>
              onChange({
                ...filters,
                dateTo: event.target.value || undefined,
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{t("loans")}</Label>

          <div className="flex h-11 items-center gap-2 md:h-10">
            <Switch
              id="filter-loan"
              checked={filters.loanOnly ?? false}
              onCheckedChange={(checked) =>
                onChange({
                  ...filters,
                  loanOnly: checked || undefined,
                })
              }
            />

            <Label
              htmlFor="filter-loan"
              className="cursor-pointer text-sm font-normal"
            >
              {t("paymentsOnly")}
            </Label>
          </div>
        </div>
      </div>

      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex"
          onClick={() => onChange({})}
        >
          <X className="size-4" />
          {tTransactions("clearFilters")}
        </Button>
      )}
    </div>
  );
}
