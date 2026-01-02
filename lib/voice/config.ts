import path from "path";
import { URL } from "url";

const DEFAULT_STORAGE = path.join(process.cwd(), ".private", "voice");

export function getStorageRoot() {
  return process.env.VOICE_STORAGE_DIR || DEFAULT_STORAGE;
}

export const HKDF_INFO = "ethub-voice-v1";

export const ALLOWED_AUDIO_MIME = ["audio/webm", "audio/wav", "audio/ogg"] as const;
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const DEFAULT_ALLOWED_IPS = new Set(["127.0.0.1", "::1"]);

export function getAllowedClientIps() {
  const raw = process.env.VOICE_ALLOWED_IPS;
  if (!raw) return new Set(DEFAULT_ALLOWED_IPS);

  const parts = raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  return new Set(parts.length ? parts : DEFAULT_ALLOWED_IPS);
}

export function getRequestIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real && real.trim()) return real.trim();
  return undefined;
}

export function assertAllowedClientIp(req: Request) {
  const allowed = getAllowedClientIps();
  if (!allowed.size) return;
  const ip = getRequestIp(req);
  if (!ip || !allowed.has(ip)) {
    throw new Error("Forbidden");
  }
}

export function assertLocalVoiceService(serviceUrl = process.env.VOICE_SERVICE_URL) {
  if (!serviceUrl) return;
  const url = new URL(serviceUrl);
  if (!LOCAL_HOSTNAMES.has(url.hostname)) {
    throw new Error("VOICE_SERVICE_URL must point to localhost/127.0.0.1 for safety");
  }
}
