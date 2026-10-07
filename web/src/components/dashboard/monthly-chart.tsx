"use client";

import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MonthPoint = {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
};

interface MonthlyChartProps {
  data: MonthPoint[];
  currency: string;
  onBarClick?: (point: {
    year: number;
    month: number;
    type: "INCOME" | "EXPENSE";
  }) => void;
  onMonthClick?: (point: { year: number; month: number }) => void;
}

function MonthAxisTick(props: {
  x?: string | number;
  y?: string | number;
  index?: number;
  payload?: { value: string };
  data: MonthPoint[];
  onMonthClick?: (point: { year: number; month: number }) => void;
}) {
  const { x = 0, y = 0, index = 0, payload, data, onMonthClick } = props;
  const point = data[index];
  const xValue = typeof x === "number" ? x : Number(x);
  const yValue = typeof y === "number" ? y : Number(y);

  return (
    <text
      x={xValue}
      y={yValue + 12}
      textAnchor="middle"
      fontSize={12}
      fill={onMonthClick ? "var(--foreground)" : "var(--muted-foreground)"}
      className={onMonthClick ? "cursor-pointer" : undefined}
      onClick={() =>
        point && onMonthClick?.({ year: point.year, month: point.month })
      }
    >
      {payload?.value}
    </text>
  );
}

export default function MonthlyChart({
  data,
  currency,
  onBarClick,
  onMonthClick,
}: MonthlyChartProps) {
  const t = useTranslations("monthlyChart");
  return (
    <div className="h-64 w-full pb-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={(props) => (
              <MonthAxisTick
                {...props}
                data={data}
                onMonthClick={onMonthClick}
              />
            )}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="var(--muted-foreground)"
            width={40}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? `${value.toFixed(2)} ${currency}`
                : value
            }
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="var(--success)"
            radius={4}
            className={onBarClick ? "cursor-pointer" : undefined}
            onClick={(_, index) => {
              const point = data[index];
              if (point)
                onBarClick?.({
                  year: point.year,
                  month: point.month,
                  type: "INCOME",
                });
            }}
          />
          <Bar
            dataKey="expense"
            name="Expense"
            fill="var(--destructive)"
            radius={4}
            className={onBarClick ? "cursor-pointer" : undefined}
            onClick={(_, index) => {
              const point = data[index];
              if (point)
                onBarClick?.({
                  year: point.year,
                  month: point.month,
                  type: "EXPENSE",
                });
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      {onMonthClick && (
        <p className="mt-1 text-center text-xs text-balance text-muted-foreground">
          {t("hint")}
        </p>
      )}
    </div>
  );
}
