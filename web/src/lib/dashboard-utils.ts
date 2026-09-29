import type { Transaction, TransactionType } from "./transactions-api";

export function getLastMonths(count: number) {
  const months: { year: number; month: number; label: string }[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString(undefined, { month: "short" }),
    });
  }

  return months;
}

export function aggregateMonthly(
  transactions: Transaction[],
  months: { year: number; month: number; label: string }[],
  currency: string,
) {
  return months.map(({ year, month, label }) => {
    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      if (t.currency !== currency) continue;
      const d = new Date(t.date);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;

      if (t.type === "INCOME") income += parseFloat(t.amount);
      if (t.type === "EXPENSE") expense += parseFloat(t.amount);
    }

    return { year, month, label, income, expense };
  });
}

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function aggregateByCategory(
  transactions: Transaction[],
  currency: string,
  type: TransactionType,
  year: number,
  month: number,
) {
  const totals = new Map<string, number>();

  for (const t of transactions) {
    if (t.currency !== currency || t.type !== type) continue;
    const d = new Date(t.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;

    const name = t.category?.name ?? "Uncategorized";
    totals.set(name, (totals.get(name) ?? 0) + parseFloat(t.amount));
  }

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      fill: PALETTE[index % PALETTE.length],
    }));
}

export function sumByCurrency(
  items: { amount: string; currency: string }[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const item of items) {
    totals[item.currency] =
      (totals[item.currency] ?? 0) + parseFloat(item.amount);
  }
  return totals;
}
