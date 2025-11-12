import * as ed from '@noble/ed25519';
import * as secp from '@noble/secp256k1';
import { createHash, randomBytes } from 'crypto';
import type { Curve } from './models.js';

export const sha256 = (b: Uint8Array|Buffer|string) =>
  createHash('sha256').update(typeof b === 'string' ? Buffer.from(b) : Buffer.from(b)).digest('hex');

export async function genKeypair(curve: Curve) {
  if (curve === 'ed25519') {
    const sk = randomBytes(32);
    const pk = await ed.getPublicKey(sk);
    return { privateKey: Buffer.from(sk).toString('hex'), publicKey: Buffer.from(pk).toString('hex') };
  } else {
    const sk = secp.utils.randomPrivateKey();
    const pk = secp.getPublicKey(sk, true);
    return { privateKey: Buffer.from(sk).toString('hex'), publicKey: Buffer.from(pk).toString('hex') };
  }
}

export async function sign(curve: Curve, msgHex: string, skHex: string) {
  const msg = Buffer.from(msgHex, 'hex');
  if (curve === 'ed25519') return Buffer.from(await ed.sign(msg, Buffer.from(skHex,'hex'))).toString('hex');
  const sig = await secp.sign(msg, Buffer.from(skHex,'hex'), { der: false });
  return Buffer.from(sig).toString('hex');
}

export async function verify(curve: Curve, msgHex: string, sigHex: string, pkHex: string) {
  const msg = Buffer.from(msgHex,'hex');
  if (curve === 'ed25519') return await ed.verify(Buffer.from(sigHex,'hex'), msg, Buffer.from(pkHex,'hex'));
  return await secp.verify(Buffer.from(sigHex,'hex'), msg, Buffer.from(pkHex,'hex'));
}

export function merkleRoot(items: string[]) {
  if (items.length === 0) return sha256('');
  let level = items.map(sha256);
  while (level.length > 1) {
    const next: string[] = [];
    for (let i=0;i<level.length;i+=2) {
      const a = level[i], b = level[i+1] ?? level[i];
      next.push(sha256(Buffer.concat([Buffer.from(a,'hex'), Buffer.from(b,'hex')])));
    }
    level = next;
  }
  return level[0];
}
