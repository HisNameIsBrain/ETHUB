import { genKeypair, sign, sha256 } from '../src/crypto.js';

async function main() {
  const curve = 'ed25519' as const;
  const { publicKey, privateKey } = await genKeypair(curve);
  const fingerprint = 'browser:ABC123|hw:XYZ';
  await fetch('http://localhost:7070/keys/register', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ publicKey, fingerprint, curve }) });

  const tx = { id: crypto.randomUUID(), from: publicKey, to: 'receiver-key', amount: '100', nonce: 1, fingerprintProof: fingerprint, curve };
  const msg = sha256(JSON.stringify(tx));
  const sig = await sign(curve, msg, privateKey);
  const r = await fetch('http://localhost:7070/tx/submit', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ tx, sig }) });
  console.log(await r.json());

  const v = await fetch('http://localhost:7070/chain/verify');
  console.log(await v.json());
}
main();
