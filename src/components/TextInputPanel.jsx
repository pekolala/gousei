import { useState, useMemo } from 'react';

export default function TextInputPanel({
  label, text, onTextChange,
  font, onFontChange, fontSize, onFontSizeChange,
  localFonts = [], synced, previewChar,
  onLoadFonts, fontLoadingStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const generics = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];

  const defaultFonts = [
    { value: 'serif', label: 'セリフ (明朝系)' },
    { value: 'sans-serif', label: 'ゴシック (サンセリフ系)' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Impact', label: 'Impact' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Arial Black', label: 'Arial Black' },
  ];

  const allFonts = useMemo(() => {
    if (localFonts.length === 0) return defaultFonts;
    
    // localFontsにあるものはdefaultFontsから引く (valueで比較)
    const localValues = new Set(localFonts.map(f => f.value));
    const filteredDefaults = defaultFonts.filter(f => !localValues.has(f.value));
    
    return [...filteredDefaults, ...localFonts];
  }, [localFonts]);

  const filteredFonts = useMemo(() => {
    if (!searchTerm) return allFonts;
    const lowerSearch = searchTerm.toLowerCase();
    return allFonts.filter(f => {
      // App.jsx で作成した searchText を優先して利用
      if (f.searchText) return f.searchText.includes(lowerSearch);
      // フォールバック
      return (
        f.label.toLowerCase().includes(lowerSearch) || 
        (f.family && f.family.toLowerCase().includes(lowerSearch))
      );
    });
  }, [allFonts, searchTerm]);

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

      {/* フォント読み込み・検索エリア */}
      {!synced && (
        <div className="font-control-area" style={{ marginBottom: '8px' }}>
          {window.queryLocalFonts && (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              <button 
                className="btn btn-sm" 
                onClick={onLoadFonts}
                disabled={fontLoadingStatus === 'loading'}
                style={{ flex: 1, padding: '4px', fontSize: '10px' }}
              >
                {fontLoadingStatus === 'loading' ? '⏳ 読み込み中...' : 
                 fontLoadingStatus === 'loaded' ? '🔄 再読み込み' : '📥 PCフォント読込'}
              </button>
              {allFonts.length > 0 && (
                <div style={{ fontSize: '9px', color: '#666', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                  {searchTerm ? `${filteredFonts.length}/${allFonts.length}` : allFonts.length}個
                </div>
              )}
            </div>
          )}
          
          {localFonts.length > 0 && (
            <input
              type="text"
              className="form-input search-input"
              placeholder="フォントを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '10px', height: '24px' }}
            />
          )}
        </div>
      )}

      {/* フォント選択欄 */}
      <div className="form-group compact">
        <label className="form-label">
          フォント {synced && <span className="synced-tag">🔗 同期中</span>}
        </label>
        {synced ? (
          <div className="form-select" style={{ opacity: 0.7, pointerEvents: 'none', background: '#f8f9fa' }}>
            {allFonts.find(f => f.value === font)?.label || font}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '4px' }}>
              <select
                className="form-select"
                value={font}
                onChange={(e) => onFontChange(e.target.value)}
                style={{ 
                  fontFamily: (generics.includes(font) || font.includes('"')) ? font : `"${font}"`,
                  height: '32px',
                  flex: 1
                }}
              >
                {filteredFonts.length === 0 ? (
                  <option disabled>該当なし</option>
                ) : (
                  filteredFonts.map(f => (
                    <option 
                      key={f.value} 
                      value={f.value}
                      style={{ 
                        fontFamily: (generics.includes(f.value) || f.value.includes('"')) ? f.value : `"${f.value}"`,
                        fontSize: '14px'
                      }}
                    >
                      {f.label}
                    </option>
                  ))
                )}
                <option value="custom">── 直接入力する ──</option>
              </select>
            </div>

            {/* 手入力または選択中の詳細 */}
            <div style={{ marginTop: '4px' }}>
              <input
                type="text"
                className="form-input search-input"
                placeholder="フォント名を直接指定 (例: IwataKaishoR-Regular)"
                value={font.includes('"') ? font.replace(/"/g, '').split(',')[0] : font}
                onChange={(e) => onFontChange(e.target.value)}
                style={{ fontSize: '11px', height: '24px', background: '#fffbeb' }}
              />
              <div style={{ fontSize: '9px', color: '#999', marginTop: '1px' }}>
                ※リストに出ない場合はここに正確な名前を入力してください
              </div>
            </div>
          </>
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
          <span className="font-preview-char" style={{ fontFamily: (generics.includes(font) || font.includes('"')) ? font : `"${font}"`, fontSize: '24px' }}>
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
