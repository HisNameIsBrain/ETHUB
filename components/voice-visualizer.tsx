"use client";
import * as React from "react";

export function VoiceVisualizer({ stream }: { stream: MediaStream }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!stream) return;
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current!;
    const cctx = canvas.getContext("2d")!;

    function draw() {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(buffer);
      cctx.clearRect(0, 0, canvas.width, canvas.height);
      buffer.forEach((v, i) => {
        const barHeight = v / 2;
        cctx.fillStyle = `hsl(${i * 10}, 100%, 50%)`;
        cctx.fillRect(i * 4, canvas.height - barHeight, 3, barHeight);
      });
    }
    draw();
  }, [stream]);

  return <canvas ref={canvasRef} width={300} height={60} className="rounded bg-black" />;
}

