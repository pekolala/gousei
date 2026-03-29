import { useRef } from 'react';

export default function MergeControls({
  mergeEnabled, onMergeToggle,
  offsetX, offsetY, onOffsetChange
}) {
  const intervalRef = useRef(null);

  const startMoving = (dx, dy) => {
    onOffsetChange(prevX => prevX + dx, prevY => prevY + dy);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      onOffsetChange(prevX => prevX + dx, prevY => prevY + dy);
    }, 40); // 連続移動速度を向上 (40ms)
  };

  const stopMoving = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="panel compact">
      <div className="panel-title">合成・位置調整</div>

      <div className="toggle-row compact">
        <label className="toggle-label">🔀 合成</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={mergeEnabled}
            onChange={(e) => onMergeToggle(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="divider" />

      <div className="form-group compact">
        <label className="form-label">位置 (長押し可)</label>
        <div className="position-row compact">
          <div className="dpad">
            <button
              className="btn btn-icon btn-up"
              onMouseDown={() => startMoving(0, -1)}
              onMouseUp={stopMoving}
              onMouseLeave={stopMoving}
              onTouchStart={() => startMoving(0, -1)}
              onTouchEnd={stopMoving}
            >↑</button>
            <button
              className="btn btn-icon btn-left"
              onMouseDown={() => startMoving(-1, 0)}
              onMouseUp={stopMoving}
              onMouseLeave={stopMoving}
              onTouchStart={() => startMoving(-1, 0)}
              onTouchEnd={stopMoving}
            >←</button>
            <button
              className="btn btn-icon btn-right"
              onMouseDown={() => startMoving(1, 0)}
              onMouseUp={stopMoving}
              onMouseLeave={stopMoving}
              onTouchStart={() => startMoving(1, 0)}
              onTouchEnd={stopMoving}
            >→</button>
            <button
              className="btn btn-icon btn-down"
              onMouseDown={() => startMoving(0, 1)}
              onMouseUp={stopMoving}
              onMouseLeave={stopMoving}
              onTouchStart={() => startMoving(0, 1)}
              onTouchEnd={stopMoving}
            >↓</button>
          </div>
          <div className="offset-display">
            <div>X: <span>{offsetX}</span></div>
            <div>Y: <span>{offsetY}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
