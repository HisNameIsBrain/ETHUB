export { auth, currentUser } from "@clerk/nextjs/server";

export async function signOut() {
  if (typeof window !== "undefined") {
    const { signOut } = await import("@clerk/nextjs");
    if (typeof signOut === "function") {
      await signOut();
    }
  }
}
