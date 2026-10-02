import NotificationSettingsCard from "@/components/settings/notification-settings-card";
import ChangePasswordCard from "@/components/settings/change-password-card";
import DeleteAccountDialog from "@/components/settings/delete-account-dialog";
import ActivateAccountCard from "@/components/settings/activate-account-card";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Manage your account preferences and security.
      </p>
      <ActivateAccountCard />
      <NotificationSettingsCard />
      <ChangePasswordCard />
      <DeleteAccountDialog />
    </div>
  );
}
