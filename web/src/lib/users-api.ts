import { apiGet, apiPatch, apiPost, apiDelete } from "./api";

export type NotificationSettings = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  loanRemindersEnabled: boolean;
  savingsGoalRemindersEnabled: boolean;
};

export function getNotificationSettings(): Promise<NotificationSettings> {
  return apiGet<NotificationSettings>("/users/me/notification-settings");
}

export function updateNotificationSettings(
  data: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  return apiPatch<NotificationSettings>(
    "/users/me/notification-settings",
    data,
  );
}

export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiPatch<{ message: string }>("/users/me/password", data);
}

export function deleteAccount(password: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>("/users/me", {
    password,
  });
}
