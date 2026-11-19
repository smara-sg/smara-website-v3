/** Turn background confidence into a soft person matte, retaining every non-background class. */
export function updatePersonAlpha(
  background: Float32Array,
  previous: Float32Array,
  rgba: Uint8ClampedArray,
  firstFrame: boolean,
) {
  for (let pixel = 0; pixel < background.length; pixel++) {
    const person = Math.max(0, Math.min(1, 1 - background[pixel]));
    const old = previous[pixel];
    // Stabilize small confidence fluctuations, but follow moving heads immediately.
    const confidence = firstFrame || Math.abs(person - old) > 0.12
      ? person : person * 0.8 + old * 0.2;
    previous[pixel] = confidence;
    const edge = Math.max(0, Math.min(1, (confidence - 0.22) / 0.56));
    rgba[pixel * 4 + 3] = Math.round(edge * edge * (3 - 2 * edge) * 255);
  }
}

export function inferenceInterval(durationMs: number, offThread = true) {
  if (!offThread) return Math.max(100, durationMs + 60);
  return Math.max(1000 / 24, Math.min(180, durationMs * 1.15));
}

/** Never composite malformed GPU readback as an alpha matte. */
export function validateConfidenceMask(background: Float32Array, width: number, height: number) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0
    || background.length !== width * height) throw new Error('Invalid mask dimensions');
  for (const value of background) {
    if (!Number.isFinite(value) || value < -0.001 || value > 1.001) {
      throw new Error('Invalid mask confidence');
    }
  }
}

/** The single-output selfie model uses 0 for person and 255 for background.
 * Multiclass uses 0 for background and 1..5 for the parts of a person. */
export function backgroundFromCategories(categories: Uint8Array, width: number, height: number, selfie = false) {
  if (categories.length !== width * height || width <= 0 || height <= 0) throw new Error('Invalid category dimensions');
  const background = new Float32Array(categories.length);
  for (let index = 0; index < categories.length; index++) {
    const value = categories[index];
    if (selfie ? value !== 0 && value !== 255 : value > 5) throw new Error('Invalid person category');
    background[index] = (selfie ? value === 255 : value === 0) ? 1 : 0;
  }
  // A one-pixel separable feather keeps byte-mask boundaries soft, including
  // fallbacks whose output mask is already the full camera-frame resolution.
  const horizontal = new Float32Array(background.length);
  const feathered = new Float32Array(background.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      horizontal[index] = (background[y * width + Math.max(0, x - 1)] + 2 * background[index] + background[y * width + Math.min(width - 1, x + 1)]) / 4;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      feathered[index] = (horizontal[Math.max(0, y - 1) * width + x] + 2 * horizontal[index] + horizontal[Math.min(height - 1, y + 1) * width + x]) / 4;
    }
  }
  return feathered;
}

/** Apply the soft matte in ordinary pixel memory, without GPU destination-in blending. */
export function applyPersonMatte(
  image: Uint8ClampedArray, width: number, height: number,
  matte: Uint8ClampedArray, maskWidth: number, maskHeight: number, mirrored: boolean,
) {
  if (image.length !== width * height * 4 || matte.length !== maskWidth * maskHeight * 4) {
    throw new Error('Invalid matte dimensions');
  }
  for (let y = 0; y < height; y++) {
    const sy = Math.max(0, Math.min(maskHeight - 1, (y + 0.5) * maskHeight / height - 0.5));
    const y0 = Math.floor(sy), y1 = Math.min(maskHeight - 1, y0 + 1), fy = sy - y0;
    for (let x = 0; x < width; x++) {
      const sx = Math.max(0, Math.min(maskWidth - 1, ((mirrored ? width - 1 - x : x) + 0.5) * maskWidth / width - 0.5));
      const x0 = Math.floor(sx), x1 = Math.min(maskWidth - 1, x0 + 1), fx = sx - x0;
      const a = matte[(y0 * maskWidth + x0) * 4 + 3] * (1 - fx) + matte[(y0 * maskWidth + x1) * 4 + 3] * fx;
      const b = matte[(y1 * maskWidth + x0) * 4 + 3] * (1 - fx) + matte[(y1 * maskWidth + x1) * 4 + 3] * fx;
      image[(y * width + x) * 4 + 3] = Math.round((a * (1 - fy) + b * fy) * image[(y * width + x) * 4 + 3] / 255);
    }
  }
}
