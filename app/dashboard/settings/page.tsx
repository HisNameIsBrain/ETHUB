"use client";

import { useState } from "react"; import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, } from "@clerk/nextjs";
export default function SettingsPage() { return ( 

<div className="min-h-screen bg-background"> <SignedIn> <AuthedSettings /> </SignedIn>



function AuthedSettings() { const { user } = useUser();

const [firstName, setFirstName] = useState(user?.firstName ?? ""); const [lastName, setLastName] = useState(user?.lastName ?? ""); const [username, setUsername] = useState(user?.username ?? "");

// Example local preferences you store in your own DB. Wire these to your API. const [newsletter, setNewsletter] = useState<boolean>(true); const [productUpdates, setProductUpdates] = useState<boolean>(true);

const [isSavingProfile, setIsSavingProfile] = useState(false); const [isSavingPrefs, setIsSavingPrefs] = useState(false);

async function saveProfile() { if (!user) return; setIsSavingProfile(true); try { // Clerk: update basic attributes. Add others as needed. await user.update({ firstName, lastName, username }); } finally { setIsSavingProfile(false); } }

async function savePreferences() { setIsSavingPrefs(true); try { // TODO: replace with your API call to persist preferences. // await fetch("/api/user/preferences", { method: "POST", body: JSON.stringify({ newsletter, productUpdates }) }) await new Promise((r) => setTimeout(r, 600)); } finally { setIsSavingPrefs(false); } }

return ( <SettingsLayout title="Settings" subtitle="Manage your account, security, and preferences" rightSlot={<UserButton appearance={{ elements: { userButtonBox: "scale-90" } }} />} > {/* Profile */} <SettingsSection title="Profile" description="Public-facing details for your account."> <SettingsCard> <div className="grid gap-4 sm:grid-cols-2"> <SettingsInput label="First name" value={firstName} onChange={(e: any) => setFirstName(e.target.value)} placeholder="Ada" /> <SettingsInput label="Last name" value={lastName} onChange={(e: any) => setLastName(e.target.value)} placeholder="Lovelace" /> <SettingsInput className="sm:col-span-2" label="Username" value={username} onChange={(e: any) => setUsername(e.target.value)} placeholder="ada.codes" /> <SettingsInput className="sm:col-span-2" label="Email" value={user?.primaryEmailAddress?.emailAddress ?? ""} readOnly hint="Managed by Clerk" /> </div>

<SettingsSaveBar
        isSaving={isSavingProfile}
        onSave={saveProfile}
        saveLabel="Save profile"
      />
    </SettingsCard>
  </SettingsSection>

  {/* Security */}
  <SettingsSection title="Security" description="Change password, enable 2FA, and manage sessions.">
    <SettingsCard>
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Security settings like password and multi‑factor auth are managed by Clerk.
        </p>
        <p>
          Use the account portal to update them.
        </p>
      </div>
      <div className="mt-4">
        <Link href="/user">{/* Clerk <UserProfile/> route (default) */}
          <Button>Open account portal</Button>
        </Link>
      </div>
    </SettingsCard>
  </SettingsSection>

  {/* Notifications / Preferences */}
  <SettingsSection
    title="Preferences"
    description="Control how we contact you about the app."
  >
    <SettingsCard>
      <div className="space-y-4">
        <SettingsToggle
          label="Newsletter"
          description="Occasional tips and deep dives."
          checked={newsletter}
          onCheckedChange={setNewsletter}
        />
        <SettingsToggle
          label="Product updates"
          description="Major releases and important changes."
          checked={productUpdates}
          onCheckedChange={setProductUpdates}
        />
      </div>

      <SettingsSaveBar
        isSaving={isSavingPrefs}
        onSave={savePreferences}
        saveLabel="Save preferences"
      />
    </SettingsCard>
  </SettingsSection>

  {/* Danger zone */}
  <SettingsSection title="Danger zone" description="Irreversible actions for this account.">
    <SettingsDanger
      title="Delete account"
      description="Permanently remove your account and data."
      actionLabel="Delete account"
      onAction={async () => {
        // You can also do `await user?.delete()` to remove Clerk user entirely.
        // Typically you'd additionally handle app-side data cleanup in your API.
        if (!confirm("This will permanently delete your account. Continue?")) return;
        await user?.delete();
        window.location.href = "/";
      }}
    />
  </SettingsSection>
</SettingsLayout>

); }

