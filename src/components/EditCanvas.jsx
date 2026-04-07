import { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react';

const EditCanvas = forwardRef(function EditCanvas({
  partText, font, fontSize, eraserSize, onUndoStackChange
}, ref) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const undoStack = useRef([]);
  const [cursorPos, setCursorPos] = useState(null);

  // Expose canvas element directly
  useImperativeHandle(ref, () => canvasRef.current);

  const drawText = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);

    if (partText) {
      ctx.save();
      const generics = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
      const fontStyle = generics.includes(font) ? font : `"${font}"`;
      ctx.font = `${fontSize}px ${fontStyle}`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(partText, 256, 256);
      ctx.restore();
    }

    // Clear undo stack when text changes
    undoStack.current = [];
    if (onUndoStackChange) onUndoStackChange(0);
  }, [partText, font, fontSize, onUndoStackChange]);

  useEffect(() => {
    drawText();
  }, [drawText]);

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, 512, 512);
    undoStack.current.push(imageData);
    if (onUndoStackChange) onUndoStackChange(undoStack.current.length);
    isDrawing.current = true;
    const pos = getCanvasPos(e);
    erase(pos.x, pos.y);
  };

  const handleMouseMove = (e) => {
    const pos = getCanvasPos(e);
    setCursorPos(pos);
    if (!isDrawing.current) return;
    erase(pos.x, pos.y);
  };

  const handleMouseUp = () => { isDrawing.current = false; };
  const handleMouseLeave = () => { isDrawing.current = false; setCursorPos(null); };

  const erase = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, eraserSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const prevState = undoStack.current.pop();
    ctx.putImageData(prevState, 0, 0);
    if (onUndoStackChange) onUndoStackChange(undoStack.current.length);
  }, [onUndoStackChange]);

  useEffect(() => {
    window.__editCanvasUndo = undo;
    return () => { delete window.__editCanvasUndo; };
  }, [undo]);

  return (
    <div
      className="canvas-frame checkerboard-bg editable"
      style={{ position: 'relative' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} width={512} height={512} />
      {cursorPos && (
        <div
          className="eraser-cursor-hint"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            width: eraserSize,
            height: eraserSize,
          }}
        />
      )}
    </div>
  );
});

export default EditCanvas;
