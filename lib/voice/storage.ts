import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getVoiceStorageDir } from "./config";
import { decryptForUser, encryptForUser, EncryptedPayload } from "./crypto";
import { VoiceError } from "./errors";

const MAX_RECORDING_BYTES = 25 * 1024 * 1024; // 25MB
const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/;
const ALLOWED_MIME = new Set(["audio/webm", "audio/ogg", "audio/wav", "audio/x-wav"]);

type RecordingMeta = {
  id: string;
  userId: string;
  createdAt: string;
  originalName: string;
  mimeType: string;
  size: number;
};

type VoiceModelMeta = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  sourceRecordingId?: string;
  status: "ready";
};

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function validateSegment(segment: string, field: string) {
  if (!SAFE_SEGMENT.test(segment)) {
    throw new VoiceError(`${field} contains unsupported characters`, 400, "voice_path_invalid");
  }
}

function baseUserDir(userId: string) {
  validateSegment(userId, "userId");
  return path.join(getVoiceStorageDir(), "users", userId);
}

function recordingsDir(userId: string) {
  return path.join(baseUserDir(userId), "recordings");
}

function modelsDir(userId: string) {
  return path.join(baseUserDir(userId), "models");
}

async function writeEncryptedJson(userId: string, filepath: string, data: unknown) {
  const payload = encryptForUser(userId, Buffer.from(JSON.stringify(data)));
  await ensureDir(path.dirname(filepath));
  await fs.writeFile(filepath, JSON.stringify(payload, null, 2), "utf8");
}

async function readEncryptedJson<T>(userId: string, filepath: string): Promise<T> {
  const raw = await fs.readFile(filepath, "utf8");
  const payload = JSON.parse(raw) as EncryptedPayload;
  const decrypted = decryptForUser(userId, payload);
  return JSON.parse(decrypted.toString("utf8")) as T;
}

export async function saveRecording(userId: string, file: File): Promise<RecordingMeta> {
  validateSegment(userId, "userId");

  if (!file) {
    throw new VoiceError("No recording provided", 400, "voice_file_missing");
  }

  if (file.size === 0 || file.size > MAX_RECORDING_BYTES) {
    throw new VoiceError("Recording size is invalid", 400, "voice_file_size");
  }

  const mimeType = file.type || "";
  if (mimeType && !ALLOWED_MIME.has(mimeType)) {
    throw new VoiceError("Unsupported audio type", 415, "voice_file_type");
  }

  const recordingId = randomUUID();
  validateSegment(recordingId, "recordingId");

  const buffer = Buffer.from(await file.arrayBuffer());
  const encrypted = encryptForUser(userId, buffer);

  const meta: RecordingMeta = {
    id: recordingId,
    userId,
    createdAt: new Date().toISOString(),
    originalName: file.name || "recording",
    mimeType: mimeType || "audio/webm",
    size: buffer.byteLength,
  };

  const dir = path.join(recordingsDir(userId), recordingId);
  await ensureDir(dir);
  await fs.writeFile(path.join(dir, "raw.enc"), JSON.stringify(encrypted, null, 2), "utf8");
  await writeEncryptedJson(userId, path.join(dir, "meta.json"), meta);

  return meta;
}

export async function listRecordings(userId: string): Promise<RecordingMeta[]> {
  validateSegment(userId, "userId");

  const dir = recordingsDir(userId);
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const metas: RecordingMeta[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const recordingId = entry.name;
      try {
        validateSegment(recordingId, "recordingId");
        const metaPath = path.join(dir, recordingId, "meta.json");
        const meta = await readEncryptedJson<RecordingMeta>(userId, metaPath);
        metas.push(meta);
      } catch (error) {
        // Skip invalid entries but do not expose details
        continue;
      }
    }

    return metas;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function deleteRecording(userId: string, recordingId: string) {
  validateSegment(userId, "userId");
  validateSegment(recordingId, "recordingId");

  const dir = path.join(recordingsDir(userId), recordingId);
  await fs.rm(dir, { recursive: true, force: true });
}

async function loadModelRegistry(userId: string): Promise<VoiceModelMeta[]> {
  const registryPath = path.join(modelsDir(userId), "models.json");
  try {
    return await readEncryptedJson<VoiceModelMeta[]>(userId, registryPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveModelRegistry(userId: string, models: VoiceModelMeta[]) {
  const registryPath = path.join(modelsDir(userId), "models.json");
  await writeEncryptedJson(userId, registryPath, models);
}

export async function registerModel(
  userId: string,
  name: string,
  sourceRecordingId?: string
): Promise<VoiceModelMeta> {
  validateSegment(userId, "userId");
  if (!name) {
    throw new VoiceError("Model name is required", 400, "voice_model_name");
  }

  if (sourceRecordingId) validateSegment(sourceRecordingId, "sourceRecordingId");

  const models = await loadModelRegistry(userId);
  const model: VoiceModelMeta = {
    id: randomUUID(),
    userId,
    name,
    createdAt: new Date().toISOString(),
    sourceRecordingId,
    status: "ready",
  };

  models.push(model);
  await saveModelRegistry(userId, models);

  const modelDir = path.join(modelsDir(userId), model.id);
  await writeEncryptedJson(userId, path.join(modelDir, "meta.json"), model);

  return model;
}

export async function listModels(userId: string): Promise<VoiceModelMeta[]> {
  return loadModelRegistry(userId);
}

export async function getModel(userId: string, modelId: string): Promise<VoiceModelMeta | null> {
  validateSegment(userId, "userId");
  validateSegment(modelId, "modelId");

  const models = await loadModelRegistry(userId);
  return models.find((model) => model.id === modelId) ?? null;
}
