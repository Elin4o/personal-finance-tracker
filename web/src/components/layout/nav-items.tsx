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
  label: string;
  icon: LucideIcon;
};

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/loans", label: "Loans", icon: HandCoins },
  { href: "/categories", label: "Categories", icon: Tags },
];
