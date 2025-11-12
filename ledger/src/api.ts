import express from 'express';
import { z } from 'zod';
import { config } from 'dotenv';
import { LedgerStore, blockHash } from './storage.js';
import { merkleRoot, sha256, verify } from './crypto.js';
import { anchorToFile, anchorToGit } from './anchor.js';
import { hmacFingerprint } from './fingerprint.js';
import type { AccountBinding, Block, RegisterRequest, SubmitTxRequest } from './models.js';

config();

const app = express();
app.use(express.json());

const STORAGE = process.env.LEDGER_STORAGE ?? './data/ledger.jsonl';
const ANCHOR_DIR = process.env.ANCHOR_DIR ?? './.anchors';
const HMAC_KEY = process.env.HMAC_KEY ?? 'key';
const HMAC_SALT = process.env.HMAC_SALT ?? 'salt';

const store = new LedgerStore(STORAGE);
const bindings = new Map<string,AccountBinding>();

app.post('/keys/register', async (req, res) => {
  const schema = z.object({ publicKey: z.string(), fingerprint: z.string(), curve: z.enum(['ed25519','secp256k1']) });
  const body = schema.parse(req.body) as RegisterRequest;
  const fpHmac = hmacFingerprint(body.fingerprint, HMAC_KEY, HMAC_SALT);
  const record: AccountBinding = { publicKey: body.publicKey, fpHmac, curve: body.curve, createdAt: Date.now() };
  bindings.set(body.publicKey, record);
  res.json({ ok: true, fpHmac });
});

app.post('/tx/submit', async (req, res) => {
  const body = (z.object({ tx: z.any(), sig: z.string() }).parse(req.body)) as SubmitTxRequest;
  const bound = bindings.get(body.tx.from);
  if (!bound) return res.status(400).json({ error: 'unbound' });
  const fpOk = bound.fpHmac === hmacFingerprint(body.tx.fingerprintProof, HMAC_KEY, HMAC_SALT);
  if (!fpOk) return res.status(400).json({ error: 'fp' });
  const msg = sha256(JSON.stringify(body.tx));
  const ok = await verify(body.tx.curve, msg, body.sig, body.tx.from);
  if (!ok) return res.status(400).json({ error: 'sig' });

  const all = await store.readAll();
  const txs = [ { ...body.tx, sig: body.sig } ];
  const merkle = merkleRoot(txs.map(t => sha256(JSON.stringify({ ...t, sig: undefined }))));
  const blockBase = {
    index: all.length,
    timestamp: Date.now(),
    prevHash: all.length ? all[all.length-1].hash : '',
    txs,
    merkleRoot: merkle,
    stateRoot: 'todo'
  };
  const hash = blockHash(blockBase as any);
  const block: Block = { ...blockBase, hash };
  await store.append(block);
  await anchorToFile(ANCHOR_DIR, hash);
  await anchorToGit(hash);
  res.json({ ok: true, block });
});

app.get('/chain/verify', async (_req, res) => {
  const bmap = new Map<string,string>();
  for (const b of bindings.values()) bmap.set(b.publicKey, b.fpHmac);
  const blocks = await store.readAll();
  let prev = '';
  for (let i=0;i<blocks.length;i++) {
    const b = blocks[i];
    if (b.index !== i || b.prevHash !== prev) return res.json({ ok: false, at: i });
    const txHashes = b.txs.map(t => sha256(JSON.stringify({ ...t, sig: undefined })));
    if (merkleRoot(txHashes) !== b.merkleRoot) return res.json({ ok: false, at: i });
    for (const t of b.txs) {
      const fpH = bmap.get(t.from);
      if (!fpH) return res.json({ ok: false, at: i });
      if (fpH !== hmacFingerprint(t.fingerprintProof, HMAC_KEY, HMAC_SALT)) return res.json({ ok: false, at: i });
      const msg = sha256(JSON.stringify({ ...t, sig: undefined }));
      const ok = await verify(t.curve, msg, t.sig, t.from);
      if (!ok) return res.json({ ok: false, at: i });
    }
    const { hash, ...rest } = b as any;
    if (blockHash(rest) !== b.hash) return res.json({ ok: false, at: i });
    prev = b.hash;
  }
  res.json({ ok: true, height: blocks.length, tip: blocks.at(-1)?.hash ?? '' });
});

app.get('/meta', async (_req, res) => res.json(await store.meta()));

export function createServer() { return app; }
export default app;
