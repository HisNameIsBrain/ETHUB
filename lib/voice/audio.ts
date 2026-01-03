export function synthesizeStubWav(text: string): Buffer {
  const sanitized = text?.slice(0, 240) || "";
  const durationSeconds = 1.0 + Math.min(sanitized.length / 160, 2);
  const sampleRate = 16000;
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const amplitude = 0.2;

  const samples = Buffer.alloc(totalSamples * 2);
  for (let i = 0; i < totalSamples; i++) {
    const charCode = sanitized.charCodeAt(i % sanitized.length) || 65;
    const freq = 220 + (charCode % 200);
    const value = Math.sin((2 * Math.PI * freq * i) / sampleRate) * amplitude;
    const intSample = Math.max(-1, Math.min(1, value)) * 0x7fff;
    samples.writeInt16LE(intSample, i * 2);
  }

  const header = createWavHeader(totalSamples, sampleRate, 1, 16);
  return Buffer.concat([header, samples]);
}

function createWavHeader(
  sampleCount: number,
  sampleRate: number,
  channels: number,
  bitsPerSample: number
): Buffer {
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = sampleCount * blockAlign;
  const buffer = Buffer.alloc(44);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}
