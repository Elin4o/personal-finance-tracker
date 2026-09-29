"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [isLoading, user, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </main>
  );
}
