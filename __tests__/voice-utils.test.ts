const assert = require("node:assert");
const test = require("node:test");

process.env.VOICE_MASTER_KEY = Buffer.alloc(32, 7).toString("base64");

const { decryptForUser, encryptForUser, sha256 } = require("../lib/voice/crypto");
const { sanitizeSegment, sniffMime } = require("../lib/voice/storage");
const { assertAllowedClientIp, getAllowedClientIps, getRequestIp } = require("../lib/voice/config");

test("encrypt/decrypt roundtrip", () => {
  const userId = "user_test";
  const data = Buffer.from("sample audio data");
  const enc = encryptForUser(userId, data);
  const dec = decryptForUser(userId, enc);
  assert.strictEqual(dec.toString(), data.toString());
  assert.ok(enc.iv && enc.authTag && enc.ciphertext);
});

test("sha256 hashing is deterministic", () => {
  const buf = Buffer.from("abc");
  const hash1 = sha256(buf);
  const hash2 = sha256(buf);
  assert.strictEqual(hash1, hash2);
});

test("sanitizeSegment prevents traversal", () => {
  assert.throws(() => sanitizeSegment("../etc"));
  assert.strictEqual(sanitizeSegment("user_123"), "user_123");
});

test("sniffMime detects basic types", () => {
  const wav = Buffer.from("RIFF", "ascii");
  const ogg = Buffer.from("OggS", "ascii");
  const webm = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);
  assert.strictEqual(sniffMime(wav), "audio/wav");
  assert.strictEqual(sniffMime(ogg), "audio/ogg");
  assert.strictEqual(sniffMime(webm), "audio/webm");
  assert.strictEqual(sniffMime(Buffer.from("??")), null);
});

test("getAllowedClientIps defaults to localhost loopback", () => {
  delete process.env.VOICE_ALLOWED_IPS;
  const allowed = getAllowedClientIps();
  assert.ok(allowed.has("127.0.0.1"));
  assert.ok(allowed.has("::1"));
});

test("assertAllowedClientIp enforces allowlist", () => {
  process.env.VOICE_ALLOWED_IPS = "10.0.0.1";
  const okReq = new Request("http://localhost/api", { headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1" } });
  const blockedReq = new Request("http://localhost/api", { headers: { "x-forwarded-for": "8.8.8.8" } });
  assert.doesNotThrow(() => assertAllowedClientIp(okReq));
  assert.throws(() => assertAllowedClientIp(blockedReq));
});

test("assertAllowedClientIp falls back to localhost when no ip present", () => {
  delete process.env.VOICE_ALLOWED_IPS;
  const req = new Request("http://localhost/api");
  assert.doesNotThrow(() => assertAllowedClientIp(req));
});

test("getRequestIp uses direct ip when present", () => {
  const req = new Request("http://localhost/api") as Request & { ip?: string };
  req.ip = "192.168.0.1";
  assert.strictEqual(getRequestIp(req), "192.168.0.1");
});

test("getRequestIp extracts last forwarded ip", () => {
  const req = new Request("http://localhost/api", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
  assert.strictEqual(getRequestIp(req), "5.6.7.8");
});
