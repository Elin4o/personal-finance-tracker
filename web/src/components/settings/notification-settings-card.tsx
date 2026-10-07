"use client";

import { useEffect, useState } from "react";
import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "@/lib/users-api";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const FIELDS: {
  key: keyof NotificationSettings;
  labelKey: "emailNotifications" | "loanReminders";
  descriptionKey: "emailNotificationsDescription" | "loanRemindersDescription";
}[] = [
  {
    key: "emailEnabled",
    labelKey: "emailNotifications",
    descriptionKey: "emailNotificationsDescription",
  },
  // {
  //   key: "pushEnabled",
  //   labelKey: "pushNotifications",
  //   descriptionKey: "pushNotificationsDescription",
  // },
  {
    key: "loanRemindersEnabled",
    labelKey: "loanReminders",
    descriptionKey: "loanRemindersDescription",
  },
  // {
  //   key: "savingsGoalRemindersEnabled",
  //   labelKey: "savingsGoalReminders",
  //   descriptionKey: "savingsGoalRemindersDescription",
  // },
];

export default function NotificationSettingsCard() {
  const t = useTranslations("notificationSettings");

  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const data = await getNotificationSettings();

        if (!ignore) {
          setSettings(data);
        }
      } catch {
        if (!ignore) {
          setError(t("failedLoad"));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, [t]);

  async function handleToggle(key: keyof NotificationSettings, value: boolean) {
    if (!settings) return;

    const previous = settings;

    setSettings({
      ...settings,
      [key]: value,
    });

    setSavingKey(key);
    setError("");

    try {
      await updateNotificationSettings({ [key]: value });
    } catch {
      setSettings(previous);
      setError(t("failedSave"));
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="font-medium">{t("title")}</h2>

      <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>

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
          FIELDS.map(({ key, labelKey, descriptionKey }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor={key} className="text-sm font-normal">
                  {t(labelKey)}
                </Label>

                <p className="text-xs text-muted-foreground">
                  {t(descriptionKey)}
                </p>
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
