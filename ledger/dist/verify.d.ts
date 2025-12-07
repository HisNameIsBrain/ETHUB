import { LedgerState, Block } from "./models.js";
export interface ChainVerificationResult {
    ok: boolean;
    error?: string;
}
export declare function verifyBlockHash(block: Block): boolean;
export declare function verifyChain(state: LedgerState): ChainVerificationResult;
