import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  HandCoins,
  Tags,
  LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  excludeNav: boolean;
};

export const navItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/accounts", labelKey: "accounts", icon: Wallet },
  { href: "/transactions", labelKey: "transactions", icon: ArrowLeftRight },
  { href: "/loans", labelKey: "loans", icon: HandCoins },
  { href: "/categories", labelKey: "categories", icon: Tags },
  { href: "/settings", labelKey: "settings", icon: Tags, excludeNav: true },
];
