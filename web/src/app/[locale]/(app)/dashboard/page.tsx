"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  HandCoins,
} from "lucide-react";
import { getAccounts, type Account } from "@/lib/accounts-api";
import { getLoans, type Loan } from "@/lib/loans-api";
import {
  getAllTransactions,
  getEarliestTransactionDate,
  type Transaction,
} from "@/lib/transactions-api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MonthlyChart from "@/components/dashboard/monthly-chart";
import CategoryBreakdownChart from "@/components/dashboard/category-breakdown-chart";
import { useRouter } from "@/i18n/navigation";
import {
  aggregateByCategory,
  aggregateMonthly,
  getMonthRange,
  sumByCurrency,
} from "@/lib/dashboard-utils";
import MonthRangePicker from "@/components/dashboard/month-range-picker";
import { Category, getCategories } from "@/lib/categories-api";
import OnboardingChecklist from "@/components/dashboard/onboarding-checklist";

const NOW = new Date();

function CurrencyRows({
  totals,
  activeCurrency,
}: {
  totals: Record<string, number>;
  activeCurrency?: string;
}) {
  const entries = Object.entries(totals);

  if (entries.length === 0) {
    return <p className="font-mono text-2xl font-semibold">0.00</p>;
  }

  return (
    <div className="space-y-0.5">
      {entries.map(([curr, value]) => (
        <p
          key={curr}
          className={`font-mono text-2xl ${curr === activeCurrency ? "font-bold" : "font-semibold text-muted-foreground"}`}
        >
          {value.toFixed(2)}
          <span className="text-base font-normal text-muted-foreground">
            {" " + curr}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("");
  const [truncated, setTruncated] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  function monthsAgo(n: number) {
    const d = new Date(NOW.getFullYear(), NOW.getMonth() - n, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }

  const [range, setRange] = useState(() => ({
    from: monthsAgo(5),
    to: monthsAgo(0),
  }));

  function keyOf(year: number, month: number) {
    return `${year}-${String(month).padStart(2, "0")}`;
  }

  const normalizedRange =
    keyOf(range.from.year, range.from.month) <=
    keyOf(range.to.year, range.to.month)
      ? range
      : { from: range.to, to: range.from };

  const MONTHS = getMonthRange(normalizedRange.from, normalizedRange.to);
  const [categoryMonthKey, setCategoryMonthKey] = useState(() => {
    const t = monthsAgo(0);
    return `${t.year}-${t.month}`;
  });
  const [selectedCategoryYear, selectedCategoryMonthNum] = categoryMonthKey
    .split("-")
    .map(Number);

  const [breakdownType, setBreakdownType] = useState<
    "EXPENSE" | "INCOME" | "ALL"
  >("EXPENSE");

  const [earliestMonth, setEarliestMonth] = useState<{
    year: number;
    month: number;
  } | null>(null);

  const router = useRouter();

  function goToMonth(year: number, month: number, type?: "INCOME" | "EXPENSE") {
    const from = new Date(year, month, 1).toISOString().slice(0, 10);
    const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);

    const params = new URLSearchParams({
      dateFrom: from,
      dateTo: to,
      from: "dashboard",
    });
    if (type) params.set("type", type);

    router.push(`/transactions?${params.toString()}`);
  }

  function handleRangeChange(next: {
    from: { year: number; month: number };
    to: { year: number; month: number };
  }) {
    const scrollY = window.scrollY;
    setRange(next);
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const [accountsData, loansData, earliestDate, categoriesData] =
          await Promise.all([
            getAccounts(),
            getLoans(),
            getEarliestTransactionDate(),
            getCategories(),
          ]);

        if (ignore) return;

        setAccounts(accountsData);
        setLoans(loansData);
        setCategories(categoriesData);

        if (earliestDate) {
          const d = new Date(earliestDate);
          setEarliestMonth({ year: d.getFullYear(), month: d.getMonth() });
        }

        const activeAccounts = accountsData.filter((a) => !a.isArchived);
        const totals = sumByCurrency(
          activeAccounts.map((a) => ({
            amount: a.currentBalance,
            currency: a.currency,
          })),
        );
        const bestCurrency = Object.entries(totals).sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0];
        setCurrency((current) => current || bestCurrency || "EUR");
      } catch {
        if (!ignore) setError("Failed to load dashboard data.");
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setIsLoading(true);
      try {
        const dateFrom = new Date(range.from.year, range.from.month, 1)
          .toISOString()
          .slice(0, 10);

        const { data: transactionsData, truncated: isTruncated } =
          await getAllTransactions({ dateFrom });

        if (ignore) return;

        setTransactions(transactionsData);
        setTruncated(isTruncated);
      } catch {
        if (!ignore) setError("Failed to load dashboard data.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, [range]);
  const [prevRange, setPrevRange] = useState(range);

  if (range !== prevRange) {
    setPrevRange(range);
    const last = MONTHS[MONTHS.length - 1];
    const inRange = MONTHS.some(
      (m) => `${m.year}-${m.month}` === categoryMonthKey,
    );
    if (!inRange && last) setCategoryMonthKey(`${last.year}-${last.month}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const balanceTotals = sumByCurrency(
    activeAccounts.map((a) => ({
      amount: a.currentBalance,
      currency: a.currency,
    })),
  );
  const currencies = Array.from(new Set(activeAccounts.map((a) => a.currency)));

  const monthlyData = currency
    ? aggregateMonthly(transactions, MONTHS, currency)
    : [];

  const currentMonthPoint = currency
    ? aggregateMonthly(
        transactions,
        [{ year: NOW.getFullYear(), month: NOW.getMonth(), label: "" }],
        currency,
      )[0]
    : undefined;

  const thisMonth = currentMonthPoint ?? { income: 0, expense: 0 };

  const categoryData = currency
    ? aggregateByCategory(
        transactions,
        currency,
        breakdownType,
        selectedCategoryYear,
        selectedCategoryMonthNum,
      )
    : [];

  const activeLoans = loans.filter((l) => parseFloat(l.currentLoanBalance) > 0);
  const owedToMe = sumByCurrency(
    activeLoans
      .filter((l) => l.type === "LENT")
      .map((l) => ({
        amount: l.currentLoanBalance,
        currency: l.currency,
      })),
  );
  const owedByMe = sumByCurrency(
    activeLoans
      .filter((l) => l.type === "BORROWED")
      .map((l) => ({
        amount: l.currentLoanBalance,
        currency: l.currency,
      })),
  );

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const onboardingSteps = [
    { label: "Add an account", href: "/accounts", done: accounts.length > 0 },
    {
      label: "Add a category",
      href: "/categories",
      done: categories.length > 0,
    },
    {
      label: "Record your first transaction",
      href: "/transactions",
      done: transactions.length > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <OnboardingChecklist steps={onboardingSteps} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total balance</p>
          <CurrencyRows totals={balanceTotals} activeCurrency={currency} />
        </div>

        <button
          type="button"
          onClick={() => goToMonth(NOW.getFullYear(), NOW.getMonth())}
          className="rounded-lg border p-4 text-left transition-colors bg-card hover:bg-card-hover cursor-pointer"
        >
          <p className="text-sm text-muted-foreground">Income this month</p>
          <p className="font-mono text-2xl font-semibold text-success">
            +{thisMonth.income.toFixed(2)}{" "}
            <span className="text-base font-normal text-muted-foreground">
              {currency}
            </span>
          </p>
        </button>

        <button
          type="button"
          onClick={() => goToMonth(NOW.getFullYear(), NOW.getMonth())}
          className="rounded-lg border p-4 text-left transition-colors bg-card hover:bg-card-hover cursor-pointer"
        >
          <p className="text-sm text-muted-foreground">Expenses this month</p>
          <p className="font-mono text-2xl font-semibold text-destructive">
            -{thisMonth.expense.toFixed(2)}{" "}
            <span className="text-base font-normal text-muted-foreground">
              {currency}
            </span>
          </p>
        </button>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Loans</p>
          <div className="space-y-0.5">
            {Object.entries(owedToMe).map(([c, v]) => (
              <p key={`owed-${c}`} className="text-sm">
                <span className="text-success">
                  +{v.toFixed(2)} {c}
                </span>{" "}
                owed to you
              </p>
            ))}
            {Object.entries(owedByMe).map(([c, v]) => (
              <p key={`owe-${c}`} className="text-sm">
                <span className="text-destructive">
                  -{v.toFixed(2)} {c}
                </span>{" "}
                you owe
              </p>
            ))}
            {activeLoans.length === 0 && (
              <p className="text-sm text-muted-foreground">No open loans.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className="font-medium">Income vs expenses</h2>
          <div className="flex flex-wrap items-center gap-2">
            <MonthRangePicker
              from={range.from}
              to={range.to}
              earliest={earliestMonth}
              onChange={handleRangeChange}
            />
            {currencies.length > 1 && (
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-9 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        {currency ? (
          <MonthlyChart
            data={monthlyData}
            currency={currency}
            onBarClick={(p) => goToMonth(p.year, p.month, p.type)}
            onMonthClick={(p) => goToMonth(p.year, p.month)}
          />
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Add an account to see this chart.
          </p>
        )}
      </div>
      {truncated && (
        <p className="text-xs text-muted-foreground">
          Showing a sample of your transactions for this period.
        </p>
      )}

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-medium">By category</h2>
            <Select
              value={categoryMonthKey}
              onValueChange={setCategoryMonthKey}
            >
              <SelectTrigger className="h-9 w-28 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {MONTHS.map((m) => (
                  <SelectItem
                    key={`${m.year}-${m.month}`}
                    value={`${m.year}-${m.month}`}
                    className="cursor-pointer"
                  >
                    {m.label} {m.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex rounded-md border p-0.5 text-sm">
            <button
              type="button"
              onClick={() => setBreakdownType("EXPENSE")}
              className={`flex-1 rounded px-2.5 py-1 sm:flex-none cursor-pointer ${breakdownType === "EXPENSE" ? "bg-destructive/10 text-destructive" : "text-muted-foreground"}`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setBreakdownType("INCOME")}
              className={`flex-1 rounded px-2.5 py-1 sm:flex-none cursor-pointer ${breakdownType === "INCOME" ? "bg-success/10 text-success" : "text-muted-foreground"}`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setBreakdownType("ALL")}
              className={`flex-1 rounded px-2.5 py-1 sm:flex-none cursor-pointer ${breakdownType === "ALL" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
            >
              All
            </button>
          </div>
        </div>
        <CategoryBreakdownChart data={categoryData} currency={currency} />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Recent activity</h2>
          <Link
            href="/transactions"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transactions yet.
          </p>
        ) : (
          <ul className="divide-y">
            {recent.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {t.type === "INCOME" && (
                    <ArrowDownLeft className="size-4 shrink-0 text-success" />
                  )}
                  {t.type === "EXPENSE" && (
                    <ArrowUpRight className="size-4 shrink-0 text-destructive" />
                  )}
                  {t.type === "TRANSFER" && (
                    <ArrowLeftRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {t.loan
                        ? t.loan.personName
                        : (t.category?.name ?? t.account.name)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 font-mono text-sm ${
                    t.type === "INCOME"
                      ? "text-success"
                      : t.type === "EXPENSE"
                        ? "text-destructive"
                        : ""
                  }`}
                >
                  {t.type === "INCOME" && "+"}
                  {t.type === "EXPENSE" && "-"}
                  {parseFloat(t.amount).toFixed(2)} {t.currency}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeLoans.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <HandCoins className="size-4 text-muted-foreground" />
            <h2 className="font-medium">Open loans</h2>
          </div>
          <ul className="divide-y">
            {activeLoans.slice(0, 4).map((loan) => (
              <li
                key={loan.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="truncate">{loan.personName}</span>
                <span
                  className={`shrink-0 font-mono ${loan.type === "LENT" ? "text-success" : "text-destructive"}`}
                >
                  {parseFloat(loan.currentLoanBalance).toFixed(2)}{" "}
                  {loan.currency}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/loans"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            View all loans
          </Link>
        </div>
      )}
    </div>
  );
}
