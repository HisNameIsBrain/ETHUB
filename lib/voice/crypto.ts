import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "crypto";
import { getMasterKey } from "./config";
import { VoiceError } from "./errors";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const INFO = "ethub-voice-v1";

export type EncryptedPayload = {
  iv: string;
  authTag: string;
  ciphertext: string;
};

function deriveUserKey(userId: string): Buffer {
  const masterKey = getMasterKey();
  return hkdfSync("sha256", masterKey, Buffer.from(userId, "utf8"), INFO, KEY_LENGTH);
}

export function encryptForUser(userId: string, data: Buffer): EncryptedPayload {
  if (!data || data.byteLength === 0) {
    throw new VoiceError("No data provided for encryption", 400, "voice_encrypt_empty");
  }

  const key = deriveUserKey(userId);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
  };
}

export function decryptForUser(userId: string, payload: EncryptedPayload): Buffer {
  const key = deriveUserKey(userId);
  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted;
}
