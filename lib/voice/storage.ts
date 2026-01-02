import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { ALLOWED_AUDIO_MIME, HKDF_INFO, MAX_UPLOAD_BYTES, getStorageRoot } from "./config";
import { encryptForUser, sha256 } from "./crypto";

export type RecordingMeta = {
  id: string;
  userId: string;
  createdAt: number;
  originalMime: string;
  durationMs?: number | null;
  size: number;
  sha256: string;
  encryption: {
    alg: string;
    iv: string;
    authTag: string;
    hkdfInfo: string;
  };
};

export type VoiceModel = {
  modelId: string;
  recordingId: string;
  status: "training" | "ready" | "error";
  createdAt: number;
  updatedAt: number;
  notes?: string;
};

export function sanitizeSegment(segment: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(segment)) {
    throw new Error("Invalid path segment");
  }
  return segment;
}

function ensureInside(base: string, target: string) {
  const resolvedBase = path.resolve(base) + path.sep;
  const resolvedTarget = path.resolve(target);
  if (!resolvedTarget.startsWith(resolvedBase)) {
    throw new Error("Unsafe path detected");
  }
  return resolvedTarget;
}

export function sniffMime(buffer: Buffer): string | null {
  if (buffer.length >= 4) {
    const header = buffer.slice(0, 4);
    if (header.toString("ascii") === "RIFF") return "audio/wav";
    if (header.toString("ascii") === "OggS") return "audio/ogg";
    if (header.equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return "audio/webm";
  }
  return null;
}

export async function ensureUserDirectories(userId: string) {
  const root = getStorageRoot();
  const userRoot = ensureInside(root, path.join(root, "users", sanitizeSegment(userId)));
  await fs.mkdir(path.join(userRoot, "recordings"), { recursive: true });
  await fs.mkdir(path.join(userRoot, "models"), { recursive: true });
  await fs.mkdir(path.join(userRoot, "outputs"), { recursive: true });
  return { root, userRoot };
}

export async function saveEncryptedRecording(options: {
  userId: string;
  fileBuffer: Buffer;
  mimeType: string;
  durationMs?: number | null;
}) {
  const { userId, fileBuffer, mimeType, durationMs = null } = options;
  if (!ALLOWED_AUDIO_MIME.includes(mimeType as any)) throw new Error("Unsupported mime type");
  if (fileBuffer.byteLength > MAX_UPLOAD_BYTES) throw new Error("File too large");

  const { userRoot } = await ensureUserDirectories(userId);
  const recordingId = crypto.randomUUID();
  const recDir = ensureInside(userRoot, path.join(userRoot, "recordings", recordingId));
  await fs.mkdir(recDir, { recursive: true });

  const hash = sha256(fileBuffer);
  const payload = encryptForUser(userId, fileBuffer);
  const meta: RecordingMeta = {
    id: recordingId,
    userId,
    createdAt: Date.now(),
    originalMime: mimeType,
    durationMs,
    size: fileBuffer.byteLength,
    sha256: hash,
    encryption: {
      alg: "AES-256-GCM",
      iv: payload.iv,
      authTag: payload.authTag,
      hkdfInfo: HKDF_INFO
    }
  };

  const encryptedPath = ensureInside(recDir, path.join(recDir, "raw.enc"));
  const metaPath = ensureInside(recDir, path.join(recDir, "meta.json"));

  await fs.writeFile(encryptedPath, JSON.stringify(payload));
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
  return meta;
}

export async function listRecordings(userId: string) {
  const { userRoot } = await ensureUserDirectories(userId);
  const recDir = ensureInside(userRoot, path.join(userRoot, "recordings"));
  const entries = await fs.readdir(recDir).catch(() => []);
  const metas: RecordingMeta[] = [];
  for (const entry of entries) {
    try {
      const safe = sanitizeSegment(entry);
      const metaPath = ensureInside(recDir, path.join(recDir, safe, "meta.json"));
      const metaRaw = await fs.readFile(metaPath, "utf8");
      const meta = JSON.parse(metaRaw) as RecordingMeta;
      metas.push(meta);
    } catch (err) {
      continue;
    }
  }
  return metas.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteRecording(userId: string, recordingId: string) {
  const { userRoot } = await ensureUserDirectories(userId);
  const recDir = ensureInside(userRoot, path.join(userRoot, "recordings"));
  const safe = sanitizeSegment(recordingId);
  const target = ensureInside(recDir, path.join(recDir, safe));
  await fs.rm(target, { recursive: true, force: true });
}

export async function getRecordingMeta(userId: string, recordingId: string) {
  const { userRoot } = await ensureUserDirectories(userId);
  const recDir = ensureInside(userRoot, path.join(userRoot, "recordings"));
  const safe = sanitizeSegment(recordingId);
  const metaPath = ensureInside(recDir, path.join(recDir, safe, "meta.json"));
  const meta = JSON.parse(await fs.readFile(metaPath, "utf8")) as RecordingMeta;
  if (meta.userId !== userId) throw new Error("Forbidden");
  return meta;
}

async function readModelsRegistry(userRoot: string) {
  const registryPath = ensureInside(userRoot, path.join(userRoot, "models", "models.json"));
  try {
    const raw = await fs.readFile(registryPath, "utf8");
    return JSON.parse(raw) as VoiceModel[];
  } catch {
    return [];
  }
}

async function writeModelsRegistry(userRoot: string, models: VoiceModel[]) {
  const registryPath = ensureInside(userRoot, path.join(userRoot, "models", "models.json"));
  await fs.writeFile(registryPath, JSON.stringify(models, null, 2));
}

export async function registerModel(userId: string, recordingId: string, notes?: string) {
  const { userRoot } = await ensureUserDirectories(userId);
  const models = await readModelsRegistry(userRoot);
  const modelId = crypto.randomUUID();
  const now = Date.now();
  const entry: VoiceModel = {
    modelId,
    recordingId,
    status: "ready",
    createdAt: now,
    updatedAt: now,
    notes
  };
  models.push(entry);
  await writeModelsRegistry(userRoot, models);
  const modelDir = ensureInside(userRoot, path.join(userRoot, "models", modelId));
  await fs.mkdir(modelDir, { recursive: true });
  await fs.writeFile(ensureInside(modelDir, path.join(modelDir, "meta.json")), JSON.stringify(entry, null, 2));
  return entry;
}

export async function listModels(userId: string) {
  const { userRoot } = await ensureUserDirectories(userId);
  const models = await readModelsRegistry(userRoot);
  return models.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getModel(userId: string, modelId: string) {
  const { userRoot } = await ensureUserDirectories(userId);
  const models = await readModelsRegistry(userRoot);
  const model = models.find(m => m.modelId === modelId);
  if (!model) return null;
  return model;
}
