"use client";
import { getAccount, User } from "@/lib/users-api";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { resendVerification } from "@/lib/auth-api";

export default function ActivateAccountCard() {
  const [account, setAccount] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const data = await getAccount();
        if (!ignore) setAccount(data);
      } catch {
        if (!ignore) setError("Failed to load account info.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="rounded-lg bg-card border p-4">
      <h2 className="font-medium">Account verification</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Verify your email address to keep your account secure.
      </p>

      <div className="mt-4">
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : account?.emailVerified ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Email verified</p>
              <p className="text-xs text-muted-foreground">
                Your account is activated.
              </p>
            </div>

            <span className="text-sm text-muted-foreground">Verified</span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Email not verified</p>
              <p className="text-xs text-muted-foreground">
                Check your inbox for the verification link.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => resendVerification()}
            >
              Resend email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
