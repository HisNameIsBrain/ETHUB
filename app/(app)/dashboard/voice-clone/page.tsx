"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface RecordingMeta {
  id: string;
  createdAt: number;
  originalMime: string;
  durationMs?: number | null;
  size: number;
  sha256: string;
}

interface VoiceModel {
  modelId: string;
  recordingId: string;
  status: "training" | "ready" | "error";
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export default function VoiceClonerPage() {
  const [prompt, setPrompt] = useState("");
  const [recordings, setRecordings] = useState<RecordingMeta[]>([]);
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState<number | null>(null);
  const recordingStartRef = useRef<number | null>(null);

  const mimeType = useMemo(() => {
    if (typeof window === "undefined") return "audio/webm";
    if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
    if (MediaRecorder.isTypeSupported("audio/ogg")) return "audio/ogg";
    return "audio/webm";
  }, []);

  const fetchRecordings = useCallback(async () => {
    const res = await fetch("/api/voice/recordings/list");
    if (!res.ok) return;
    const data = await res.json();
    setRecordings(data.recordings || []);
  }, []);

  const fetchModels = useCallback(async () => {
    const res = await fetch("/api/voice/models/list");
    if (!res.ok) return;
    const data = await res.json();
    setModels(data.models || []);
  }, []);

  useEffect(() => {
    fetchRecordings();
    fetchModels();
  }, [fetchModels, fetchRecordings]);

  useEffect(() => {
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
  }, [recordingUrl, generatedUrl]);

  const startRecording = async () => {
    if (isRecording) return;
    setStatusMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recordingStartRef.current = Date.now();
      recorder.ondataavailable = evt => {
        if (evt.data && evt.data.size > 0) chunksRef.current.push(evt.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordingDuration(recordingStartRef.current ? Date.now() - recordingStartRef.current : null);
        setRecordingUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err: any) {
      setStatusMessage(err?.message || "Unable to access microphone");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && isRecording) {
      recorder.stop();
    }
  };

  const uploadRecording = async () => {
    if (!recordingUrl || chunksRef.current.length === 0) {
      setStatusMessage("Record something first");
      return;
    }
    setIsUploading(true);
    setStatusMessage("");
    try {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const form = new FormData();
      form.append("recording", blob, `recording.${mimeType.includes("ogg") ? "ogg" : "webm"}`);
      if (recordingDuration) form.append("durationMs", String(recordingDuration));

      const res = await fetch("/api/voice/recordings/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setStatusMessage("Recording uploaded securely");
      setRecordingUrl("");
      chunksRef.current = [];
      await fetchRecordings();
    } catch (err: any) {
      setStatusMessage(err?.message || "Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteRecording = async (id: string) => {
    await fetch("/api/voice/recordings/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordingId: id })
    });
    fetchRecordings();
  };

  const trainModel = async () => {
    if (!selectedRecording) {
      setStatusMessage("Select a recording to train");
      return;
    }
    setIsTraining(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/voice/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId: selectedRecording })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Training failed");
      setSelectedModel(data.model?.modelId || "");
      setStatusMessage("Model is ready (stub training)");
      await fetchModels();
    } catch (err: any) {
      setStatusMessage(err?.message || "Training error");
    } finally {
      setIsTraining(false);
    }
  };

  const generateSpeech = async () => {
    if (!selectedModel) {
      setStatusMessage("Select a trained voice");
      return;
    }
    setIsGenerating(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: selectedModel, prompt })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Synthesis failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setStatusMessage("Audio ready");
    } catch (err: any) {
      setStatusMessage(err?.message || "Generate error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Voice Cloner Trainer</h1>
          <p className="text-sm text-muted-foreground">Train a private voice clone locally and generate speech.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Prompt</h2>
            <span className="text-xs text-muted-foreground">Text length: {prompt.length}</span>
          </div>
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Enter anything. Prompt is kept private and not stored."
            className="min-h-[200px]"
          />
          <div className="flex gap-2 justify-end">
            <Button onClick={generateSpeech} disabled={isGenerating}>
              {isGenerating ? "Generating…" : "Generate"}
            </Button>
          </div>
          {generatedUrl ? (
            <div className="space-y-2">
              <Label className="text-sm">Generated audio</Label>
              <audio controls src={generatedUrl} className="w-full" />
            </div>
          ) : null}
        </Card>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Recorder</h2>
              <span className="text-xs text-muted-foreground">Files stay encrypted at rest</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={startRecording} disabled={isRecording}>
                {isRecording ? "Recording…" : "Record"}
              </Button>
              <Button onClick={stopRecording} variant="secondary" disabled={!isRecording}>
                Stop
              </Button>
              <Button onClick={uploadRecording} variant="outline" disabled={isUploading || chunksRef.current.length === 0}>
                {isUploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
            {recordingUrl ? (
              <audio controls src={recordingUrl} className="w-full" />
            ) : (
              <p className="text-xs text-muted-foreground">Record locally, preview, then upload.</p>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Recordings</h2>
              <Button variant="ghost" size="sm" onClick={fetchRecordings}>
                Refresh
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto pr-2">
              {recordings.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recordings yet.</p>
              ) : (
                recordings.map(r => (
                  <div key={r.id} className="border rounded p-3 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{r.id}</span>
                      <Button size="sm" variant="ghost" onClick={() => deleteRecording(r.id)}>
                        Delete
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString()} · {(r.size / 1024).toFixed(1)} KB · {r.originalMime}
                    </div>
                    <div className="text-xs text-muted-foreground">SHA-256: {r.sha256.slice(0, 16)}…</div>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Training source</Label>
              <Select value={selectedRecording} onValueChange={setSelectedRecording}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a recording" />
                </SelectTrigger>
                <SelectContent>
                  {recordings.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.id} ({(r.size / 1024).toFixed(1)} KB)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={trainModel} disabled={isTraining || !selectedRecording}>
                {isTraining ? "Training…" : "Train voice clone"}
              </Button>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Trained voices</h2>
              <Button variant="ghost" size="sm" onClick={fetchModels}>
                Refresh
              </Button>
            </div>
            {models.length === 0 ? (
              <p className="text-xs text-muted-foreground">No models yet.</p>
            ) : (
              <div className="space-y-2">
                {models.map(model => (
                  <div key={model.modelId} className="border rounded p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{model.modelId}</span>
                      <span className="text-xs text-muted-foreground">{model.status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Trained from {model.recordingId} · {new Date(model.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm">Voice to use</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(m => (
                    <SelectItem key={m.modelId} value={m.modelId}>
                      {m.modelId} ({m.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>
      </div>

      {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}
    </div>
  );
}
