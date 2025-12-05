import { LedgerState, Account, Block } from "./models.js";
export declare function createGenesisBlock(): Block;
export declare function createEmptyState(): LedgerState;
export declare function getLatestBlock(state: LedgerState): Block;
export declare function addAccount(state: LedgerState, account: Account): LedgerState;
export declare function findAccountByPublicKey(state: LedgerState, publicKey: string): Account | undefined;
export declare function appendBlock(state: LedgerState, block: Block): LedgerState;
