import { createHmac, createHash, generateKeyPairSync, createSign, createVerify } from "node:crypto";

export type KeyPair = {
  publicKey: string;
  privateKey: string;
};

export function generateKeyPair(): KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });
  return { publicKey, privateKey };
}

export function hashObject(value: unknown): string {
  const json = JSON.stringify(value);
  const h = createHash("sha256");
  h.update(json);
  return h.digest("hex");
}

export function hmacFingerprint(rawFingerprint: string, secret: string): string {
  const h = createHmac("sha256", secret);
  h.update(rawFingerprint);
  return h.digest("hex");
}

export function signPayload(payload: unknown, privateKey: string): string {
  const sign = createSign("sha256");
  const data = JSON.stringify(payload);
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, "base64");
}

export function verifySignature(payload: unknown, signature: string, publicKey: string): boolean {
  const verify = createVerify("sha256");
  const data = JSON.stringify(payload);
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, "base64");
}
