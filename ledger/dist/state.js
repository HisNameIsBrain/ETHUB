import { hashObject } from "./crypto.js";
export function createGenesisBlock() {
    const tx = {
        id: "genesis",
        from: null,
        to: "genesis",
        amount: "0",
        nonce: 0,
        timestamp: new Date().toISOString(),
        fingerprintHash: "genesis",
        signature: "",
        publicKey: "genesis"
    };
    const block = {
        index: 0,
        previousHash: "0".repeat(64),
        timestamp: new Date().toISOString(),
        transactions: [tx],
        nonce: 0,
        hash: ""
    };
    block.hash = hashObject({
        index: block.index,
        previousHash: block.previousHash,
        timestamp: block.timestamp,
        transactions: block.transactions,
        nonce: block.nonce
    });
    return block;
}
export function createEmptyState() {
    return {
        accounts: [],
        blocks: [createGenesisBlock()]
    };
}
export function getLatestBlock(state) {
    return state.blocks[state.blocks.length - 1];
}
export function addAccount(state, account) {
    return {
        ...state,
        accounts: [...state.accounts, account]
    };
}
export function findAccountByPublicKey(state, publicKey) {
    return state.accounts.find((a) => a.publicKey === publicKey);
}
export function appendBlock(state, block) {
    return {
        ...state,
        blocks: [...state.blocks, block]
    };
}
