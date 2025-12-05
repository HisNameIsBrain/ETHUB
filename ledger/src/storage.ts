import { promises as fs } from "node:fs";
import { LedgerState } from "./models.js";

export interface StorageOptions {
  path?: string;
}

const DEFAULT_PATH = ".ethub-ledger.json";

export async function loadState(options: StorageOptions = {}): Promise<LedgerState | null> {
  const path = options.path ?? DEFAULT_PATH;
  try {
    const raw = await fs.readFile(path, "utf8");
    return JSON.parse(raw) as LedgerState;
  } catch (err: any) {
    if (err && err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

export async function saveState(state: LedgerState, options: StorageOptions = {}): Promise<void> {
  const path = options.path ?? DEFAULT_PATH;
  const json = JSON.stringify(state, null, 2);
  await fs.writeFile(path, json, "utf8");
}
