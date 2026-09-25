"use client";
import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const t = useTranslations("common");
  const router = useRouter();
  const { user } = useAuth();
  if (user) {
    router.replace("/dashboard");
  } else {
    router.replace("/login");
  }

  return (
    <main>
      <h1>{t("appName")}</h1>
    </main>
  );
}
