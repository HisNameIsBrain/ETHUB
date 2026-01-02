import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteRecording, getRecordingMeta } from "@/lib/voice/storage";
import { assertAllowedClientIp } from "@/lib/voice/config";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    assertAllowedClientIp(req);
    const body = await req.json();
    const recordingId = body?.recordingId as string;
    if (!recordingId) return NextResponse.json({ error: "recordingId required" }, { status: 400 });
    await getRecordingMeta(userId, recordingId); // ensures ownership
    await deleteRecording(userId, recordingId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const status = err?.message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: err?.message || "Delete failed" }, { status });
  }
}
