export default function EraserControls({ eraserSize, onEraserSizeChange, onUndo, undoCount }) {
  return (
    <div className="panel">
      <div className="panel-title">消しゴム設定</div>

      <div className="form-group">
        <div className="slider-label-row">
          <label className="form-label" style={{ marginBottom: 0 }}>
            ◆ 消しゴムの太さ
          </label>
          <span className="slider-value">{eraserSize}px</span>
        </div>
        <input
          type="range"
          min={2}
          max={100}
          value={eraserSize}
          onChange={(e) => onEraserSizeChange(Number(e.target.value))}
        />
      </div>

      <button
        className="btn"
        onClick={onUndo}
        disabled={undoCount === 0}
        style={{ width: '100%', opacity: undoCount === 0 ? 0.5 : 1 }}
      >
        ↩ やり直し（Undo）
        {undoCount > 0 && (
          <span className="slider-value" style={{ marginLeft: 6 }}>{undoCount}</span>
        )}
      </button>
    </div>
  );
}
