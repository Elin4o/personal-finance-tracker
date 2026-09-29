"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryBreakdownChartProps {
  data: { name: string; value: number; fill: string }[];
  currency: string;
}

export default function CategoryBreakdownChart({
  data,
  currency,
}: CategoryBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Nothing to show for this month yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="max-w-[220px] space-y-2 text-sm">
        {data.map((entry) => (
          <li
            key={entry.name}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="truncate">{entry.name}</span>
            </span>
            <span className="shrink-0 font-mono text-muted-foreground">
              {entry.value.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
