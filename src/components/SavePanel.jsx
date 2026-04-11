import { useState } from 'react';
import { canvasToBmpBlob } from '../utils/bmpEncoder';

export default function SavePanel({ editCanvasRef, mergeEnabled, baseText, font, fontSize, offsetX, offsetY }) {
  const [filename, setFilename] = useState('combined_char_01');
  const [format, setFormat] = useState('png');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!filename.trim()) return;
    setSaving(true);

    try {
      // Create an offscreen canvas for final render
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 512;
      exportCanvas.height = 512;
      const ctx = exportCanvas.getContext('2d');

      // Draw base text (Left part)
      if (baseText) {
        ctx.save();
        const generics = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
        const fontStyle = (generics.includes(font) || font.includes('"')) ? font : `"${font}"`;
        ctx.font = `${fontSize}px ${fontStyle}`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(baseText, 256, 256);
        ctx.restore();
      }

      // If merge is ON, overlay the edit canvas (Right part)
      if (mergeEnabled && editCanvasRef?.current) {
        ctx.drawImage(editCanvasRef.current, offsetX, offsetY);
      }

      const mimeType = format === 'png' ? 'image/png' : 'image/bmp';
      let blob;
      if (format === 'png') {
        blob = await new Promise(resolve => exportCanvas.toBlob(resolve, 'image/png'));
      } else {
        blob = canvasToBmpBlob(exportCanvas);
      }

      // File System Access API (showSaveFilePicker)
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: `${filename.trim()}.${format}`,
            types: [{
              description: format === 'png' ? 'PNG Image' : 'BMP Image',
              accept: { [mimeType]: [`.${format}`] }
            }]
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          // User cancelled file picker or it failed
          if (err.name !== 'AbortError') {
            console.error('Save failed with file picker:', err);
            // Fallback to traditional download on other errors
            downloadFallback(blob);
          }
        }
      } else {
        // Traditional download fallback if showSaveFilePicker is not supported
        downloadFallback(blob);
      }
    } catch (err) {
      console.error('General save error:', err);
      alert('保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const downloadFallback = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.trim()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel compact save-panel">
      <div className="panel-title">💾 保存・エクスポート</div>
      
      <div className="form-group compact">
        <label className="form-label">デフォルトファイル名</label>
        <input
          type="text"
          className="form-input"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="名前を入力..."
        />
      </div>

      <div className="form-group compact">
        <label className="form-label">形式</label>
        <div className="format-options-row">
          <label className={`radio-pill ${format === 'png' ? 'active' : ''}`}>
            <input type="radio" value="png" checked={format === 'png'} onChange={() => setFormat('png')} />
            PNG
          </label>
          <label className={`radio-pill ${format === 'bmp' ? 'active' : ''}`}>
            <input type="radio" value="bmp" checked={format === 'bmp'} onChange={() => setFormat('bmp')} />
            BMP
          </label>
        </div>
      </div>

      <button className="btn btn-primary btn-save-large" onClick={handleSave} disabled={saving}>
        {saving ? '保存中...' : '💾 画像を保存する'}
      </button>
      <div className="save-hint">※クリック後に保存先を選択できます</div>
    </div>
  );
}
