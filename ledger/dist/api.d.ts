import { LedgerState, Block } from "./models.js";
import { RegisterFingerprintInput } from "./fingerprint.js";
import { StorageOptions } from "./storage.js";
export { generateKeyPair } from "./crypto.js";
export { verifyChain } from "./verify.js";
export interface SubmitTransactionInput {
    fromPublicKey: string | null;
    toPublicKey: string;
    amount: string;
    rawFingerprint: string;
    fingerprintHmacKey: string;
    signature: string;
}
export declare function loadOrInitState(storageOptions?: StorageOptions): Promise<LedgerState>;
export declare function registerAccountFingerprint(storageOptions: StorageOptions, input: RegisterFingerprintInput): Promise<LedgerState>;
export declare function submitSignedTransaction(storageOptions: StorageOptions, input: SubmitTransactionInput): Promise<{
    state: LedgerState;
    block: Block;
}>;
