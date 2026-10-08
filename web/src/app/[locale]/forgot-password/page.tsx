"use client";

import { useState, type SubmitEvent } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { forgotPassword } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useTranslations } from "next-intl";
import { required } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const tCommon = useTranslations("common");

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const emailError = required(email, tCommon("emptyEmail"));

    if (emailError) {
      errors.email = emailError;
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError(tCommon("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout headline={t("headline")} subtext={t("subtext")}>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">
          {t("resetPassword")}
        </h2>
      </div>

      {submitted ? (
        <p className="text-sm text-muted-foreground">
          {t.rich("submitted", {
            email: email,
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors({});
                  }
                }}
                autoFocus
                autoComplete="email"
                className={`h-11 text-base ${
                  fieldErrors.email ? "border-destructive" : ""
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {tCommon("backToSignIn")}
        </Link>
      </p>
    </AuthLayout>
  );
}
