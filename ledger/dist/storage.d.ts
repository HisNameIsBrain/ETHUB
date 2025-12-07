import { LedgerState } from "./models.js";
export interface StorageOptions {
    path?: string;
}
export declare function loadState(options?: StorageOptions): Promise<LedgerState | null>;
export declare function saveState(state: LedgerState, options?: StorageOptions): Promise<void>;
