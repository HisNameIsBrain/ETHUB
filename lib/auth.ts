export { auth, currentUser } from "@clerk/server";

export async function signOut() {
  if (typeof window === "undefined") return;
  const anyWin = window as any;
  const clerk = anyWin?.Clerk;

  if (clerk && typeof clerk.signOut === "function") {
    await clerk.signOut();
  } else {
    window.location.href = "/sign-in";
  }
}
