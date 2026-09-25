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
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { usePathname } from "@/i18n/navigation";
import { navItems } from "./nav-items";

export function Header() {
  const { user, logout } = useAuth();

  const initial = user?.email.charAt(0).toUpperCase() ?? "?";
  const pathname = usePathname();
  const currentPage = navItems.find((item) => item.href === pathname);

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <h1 className="text-lg font-semibold">{currentPage?.label ?? ""}</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="ml-auto cursor-pointer">
            <Avatar>
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="truncate text-sm font-normal text-muted-foreground">
            {user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className=" cursor-pointer">
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
