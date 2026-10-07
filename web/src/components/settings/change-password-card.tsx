"use client";

import { useState, type SubmitEvent } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { changePassword } from "@/lib/users-api";
import { ApiError } from "@/lib/api";
import { required } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordCard() {
  const t = useTranslations("changePassword");
  const common = useTranslations("common");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const currentError = required(currentPassword, t("enterCurrentPassword"));

    if (currentError) {
      errors.currentPassword = currentError;
    }

    if (newPassword.length < 8) {
      errors.newPassword = t("newPasswordTooShort");
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = common("passwordMismatch");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await changePassword({ currentPassword, newPassword });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setFieldErrors({
          currentPassword: t("currentPasswordIncorrect"),
        });
      } else {
        setError(t("failed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="font-medium">{t("title")}</h2>

      <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">{t("currentPassword")}</Label>

          <div className="relative">
            <Input
              id="currentPassword"
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              className={`h-11 pr-10 text-base ${
                fieldErrors.currentPassword ? "border-destructive" : ""
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label={
                showPassword
                  ? common("aria.hidePassword")
                  : common("aria.showPassword")
              }
            >
              {showPassword ? (
                <EyeOff className="size-5 cursor-pointer" />
              ) : (
                <Eye className="size-5 cursor-pointer" />
              )}
            </button>
          </div>

          {fieldErrors.currentPassword && (
            <p className="text-xs text-destructive">
              {fieldErrors.currentPassword}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("newPassword")}</Label>

            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              className={`h-11 text-base ${
                fieldErrors.newPassword ? "border-destructive" : ""
              }`}
            />

            {fieldErrors.newPassword && (
              <p className="text-xs text-destructive">
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmNewPassword")}</Label>

            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-success" role="status">
            {t("success")}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-4 md:h-10 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t("changing")}
            </>
          ) : (
            t("title")
          )}
        </Button>
      </form>
    </div>
  );
}
