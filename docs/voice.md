# Voice Cloner Trainer + Local TTS

This module lets authenticated users upload encrypted voice recordings, stub-train private models, and synthesize audio locally without using external services.

## Environment
- `VOICE_MASTER_KEY` (required): 32-byte base64 master key used to derive per-user AES-256-GCM keys.
- `VOICE_STORAGE_DIR` (optional): Custom storage directory. Defaults to `<repo>/.private/voice`.
- `VOICE_ALLOWED_IPS` (optional): Comma-separated client IP allowlist. Defaults to loopback addresses (`127.0.0.1`, `::1`).
- `VOICE_SERVICE_URL` (optional): Must remain localhost (`127.0.0.1`, `::1`, `localhost`). Remote targets are rejected.

## Storage layout
```
.private/voice/
  users/<userId>/
    recordings/<recordingId>/
      raw.enc           # JSON { iv, authTag, ciphertext }
      meta.json         # encrypted metadata
    models/
      models.json       # encrypted registry
      <modelId>/meta.json
    outputs/            # reserved for generated audio
```

Audio and metadata never live under `public/` and IDs are validated to prevent path traversal.

## API routes (Clerk + IP allowlist)
- `POST /api/voice/recordings/upload` – multipart upload (webm/ogg/wav up to 25MB), encrypted at rest.
- `GET /api/voice/recordings/list` – list current user recordings (metadata only).
- `DELETE /api/voice/recordings/delete` – remove one recording.
- `POST /api/voice/train` – stub training that registers a ready model entry for the user.
- `GET /api/voice/models/list` – list user models.
- `POST /api/voice/speak` – stub TTS returning a WAV stream for the selected model.

### Notes
- All voice endpoints enforce the allowlist and block remote service URLs.
- Per-user HKDF-derived keys keep recordings and metadata encrypted at rest.
- No audio or key material is logged.
