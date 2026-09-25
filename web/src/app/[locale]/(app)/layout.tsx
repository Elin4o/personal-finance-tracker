import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">
          <Header />
          <div className="p-6 pb-24 lg:pb-6">{children}</div> <BottomNav />
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
