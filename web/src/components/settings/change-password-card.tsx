"use client";

import { useState, type SubmitEvent } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { changePassword } from "@/lib/users-api";
import { ApiError } from "@/lib/api";
import { required } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordCard() {
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

    const currentError = required(
      currentPassword,
      "Enter your current password.",
    );
    if (currentError) errors.currentPassword = currentError;

    if (newPassword.length < 8) {
      errors.newPassword = "New password must be at least 8 characters.";
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
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
        setFieldErrors({ currentPassword: "Current password is incorrect." });
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="font-medium">Change password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        You&apos;ll stay signed in here, but other devices will be signed out.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current password</Label>
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
              aria-label={showPassword ? "Hide password" : "Show password"}
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
            <Label htmlFor="newPassword">New password</Label>
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
            <Label htmlFor="confirmPassword">Confirm new password</Label>
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
            Password changed successfully.
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
              Changing...
            </>
          ) : (
            "Change password"
          )}
        </Button>
      </form>
    </div>
  );
}
