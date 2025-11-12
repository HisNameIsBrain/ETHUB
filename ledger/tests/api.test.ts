import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/api.js';
import { genKeypair, sha256, sign } from '../src/crypto.js';

const app = createServer();

describe('ledger', () => {
  let pk: string, sk: string;
  beforeAll(async () => {
    const kp = await genKeypair('ed25519');
    pk = kp.publicKey; sk = kp.privateKey;
  });

  it('register, submit, verify', async () => {
    const fingerprint = 'browser:abc|device:xyz';
    await request(app).post('/keys/register').send({ publicKey: pk, fingerprint, curve: 'ed25519' }).expect(200);

    const tx = { id: 't1', from: pk, to: 'receiver', amount: '0', nonce: 1, fingerprintProof: fingerprint, curve: 'ed25519' };
    const sig = await sign('ed25519', sha256(JSON.stringify(tx)), sk);
    await request(app).post('/tx/submit').send({ tx, sig }).expect(200);

    const v = await request(app).get('/chain/verify').expect(200);
    expect(v.body.ok).toBe(true);
  });
});
