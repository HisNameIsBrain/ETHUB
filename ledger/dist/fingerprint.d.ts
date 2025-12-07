import { LedgerState } from "./models.js";
export interface RegisterFingerprintInput {
    publicKey: string;
    rawFingerprint: string;
    hmacKey: string;
}
export declare function registerFingerprint(state: LedgerState, input: RegisterFingerprintInput): LedgerState;
