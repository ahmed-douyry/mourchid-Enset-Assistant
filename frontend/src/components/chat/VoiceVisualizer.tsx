import { useEffect, useRef } from "react";

const BARS = 28;

export function VoiceVisualizer({ stream }: { stream: MediaStream | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    audioCtxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);

    const bins = analyser.frequencyBinCount;
    const data = new Uint8Array(bins);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      analyser.getByteFrequencyData(data);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const gap = 3;
      const barWidth = (w - gap * (BARS - 1)) / BARS;
      for (let i = 0; i < BARS; i += 1) {
        const idx = Math.floor((i * bins) / BARS);
        const value = data[idx] / 255;
        const barHeight = Math.max(3, value * h);
        const x = i * (barWidth + gap);
        const y = (h - barHeight) / 2;
        ctx.fillStyle = `rgba(124, 58, 237, ${0.45 + value * 0.55})`;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    };
    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      source.disconnect();
      audioCtx.close().catch(() => undefined);
      audioCtxRef.current = null;
    };
  }, [stream]);

  if (!stream) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-accent-soft/60 px-4 py-2.5">
      <span className="flex h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-danger" />
      <span className="shrink-0 text-xs font-medium text-violet-brand">Écoute en cours…</span>
      <canvas ref={canvasRef} width={320} height={36} className="h-9 flex-1" />
    </div>
  );
}
