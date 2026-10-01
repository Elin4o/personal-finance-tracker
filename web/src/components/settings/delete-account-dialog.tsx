"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
        setError("Incorrect password.");
      } else {
        setError("Failed to delete account. Please try again.");
      }
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-lg border border-destructive/30 p-4">
      <h2 className="font-medium text-destructive">Delete account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Permanently delete your account and all your data. This cannot be
        undone.
      </p>

      <Button
        variant="destructive"
        className="mt-4 h-11 px-4 md:h-10"
        onClick={() => setOpen(true)}
      >
        Delete my account
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, accounts, transactions,
              categories, and loans. Enter your password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="deletePassword">Password</Label>
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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
                  Deleting...
                </>
              ) : (
                "Delete permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
