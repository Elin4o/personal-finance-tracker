"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { verifyEmail } from "@/lib/auth-api";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useTranslations } from "next-intl";

export default function VerifyEmailPage() {
  const t = useTranslations("verifyEmail");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">(() =>
    token ? "loading" : "error",
  );

  useEffect(() => {
    if (!token) return;

    let ignore = false;

    void (async () => {
      try {
        await verifyEmail(token);
        if (!ignore) setStatus("success");
      } catch {
        if (!ignore) setStatus("error");
      }
    })();

    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <AuthLayout headline={t("headline")} subtext={t("subtext")}>
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        {status === "loading" && (
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="size-8 text-success" />
            <p className="text-sm text-muted-foreground">
              {t("emailVerified")}
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {t("linkInvalidOrExpired")}
            </p>
          </>
        )}

        <Link
          href="/login"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("goToSignIn")}
        </Link>
      </div>
    </AuthLayout>
  );
}
