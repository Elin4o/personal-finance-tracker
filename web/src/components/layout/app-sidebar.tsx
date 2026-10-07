"use client";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  useSidebar,
} from "../ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-primary transition-colors hover:bg-sidebar-accent"
          >
            <Wallet className="size-5" />
          </button>
          <span className="text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Fiscora
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map(
                ({ href, labelKey, icon: Icon, excludeNav }) =>
                  !excludeNav && (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === href}
                        className={cn(
                          "h-11 text-base",
                          "hover:bg-primary/5",
                          "data-active:bg-primary/10 data-active:text-primary data-active:font-medium",
                          "group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:p-3!",
                        )}
                      >
                        <Link href={href}>
                          <Icon className="size-5" />
                          <span>{t(labelKey)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
