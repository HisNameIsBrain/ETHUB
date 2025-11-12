import { LedgerStore, blockHash } from './storage.js';
import { merkleRoot, sha256, verify } from './crypto.js';
import type { Block, Tx } from './models.js';
import { hmacFingerprint } from './fingerprint.js';

export async function verifyChain(store: LedgerStore, bindings: Map<string,string>, hmacKey: string, hmacSalt: string) {
  const blocks = await store.readAll();
  let prev = '';
  for (let i=0;i<blocks.length;i++) {
    const b = blocks[i];
    if (b.index !== i) return false;
    if (b.prevHash !== prev) return false;
    const txHashes = b.txs.map(t => sha256(JSON.stringify({ ...t, sig: undefined })));
    if (merkleRoot(txHashes) !== b.merkleRoot) return false;
    for (const t of b.txs) {
      const pk = t.from;
      const bound = bindings.get(pk);
      if (!bound) return false;
      const fpOk = bound === hmacFingerprint(t.fingerprintProof, hmacKey, hmacSalt);
      if (!fpOk) return false;
      const msg = sha256(JSON.stringify({ ...t, sig: undefined }));
      const ok = await verify(t.curve, msg, t.sig, pk);
      if (!ok) return false;
    }
    const { hash, ...rest } = b as any;
    if (blockHash(rest) !== b.hash) return false;
    prev = b.hash;
  }
  return true;
}
