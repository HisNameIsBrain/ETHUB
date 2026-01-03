import { auth } from "@clerk/nextjs/server";
import { VoiceError } from "./errors";

export function requireVoiceUser(): string {
  const { userId } = auth();
  if (!userId) {
    throw new VoiceError("Unauthorized", 401, "voice_unauthorized");
  }
  return userId;
}
