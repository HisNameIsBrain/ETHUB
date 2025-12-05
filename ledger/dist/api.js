import { hashObject, verifySignature } from "./crypto.js";
import { createEmptyState, getLatestBlock, appendBlock, findAccountByPublicKey } from "./state.js";
import { registerFingerprint } from "./fingerprint.js";
import { loadState, saveState } from "./storage.js";
import { resolveGitAnchor } from "./anchor.js";
import { verifyChain } from "./verify.js";
export { generateKeyPair } from "./crypto.js";
export { verifyChain } from "./verify.js";
export async function loadOrInitState(storageOptions) {
    const existing = await loadState(storageOptions);
    if (existing) {
        return existing;
    }
    const state = createEmptyState();
    await saveState(state, storageOptions);
    return state;
}
export async function registerAccountFingerprint(storageOptions, input) {
    const state = await loadOrInitState(storageOptions);
    const next = registerFingerprint(state, input);
    await saveState(next, storageOptions);
    return next;
}
export async function submitSignedTransaction(storageOptions, input) {
    const state = await loadOrInitState(storageOptions);
    const fromAccount = input.fromPublicKey ? findAccountByPublicKey(state, input.fromPublicKey) : null;
    const toAccount = findAccountByPublicKey(state, input.toPublicKey);
    if (input.fromPublicKey && !fromAccount) {
        throw new Error("unknown from account");
    }
    if (!toAccount) {
        throw new Error("unknown to account");
    }
    const fingerprintHashAccount = input.fromPublicKey ? fromAccount.fingerprintHash : toAccount.fingerprintHash;
    const payload = {
        fromPublicKey: input.fromPublicKey,
        toPublicKey: input.toPublicKey,
        amount: input.amount,
        fingerprintHash: fingerprintHashAccount
    };
    const ok = verifySignature(payload, input.signature, input.fromPublicKey ?? input.toPublicKey);
    if (!ok) {
        throw new Error("invalid signature");
    }
    const latest = getLatestBlock(state);
    const tx = {
        id: `tx_${latest.index + 1}_${latest.transactions.length + 1}`,
        from: input.fromPublicKey,
        to: input.toPublicKey,
        amount: input.amount,
        nonce: latest.transactions.length + 1,
        timestamp: new Date().toISOString(),
        fingerprintHash: fingerprintHashAccount,
        signature: input.signature,
        publicKey: input.fromPublicKey ?? input.toPublicKey
    };
    const block = {
        index: latest.index + 1,
        previousHash: latest.hash,
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
    const anchor = resolveGitAnchor();
    if (anchor) {
        block.anchor = anchor;
    }
    const nextState = appendBlock(state, block);
    const verification = verifyChain(nextState);
    if (!verification.ok) {
        throw new Error(`chain verification failed: ${verification.error}`);
    }
    await saveState(nextState, storageOptions);
    return { state: nextState, block };
}
