/**
 * Canvas ImageData を 24bit BMP バイナリに変換するエンコーダー
 * 透過部分は白背景に合成される
 */
export function canvasToBmpBlob(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  // 行ごとのパディング（4byte境界）
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 14 + 40 + pixelArraySize; // File Header + DIB Header + Pixel Data

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BMP File Header (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4D); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint16(6, 0, true); // Reserved
  view.setUint16(8, 0, true); // Reserved
  view.setUint32(10, 54, true); // Pixel data offset

  // DIB Header (BITMAPINFOHEADER - 40 bytes)
  view.setUint32(14, 40, true); // DIB header size
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive = bottom-up
  view.setUint16(26, 1, true); // Color planes
  view.setUint16(28, 24, true); // Bits per pixel
  view.setUint32(30, 0, true); // Compression (none)
  view.setUint32(34, pixelArraySize, true);
  view.setUint32(38, 2835, true); // Horizontal resolution (72 DPI)
  view.setUint32(42, 2835, true); // Vertical resolution (72 DPI)
  view.setUint32(46, 0, true); // Colors in palette
  view.setUint32(50, 0, true); // Important colors

  // Pixel Data (bottom-up, BGR order)
  let offset = 54;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3] / 255;

      // Alpha composite onto white background
      const bgR = Math.round(r * a + 255 * (1 - a));
      const bgG = Math.round(g * a + 255 * (1 - a));
      const bgB = Math.round(b * a + 255 * (1 - a));

      view.setUint8(offset++, bgB); // Blue
      view.setUint8(offset++, bgG); // Green
      view.setUint8(offset++, bgR); // Red
    }
    // Row padding
    const padding = rowSize - width * 3;
    for (let p = 0; p < padding; p++) {
      view.setUint8(offset++, 0);
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}
