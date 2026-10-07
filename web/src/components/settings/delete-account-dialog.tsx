"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteAccount } from "@/lib/users-api";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteAccountDialog() {
  const t = useTranslations("deleteAccountDialog");
  const common = useTranslations("common");

  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setIsDeleting(true);

    try {
      await deleteAccount(password);
      await logout();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t("incorrectPassword"));
      } else {
        setError(t("failedDelete"));
      }

      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card border-destructive/30 p-4">
      <h2 className="font-medium text-destructive">{t("title")}</h2>

      <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>

      <Button
        variant="destructive"
        className="mt-4 h-11 px-4 md:h-10 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {t("deleteButton")}
      </Button>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setPassword("");
            setError("");
          }
          setOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>

            <AlertDialogDescription>
              {t("confirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="deletePassword">{t("password")}</Label>

            <Input
              id="deletePassword"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {common("cancel")}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting || !password}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {common("deleting")}
                </>
              ) : (
                t("deletePermanently")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
