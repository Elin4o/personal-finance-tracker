"use client";

import { useAuth } from "@/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { usePathname, Link } from "@/i18n/navigation";
import { navItems } from "./nav-items";
import { ThemeToggleMenuItem } from "./theme-toggle";

export function Header() {
  const { user, logout } = useAuth();

  const initial = user?.email.charAt(0).toUpperCase() ?? "?";
  const pathname = usePathname();
  const currentPage = navItems.find((item) => item.href === pathname);

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-2">
        <Wallet className="size-5 text-primary md:hidden" />
        <h1 className="text-lg font-semibold">{currentPage?.label ?? ""}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className="ml-auto flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-muted md:pr-3"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 font-medium text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-40 truncate text-sm md:inline">
              {user?.email}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="truncate text-sm font-normal text-muted-foreground">
            {user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/settings">
              <SettingsIcon className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <ThemeToggleMenuItem />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
