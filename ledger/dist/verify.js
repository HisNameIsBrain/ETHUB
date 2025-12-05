import { hashObject } from "./crypto.js";
export function verifyBlockHash(block) {
    const expected = hashObject({
        index: block.index,
        previousHash: block.previousHash,
        timestamp: block.timestamp,
        transactions: block.transactions,
        nonce: block.nonce
    });
    return expected === block.hash;
}
export function verifyChain(state) {
    const { blocks } = state;
    if (blocks.length === 0) {
        return { ok: false, error: "no blocks" };
    }
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (!verifyBlockHash(block)) {
            return { ok: false, error: `invalid hash at index ${i}` };
        }
        if (i === 0) {
            continue;
        }
        const prev = blocks[i - 1];
        if (block.previousHash !== prev.hash) {
            return { ok: false, error: `broken link at index ${i}` };
        }
    }
    return { ok: true };
}
