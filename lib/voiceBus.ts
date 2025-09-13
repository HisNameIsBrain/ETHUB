// lib/voiceBus.ts
export type VoiceEventMap = {
  "tts:start": { source?: string };
  "tts:end":   { source?: string; error?: string | null };
};

class VoiceBus {
  private et = new EventTarget();
  on<K extends keyof VoiceEventMap>(type: K, cb: (e: VoiceEventMap[K]) => void) {
    const handler = (ev: Event) => cb((ev as CustomEvent<VoiceEventMap[K]>).detail);
    this.et.addEventListener(type, handler as EventListener);
    return () => this.et.removeEventListener(type, handler as EventListener);
  }
  emit<K extends keyof VoiceEventMap>(type: K, detail: VoiceEventMap[K]) {
    this.et.dispatchEvent(new CustomEvent(type, { detail }));
  }
}
export const voiceBus = new VoiceBus();
