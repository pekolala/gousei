import { useState, useRef } from 'react';
import CompositionCanvas from './components/CompositionCanvas';
import EditCanvas from './components/EditCanvas';
import TextInputPanel from './components/TextInputPanel';
import EraserControls from './components/EraserControls';
import MergeControls from './components/MergeControls';
import SavePanel from './components/SavePanel';
import './App.css';

function App() {
  // Text states
  const [baseText, setBaseText] = useState('王');
  const [partText, setPartText] = useState('犬');
  
  // Design states
  const [font, setFont] = useState('sans-serif');
  const [fontSize, setFontSize] = useState(400);
  
  // Interaction states
  const [eraserSize, setEraserSize] = useState(40);
  const [undoCount, setUndoCount] = useState(0);
  
  // Merge states
  const [mergeEnabled, setMergeEnabled] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Local Font state
  const [localFonts, setLocalFonts] = useState([]);
  const [fontLoadingStatus, setFontLoadingStatus] = useState('idle'); // idle, loading, loaded, error

  const editCanvasRef = useRef(null);

  const handleUndo = () => {
    if (editCanvasRef.current && typeof window.__editCanvasUndo === 'function') {
      window.__editCanvasUndo();
    }
  };

  const handleOffsetChange = (x, y) => {
    setOffsetX(x);
    setOffsetY(y);
  };

  const handleLoadLocalFonts = async () => {
    if (window.queryLocalFonts) {
      setFontLoadingStatus('loading');
      try {
        const fonts = await window.queryLocalFonts();
        const fontMap = new Map();

        fonts.forEach(f => {
          const fullName = f.fullName || '';
          const family = f.family || '';
          const style = f.style || '';
          const psName = f.postscriptName || '';

          // システムフォントや隠しフォントを簡易的にフィルタリング
          if (psName.startsWith('.') || psName.includes('LastResort')) return;

          // ユニークなIDを生成 (PostScriptNameがあればそれがベスト)
          const id = psName || `${family}-${style}-${fullName}`;
          
          // 表示用のラベルを作成 (fullNameがfamilyと同じならstyleを追記して区別しやすくする)
          let label = fullName;
          if (!label || label === family) {
            label = style ? `${family} (${style})` : family;
          }

          if (!fontMap.has(id)) {
            fontMap.set(id, {
              value: id, // valueもユニークなIDにする
              label: label,
              family: family,
              style: style
            });
          }
        });

        const sortedFonts = Array.from(fontMap.values())
          .sort((a, b) => a.label.localeCompare(b.label, 'ja'));
        
        setLocalFonts(sortedFonts);
        setFontLoadingStatus('loaded');
      } catch (err) {
        setFontLoadingStatus('error');
        if (err.name !== 'AbortError') {
          console.error('Font access failed', err);
          alert('フォントの取得に失敗しました。アクセスを許可してください。');
        }
      }
    } else {
      alert('このブラウザはローカルフォントの取得に対応していません。Google Chrome / Edge 等をご利用ください。');
    }
  };

  return (
    <div className="app">
      <header className="app-header compact">
        <span className="app-header-icon">✦</span>
        <h1>文字合成ツール</h1>
      </header>

      <div className="main-layout compact">
        {/* 左サイドバー */}
        <div className="sidebar-left">
          <TextInputPanel
            label="1. ベース文字 (左)"
            text={baseText}
            onTextChange={setBaseText}
            font={font}
            onFontChange={setFont}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            localFonts={localFonts}
            onLoadFonts={handleLoadLocalFonts}
            fontLoadingStatus={fontLoadingStatus}
            previewChar={baseText}
          />
          <SavePanel
            editCanvasRef={editCanvasRef}
            mergeEnabled={mergeEnabled}
            baseText={baseText}
            font={font}
            fontSize={fontSize}
            offsetX={offsetX}
            offsetY={offsetY}
          />
        </div>

        {/* 中央: キャンバスエリア (グレー部分の余白を極限まで削る) */}
        <div className="canvas-area">
          <div className="canvas-container">
            <div className="canvas-wrapper">
              <div className="canvas-label">合成プレビュー (左)</div>
              <CompositionCanvas
                baseText={baseText}
                font={font}
                fontSize={fontSize}
                mergeEnabled={mergeEnabled}
                editCanvasRef={editCanvasRef}
                offsetX={offsetX}
                offsetY={offsetY}
              />
            </div>
            <div className="canvas-wrapper">
              <div className="canvas-label">部品を加工 (右)</div>
              <EditCanvas
                ref={editCanvasRef}
                partText={partText}
                font={font}
                fontSize={fontSize}
                eraserSize={eraserSize}
                onUndoStackChange={setUndoCount}
              />
            </div>
          </div>
        </div>

        {/* 右サイドバー */}
        <div className="sidebar-right">
          <TextInputPanel
            label="2. 部品用の文字 (右)"
            text={partText}
            onTextChange={setPartText}
            font={font}
            onFontChange={setFont}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            localFonts={localFonts}
            fontLoadingStatus={fontLoadingStatus}
            synced={true}
            previewChar={partText}
          />
          <EraserControls
            eraserSize={eraserSize}
            onEraserSizeChange={setEraserSize}
            onUndo={handleUndo}
            undoCount={undoCount}
          />
          <MergeControls
            mergeEnabled={mergeEnabled}
            onMergeToggle={setMergeEnabled}
            offsetX={offsetX}
            offsetY={offsetY}
            onOffsetChange={handleOffsetChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
