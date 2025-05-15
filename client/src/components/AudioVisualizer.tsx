import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  audioData: Float32Array | null;
  className?: string;
}

const AudioVisualizer = ({ audioData, className }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !audioData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw visual strip
    const centerY = rect.height / 2;
    const barWidth = 1;
    const gap = 1;
    const barCount = Math.floor(rect.width / (barWidth + gap));
    const dataStep = Math.ceil(audioData.length / barCount);

    // Gradient for more visual appeal
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, "hsl(220, 90%, 55%)"); // e.g., a nice blue


    ctx.fillStyle = gradient;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.min(i * dataStep, audioData.length - 1);
      const value = Math.abs(audioData[dataIndex]);

      const magnitude = Math.max(0.03, value);
      const barHeight = Math.min(rect.height * magnitude * 1.2, rect.height * 0.9); // Controlled bar height

      ctx.fillRect(
        i * (barWidth + gap),
        centerY - barHeight / 2,
        barWidth,
        barHeight
      );
    }
  }, [audioData]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-12 rounded-md shadow-sm", className)}
    />
  );
};

export default AudioVisualizer;
