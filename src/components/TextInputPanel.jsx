export default function TextInputPanel({
  label, text, onTextChange,
  font, onFontChange, fontSize, onFontSizeChange,
  localFonts = [], synced, previewChar,
  onLoadFonts // フォント読み込み用コールバックを追加
}) {
  const defaultFonts = [
    { value: 'serif', label: 'セリフ (明朝系)' },
    { value: 'sans-serif', label: 'ゴシック (サンセリフ系)' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Impact', label: 'Impact' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Arial Black', label: 'Arial Black' },
  ];

  const currentFonts = localFonts.length > 0 ? [...defaultFonts, ...localFonts] : defaultFonts;

  const handleApply = () => {
    console.log(`${label} の設定を反映しました`);
  };

  return (
    <div className="panel compact">
      <div className="panel-title">{label}</div>

      {/* テキスト入力欄 */}
      <div className="form-group compact">
        <label className="form-label">テキスト</label>
        <input
          type="text"
          className="form-input"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          maxLength={4}
        />
      </div>

      {/* ユーザー指定の位置: テキスト入力とフォントの間にボタンを配置 */}
      {!synced && localFonts.length === 0 && onLoadFonts && window.queryLocalFonts && (
        <button 
          className="btn btn-primary btn-sm" 
          onClick={onLoadFonts}
          style={{ width: '100%', marginBottom: '10px', padding: '6px', fontSize: '11px' }}
        >
          📥 PC内のフォントを読み込む
        </button>
      )}

      {/* フォント選択欄 */}
      <div className="form-group compact">
        <label className="form-label">
          フォント {synced && <span className="synced-tag">🔗 同期中</span>}
        </label>
        {synced ? (
          <div className="form-select" style={{ opacity: 0.7, pointerEvents: 'none', background: '#f8f9fa' }}>
            {currentFonts.find(f => f.value === font)?.label || font}
          </div>
        ) : (
          <select
            className="form-select"
            value={font}
            onChange={(e) => onFontChange(e.target.value)}
          >
            {currentFonts.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        )}
      </div>

      {!synced && (
        <div className="form-group compact">
          <div className="slider-label-row">
            <label className="form-label">サイズ</label>
            <span className="slider-value">{fontSize}px</span>
          </div>
          <input
            type="range"
            min={40}
            max={450}
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
          />
        </div>
      )}

      {previewChar && (
        <div className="font-preview compact" style={{ height: 40 }}>
          <span className="font-preview-char" style={{ fontFamily: `"${font}", ${font}`, fontSize: '24px' }}>
            {previewChar}
          </span>
        </div>
      )}

      <button className="btn btn-apply" onClick={handleApply}>
        ✅ 決定・反映
      </button>
    </div>
  );
}
