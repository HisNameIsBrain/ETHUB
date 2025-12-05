import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateKeyPair, registerAccountFingerprint, submitSignedTransaction, verifyChain } from "../src/api.js";
import { signPayload } from "../src/crypto.js";
(async () => {
    const dir = mkdtempSync(join(tmpdir(), "ethub-ledger-"));
    const storagePath = join(dir, "ledger.json");
    const hmacKey = "test-key";
    const alice = generateKeyPair();
    const bob = generateKeyPair();
    let state = await registerAccountFingerprint({ path: storagePath }, {
        publicKey: alice.publicKey,
        rawFingerprint: "alice-fp",
        hmacKey
    });
    state = await registerAccountFingerprint({ path: storagePath }, {
        publicKey: bob.publicKey,
        rawFingerprint: "bob-fp",
        hmacKey
    });
    const payload = {
        fromPublicKey: alice.publicKey,
        toPublicKey: bob.publicKey,
        amount: "5",
        fingerprintHash: "ignored-here"
    };
    const signature = signPayload(payload, alice.privateKey);
    const result = await submitSignedTransaction({ path: storagePath }, {
        fromPublicKey: alice.publicKey,
        toPublicKey: bob.publicKey,
        amount: "5",
        rawFingerprint: "alice-fp",
        fingerprintHmacKey: hmacKey,
        signature
    });
    const verification = verifyChain(result.state);
    assert.equal(verification.ok, true);
    rmSync(dir, { recursive: true, force: true });
})();
