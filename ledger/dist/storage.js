import { promises as fs } from "node:fs";
const DEFAULT_PATH = ".ethub-ledger.json";
export async function loadState(options = {}) {
    const path = options.path ?? DEFAULT_PATH;
    try {
        const raw = await fs.readFile(path, "utf8");
        return JSON.parse(raw);
    }
    catch (err) {
        if (err && err.code === "ENOENT") {
            return null;
        }
        throw err;
    }
}
export async function saveState(state, options = {}) {
    const path = options.path ?? DEFAULT_PATH;
    const json = JSON.stringify(state, null, 2);
    await fs.writeFile(path, json, "utf8");
}
