/** Mobile keeps the entire camera sensor image; desktop retains its existing crop. */
export function cameraFrameGeometry(sourceWidth: number, sourceHeight: number, mobile: boolean) {
  const cropWidth = mobile ? sourceWidth : Math.min(sourceWidth, sourceHeight * 9 / 16);
  const cropHeight = mobile ? sourceHeight : cropWidth * 16 / 9;
  const width = Math.max(2, Math.round(Math.min(mobile ? 480 : 720, cropWidth) / 2) * 2);
  return {
    x: mobile ? 0 : Math.round((sourceWidth - cropWidth) / 2),
    y: mobile ? 0 : Math.round((sourceHeight - cropHeight) / 2),
    cropWidth, cropHeight, width, height: Math.max(2, Math.round(width * cropHeight / cropWidth)),
  };
}

/** Fit the cutout without stretching or cropping, leaving a little mobile headroom. */
export function personPlacement(sourceWidth: number, sourceHeight: number, width: number, height: number, mobile: boolean) {
  const scale = Math.min(width / sourceWidth, height / sourceHeight) * (mobile ? 0.9 : 1);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  return { x: (width - drawWidth) / 2, y: height - drawHeight, width: drawWidth, height: drawHeight };
}
