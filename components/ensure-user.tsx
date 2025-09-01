"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function EnsureUser() {
  const { user, isSignedIn } = useUser();
  const ensureByToken = useMutation(api.users.ensureByToken);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const tokenIdentifier = user.id; // adjust if your server expects a different token id
    const payload = {
      userId: user.id,
      tokenIdentifier,
      role: "user" as const,
      name: user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" "),
      email: user.primaryEmailAddress?.emailAddress,
      imageUrl: user.imageUrl,
      username: user.username ?? undefined,
      phoneNumber: user.primaryPhoneNumber?.phoneNumber ?? undefined,
    };

    // fire-and-forget; Convex mutation returns promise
    void ensureByToken(payload);
  }, [isSignedIn, user, ensureByToken]);

  return null;
}
