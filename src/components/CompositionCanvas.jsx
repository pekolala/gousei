import { useRef, useEffect, useCallback } from 'react';

export default function CompositionCanvas({
  baseText, font, fontSize,
  mergeEnabled, editCanvasRef, offsetX, offsetY
}) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.clearRect(0, 0, 512, 512);

    // Draw base text (background layer)
    if (baseText) {
      ctx.save();
      ctx.font = `${fontSize}px "${font}"`;
      ctx.fillStyle = '#1a1a1a'; // 少し柔らかい黒
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(baseText, 256, 256);
      ctx.restore();
    }

    // If merge is ON, overlay the edit canvas content
    if (mergeEnabled && editCanvasRef?.current) {
      ctx.save();
      ctx.drawImage(editCanvasRef.current, offsetX, offsetY);
      ctx.restore();
    }
  }, [baseText, font, fontSize, mergeEnabled, editCanvasRef, offsetX, offsetY]);

  useEffect(() => {
    draw();
  }, [draw]);

  // 定期的な再描画 (消しゴム操作などは外部から監視できないため)
  useEffect(() => {
    if (mergeEnabled) {
      const interval = setInterval(draw, 40); // 連続反映速度アップ
      return () => clearInterval(interval);
    }
  }, [mergeEnabled, draw]);

  return (
    <div className="canvas-frame checkerboard-bg">
      <canvas ref={canvasRef} width={512} height={512} />
    </div>
  );
}
