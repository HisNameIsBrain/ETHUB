import path from "path";
import { NextRequest } from "next/server";
import { VoiceError } from "./errors";

const DEFAULT_ALLOWED_IPS = ["127.0.0.1", "::1"];
const DEFAULT_STORAGE_DIR = ".private/voice";
const MASTER_KEY_BYTES = 32;

export function getVoiceStorageDir(): string {
  const baseDir = process.env.VOICE_STORAGE_DIR?.trim() || DEFAULT_STORAGE_DIR;
  return path.resolve(process.cwd(), baseDir);
}

export function getMasterKey(): Buffer {
  const raw = process.env.VOICE_MASTER_KEY;
  if (!raw) {
    throw new VoiceError("VOICE_MASTER_KEY is required", 500, "voice_master_key_missing");
  }

  let decoded: Buffer;
  try {
    decoded = Buffer.from(raw, "base64");
  } catch (error) {
    throw new VoiceError("VOICE_MASTER_KEY must be valid base64", 500, "voice_master_key_invalid");
  }

  if (decoded.byteLength !== MASTER_KEY_BYTES) {
    throw new VoiceError(
      `VOICE_MASTER_KEY must decode to ${MASTER_KEY_BYTES} bytes`,
      500,
      "voice_master_key_length"
    );
  }

  return decoded;
}

function parseAllowlist(): Set<string> {
  const envIps = process.env.VOICE_ALLOWED_IPS;
  if (!envIps) return new Set(DEFAULT_ALLOWED_IPS);

  const entries = envIps
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  return new Set(entries.length > 0 ? entries : DEFAULT_ALLOWED_IPS);
}

export function assertClientIpAllowed(req: NextRequest) {
  const allowlist = parseAllowlist();
  const clientIp = extractClientIp(req);

  if (!clientIp || !allowlist.has(clientIp)) {
    throw new VoiceError("Forbidden", 403, "voice_ip_forbidden");
  }
}

function extractClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const reqIp = (req as unknown as { ip?: string }).ip;
  if (reqIp) return reqIp;

  return null;
}

function isLocalhostUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1"
    );
  } catch (error) {
    return false;
  }
}

export function assertLocalVoiceService() {
  const configured = process.env.VOICE_SERVICE_URL;
  if (configured && !isLocalhostUrl(configured)) {
    throw new VoiceError(
      "VOICE_SERVICE_URL must point to localhost for stub voice operations",
      400,
      "voice_service_remote_blocked"
    );
  }
}
