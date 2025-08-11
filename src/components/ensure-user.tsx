// components/ensure-user.tsx
"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function EnsureUser() {
  const { user, isSignedIn } = useUser();
  const ensureUser = useMutation(api.users.ensureUser);
  
  useEffect(() => {
    if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) return;
    ensureUser({
      email: user.primaryEmailAddress.emailAddress.toLowerCase(),
      name: user.fullName ?? undefined,
      username: user.username ?? undefined,
      phoneNumber: user.phoneNumbers?.[0]?.phoneNumber ?? undefined,
    }).catch(console.error);
  }, [isSignedIn, user, ensureUser]);
  
  return null;
}