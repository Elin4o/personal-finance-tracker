"use client";

import { getMonthOptions } from "@/lib/dashboard-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

function keyOf(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

interface MonthRangePickerProps {
  from: { year: number; month: number };
  to: { year: number; month: number };
  earliest?: { year: number; month: number } | null;
  onChange: (range: {
    from: { year: number; month: number };
    to: { year: number; month: number };
  }) => void;
}

export default function MonthRangePicker({
  from,
  to,
  earliest,
  onChange,
}: MonthRangePickerProps) {
  const tMonths = useTranslations("months");
  const monthLabels = tMonths.raw("short") as string[];
  const OPTIONS = getMonthOptions(3, monthLabels);
  const OPTIONS_ASC = [...OPTIONS].reverse();
  const t = useTranslations("monthRangePicker");
  const minKey = earliest ? keyOf(earliest.year, earliest.month) : null;
  function parse(value: string): { year: number; month: number } {
    const [year, month] = value.split("-").map(Number);
    return { year, month };
  }

  function handleFromChange(value: string) {
    const newFrom = parse(value);
    if (keyOf(newFrom.year, newFrom.month) > keyOf(to.year, to.month)) {
      onChange({ from: newFrom, to: newFrom });
    } else {
      onChange({ from: newFrom, to });
    }
  }

  function handleToChange(value: string) {
    const newTo = parse(value);
    if (keyOf(newTo.year, newTo.month) < keyOf(from.year, from.month)) {
      onChange({ from: newTo, to: newTo });
    } else {
      onChange({ from, to: newTo });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Select
        value={keyOf(from.year, from.month)}
        onValueChange={handleFromChange}
      >
        <SelectTrigger className="h-9 w-28 cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          {OPTIONS_ASC.filter(
            (o) =>
              keyOf(o.year, o.month) <= keyOf(to.year, to.month) &&
              (!minKey || keyOf(o.year, o.month) >= minKey),
          ).map((o) => (
            <SelectItem
              key={keyOf(o.year, o.month)}
              value={keyOf(o.year, o.month)}
              className="cursor-pointer"
            >
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground">{t("to")}</span>

      <Select value={keyOf(to.year, to.month)} onValueChange={handleToChange}>
        <SelectTrigger className="h-9 w-28 cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          {OPTIONS_ASC.filter(
            (o) =>
              keyOf(o.year, o.month) >= keyOf(from.year, from.month) &&
              (!minKey || keyOf(o.year, o.month) >= minKey),
          ).map((o) => (
            <SelectItem
              key={keyOf(o.year, o.month)}
              value={keyOf(o.year, o.month)}
              className="cursor-pointer"
            >
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
