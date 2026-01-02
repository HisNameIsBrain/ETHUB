export function synthesizeStubWave(prompt: string) {
  const sampleRate = 24000;
  const durationSeconds = Math.min(8, Math.max(2, Math.ceil(prompt.length / 40)));
  const samples = sampleRate * durationSeconds;
  const amplitude = 0.2 * 0x7fff;
  const frequency = 440;
  const buffer = Buffer.alloc(44 + samples * 2);

  buffer.write("RIFF", 0, 4, "ascii");
  buffer.writeUInt32LE(36 + samples * 2, 4);
  buffer.write("WAVEfmt ", 8, 8, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, 4, "ascii");
  buffer.writeUInt32LE(samples * 2, 40);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const value = Math.sin(2 * Math.PI * frequency * t) * amplitude * Math.exp(-t / durationSeconds);
    buffer.writeInt16LE(Math.floor(value), 44 + i * 2);
  }

  return buffer;
}
