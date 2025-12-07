import { generateKeyPair, registerAccountFingerprint, submitSignedTransaction } from "../src/api.js";
import { signPayload } from "../src/crypto.js";

async function main() {
  const hmacKey = process.env.LEDGER_HMAC_KEY || "dev-secret-key";
  const storagePath = process.env.LEDGER_PATH || ".ethub-ledger.json";

  const alice = generateKeyPair();
  const bob = generateKeyPair();

  await registerAccountFingerprint(
    { path: storagePath },
    {
      publicKey: alice.publicKey,
      rawFingerprint: "device-fingerprint-alice",
      hmacKey
    }
  );

  await registerAccountFingerprint(
    { path: storagePath },
    {
      publicKey: bob.publicKey,
      rawFingerprint: "device-fingerprint-bob",
      hmacKey
    }
  );

  const payload = {
    fromPublicKey: alice.publicKey,
    toPublicKey: bob.publicKey,
    amount: "10",
    fingerprintHash: "will-be-validated-on-server"
  };

  const signature = signPayload(payload, alice.privateKey);

  const result = await submitSignedTransaction(
    { path: storagePath },
    {
      fromPublicKey: alice.publicKey,
      toPublicKey: bob.publicKey,
      amount: "10",
      rawFingerprint: "device-fingerprint-alice",
      fingerprintHmacKey: hmacKey,
      signature
    }
  );

  console.log("new block index:", result.block.index);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
