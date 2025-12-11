// app/dashboard/settings/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  LifeBuoy,
  ShieldCheck,
  KeyRound,
  Download,
  Trash2,
  MonitorCog,
  User as UserIcon,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background/60">
      <SignedIn>
        <AuthedSettings />
      </SignedIn>

      <SignedOut>
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <UserIcon className="mb-2 h-10 w-10 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to manage your ETHUB account
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Access profile, security, notifications, and workspace defaults once
            you are signed in.
          </p>
          <SignInButton mode="modal">
            <Button size="lg">Sign in</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  );
}

function AuthedSettings() {
  const { user } = useUser();
  const router = useRouter();

  const [firstName, setFirstName] = React.useState(user?.firstName ?? "");
  const [lastName, setLastName] = React.useState(user?.lastName ?? "");
  const [username, setUsername] = React.useState(user?.username ?? "");

  // System / workspace defaults
  const [themePreference, setThemePreference] =
    React.useState<"system" | "light" | "dark">("system");
  const [defaultLanding, setDefaultLanding] =
    React.useState<"dashboard" | "workspace" | "settings">("dashboard");
  const [denseMode, setDenseMode] = React.useState(false);

  // Notification preferences
  const [notificationsEnabled, setNotificationsEnabled] =
    React.useState(true);
  const [emailProductUpdates, setEmailProductUpdates] =
    React.useState(true);
  const [emailNews, setEmailNews] = React.useState(true);
  const [inAppActivity, setInAppActivity] = React.useState(true);

  // Backup codes (placeholder – wire to your API)
  const [backupCodes, setBackupCodes] = React.useState<string[] | null>(
    null,
  );
  const [generatingBackupCodes, setGeneratingBackupCodes] =
    React.useState(false);
  const [backupCodesLocked, setBackupCodesLocked] =
    React.useState(false); // only once from this UI

  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isSavingSystem, setIsSavingSystem] = React.useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = React.useState(false);

  async function saveProfile() {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await user.update({
        firstName,
        lastName,
        username,
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function saveSystemDefaults() {
    setIsSavingSystem(true);
    try {
      // Replace with your API call to persist defaults
      await new Promise((r) => setTimeout(r, 400));
    } finally {
      setIsSavingSystem(false);
    }
  }

  async function savePreferences() {
    setIsSavingPrefs(true);
    try {
      // Replace with your API call to persist notification prefs
      await new Promise((r) => setTimeout(r, 400));
    } finally {
      setIsSavingPrefs(false);
    }
  }

  async function handleGenerateBackupCodes() {
    if (backupCodesLocked) return;
    setGeneratingBackupCodes(true);
    try {
      const codes = Array.from({ length: 10 }).map(
        (_, i) =>
          `ETHUB-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}-${i + 1}`,
      );
      setBackupCodes(codes);
      setBackupCodesLocked(true);
    } finally {
      setGeneratingBackupCodes(false);
    }
  }

  function handleDownloadBackupCodes() {
    if (!backupCodes || backupCodes.length === 0) return;
    const content = [
      "ETHUB Backup Codes",
      "",
      "Store these codes in a safe offline place.",
      "",
      ...backupCodes,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ethub-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    if (!user) return;

    const firstConfirm = window.confirm(
      "This will permanently delete your ETHUB account and associated data. This action cannot be undone. Continue?",
    );
    if (!firstConfirm) return;

    const second = window.prompt(
      'Type "DELETE" (in all caps) to confirm you want to permanently remove your account.',
    );
    if (second !== "DELETE") {
      alert("Confirmation text did not match. Account not deleted.");
      return;
    }

    await user.delete();
    router.push("/");
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const phone = user?.primaryPhoneNumber?.phoneNumber ?? "";

  return (
    <SettingsLayout
      title="Settings"
      subtitle="Manage your ETHUB account, security, workspace defaults, and notifications."
      rightSlot={
        <UserButton
          appearance={{
            elements: {
              userButtonBox:
                "scale-90 rounded-full border border-border/70 shadow-sm shadow-black/10",
            },
          }}
        />
      }
    >
      {/* Profile */}
      <SettingsSection
        title="Profile"
        description="Update how your name and handle appear across ETHUB. Email and phone are visible but not editable here."
      >
        <SettingsCard>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ada"
            />
            <SettingsInput
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Lovelace"
            />
            <SettingsInput
              className="sm:col-span-2"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ada.codes"
              hint="Used for mentions, links, and sharing."
            />
            <SettingsInput
              className="sm:col-span-2"
              label="Email"
              value={email}
              readOnly
              hint="Email is managed by Clerk and cannot be changed here."
            />
            {phone && (
              <SettingsInput
                className="sm:col-span-2"
                label="Phone"
                value={phone}
                readOnly
                hint="Phone is managed by Clerk and cannot be changed here."
              />
            )}
          </div>

          <SettingsSaveBar
            isSaving={isSavingProfile}
            onSave={saveProfile}
            saveLabel="Save profile"
          />
        </SettingsCard>
      </SettingsSection>

      {/* System / workspace defaults */}
      <SettingsSection
        title="Workspace defaults"
        description="Design and behavior defaults for your DevOS environment."
      >
        <SettingsCard>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Theme
              </p>
              <div className="flex gap-2">
                <SettingsChip
                  active={themePreference === "system"}
                  onClick={() => setThemePreference("system")}
                >
                  System
                </SettingsChip>
                <SettingsChip
                  active={themePreference === "light"}
                  onClick={() => setThemePreference("light")}
                >
                  Light
                </SettingsChip>
                <SettingsChip
                  active={themePreference === "dark"}
                  onClick={() => setThemePreference("dark")}
                >
                  Dark
                </SettingsChip>
              </div>
              <p className="text-xs text-muted-foreground">
                ETHUB can follow your OS or stay fixed to a theme.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Default landing page
              </p>
              <div className="flex flex-wrap gap-2">
                <SettingsChip
                  active={defaultLanding === "dashboard"}
                  onClick={() => setDefaultLanding("dashboard")}
                >
                  Dashboard
                </SettingsChip>
                <SettingsChip
                  active={defaultLanding === "workspace"}
                  onClick={() => setDefaultLanding("workspace")}
                >
                  Workspace
                </SettingsChip>
                <SettingsChip
                  active={defaultLanding === "settings"}
                  onClick={() => setDefaultLanding("settings")}
                >
                  Settings
                </SettingsChip>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose where ETHUB opens after sign in.
              </p>
            </div>

            <div className="space-y-3">
              <SettingsToggle
                label="Dense layout"
                description="Compact mode to show more content on screen."
                checked={denseMode}
                onCheckedChange={setDenseMode}
              />
            </div>
          </div>

          <SettingsSaveBar
            isSaving={isSavingSystem}
            onSave={saveSystemDefaults}
            saveLabel="Save workspace defaults"
          />
        </SettingsCard>
      </SettingsSection>

      {/* Security / 2FA / backup codes */}
      <SettingsSection
        title="Security"
        description="Strengthen account protection and prepare for recovery."
      >
        <SettingsCard>
          <div className="space-y-6">
            {/* 2FA */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-medium">
                    Two-factor authentication
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add an extra layer of security with TOTP or SMS. Managed in
                  the Clerk account portal.
                </p>
              </div>
              <Link href="/user#security">
                <Button variant="outline" size="sm">
                  Manage 2FA
                </Button>
              </Link>
            </div>

            {/* Backup codes */}
            <div className="border-t border-border/60 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-medium">Backup codes</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    One-time recovery codes for when you lose access to your
                    device. Generate once and store in a safe place.
                  </p>
                  {backupCodesLocked && (
                    <p className="mt-2 text-xs text-amber-500">
                      For security, codes can only be generated once from this
                      screen. Regenerate from the secure account portal if
                      needed.
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={generatingBackupCodes || backupCodesLocked}
                    onClick={handleGenerateBackupCodes}
                  >
                    {generatingBackupCodes ? "Generating…" : "Generate codes"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!backupCodes || backupCodes.length === 0}
                    onClick={handleDownloadBackupCodes}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download .txt
                  </Button>
                </div>
              </div>

              {backupCodes && backupCodes.length > 0 && (
                <div className="mt-4 rounded-lg border border-dashed border-border/70 bg-muted/40 p-3 text-xs font-mono">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Your backup codes
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {backupCodes.map((code) => (
                      <span
                        key={code}
                        className="rounded bg-background/60 px-2 py-1"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
              Password, sessions, and advanced security events are also managed
              in the Clerk account portal.
            </p>
            <Link href="/user">
              <Button size="sm" variant="outline">
                Open full account portal
              </Button>
            </Link>
          </div>
        </SettingsCard>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection
        title="Notifications"
        description="Control when and how ETHUB is allowed to contact you."
      >
        <SettingsCard>
          <div className="space-y-4">
            <SettingsToggle
              label="Enable notifications"
              description="Master switch for all ETHUB notifications. Disabling this mutes all categories below."
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />

            <div className="grid gap-4 border-t border-border/60 pt-4 md:grid-cols-2">
              <SettingsToggle
                label="Product updates"
                description="New features, improvements, and major changes."
                checked={notificationsEnabled && emailProductUpdates}
                onCheckedChange={(val) => setEmailProductUpdates(val)}
                disabled={!notificationsEnabled}
              />
              <SettingsToggle
                label="ETHUB newsletter"
                description="Occasional deep dives, guides, and best practices."
                checked={notificationsEnabled && emailNews}
                onCheckedChange={(val) => setEmailNews(val)}
                disabled={!notificationsEnabled}
              />
              <SettingsToggle
                label="In-app activity"
                description="Pipeline alerts, task changes, and system events."
                checked={notificationsEnabled && inAppActivity}
                onCheckedChange={(val) => setInAppActivity(val)}
                disabled={!notificationsEnabled}
              />
              <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-xs">
                Security-related emails (logins, password changes) are always
                sent and cannot be disabled.
              </div>
            </div>
          </div>

          <SettingsSaveBar
            isSaving={isSavingPrefs}
            onSave={savePreferences}
            saveLabel="Save notification settings"
          />
        </SettingsCard>
      </SettingsSection>

      {/* Support */}
      <SettingsSection
        title="Support"
        description="Need help with your account or workspace?"
      >
        <SettingsCard>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-sky-500" />
                <p className="text-sm font-medium">Contact support</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Include logs, screenshots, and steps to reproduce so we can
                resolve issues faster.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              <Textarea
                className="min-h-[80px] resize-none"
                placeholder="Briefly describe what you need help with…"
              />
              <div className="flex items-center justify-end gap-2">
                <Link href="/contact">
                  <Button size="sm" variant="outline">
                    Go to contact page
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

      {/* Danger zone */}
      <SettingsSection
        title="Danger zone"
        description="Irreversible actions for your ETHUB account."
      >
        <SettingsDanger
          title="Delete account"
          description="Permanently remove your ETHUB account, all personal settings, and associated data. This cannot be undone."
          actionLabel="Delete account"
          onAction={handleDeleteAccount}
        />
      </SettingsSection>
    </SettingsLayout>
  );
}

/* Layout + primitives */

type SettingsLayoutProps = {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
};

function SettingsLayout({
  title,
  subtitle,
  rightSlot,
  children,
}: SettingsLayoutProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 pt-10">
      <header className="flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {rightSlot}
      </header>
      <main className="space-y-8">{children}</main>
    </div>
  );
}

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

type SettingsCardProps = {
  children: React.ReactNode;
};

function SettingsCard({ children }: SettingsCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/5 sm:p-5">
      {children}
    </div>
  );
}

type SettingsInputProps = {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  hint?: string;
  readOnly?: boolean;
  className?: string;
};

function SettingsInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  readOnly,
  className,
}: SettingsInputProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          readOnly && "bg-muted/60 text-muted-foreground cursor-not-allowed",
        )}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type SettingsToggleProps = {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

function SettingsToggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: SettingsToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
        disabled
          ? "border-border/60 bg-muted/40 opacity-70"
          : checked
          ? "border-emerald-500/70 bg-emerald-500/5"
          : "border-border/70 bg-background/60 hover:bg-muted/40",
      )}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={label}
      />
    </button>
  );
}

type SettingsSaveBarProps = {
  isSaving: boolean;
  onSave: () => void;
  saveLabel: string;
};

function SettingsSaveBar({
  isSaving,
  onSave,
  saveLabel,
}: SettingsSaveBarProps) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
      <p className="text-xs text-muted-foreground">
        Changes are stored for this ETHUB account only.
      </p>
      <Button size="sm" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Saving…" : saveLabel}
      </Button>
    </div>
  );
}

type SettingsDangerProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

function SettingsDanger({
  title,
  description,
  actionLabel,
  onAction,
}: SettingsDangerProps) {
  return (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <p className="text-sm font-semibold text-destructive">{title}</p>
          </div>
          <p className="max-w-xl text-xs text-muted-foreground">
            {description}
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

type SettingsChipProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

function SettingsChip({ active, children, onClick }: SettingsChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/70 bg-background/60 text-muted-foreground hover:bg-muted/40",
      )}
    >
      <MonitorCog className="mr-1.5 h-3 w-3" />
      {children}
    </button>
  );
}
