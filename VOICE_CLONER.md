# Voice Cloner Trainer + Local TTS

This module enables authenticated users to record voice samples locally in the browser, upload them securely, stub-train a private clone, and generate audio from text prompts without using external cloud services.

## Environment

- `VOICE_MASTER_KEY` – **required**, 32-byte base64 string used as the master encryption key for AES-256-GCM. Generate this securely (for example, from a local `openssl rand -base64 32` invocation) and keep it private.
- `VOICE_STORAGE_DIR` – optional custom directory for private storage. Defaults to `<repo>/.private/voice`.
- `VOICE_ALLOWED_IPS` – optional comma-separated allowlist of client IPs permitted to call the voice APIs. Defaults to loopback (`127.0.0.1`, `::1`).
- `VOICE_TRUSTED_IP_HEADER` – optional trusted header name (e.g., `x-forwarded-for`) to read the client IP from when behind a known proxy. When unset, client-provided forwarding headers are ignored and only the direct request IP is used.

## Storage layout

```
.private/voice/
  users/<userId>/
    recordings/<recordingId>/
      raw.enc           # JSON { iv, authTag, ciphertext }
      meta.json         # metadata + encryption info
    models/
      models.json       # registry of trained voices
      <modelId>/meta.json
    outputs/            # reserved for generated audio
```

Audio and metadata never live under `public/` and are validated for safe paths.

## API routes (Clerk-protected)
- `POST /api/voice/recordings/upload` – multipart upload (webm/ogg/wav up to 25MB), encrypted at rest.
- `GET /api/voice/recordings/list` – list current user recordings (metadata only).
- `DELETE /api/voice/recordings/delete` – remove one recording.
- `POST /api/voice/train` – stub training that registers a ready model entry for the user.
- `GET /api/voice/models/list` – list user models.
- `POST /api/voice/speak` – stub TTS returning a WAV stream for the selected model.

## Development notes
- Requires Node.js 18+ and Clerk auth configured.
- ffmpeg is optional; current flow accepts browser-generated audio and leaves TODO for heavier training/serving integration.
- Avoid logging raw audio or keys. Files are encrypted using per-user keys derived via HKDF(masterKey, salt=userId, info="ethub-voice-v1").

## Testing

```
npm test
```

Adds coverage for encryption round-trip and path safety.
