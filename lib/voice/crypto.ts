import crypto from "crypto";
import { HKDF_INFO } from "./config";

export type EncryptedPayload = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

function getMasterKey(): Buffer {
  const key = process.env.VOICE_MASTER_KEY;
  if (!key) throw new Error("VOICE_MASTER_KEY is not configured");
  const buf = Buffer.from(key, "base64");
  if (buf.length !== 32) throw new Error("VOICE_MASTER_KEY must be 32 bytes base64");
  return buf;
}

export function deriveUserKey(userId: string) {
  const master = getMasterKey();
  const derived = crypto.hkdfSync("sha256", master, Buffer.from(userId), Buffer.from(HKDF_INFO), 32);
  return Buffer.from(derived);
}

export function encryptForUser(userId: string, data: Buffer): EncryptedPayload {
  const key = deriveUserKey(userId);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64")
  };
}

export function decryptForUser(userId: string, payload: EncryptedPayload) {
  const key = deriveUserKey(userId);
  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, "base64")), decipher.final()]);
  return plaintext;
}

export function sha256(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
