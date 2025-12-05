import { LedgerState, Account } from "./models.js";
import { hmacFingerprint } from "./crypto.js";
import { addAccount, findAccountByPublicKey } from "./state.js";

export interface RegisterFingerprintInput {
  publicKey: string;
  rawFingerprint: string;
  hmacKey: string;
}

export function registerFingerprint(state: LedgerState, input: RegisterFingerprintInput): LedgerState {
  const existing = findAccountByPublicKey(state, input.publicKey);
  if (existing) {
    return state;
  }

  const fingerprintHash = hmacFingerprint(input.rawFingerprint, input.hmacKey);
  const account: Account = {
    id: `acct_${state.accounts.length + 1}`,
    publicKey: input.publicKey,
    fingerprintHash,
    createdAt: new Date().toISOString()
  };

  return addAccount(state, account);
}
