import { useState, useRef, useEffect } from 'react';
import CompositionCanvas from './components/CompositionCanvas';
import EditCanvas from './components/EditCanvas';
import TextInputPanel from './components/TextInputPanel';
import EraserControls from './components/EraserControls';
import MergeControls from './components/MergeControls';
import SavePanel from './components/SavePanel';
import './App.css';

function App() {
  // Text states
  const [baseText, setBaseText] = useState('A');
  const [partText, setPartText] = useState('B');
  
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

  const editCanvasRef = useRef(null);

  const handleUndo = () => {
    if (editCanvasRef.current) {
      editCanvasRef.current.undo();
    }
  };

  const handleOffsetChange = (x, y) => {
    setOffsetX(x);
    setOffsetY(y);
  };

  const handleLoadLocalFonts = async () => {
    if (window.queryLocalFonts) {
      try {
        const fonts = await window.queryLocalFonts();
        const uniqueFonts = Array.from(new Set(fonts.map(f => f.fullName)))
          .sort()
          .map(name => ({ value: name, label: name }));
        setLocalFonts(uniqueFonts);
      } catch (err) {
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
            onLoadFonts={handleLoadLocalFonts} // ここで関数を渡す
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

        {/* 中央: キャンバスエリア */}
        <div className="canvas-area">
          <div className="canvas-container">
            <div className="canvas-wrapper">
              <div className="canvas-label">合成結果（閲覧用）</div>
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
              <div className="canvas-label">部品を加工（右）</div>
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

        {/* 右サイドバー: 部品設定と調整 */}
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
