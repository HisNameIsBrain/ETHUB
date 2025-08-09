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
    const email = user.primaryEmailAddress.emailAddress;
    const name = user.fullName ?? undefined;
    // You can store Clerk username or craft one; optional:
    const username = user.username ?? undefined;
    ensureUser({ email, name, username }).catch(console.error);
  }, [isSignedIn, user, ensureUser]);

  return null;
}