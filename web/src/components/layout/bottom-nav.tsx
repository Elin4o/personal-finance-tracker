"use client";

import { navItems } from "./nav-items";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslations } from "next-intl";

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <nav
      className="sticky inset-x-0 bottom-0 z-50 flex items-stretch border-t bg-background"
      style={{ height: "calc(4rem + env(safe-area-inset-bottom))" }}
    >
      {navItems.map(({ href, labelKey, icon: Icon, excludeNav }) => {
        if (excludeNav) {
          return null;
        }

        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 pb-[env(safe-area-inset-bottom)] text-xs",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" />

            <span className="max-w-full truncate leading-none">
              {t(labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
