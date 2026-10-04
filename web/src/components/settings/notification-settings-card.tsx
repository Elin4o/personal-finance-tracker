"use client";

import { useEffect, useState } from "react";
import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "@/lib/users-api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const FIELDS: {
  key: keyof NotificationSettings;
  label: string;
  description: string;
}[] = [
  {
    key: "emailEnabled",
    label: "Email notifications",
    description: "General updates sent to your email.",
  },
  // {
  //   key: "pushEnabled",
  //   label: "Push notifications",
  //   description: "Alerts sent to your device.",
  // },
  {
    key: "loanRemindersEnabled",
    label: "Loan reminders",
    description: "Reminders about upcoming or overdue loan payments.",
  },
  // {
  //   key: "savingsGoalRemindersEnabled",
  //   label: "Savings goal reminders",
  //   description: "Reminders about your savings goals progress.",
  // },
];

export default function NotificationSettingsCard() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const data = await getNotificationSettings();
        if (!ignore) setSettings(data);
      } catch {
        if (!ignore) setError("Failed to load notification settings.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleToggle(key: keyof NotificationSettings, value: boolean) {
    if (!settings) return;

    const previous = settings;
    setSettings({ ...settings, [key]: value });
    setSavingKey(key);
    setError("");

    try {
      await updateNotificationSettings({ [key]: value });
    } catch {
      setSettings(previous);
      setError("Failed to save. Please try again.");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="font-medium">Notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose what you want to be notified about.
      </p>

      <div className="mt-4 space-y-4">
        {isLoading && (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        )}

        {!isLoading && error && !settings && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!isLoading &&
          settings &&
          FIELDS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor={key} className="text-sm font-normal">
                  {label}
                </Label>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                id={key}
                checked={settings[key]}
                disabled={savingKey === key}
                onCheckedChange={(checked) => handleToggle(key, checked)}
                className="cursor-pointer"
              />
            </div>
          ))}

        {error && settings && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}
