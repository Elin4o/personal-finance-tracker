"use client";

import { useState, SubmitEvent } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("register");
  const tCommon = useTranslations("common");

  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(tCommon("passwordMismatch"));
      return;
    }

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
              autoComplete="email"
              className="h-11 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 pr-10 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-5 cursor-pointer" />
                ) : (
                  <Eye className="size-5 cursor-pointer" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {tCommon("confirmPassword")}
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              autoComplete="new-password"
              className="h-11 text-base"
            />
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
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
