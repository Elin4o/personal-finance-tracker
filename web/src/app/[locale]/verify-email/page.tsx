"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { verifyEmail } from "@/lib/auth-api";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function VerifyEmailPage() {
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
    <AuthLayout
      headline="Verifying your email."
      subtext="This will only take a moment."
    >
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        {status === "loading" && (
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="size-8 text-success" />
            <p className="text-sm text-muted-foreground">
              Your email has been verified.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              This link is invalid or has expired.
            </p>
          </>
        )}

        <Link
          href="/login"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Go to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
