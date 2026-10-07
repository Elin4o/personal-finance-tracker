"use client";

import { getAccount, User } from "@/lib/users-api";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { resendVerification } from "@/lib/auth-api";

export default function ActivateAccountCard() {
  const t = useTranslations("accountVerification");

  const [account, setAccount] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const data = await getAccount();

        if (!ignore) {
          setAccount(data);
        }
      } catch {
        if (!ignore) {
          setError(t("failedLoad"));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, [t]);

  return (
    <div className="rounded-lg bg-card border p-4">
      <h2 className="font-medium">{t("title")}</h2>

      <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>

      <div className="mt-4">
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : account?.emailVerified ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{t("emailVerified")}</p>

              <p className="text-xs text-muted-foreground">{t("activated")}</p>
            </div>

            <span className="text-sm text-muted-foreground">
              {t("verified")}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{t("emailNotVerified")}</p>

              <p className="text-xs text-muted-foreground">{t("checkInbox")}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => resendVerification()}
            >
              {t("resendEmail")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
