"use client";

import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card className="p-4">
        <h2 className="font-medium">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your account info.</p>
      </Card>
      <Card className="p-4">
        <h2 className="font-medium">Notifications</h2>
        <p className="text-sm text-muted-foreground">Control email/SMS alerts.</p>
      </Card>
    </div>
  );
}
