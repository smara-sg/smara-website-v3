import qrcode from 'qrcode-generator';

export function createQrMatrix(text: string) {
  const qr = qrcode(0, 'M');
  qr.addData(text, 'Byte');
  qr.make();
  const count = qr.getModuleCount();
  return Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_, col) => qr.isDark(row, col)));
}

export function drawQrCode(canvas: HTMLCanvasElement, text: string) {
  const matrix = createQrMatrix(text);
  const quietZone = 4;
  const scale = 24;
  const size = (matrix.length + quietZone * 2) * scale;
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('QR code canvas unavailable');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, size, size);
  context.fillStyle = '#000';
  matrix.forEach((row, y) => row.forEach((dark, x) => {
    if (dark) context.fillRect((x + quietZone) * scale, (y + quietZone) * scale, scale, scale);
  }));
}
