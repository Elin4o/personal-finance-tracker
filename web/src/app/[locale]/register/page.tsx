"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { ApiError } from "@/lib/api";
import { required } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("register");
  const tCommon = useTranslations("common");
  const tAria = useTranslations("common.aria");

  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const emailError = required(email, tCommon("emptyEmail"));
    if (emailError) {
      errors.email = emailError;
    }

    const passwordError = required(password, tCommon("emptyPassword"));
    if (passwordError) {
      errors.password = passwordError;
    } else if (password.length < 8) {
      errors.password = t("passwordTooShort");
    }

    const confirmPasswordError = required(
      confirmPassword,
      t("emptyConfirmPassword"),
    );

    if (confirmPasswordError) {
      errors.confirmPassword = confirmPasswordError;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t("passwordMismatch");
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
      await register(email, password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(t("emailTaken"));
      } else {
        setError(t("error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout headline={t("headline")} subtext={t("subtext")}>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

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
                  setFieldErrors((current) => ({
                    ...current,
                    email: "",
                  }));
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

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);

                  if (fieldErrors.password) {
                    setFieldErrors((current) => ({
                      ...current,
                      password: "",
                    }));
                  }
                }}
                autoComplete="new-password"
                className={`h-11 pr-10 text-base ${
                  fieldErrors.password ? "border-destructive" : ""
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label={
                  showPassword ? tAria("hidePassword") : tAria("showPassword")
                }
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>

            {fieldErrors.password && (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {tCommon("confirmPassword")}
            </Label>

            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);

                if (fieldErrors.confirmPassword) {
                  setFieldErrors((current) => ({
                    ...current,
                    confirmPassword: "",
                  }));
                }
              }}
              autoComplete="new-password"
              className={`h-11 text-base ${
                fieldErrors.confirmPassword ? "border-destructive" : ""
              }`}
            />

            {fieldErrors.confirmPassword && (
              <p className="text-xs text-destructive">
                {fieldErrors.confirmPassword}
              </p>
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

        <p className="text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("signIn")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
