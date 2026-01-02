import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRecordingMeta, registerModel } from "@/lib/voice/storage";
import { assertAllowedClientIp, assertLocalVoiceService } from "@/lib/voice/config";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    assertAllowedClientIp(req);
    assertLocalVoiceService();

    const body = await req.json();
    const recordingId = body?.recordingId as string;
    const notes = body?.notes as string | undefined;
    if (!recordingId) return NextResponse.json({ error: "recordingId required" }, { status: 400 });

    await getRecordingMeta(userId, recordingId);

    // TODO: replace stub with real training job dispatch
    const model = await registerModel(userId, recordingId, notes || "Stub training completed locally");

    return NextResponse.json({ model });
  } catch (err: any) {
    const status = err?.message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: err?.message || "Training failed" }, { status });
  }
}
