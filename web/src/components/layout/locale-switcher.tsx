"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const LABELS: Record<string, string> = {
  en: "en",
  bg: "bg",
  de: "de",
};

export function LocaleSwitcherMenuItem() {
  const t = useTranslations("languages");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages className="size-4" />
        {t(LABELS[locale])}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {Object.entries(LABELS).map(([code, label]) => (
            <DropdownMenuItem
              key={code}
              disabled={code === locale}
              onClick={() => router.replace(pathname, { locale: code })}
            >
              {t(label)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
