import { hmacFingerprint } from "./crypto.js";
import { addAccount, findAccountByPublicKey } from "./state.js";
export function registerFingerprint(state, input) {
    const existing = findAccountByPublicKey(state, input.publicKey);
    if (existing) {
        return state;
    }
    const fingerprintHash = hmacFingerprint(input.rawFingerprint, input.hmacKey);
    const account = {
        id: `acct_${state.accounts.length + 1}`,
        publicKey: input.publicKey,
        fingerprintHash,
        createdAt: new Date().toISOString()
    };
    return addAccount(state, account);
}
