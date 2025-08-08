// Clerk server helpers
export { auth, currentUser } from "@clerk/nextjs/server";

// Client signOut shim (so existing imports keep working)
export const signOut = async () => {
  if (typeof window !== "undefined") {
    const mod = await import("@clerk/nextjs");
    if (typeof mod.signOut === "function") {
      await mod.signOut();
      return;
    }
    // Fallback if signOut isn't exported: use the hook dynamically
    const { useClerk } = mod as any;
    try {
      const { signOut: hookSignOut } = useClerk?.() || {};
      if (hookSignOut) await hookSignOut();
    } catch {}
  }
};
