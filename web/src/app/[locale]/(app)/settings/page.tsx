import NotificationSettingsCard from "@/components/settings/notification-settings-card";
import ChangePasswordCard from "@/components/settings/change-password-card";
import DeleteAccountDialog from "@/components/settings/delete-account-dialog";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Manage your account preferences and security.
      </p>
      <NotificationSettingsCard />
      <ChangePasswordCard />
      <DeleteAccountDialog />
    </div>
  );
}
