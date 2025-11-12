import { Tx } from './models.js';

export type BalanceState = Map<string,bigint>;

export function applyTxs(state: BalanceState, txs: Tx[]) {
  for (const t of txs) {
    const from = state.get(t.from) ?? 0n;
    const to = state.get(t.to) ?? 0n;
    const amt = BigInt(t.amount);
    if (from < amt) throw new Error('insufficient');
    state.set(t.from, from - amt);
    state.set(t.to, to + amt);
  }
  return state;
}

export function snapshotRoot(state: BalanceState) {
  const entries = [...state.entries()].sort(([a],[b]) => a.localeCompare(b));
  const s = JSON.stringify(entries);
  const { createHash } = await import('crypto');
  return createHash('sha256').update(s).digest('hex');
}
