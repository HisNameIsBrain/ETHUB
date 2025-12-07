# ETHUB Ledger

Tamper-evident append-only ledger used for ETHUB experiments.

## Features

- Append-only chain of blocks
- ECDSA/Ed25519 keypair generation
- Device/browser fingerprint binding using HMAC
- Signed transactions
- On-disk JSON storage
- Optional Git commit anchoring

## Quick start

```bash
cd ledger
npm install
npm run build
node client/example_client.js
```
