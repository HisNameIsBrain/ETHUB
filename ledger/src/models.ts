export type Curve = 'ed25519'|'secp256k1';

export type AccountBinding = {
  publicKey: string;
  fpHmac: string;
  curve: Curve;
  createdAt: number;
};

export type Tx = {
  id: string;
  from: string;
  to: string;
  amount: string;
  nonce: number;
  fingerprintProof: string;
  curve: Curve;
  sig: string;
};

export type Block = {
  index: number;
  timestamp: number;
  prevHash: string;
  txs: Tx[];
  merkleRoot: string;
  stateRoot: string;
  hash: string;
};

export type ChainMeta = {
  tip: string;
  height: number;
};

export type SubmitTxRequest = {
  tx: Omit<Tx,'sig'>;
  sig: string;
};

export type RegisterRequest = {
  publicKey: string;
  fingerprint: string;
  curve: Curve;
};
