import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ALLOWED_AUDIO_MIME, MAX_UPLOAD_BYTES, assertAllowedClientIp } from "@/lib/voice/config";
import { saveEncryptedRecording, sniffMime } from "@/lib/voice/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    assertAllowedClientIp(req);
    const formData = await req.formData();
    const file = formData.get("recording");
    const duration = formData.get("durationMs");
    const durationMs = duration ? Number(duration) : null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing recording" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffMime(buffer);
    const mime = sniffed || (file.type as string) || "";
    if (!sniffed || !ALLOWED_AUDIO_MIME.includes(mime as any)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const meta = await saveEncryptedRecording({
      userId,
      fileBuffer: buffer,
      mimeType: mime,
      durationMs
    });

    return NextResponse.json({
      recording: {
        id: meta.id,
        createdAt: meta.createdAt,
        originalMime: meta.originalMime,
        durationMs: meta.durationMs,
        size: meta.size,
        sha256: meta.sha256
      }
    });
  } catch (err: any) {
    const msg = err?.message || "Upload failed";
    const status = msg === "Forbidden" ? 403 : msg.toLowerCase().includes("master key") ? 500 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
