# ETHUB Ledger (Append-only, tamper-evident)

## Data Model
**AccountBinding**: { publicKey, fpHmac, curve, createdAt }  
**Tx**: { id, from, to, amount, nonce, fingerprintProof, curve, sig }  
**Block**: { index, timestamp, prevHash, txs[], merkleRoot, stateRoot, hash }  
**ChainMeta**: { tip, height }

## APIs
POST `/keys/register` { publicKey, fingerprint, curve } → { fpHmac }  
POST `/tx/submit` { tx, sig } → { block }  
GET `/chain/verify` → { ok, height, tip }  
GET `/meta` → { height, tip }

## Storage format
`LEDGER_STORAGE` JSONL; one Block per line.  
Anchors: files in `.anchors/<ISO>.anchor` and optional Git annotated tag `ledger-<epoch>` containing last block hash.

## Anchoring strategy
1) Write tip hash to timestamped file.  
2) If repo is a Git repo, create annotated tag with hash in message.

## Constraints
No external IdP. Fingerprint stored as HMAC(key=srv HMAC_KEY, salt=HMAC_SALT). Private keys remain client-side. Server keeps {publicKey, fpHmac, curve}. Curves: Ed25519 or secp256k1.

## Threat Model & Mitigations
- Replay: tx `nonce` per account; reject non-increasing nonces; include fingerprintProof in signed payload; merkle + prevHash.
- Key compromise: rotate by binding new publicKey->fpHmac, freeze old; encourage client-side secure storage; optional multi-sig extension.
- Fingerprint spoofing: server stores salted HMAC only; must present matching raw fingerprint to compute request-time HMAC; bind fpProof into signed msg; rate-limit per binding.
- Fork attacks: append-only file + periodic external anchors; verification compares prevHash chain and merkle roots; audit by re-hashing file; distribute anchors to external store if desired.
- Integrity: `GET /chain/verify` recomputes merkle + block hashes and signature checks.

## Usage
1) `cp .env.example .env` and set secrets.  
2) `pnpm i` (or `npm i`), `pnpm dev` (or `npm run dev`).  
3) Run tests: `pnpm test`.  
4) Example client: `tsx client/example_client.ts`.

## Notes
- `stateRoot` placeholder; wire to real balance state if you want accounting.  
- To force secp256k1, set `curve` accordingly in clients.  
- Anchor files/tags are append-only evidence; publish hashes externally for stronger guarantees.
